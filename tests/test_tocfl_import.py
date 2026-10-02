import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tocfl_import.build import audio_plan, ensure_new_source, next_test_id  # noqa: E402
from tocfl_import.discovery import ImportErrorWithContext, _classify_links, official_url  # noqa: E402
from tocfl_import.validate import validate_package  # noqa: E402
from bs4 import BeautifulSoup  # noqa: E402


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


if __name__ == "__main__":
    unittest.main()
