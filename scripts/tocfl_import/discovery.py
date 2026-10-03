from __future__ import annotations

import re
import hashlib
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

OFFICIAL_PAGE = "https://tocfl.edu.tw/tocfl/index.php/exam/test/page/1?pressBtn=(MockText)"
ALLOWED_HOSTS = {"tocfl.edu.tw", "www.tocfl.edu.tw", "eapi.sc-top.org.tw"}
SERIES_DIGITS = {word: number for number, word in enumerate("一二三四五六七八九", 1)}


def _series_number(word: str) -> int:
    if word.isdigit():
        return int(word)
    if word in SERIES_DIGITS:
        return SERIES_DIGITS[word]
    if "十" in word:
        tens, _, ones = word.partition("十")
        if (not tens or tens in SERIES_DIGITS) and (not ones or ones in SERIES_DIGITS):
            return SERIES_DIGITS.get(tens, 1) * 10 + SERIES_DIGITS.get(ones, 0)
    raise ImportErrorWithContext(f"Unknown official series numeral: {word}")


def _series_word(series: int) -> str:
    if series < 1 or series > 99:
        return str(series)
    words = {number: word for word, number in SERIES_DIGITS.items()}
    if series < 10:
        return words[series]
    tens, ones = divmod(series, 10)
    return (words.get(tens, "") if tens > 1 else "") + "十" + words.get(ones, "")


class ImportErrorWithContext(RuntimeError):
    pass


def official_url(base: str, href: str) -> str:
    url = urljoin(base, href.replace("http://eapi.sc-top.org.tw/", "https://eapi.sc-top.org.tw/"))
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise ImportErrorWithContext(f"Refusing non-official URL: {url}")
    return url


def fetch(session: requests.Session, url: str) -> requests.Response:
    response = session.get(url, timeout=60)
    response.raise_for_status()
    official_url(url, response.url)
    return response


@dataclass(frozen=True)
class Sources:
    series: int
    band: str
    components: dict[str, dict[str, str]]
    page_url: str = OFFICIAL_PAGE


def _series_card(soup: BeautifulSoup, series: int, skill: str):
    chinese = {"listening": "聽力測驗", "reading": "閱讀測驗"}[skill]
    marker = f"{chinese}(第{_series_word(series)}輯)"
    button = next((b for b in soup.select("button") if marker in b.get_text(" ", strip=True)), None)
    if not button:
        raise ImportErrorWithContext(f"Official page has no {skill} series {series}")
    card = button.find_parent(class_="card")
    if not card:
        raise ImportErrorWithContext(f"Cannot locate table for {marker}")
    return card


def _source_row(card, band: str):
    marker = r"\bNovice\b" if band == "Novice" else rf"Band\s*{re.escape(band)}\b"
    heading = next((h for h in card.select("thead") if re.search(marker, h.get_text(" ", strip=True), re.I)), None)
    if not heading:
        raise ImportErrorWithContext(f"Band {band} is absent from this official series")
    table = heading.find_parent("table")
    rows = table.select("tbody tr") if table else []
    if not rows:
        raise ImportErrorWithContext(f"Band {band} has no downloadable source row")
    if band in {"Novice", "A"}:
        vietnamese = next((r for r in rows if "中越版" in r.get_text(" ", strip=True)), None)
        if vietnamese:
            return vietnamese
    if len(rows) > 1:
        raise ImportErrorWithContext(f"Band {band} has multiple rows without a Chinese–Vietnamese source")
    return rows[0]


def _classify_links(row, page_url: str, skill: str, band: str | None = None, series: int | None = None, session: requests.Session | None = None) -> dict[str, str]:
    candidates: dict[str, list[tuple[str, list[str]]]] = {}
    for anchor in row.select("a[href]"):
        label = anchor.get_text(" ", strip=True) + " " + anchor.get("title", "")
        url = official_url(page_url, anchor["href"])
        filename = urlparse(url).path.rsplit("/", 1)[-1].lower()
        key = None
        reasons = []
        if "答案" in label:
            key = "answer_pdf"
            reasons.append("link text/title: 答案")
        elif "正體試題" in label:
            key = "traditional_pdf"
            reasons.append("link text: 正體試題")
        elif "簡體試題" in label:
            key = "simplified_pdf"
            reasons.append("link text: 簡體試題")
        elif "線上音檔" in label:
            key = "online_audio"
            reasons.append("link text: 線上音檔")
        elif "音檔下載" in label or "聽力音檔" in label:
            key = "audio_archive"
            reasons.append("link text: audio download")
        elif "聽力試題文本" in label:
            key = "transcript_pdf"
            reasons.append("link text: 聽力試題文本")
        elif "分數對照表" in label:
            key = "score_pdf"
            reasons.append("link text: 分數對照表")
        elif filename.endswith(".pdf"):
            if re.search(r"(?:^|[_-])t\.pdf$", filename):
                key = "traditional_pdf"
                reasons.append("filename suffix: _t.pdf")
            elif re.search(r"(?:^|[_-])s\.pdf$", filename):
                key = "simplified_pdf"
                reasons.append("filename suffix: _s.pdf")
        if not key:
            continue
        if key.endswith("_pdf") and not filename.endswith(".pdf"):
            raise ImportErrorWithContext(f"{key} points to a non-PDF: {url}")
        if key in {"traditional_pdf", "simplified_pdf"}:
            expected_suffix = "_t.pdf" if key == "traditional_pdf" else "_s.pdf"
            opposite_suffix = "_s.pdf" if key == "traditional_pdf" else "_t.pdf"
            if filename.endswith(opposite_suffix):
                raise ImportErrorWithContext(f"Conflicting script signals for {url}: {', '.join(reasons)} versus filename {filename}")
            if filename.endswith(expected_suffix):
                reasons.append(f"filename suffix: {expected_suffix}")
        if skill == "listening" and (filename.startswith("ls_") or "listening" in filename):
            reasons.append("filename: Listening")
        if skill == "reading" and (filename.startswith("rd_") or "reading" in filename):
            reasons.append("filename: Reading")
        if band and re.search(rf"(?:band[_-]?{re.escape(band)}|(?:^|[_-]){re.escape(band)}(?:[_\.-]|$))", filename, re.I):
            reasons.append(f"filename: {band}")
        if series and (f"mock{series}" in filename or f"mock_{series}" in filename):
            reasons.append(f"filename: series {series}")
        candidates.setdefault(key, []).append((url, reasons))
    found = {}
    for key, entries in candidates.items():
        unique = {url: reasons for url, reasons in entries}
        if len(unique) > 1:
            ranked = []
            digests = {}
            for url, reasons in unique.items():
                score = sum(4 if reason.startswith("link text") else 2 if reason.startswith("filename suffix") else 1 for reason in reasons)
                if session and key.endswith("_pdf"):
                    import fitz
                    body = fetch(session, url).content
                    digests[url] = hashlib.sha256(body).hexdigest()
                    if not body.startswith(b"%PDF-"):
                        raise ImportErrorWithContext(f"Candidate is not a PDF: {url}")
                    document = fitz.open(stream=body, filetype="pdf")
                    title = (document.metadata.get("title") or "") + " " + " ".join(page.get_text()[:1000] for page in list(document)[:2])
                    expected = "聽力" if skill == "listening" else "閱讀"
                    opposite = "閱讀" if skill == "listening" else "聽力"
                    if expected in title:
                        score += 2
                        reasons.append(f"PDF content/title: {expected}")
                    if opposite in title and expected not in title:
                        score -= 3
                        reasons.append(f"PDF content/title conflicts: {opposite}")
                    if band and (f"Band {band}" in title or band == "Novice" and "準備級" in title):
                        score += 1
                        reasons.append(f"PDF content/title: Band {band}")
                ranked.append((score, url, reasons))
            ranked.sort(reverse=True)
            if len(ranked) > 1 and ranked[0][0] > ranked[1][0] and ranked[0][0] >= 5:
                found[key] = ranked[0][1]
                continue
            if len(digests) == len(unique) and len(set(digests.values())) == 1:
                # Two official links may be mirrors of the exact same PDF bytes.
                found[key] = next(iter(unique))
                continue
            details = "\n".join(f"  - {url} (score {score}): {', '.join(reasons)}" for score, url, reasons in ranked)
            raise ImportErrorWithContext(f"Ambiguous {skill} {key} for Band {band}, series {series}; inspect these official candidates:\n{details}")
        found[key] = next(iter(unique))
    required = {"traditional_pdf", "simplified_pdf", "answer_pdf", "score_pdf"}
    if skill == "listening":
        required |= {"transcript_pdf"}
        if "online_audio" not in found and "audio_archive" not in found:
            raise ImportErrorWithContext(f"{skill} Band {band} Series {series} has no official online audio or downloadable archive")
    missing = required - found.keys()
    if missing:
        raise ImportErrorWithContext(f"{skill} official row lacks: {', '.join(sorted(missing))}")
    return found


def discover(session: requests.Session, series: int, band: str, component: str) -> Sources:
    page = fetch(session, OFFICIAL_PAGE)
    soup = BeautifulSoup(page.text, "html.parser")
    skills = ["listening", "reading"] if component == "all" else [component]
    components = {}
    for skill in skills:
        card = _series_card(soup, series, skill)
        row = _source_row(card, band)
        components[skill] = _classify_links(row, OFFICIAL_PAGE, skill, band, series, session)
    return Sources(series, band, components)


def available_tests(session: requests.Session) -> list[tuple[str, int]]:
    """Enumerate every Band/Series row, including incomplete source pairs."""
    soup = BeautifulSoup(fetch(session, OFFICIAL_PAGE).text, "html.parser")
    skills: dict[str, set[tuple[str, int]]] = {"listening": set(), "reading": set()}
    for button in soup.select("button"):
        title = button.get_text(" ", strip=True)
        match = re.search(r"(聽力測驗|閱讀測驗)\s*\(第([一二三四五六七八九十]+|\d+)輯\)", title)
        if not match:
            continue
        skill = "listening" if match[1] == "聽力測驗" else "reading"
        series = _series_number(match[2])
        card = button.find_parent(class_="card")
        if not card or series is None:
            raise ImportErrorWithContext(f"Cannot inspect official series heading {title!r}")
        for band in ("Novice", "A", "B", "C"):
            try:
                _source_row(card, band)
            except ImportErrorWithContext:
                continue
            skills[skill].add((band, series))
    if not skills["listening"] and not skills["reading"]:
        raise ImportErrorWithContext("Official page has no mock-test tables")
    return sorted(skills["listening"] | skills["reading"], key=lambda item: (item[1], ("Novice", "A", "B", "C").index(item[0])))


def discover_audio_tracks(session: requests.Session, url: str) -> list[dict[str, str]]:
    """Read the labels paired with official individual MP3s on every audio page."""
    first = BeautifulSoup(fetch(session, url).text, "html.parser")
    pages = [url]
    for anchor in first.select('a[href*="NABC.php?page="]'):
        page = official_url(url, anchor["href"])
        if page not in pages:
            pages.append(page)
    if len(pages) > 1:
        pages = pages[1:]
    tracks: dict[str, dict[str, str]] = {}
    for page_url in pages:
        soup = BeautifulSoup(fetch(session, page_url).text, "html.parser")
        for audio in soup.select("audio:has(source[src])"):
            source = audio.select_one("source[src]")
            track_url = official_url(page_url, source["src"])
            if not re.search(r"/\d+\.mp3$", track_url, re.I):
                continue
            row = audio.find_parent("tr")
            cell = audio.find_parent("td")
            label = ""
            if row and cell:
                cells = row.find_all("td", recursive=False)
                previous = row.find_previous_sibling("tr")
                previous_cells = previous.find_all(["td", "th"], recursive=False) if previous else []
                if cell in cells and len(previous_cells) > cells.index(cell):
                    label = previous_cells[cells.index(cell)].get_text(" ", strip=True)
            if track_url in tracks and tracks[track_url]["label"] != label:
                raise ImportErrorWithContext(f"Conflicting official labels for {track_url}")
            tracks[track_url] = {"label": label, "url": track_url}
    if not tracks:
        raise ImportErrorWithContext(f"No individual audio tracks on {url}")
    return list(tracks.values())
