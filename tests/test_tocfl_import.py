import sys
import json
import os
import tempfile
import unittest
import zipfile
import stat
from types import SimpleNamespace
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tocfl_import.build import _band_c_transcript_entries, _transcript_entries, audio_plan, ensure_new_source, existing_source_id, matching_legacy_test, next_test_id  # noqa: E402
from tocfl_import.archive_audio import _read_rar, _safe_name, download_audio_archive, inspect_audio_archive  # noqa: E402
from tocfl_import.discovery import ImportErrorWithContext, _classify_links, available_tests, official_url  # noqa: E402
from tocfl_import.validate import validate_package  # noqa: E402
from tocfl_import.visual_pdf import _shared_gap_pool, extract_image_paper  # noqa: E402
from tocfl_import.pdf import TranscriptExtract, _vector_document_image, extract_answers, extract_transcript_layout, normalize_printed_choice_labels  # noqa: E402
from bs4 import BeautifulSoup  # noqa: E402
import fitz  # noqa: E402


class DiscoveryTests(unittest.TestCase):
    def test_official_urls_only(self):
        self.assertEqual(official_url("https://tocfl.edu.tw/path", "/tocfl/a.pdf"), "https://tocfl.edu.tw/tocfl/a.pdf")
        with self.assertRaises(ImportErrorWithContext):
            official_url("https://tocfl.edu.tw/path", "https://example.com/a.pdf")

    def test_source_classification(self):
        row = BeautifulSoup("""<tr>
          <td><a href='/t.pdf'>[正體試題]</a></td><td><a href='/s.pdf'>[簡體試題]</a></td>
          <td><a href='/answers.pdf'>[答案]</a></td><td><a href='/score.pdf'>[測驗分數對照表]</a></td>
        </tr>""", "html.parser").tr
        found = _classify_links(row, "https://tocfl.edu.tw", "reading")
        self.assertEqual(found["traditional_pdf"], "https://tocfl.edu.tw/t.pdf")
        self.assertEqual(len(found), 4)

    def test_answer_link_title_does_not_turn_it_into_traditional_paper(self):
        row = BeautifulSoup("""<tr>
          <td><a href='/paper_t.pdf'>正體試題</a></td>
          <td><a href='/paper_s.pdf'>簡體試題</a></td>
          <td><a href='/answer_t.pdf' title='正體試題答案'>進階高階級答案</a></td>
          <td><a href='/score.pdf'>分數對照表</a></td>
        </tr>""", "html.parser").tr
        found = _classify_links(row, "https://tocfl.edu.tw", "reading")
        self.assertEqual(found["answer_pdf"], "https://tocfl.edu.tw/answer_t.pdf")
        self.assertEqual(found["traditional_pdf"], "https://tocfl.edu.tw/paper_t.pdf")

    def test_ambiguous_source_shows_candidate_urls(self):
        row = BeautifulSoup("""<tr><td><a href='/one.pdf'>正體試題</a><a href='/two.pdf'>正體試題</a></td></tr>""", "html.parser").tr
        with self.assertRaises(ImportErrorWithContext) as failure:
            _classify_links(row, "https://tocfl.edu.tw", "reading", "A", 5)
        self.assertIn("one.pdf", str(failure.exception))
        self.assertIn("two.pdf", str(failure.exception))

    def test_identical_official_pdf_mirrors_are_not_ambiguous(self):
        row = BeautifulSoup("""<tr><td>
          <a href='/one.pdf'>正體試題</a><a href='/two.pdf'>正體試題</a>
          <a href='/simple.pdf'>簡體試題</a><a href='/answer.pdf'>答案</a>
          <a href='/score.pdf'>分數對照表</a>
        </td></tr>""", "html.parser").tr
        document = fitz.open()
        document.new_page().insert_text((50, 50), "Reading")
        body = document.tobytes()
        class Session:
            def get(self, url, timeout):
                class Response:
                    def raise_for_status(self):
                        pass
                response = Response()
                response.url = url
                response.content = body
                return response
        found = _classify_links(row, "https://tocfl.edu.tw", "reading", "A", 5, Session())
        self.assertEqual(found["traditional_pdf"], "https://tocfl.edu.tw/one.pdf")

    def test_available_tests_requires_both_skills_and_does_not_invent_series(self):
        html = "".join(f"<div class='card'><button>{skill}(第{series}輯)</button><table><thead>Band A</thead><tbody><tr><td>中越版</td></tr></tbody></table></div>"
                       for skill in ("聽力測驗", "閱讀測驗") for series in ("一", "三"))
        html += "<div class='card'><button>聽力測驗(第十輯)</button><table><thead>Band B</thead><tbody><tr><td>源檔</td></tr></tbody></table></div>"
        with patch("tocfl_import.discovery.fetch", return_value=SimpleNamespace(text=html)):
            self.assertEqual(available_tests(None), [("A", 1), ("A", 3), ("B", 10)])

    def test_audit_continues_after_one_unsupported_test(self):
        import audit_tocfl_official
        from contextlib import redirect_stdout
        from io import StringIO
        results = [{"band": "A", "series": 1, "archiveFormat": "ZIP", "audioLayout": "numbered", "transcriptFormat": "numbered", "status": "UNSUPPORTED", "reason": "bad archive"},
                   {"band": "B", "series": 1, "archiveFormat": "RAR", "audioLayout": "numbered", "transcriptFormat": "numbered", "status": "PASS", "reason": ""}]
        output = StringIO()
        with patch.object(sys, "argv", ["audit"]), patch.object(audit_tocfl_official, "available_tests", return_value=[("A", 1), ("B", 1)]), patch.object(audit_tocfl_official, "audit_one", side_effect=results) as scan, redirect_stdout(output):
            self.assertEqual(audit_tocfl_official.main(), 1)
        self.assertEqual(scan.call_count, 2)
        self.assertIn("1/2 PASS", output.getvalue())


class AudioTests(unittest.TestCase):
    @staticmethod
    def archive(*names):
        output = BytesIO()
        with zipfile.ZipFile(output, "w") as zip_file:
            for name in names:
                zip_file.writestr(name, b"" if name.endswith("/") else b"ID3" + bytes(200))
        return output.getvalue()

    def test_legacy_archive_normalizes_flat_wrapper_and_nested_tracks(self):
        names = ("0-1.mp3", "1-0000intro.mp3", "q01.mp3", "q02.mp3", "2-0000end.mp3")
        flat = inspect_audio_archive(self.archive(*names), "https://tocfl.edu.tw/legacy.zip", 2)
        wrapped = inspect_audio_archive(self.archive(
            "mock3_BandA_mp3_vie/", "mock3_BandA_mp3_vie/subfolder/",
            *(f"mock3_BandA_mp3_vie/{'subfolder/' if name == 'q02.mp3' else ''}{name}" for name in names),
        ), "https://tocfl.edu.tw/legacy.zip", 2)
        self.assertEqual(flat.files, wrapped.files)
        self.assertEqual(flat.tracks, wrapped.tracks)
        self.assertEqual(wrapped.members[3]["sourcePath"], "mock3_BandA_mp3_vie/subfolder/q02.mp3")

    def test_legacy_archive_rejects_unsafe_paths_and_special_members(self):
        for name in ("/absolute/q01.mp3", "../q01.mp3", "wrapper/../q01.mp3",
                     "wrapper//q01.mp3", "C:/q01.mp3", "C:q01.mp3", "\\\\host\\share\\q01.mp3"):
            with self.subTest(name=name), self.assertRaisesRegex(ImportErrorWithContext, "Unsafe archive member"):
                inspect_audio_archive(self.archive(name), "https://tocfl.edu.tw/legacy.zip", 1)
        with self.assertRaisesRegex(ImportErrorWithContext, "Unsafe archive member path"):
            _safe_name("q01.mp3/", directory=False)
        with self.assertRaisesRegex(ImportErrorWithContext, "Unsafe archive member path"):
            _safe_name("wrapper//", directory=True)
        for special in (stat.S_IFLNK, stat.S_IFIFO):
            output = BytesIO()
            with zipfile.ZipFile(output, "w") as archive:
                info = zipfile.ZipInfo("wrapper/q01.mp3")
                info.create_system = 3
                info.external_attr = (special | 0o777) << 16
                archive.writestr(info, b"ID3" + bytes(200))
            with self.subTest(special=special), self.assertRaisesRegex(ImportErrorWithContext, "symlink/encrypted"):
                inspect_audio_archive(output.getvalue(), "https://tocfl.edu.tw/legacy.zip", 1)

    def test_rar_listing_accepts_safe_directories_before_extraction(self):
        names = ["wrapper/", "wrapper/subfolder/", "wrapper/subfolder/q01.mp3"]
        details = ["drwxr-xr-x 0 0 0 0 Jan 1 2020 folder"] * 2 + ["-rw-r--r-- 0 0 0 203 Jan 1 2020 track"]
        def bsdtar(args):
            if args[0] == "-tf":
                return "\n".join(names) + "\n"
            if args[0] == "-tvf":
                return "\n".join(details) + "\n"
            target = Path(args[args.index("-C") + 1])
            (target / "wrapper/subfolder").mkdir(parents=True)
            (target / names[-1]).write_bytes(b"ID3" + bytes(200))
            return ""
        with patch("tocfl_import.archive_audio._run_bsdtar", side_effect=bsdtar) as run:
            self.assertEqual(_read_rar(b"Rar!"), [(names[-1], b"ID3" + bytes(200))])
            self.assertEqual(run.call_count, 3)
        for unsafe_name, mode in (("wrapper/../q01.mp3", "-"), ("C:/q01.mp3", "-"),
                                  ("wrapper/link.mp3", "l"), ("wrapper/link.mp3", "h")):
            with self.subTest(unsafe_name=unsafe_name, mode=mode):
                def unsafe_bsdtar(args):
                    if args[0] == "-tf":
                        return unsafe_name + "\n"
                    if args[0] == "-tvf":
                        return mode + "rw-r--r-- 0 0 0 203 Jan 1 2020 track\n"
                    self.fail("Unsafe RAR was extracted")
                with patch("tocfl_import.archive_audio._run_bsdtar", side_effect=unsafe_bsdtar):
                    with self.assertRaises(ImportErrorWithContext):
                        _read_rar(b"Rar!")

    def test_rar_rejects_link_or_escape_after_extraction(self):
        name = "wrapper/q01.mp3"
        def listing(args):
            if args[0] == "-tf":
                return name + "\n"
            if args[0] == "-tvf":
                return "-rw-r--r-- 0 0 0 203 Jan 1 2020 track\n"
            target = Path(args[args.index("-C") + 1])
            (target / "wrapper").symlink_to(outside, target_is_directory=True)
            return ""
        with tempfile.TemporaryDirectory() as temporary:
            outside = Path(temporary)
            (outside / "q01.mp3").write_bytes(b"ID3" + bytes(200))
            with patch("tocfl_import.archive_audio._run_bsdtar", side_effect=listing):
                with self.assertRaisesRegex(ImportErrorWithContext, "Invalid extracted audio file"):
                    _read_rar(b"Rar!")
        def hardlink(args):
            if args[0] == "-tf":
                return name + "\n"
            if args[0] == "-tvf":
                return "-rw-r--r-- 0 0 0 203 Jan 1 2020 track\n"
            target = Path(args[args.index("-C") + 1])
            (target / "wrapper").mkdir()
            (target / name).write_bytes(b"ID3" + bytes(200))
            os.link(target / name, target / "second-link.mp3")
            return ""
        with patch("tocfl_import.archive_audio._run_bsdtar", side_effect=hardlink):
            with self.assertRaisesRegex(ImportErrorWithContext, "Invalid extracted audio file"):
                _read_rar(b"Rar!")

    def test_legacy_archive_named_rar_maps_explicit_question_tracks(self):
        data = self.archive("test/0-1.mp3", "test/1-0000intro.mp3", "test/1-01.mp3", "test/1-02.mp3", "test/2-0000end.mp3")
        inspected = inspect_audio_archive(data, "https://tocfl.edu.tw/legacy.rar", 2)
        self.assertEqual(inspected.format, "zip")
        self.assertEqual([track["localName"] for track in inspected.tracks], ["preamble.mp3", "part-1-intro.mp3", "q01.mp3", "q02.mp3", "ending.mp3"])
        audio, questions, steps, downloads = audio_plan(inspected.tracks, "band-a-test-02")
        self.assertEqual(len(downloads), 5)
        self.assertEqual(questions[1]["path"], "/tests/band-a-test-02/listening/audio/q01.mp3")
        self.assertEqual(steps[-1]["role"], "ending")
        self.assertEqual(audio["part1Intro"], "/tests/band-a-test-02/listening/audio/part-1-intro.mp3")

    def test_legacy_group_file_plays_once_before_its_questions(self):
        data = self.archive("1-00000.mp3", "1-01-0.mp3", "1-01-1.mp3", "1-02.mp3", "2-00000.mp3")
        inspected = inspect_audio_archive(data, "https://tocfl.edu.tw/legacy.zip", 2)
        audio, questions, steps, _ = audio_plan(inspected.tracks, "band-b-test-02")
        self.assertEqual(len(audio["groups"]), 1)
        self.assertEqual(steps[1]["type"], "question_group")
        self.assertEqual([track["questionId"] for track in steps[1]["questionTracks"]], ["listening-q01", "listening-q02"])
        self.assertEqual(questions[2]["reviewSequence"][0], steps[1]["sharedAudio"])

    def test_legacy_archive_rejects_unmapped_long_audio_and_missing_tracks(self):
        with self.assertRaisesRegex(ImportErrorWithContext, "Cannot map archive MP3"):
            inspect_audio_archive(self.archive("whole-test.mp3"), "https://tocfl.edu.tw/legacy.rar", 2)
        with self.assertRaisesRegex(ImportErrorWithContext, "1/2 mapped question tracks"):
            inspect_audio_archive(self.archive("1-0000.mp3", "1-01.mp3"), "https://tocfl.edu.tw/legacy.rar", 2)

    def test_legacy_archive_rejects_path_traversal(self):
        with self.assertRaisesRegex(ImportErrorWithContext, "Unsafe archive member"):
            inspect_audio_archive(self.archive("../1-01.mp3"), "https://tocfl.edu.tw/legacy.zip", 1)

    def test_only_known_os_metadata_is_ignored_after_safety_checks(self):
        members = ("wrapper/", "wrapper/desktop.ini", "wrapper/THUMBS.DB", "wrapper/.DS_Store",
                   "__MACOSX/", "__MACOSX/._track.mp3", "wrapper/._track.mp3",
                   "wrapper/1-00000.mp3", "wrapper/1-01.mp3")
        result = inspect_audio_archive(self.archive(*members), "https://tocfl.edu.tw/archive.rar", 1)
        self.assertEqual(set(result.files), {"part-1-intro.mp3", "q01.mp3"})
        with self.assertRaisesRegex(ImportErrorWithContext, "Unexpected non-audio"):
            inspect_audio_archive(self.archive(*members, "wrapper/notes.txt"), "https://tocfl.edu.tw/archive.rar", 1)
        with self.assertRaisesRegex(ImportErrorWithContext, "Unsafe archive member"):
            inspect_audio_archive(self.archive(*members, "../desktop.ini"), "https://tocfl.edu.tw/archive.rar", 1)
        output = BytesIO()
        with zipfile.ZipFile(output, "w") as archive:
            info = zipfile.ZipInfo("wrapper/desktop.ini")
            info.create_system = 3
            info.external_attr = (stat.S_IFLNK | 0o777) << 16
            archive.writestr(info, b"target")
        with self.assertRaisesRegex(ImportErrorWithContext, "symlink/encrypted"):
            inspect_audio_archive(output.getvalue(), "https://tocfl.edu.tw/archive.rar", 1)

    def test_cp950_filenames_and_sequential_shared_tracks(self):
        data = self.archive("wrapper/__/1-00000.mp3", "wrapper/__/1-01.mp3", "wrapper/__/1-02.mp3",
                            "wrapper/__/1-03.mp3", "wrapper/__/2-00000.mp3")
        data = data.replace(b"__", "中".encode("cp950"))
        with self.assertRaisesRegex(ImportErrorWithContext, "require the official transcript"):
            inspect_audio_archive(data, "https://tocfl.edu.tw/audio.rar", 2)
        layout = TranscriptExtract("請聽這段對話，然後回答兩個問題。", {1: "第一題？", 2: "第二題？"})
        with patch("tocfl_import.pdf.extract_transcript_layout", return_value=layout):
            result = inspect_audio_archive(data, "https://tocfl.edu.tw/audio.rar", 2, transcript_pdf=b"PDF")
        self.assertEqual([track["label"] for track in result.tracks], ["第一部分說明", "題幹", "1", "2", ""])
        self.assertIn("中", result.members[1]["sourcePath"])

    def test_interrupted_archive_download_resumes_at_verified_offset(self):
        from requests.exceptions import ChunkedEncodingError
        payload = b"Rar!" + bytes(200)
        class Response:
            def __init__(self, status, headers, chunks):
                self.url = "https://tocfl.edu.tw/archive.rar"
                self.status_code = status
                self.headers = headers
                self.chunks = chunks
            def __enter__(self): return self
            def __exit__(self, *_): pass
            def raise_for_status(self): pass
            def iter_content(self, _):
                for chunk in self.chunks:
                    if isinstance(chunk, Exception): raise chunk
                    yield chunk
        class Session:
            def __init__(self): self.calls = []
            def get(self, url, **kwargs):
                self.calls.append(kwargs["headers"])
                return (Response(200, {"Content-Length": str(len(payload))}, [payload[:100], ChunkedEncodingError()])
                        if len(self.calls) == 1 else Response(206, {"Content-Range": f"bytes 100-{len(payload)-1}/{len(payload)}"}, [payload[100:]]))
        session = Session()
        with patch("tocfl_import.archive_audio.time.sleep"):
            self.assertEqual(download_audio_archive(session, "https://tocfl.edu.tw/archive.rar"), payload)
        self.assertEqual(session.calls[1]["Range"], "bytes=100-")

    def test_shared_audio_only_once(self):
        def track(label, number):
            return {"label": label, "url": f"https://eapi.sc-top.org.tw/video/B5/{number:03d}.mp3"}
        audio, questions, steps, downloads = audio_plan([
            track("", 1), track("第一部分說明", 2), track("1", 3),
            track("題幹", 4), track("2", 5), track("3", 6),
            track("第二部分說明", 7), track("4", 8),
        ], "band-b-test-02")
        self.assertEqual(steps[3]["type"], "question_group")
        self.assertEqual(steps[3]["questionTracks"][0]["questionId"], "listening-q02")
        self.assertEqual(questions[2]["reviewSequence"], [audio["groups"][0]["sharedAudio"], questions[2]["questionTrack"]])
        self.assertEqual(questions[3]["reviewSequence"][0], audio["groups"][0]["sharedAudio"])
        self.assertEqual(len(downloads), 8)


class BandCTranscriptTests(unittest.TestCase):
    def test_single_question_passage_after_previous_question_is_reassigned(self):
        entries = _transcript_entries({1: "前一題是什麼？\n\n請聽這一段話，然後回答下面的問題。\n這是完整的下一題段落。",
                                       2: "下一題是什麼？"}, [])
        self.assertNotIn("完整的下一題段落", entries[0]["traditional"])
        self.assertIn("完整的下一題段落", entries[1]["traditional"])

    def test_pdf_extraction_keeps_passage_before_q1(self):
        document = fitz.open()
        page = document.new_page()
        for index, line in enumerate(("Shared passage before Q1", "1. First question?", "2. Second question?")):
            page.insert_text((50, 60 + index * 24), line)
        layout = extract_transcript_layout(document.tobytes(), 2)
        self.assertEqual(layout.preface, "Shared passage before Q1")
        self.assertEqual(layout.questions[1], "First question?")

    def test_shared_passages_match_numbered_audio_and_keep_questions_separate(self):
        first = "請聽這段對話，然後回答下面兩個問題。\n男：今天我們要一起討論新的工作安排和明天的會議時間。\n女：我已經準備好了，可以在下午一起討論。"
        second = "請聽這段對話，然後回答下面兩個問題。\n男：昨天我們一起去了圖書館，看了很多關於旅行的書。\n女：下個星期我們還要再去一次。"
        layout = TranscriptExtract("流利精通級模擬試題聽力測驗腳本\nScript of Listening Test\n第一部分 對話\n" + first, {
            1: "這位先生說了什麼？",
            2: "這位小姐準備了什麼？\n" + second,
            3: "他們昨天去了哪裡？",
            4: "他們下個星期打算做什麼？",
        })
        groups = [{"id": "ag-q01-q02", "questions": [1, 2]}, {"id": "ag-q03-q04", "questions": [3, 4]}]
        entries, shared = _band_c_transcript_entries(layout, groups)
        self.assertEqual([group["questions"] for group in shared], [[1, 2], [3, 4]])
        self.assertTrue(shared[0]["traditional"].startswith("請聽這段對話"))
        self.assertEqual(entries[0]["questionTraditional"], "這位先生說了什麼？")
        self.assertEqual(entries[1]["sharedTranscriptGroupId"], "ag-q01-q02")
        self.assertEqual(entries[2]["sharedTranscriptGroupId"], "ag-q03-q04")
        self.assertNotIn("昨天我們", entries[1]["traditional"])
        with self.assertRaisesRegex(ImportErrorWithContext, "declares.*but shared audio"):
            _band_c_transcript_entries(layout, [{"id": "wrong", "questions": [1, 2, 3]}, {"id": "other", "questions": [4]}])

    def test_question_first_passage_is_assigned_to_its_printed_group(self):
        layout = TranscriptExtract("請聽這段對話，然後回答下面的兩個問題。", {
            1: "這位先生說了什麼？",
            2: "這位小姐說了什麼？\n現在請聽對話。\n男：這段完整對話印在兩個問題後面，不能當成下一組的內容。",
        })
        entries, shared = _band_c_transcript_entries(layout, [{"id": "ag-q01-q02", "questions": [1, 2]}])
        self.assertIn("完整對話印在兩個問題後面", shared[0]["traditional"])
        self.assertEqual(entries[1]["questionTraditional"], "這位小姐說了什麼？")


class OfficialAnswerKeyTests(unittest.TestCase):
    def test_band_a_series_2_exact_printed_q34_typo_is_recorded(self):
        document = fitz.open()
        page = document.new_page(width=300, height=3000)
        for number in range(1, 51):
            printed = 44 if number == 34 else number
            page.insert_text((50, number * 50), str(printed))
            page.insert_text((50, number * 50 + 15), "A")
        source = document.tobytes()
        warnings = []
        answers = extract_answers(source, "listening", band="A", series=2, warnings=warnings)
        self.assertEqual(list(answers), list(range(1, 51)))
        self.assertEqual(answers[34], "A")
        self.assertEqual(len(warnings), 1)
        self.assertEqual(extract_answers(source, "listening", band="A", series=1)[34], "A")
        self.assertEqual(extract_answers(source, "listening", band="A", series=3)[34], "A")
        self.assertEqual(extract_answers(source, "listening", band="A", series=4)[34], "A")
        wrong = fitz.open()
        page = wrong.new_page(width=300, height=3000)
        for number in range(1, 51):
            printed = 4 if number == 34 else number
            page.insert_text((50, number * 50), str(printed))
            page.insert_text((50, number * 50 + 15), "A")
        self.assertEqual(extract_answers(wrong.tobytes(), "listening", band="A", series=4)[34], "A")


class SafetyTests(unittest.TestCase):
    def test_next_id_never_overwrites(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "old.json").write_text('{"exam":{"id":"band-b-test-01"}}')
            (root / "other.json").write_text('{"exam":{"id":"band-a-test-09"}}')
            self.assertEqual(next_test_id(root, "B"), "band-b-test-02")

    def test_stable_source_identity_reuses_existing_id(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "test.json").write_text('{"exam":{"id":"band-b-test-02","level":"Band B","source":{"series":5}}}')
            self.assertEqual(existing_source_id(root, "B", 5), "band-b-test-02")
            self.assertIsNone(existing_source_id(root, "B", 4))
            # Use a sibling directory to mirror data/structured-tests and data/import-manifests.
            with tempfile.TemporaryDirectory() as nested:
                data = Path(nested) / "structured-tests"
                data.mkdir()
                manifests = Path(nested) / "import-manifests"
                manifests.mkdir()
                (manifests / "band-b-test-02.json").write_text('{"testId":"band-b-test-02","sourceIdentity":"official-tocfl:b:5"}')
                self.assertEqual(existing_source_id(data, "B", 5), "band-b-test-02")

    def test_legacy_match_requires_both_complete_keys_and_scores(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            exam = {"exam": {"id": "novice-reading-2018-11", "level": "Novice"}, "components": {skill: {"questions": [{"number": 1, "correctAnswer": "A"}], "scoring": {"scoreByCorrectCount": {"1": 10}}} for skill in ("listening", "reading")}}
            (root / "old.json").write_text(json.dumps(exam))
            files = {skill: {"answer_pdf": b"key", "score_pdf": b"score"} for skill in ("listening", "reading")}
            with patch("tocfl_import.build.extract_answers", return_value={1: "A"}), patch("tocfl_import.build.extract_scores", return_value={"1": 10}):
                self.assertEqual(matching_legacy_test(root, "Novice", files), "novice-reading-2018-11")
            with patch("tocfl_import.build.extract_answers", return_value={1: "A"}), patch("tocfl_import.build.extract_scores", return_value={"1": 11}):
                self.assertIsNone(matching_legacy_test(root, "Novice", files))

    def test_same_official_series_is_not_imported_twice(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "existing.json").write_text('{"exam":{"id":"band-b-test-02","level":"Band B","source":{"series":5}}}')
            with self.assertRaisesRegex(ImportErrorWithContext, "already imported"):
                ensure_new_source(root, "B", 5)

    def test_validation_rejects_missing_audio(self):
        package = {"exam": {"id": "band-b-test-02", "variants": ["traditional", "simplified"], "componentOrder": ["listening", "reading"], "totalQuestions": 2}, "components": {}}
        for skill in ("listening", "reading"):
            package["components"][skill] = {"totalQuestions": 1, "sections": [{"id": skill, "startQuestion": 1, "endQuestion": 1}], "scoring": {"scoreByCorrectCount": {"1": 80}}, "questions": [{"id": f"{skill}-q01", "number": 1, "sectionId": skill, "choices": list("ABCD"), "correctAnswer": "A", "choiceText": {"traditional": ["甲"] * 4, "simplified": ["甲"] * 4}, "stimulusGroupId": "g", "type": "gap_filling"}], "displayContexts": {"g": {"traditional": "甲", "simplified": "甲"}}}
        package["components"]["listening"]["audio"] = {"examPlaybackPlan": [{"type": "question", "questionId": "listening-q01", "path": "/tests/band-b-test-02/listening/audio/missing.mp3"}]}
        with tempfile.TemporaryDirectory() as temporary, self.assertRaisesRegex(ImportErrorWithContext, "Missing official audio"):
            validate_package(package, {"questions": [{"questionId": "listening-q01"}]}, Path(temporary))


class ImagePaperTests(unittest.TestCase):
    def test_band_a_two_shared_gap_pools_on_one_page(self):
        document = fitz.open()
        page = document.new_page(width=500, height=4000)
        for number in range(1, 36):
            y = 40 + (number - 1) * 110
            for index, line in enumerate((f"{number}. Question", "(A) a", "(B) b", "(C) c")):
                page.insert_text((50, y + index * 20), line)
        page = document.new_page(width=500, height=800)
        y = 40
        for first in (36, 41):
            markers = " ".join(f"（{number}）" for number in range(first, first + 5))
            page.insert_text((50, y), f"Passage {markers}", fontname="china-s")
            y += 30
            for letter in "ABCDEF":
                page.insert_text((50, y), f"({letter}) {first}-{letter}")
                y += 20
            y += 30
        page = document.new_page(width=500, height=800)
        for index, number in enumerate(range(46, 51)):
            y = 35 + index * 145
            page.insert_text((50, y), "（一）", fontname="china-s")
            page.insert_text((50, y + 20), "Passage")
            page.insert_text((50, y + 40), f"{number}. Prompt")
            for choice_index, letter in enumerate("ABCD"):
                page.insert_text((50, y + 60 + choice_index * 18), f"({letter}) {letter.lower()}")
        extracted = extract_image_paper(document.tobytes(), "reading", "A", 50)
        self.assertEqual(len(extracted.questions), 50)
        self.assertEqual(extracted.questions[36]["stimulusGroupId"], "reading-q36-q40")
        self.assertEqual(extracted.questions[41]["stimulusGroupId"], "reading-q41-q45")
        self.assertEqual(extracted.questions[40]["choiceText"][0], "36-A")
        self.assertEqual(extracted.questions[45]["choiceText"][0], "41-A")
        self.assertNotEqual(extracted.contexts["reading-q36-q40"], extracted.contexts["reading-q41-q45"])

    def test_shared_gap_pool_rejects_missing_marker_or_option(self):
        passage = " ".join(f"（{number}）" for number in range(36, 41))
        choices = "\n".join(f"({letter}) value" for letter in "ABCDEF")
        with self.assertRaisesRegex(ImportErrorWithContext, "passage gaps"):
            _shared_gap_pool(passage.replace("（39）", "") + "\n" + choices, 36)
        with self.assertRaisesRegex(ImportErrorWithContext, "six-choice pool"):
            _shared_gap_pool(passage + "\n" + choices.replace("(F)", "(E)"), 36)

    def test_boxed_document_before_printed_question_is_preserved_without_question_crop(self):
        document = fitz.open()
        page = document.new_page(width=600, height=800)
        page.draw_rect(fitz.Rect(50, 70, 550, 330))
        page.insert_text((90, 140), "Original notice text")
        page.insert_text((90, 370), "1. Printed question")
        self.assertIsNotNone(_vector_document_image(page, before_y=360))
        self.assertIsNone(_vector_document_image(page, before_y=200))

    def test_older_band_a_listening_keeps_picture_questions_after_q10(self):
        document = fitz.open()
        page = document.new_page(width=400, height=1700)
        pixel = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 50, 50), False)
        pixel.clear_with(150)
        picture = pixel.tobytes("png")
        for number in range(1, 12):
            y = number * 140
            page.insert_text((50, y), f"{number}.")
            page.insert_image(fitz.Rect(80, y + 10, 130, y + 60), stream=picture)
        extracted = extract_image_paper(document.tobytes(), "listening", "A", 11)
        self.assertEqual(len(extracted.questions), 11)
        self.assertEqual(extracted.questions[11]["choiceText"], ["", "", ""])
        self.assertIn(extracted.questions[11]["imageKey"], extracted.images)

    def test_question_image_choices_are_mapped_by_position(self):
        document = fitz.open()
        page = document.new_page(width=600, height=500)
        pixel = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 50, 50), False)
        pixel.clear_with(150)
        picture = pixel.tobytes("png")
        for number, y in ((1, 30), (2, 250)):
            page.insert_text((50, y + 15), f"{number}. example")
            for index, letter in enumerate("ABC"):
                page.insert_text((50 + index * 170, y + 40), f"({letter})")
                page.insert_image(fitz.Rect(60 + index * 170, y + 50, 140 + index * 170, y + 130), stream=picture)
        extracted = extract_image_paper(document.tobytes(), "reading", "A", 2)
        self.assertEqual([len(extracted.questions[n]["choiceImageKeys"]) for n in (1, 2)], [3, 3])
        self.assertEqual(len(extracted.images), 6)

    def test_one_shared_image_is_referenced_by_each_question(self):
        document = fitz.open()
        page = document.new_page(width=600, height=500)
        pixel = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 100, 80), False)
        pixel.clear_with(100)
        page.insert_image(fitz.Rect(50, 40, 300, 200), stream=pixel.tobytes("png"))
        for number, y in ((1, 240), (2, 350)):
            page.insert_text((50, y), f"{number}. example")
            for index, letter in enumerate("ABC"):
                page.insert_text((60, y + 15 + index * 18), f"({letter}) text")
        extracted = extract_image_paper(document.tobytes(), "reading", "A", 2)
        self.assertEqual(extracted.questions[1]["imageKey"], extracted.questions[2]["imageKey"])
        self.assertEqual(len(extracted.images), 1)

    def test_only_unambiguous_fourth_label_typo_is_normalized(self):
        corrected, warning = normalize_printed_choice_labels("(A) 甲\n(B) 乙\n(C) 丙\n(C) 丁", 43, 19)
        self.assertEqual(corrected, "(A) 甲\n(B) 乙\n(C) 丙\n(D) 丁")
        self.assertIn("Q43", warning)
        unchanged, warning = normalize_printed_choice_labels("(A) 甲\n(C) 乙\n(C) 丙\n(D) 丁", 43, 19)
        self.assertIsNone(warning)
        self.assertEqual(unchanged, "(A) 甲\n(C) 乙\n(C) 丙\n(D) 丁")

    def test_rasterized_page_reuses_one_asset_with_question_crops(self):
        document = fitz.open()
        page = document.new_page(width=600, height=500)
        pixel = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 600, 500), False)
        pixel.clear_with(220)
        page.insert_image(page.rect, stream=pixel.tobytes("png"))
        for number, y in ((1, 40), (2, 260)):
            page.insert_text((50, y), f"{number}. example")
            for index, letter in enumerate("ABC"):
                page.insert_text((60, y + 20 + index * 18), f"({letter}) answer")
        extracted = extract_image_paper(document.tobytes(), "reading", "A", 2)
        self.assertEqual(extracted.questions[1]["imageKey"], extracted.questions[2]["imageKey"])
        self.assertIn("prompt", extracted.questions[1]["visual"])
        self.assertEqual(len(extracted.images), 1)


if __name__ == "__main__":
    unittest.main()
