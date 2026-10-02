"""Import a complete TOCFL ZIP under one stable logical test ID."""
from __future__ import annotations

import argparse
import json
import re
import shutil
import tempfile
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
KNOWN_IDS = {"tocfl-novice-mock-201811": "novice-reading-2018-11", "tocfl-band-a-test-1": "band-a-test-01"}


def source_path(path: str, names: set[str]) -> str:
    pure = PurePosixPath(path)
    if not path or pure.is_absolute() or ".." in pure.parts or path not in names:
        raise ValueError(f"Missing or unsafe package asset: {path}")
    return path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--test-id", help="Stable logical ID for a new test")
    args = parser.parse_args()
    with ZipFile(args.archive) as archive:
        names = set(archive.namelist())
        package = json.loads(archive.read("exam.json"))
        exam = package["exam"]
        source_id = exam["id"]
        test_id = args.test_id or KNOWN_IDS.get(source_id)
        if not test_id or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", test_id):
            raise ValueError("Pass a safe, stable --test-id for this package.")
        if package.get("schemaVersion") != "2.0" or exam.get("componentOrder") != ["listening", "reading"]:
            raise ValueError("Package must contain one complete Listening + Reading test.")
        if exam.get("variants") != ["traditional", "simplified"]:
            raise ValueError("Package must contain both script variants.")
        components = package["components"]
        seen: set[str] = set()
        assets: set[str] = set()
        total = 0
        for skill in exam["componentOrder"]:
            component = components[skill]
            questions = component["questions"]
            if component["id"] != skill or component["totalQuestions"] != len(questions) or not questions:
                raise ValueError(f"Incomplete {skill} component.")
            total += len(questions)
            sections = {part["id"]: part for part in component["sections"]}
            for index, question in enumerate(questions, start=1):
                if question["number"] != index or question["id"] in seen or question["sectionId"] not in sections:
                    raise ValueError(f"Invalid question order or identity in {skill}.")
                seen.add(question["id"])
                choices = question["choices"]
                if choices != [chr(65 + i) for i in range(len(choices))] or len(choices) < 2 or question["correctAnswer"] not in choices:
                    raise ValueError(f"Invalid answer in {question['id']}.")
                for script in exam["variants"]:
                    path = source_path(question["assets"][script], names)
                    if not question.get("variantInvariant") and f"/{script}/" not in f"/{path}":
                        raise ValueError(f"Wrong script slot in {question['id']}.")
                    assets.add(path)
                if question.get("variantInvariant") and question["assets"]["traditional"] != question["assets"]["simplified"]:
                    raise ValueError(f"Shared image differs in {question['id']}.")
                if skill == "listening":
                    assets.add(source_path(question["audio"], names))
            for part in component["sections"]:
                if part.get("introAudio"):
                    assets.add(source_path(part["introAudio"], names))
            for key in ("examIntro", "endingTrack"):
                if component.get("audio", {}).get(key):
                    assets.add(source_path(component["audio"][key], names))
            if not component.get("scoring", {}).get("scoreByCorrectCount"):
                raise ValueError(f"Missing {skill} score table.")
        if total != exam["totalQuestions"]:
            raise ValueError("Question totals do not match.")
        transcript_path = components["listening"].get("transcriptDataPath")
        transcript = None
        if transcript_path:
            source_path(transcript_path, names)
            transcript = json.loads(archive.read(transcript_path))
            if transcript.get("examId") != source_id or transcript.get("componentId") != "listening":
                raise ValueError("Transcript belongs to another test.")
            listening = {question["id"]: question["number"] for question in components["listening"]["questions"]}
            for item in transcript.get("questions", []):
                if listening.get(item.get("questionId")) != item.get("number"):
                    raise ValueError("Transcript question ID or number does not match.")

        data_dir = ROOT / "data" / "structured-tests"
        supplement_dir = ROOT / "data" / "test-supplements" / test_id
        public_dir = ROOT / "public" / "tests"
        data_dir.mkdir(parents=True, exist_ok=True)
        public_dir.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=public_dir) as staging_name:
            staging = Path(staging_name)
            for path in sorted(assets):
                destination = staging / path
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(archive.read(path))
            for skill in exam["componentOrder"]:
                component = components[skill]
                for part in component["sections"]:
                    if part.get("introAudio"):
                        part["introAudio"] = f"/tests/{test_id}/{part['introAudio']}"
                for key in ("examIntro", "endingTrack"):
                    if component.get("audio", {}).get(key):
                        component["audio"][key] = f"/tests/{test_id}/{component['audio'][key]}"
                for question in component["questions"]:
                    question["assets"] = {script: f"/tests/{test_id}/{question['assets'][script]}" for script in exam["variants"]}
                    if question.get("audio"):
                        question["audio"] = f"/tests/{test_id}/{question['audio']}"
                    if skill == "listening" and question.get("transcriptRef"):
                        question["transcriptRef"] = f"data/test-supplements/{test_id}/listening-transcripts.json#{question['id']}"
                if skill == "listening" and transcript is not None:
                    component["transcriptDataPath"] = f"data/test-supplements/{test_id}/listening-transcripts.json"
            exam["id"] = test_id
            test_number = re.search(r"-test-(\d+)$", test_id)
            if test_number:
                exam["title"] = f"TOCFL {exam['level']} — Đề {int(test_number.group(1)):02d}"
            target_assets = public_dir / test_id
            if target_assets.exists():
                shutil.rmtree(target_assets)
            shutil.move(str(staging), target_assets)
        if transcript is not None:
            transcript["examId"] = test_id
            supplement_dir.mkdir(parents=True, exist_ok=True)
            (supplement_dir / "listening-transcripts.json").write_text(json.dumps(transcript, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        target_data = data_dir / f"{test_id}.json"
        target_data.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Imported {test_id}: {total} questions, {len(assets)} assets.")


if __name__ == "__main__":
    main()
