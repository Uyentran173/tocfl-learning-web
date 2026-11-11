"""Copy only PDF-verified CC1 tracks from private staging to public assets.

The publisher checks every source byte against the import manifest and never
publishes tracks without an identified textbook or workbook activity.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / ".private" / "academy" / "cc1"
PUBLIC = ROOT / "public" / "academy" / "cc1" / "audio"
MANIFEST = ROOT / "data" / "academy" / "cc1-audio-manifest.json"


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    tracks = [track for track in manifest["tracks"] if track["mappingStatus"] == "verified"]
    if len(tracks) != 140:
        raise ValueError(f"Expected 140 verified tracks, found {len(tracks)}")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    expected_names = {f"{track['id']}.mp3" for track in tracks}
    for old in PUBLIC.glob("*.mp3"):
        if old.name not in expected_names:
            raise ValueError(f"Unexpected public CC1 audio asset: {old.name}")
    copied = 0
    for track in tracks:
        source = PRIVATE / track["privatePath"]
        if not source.is_file():
            raise FileNotFoundError(source)
        data = source.read_bytes()
        if len(data) != track["bytes"] or hashlib.sha256(data).hexdigest() != track["sha256"]:
            raise ValueError(f"Source checksum mismatch: {track['id']}")
        target = PUBLIC / f"{track['id']}.mp3"
        if not target.is_file() or target.read_bytes() != data:
            target.write_bytes(data)
            copied += 1
    print(f"Verified {len(tracks)} CC1 tracks; copied {copied}; {len(manifest['tracks']) - len(tracks)} remain private pending mapping")


if __name__ == "__main__":
    main()
