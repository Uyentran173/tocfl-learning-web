import sys
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tocfl_import.build import audio_plan, ensure_new_source, existing_source_id, matching_legacy_test, next_test_id  # noqa: E402
from tocfl_import.discovery import ImportErrorWithContext, _classify_links, official_url  # noqa: E402
from tocfl_import.validate import validate_package  # noqa: E402
from tocfl_import.visual_pdf import extract_image_paper  # noqa: E402
from tocfl_import.pdf import normalize_printed_choice_labels  # noqa: E402
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


class AudioTests(unittest.TestCase):
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
