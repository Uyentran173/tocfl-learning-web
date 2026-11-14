"""Publish only the thirteen visually checked Volume 3 Lesson 01 tracks."""

import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "data/academy/cc3-audio-manifest.json").read_text())
tracks = [item for item in manifest["tracks"] if item["lesson"] == 1]
if len(tracks) != 13 or any(item["mappingStatus"] != "verified" or not item["activity"] for item in tracks):
    raise ValueError("Lesson 01 must have 11 textbook and 2 workbook verified tracks")
if sum(item["source"] == "textbook" for item in tracks) != 11:
    raise ValueError("Incomplete textbook audio")
for track in tracks:
    source = ROOT / ".private/academy/cc3" / track["privatePath"]
    data = source.read_bytes()
    if len(data) != track["bytes"] or hashlib.sha256(data).hexdigest() != track["sha256"]:
        raise ValueError(f"Audio checksum failed: {track['id']}")
    target = ROOT / "public/academy/cc3/audio" / f"{track['id']}.mp3"
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    if target.stat().st_size != track["bytes"]:
        raise ValueError(f"Published audio size mismatch: {track['id']}")
print(f"Published {len(tracks)} checked Lesson 01 tracks; all later tracks remain private.")
