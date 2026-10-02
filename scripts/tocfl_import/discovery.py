from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

OFFICIAL_PAGE = "https://tocfl.edu.tw/tocfl/index.php/exam/test/page/1?pressBtn=(MockText)"
ALLOWED_HOSTS = {"tocfl.edu.tw", "www.tocfl.edu.tw", "eapi.sc-top.org.tw"}


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
    numerals = {1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八", 9: "九"}
    marker = f"{chinese}(第{numerals.get(series, str(series))}輯)"
    button = next((b for b in soup.select("button") if marker in b.get_text(" ", strip=True)), None)
    if not button:
        raise ImportErrorWithContext(f"Official page has no {skill} series {series}")
    card = button.find_parent(class_="card")
    if not card:
        raise ImportErrorWithContext(f"Cannot locate table for {marker}")
    return card


def _source_row(card, band: str):
    heading = next((h for h in card.select("thead") if re.search(rf"Band\s*{re.escape(band)}\b", h.get_text(" ", strip=True), re.I)), None)
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


def _classify_links(row, page_url: str, skill: str) -> dict[str, str]:
    found = {}
    for anchor in row.select("a[href]"):
        label = anchor.get_text(" ", strip=True) + " " + anchor.get("title", "")
        url = official_url(page_url, anchor["href"])
        key = None
        if "正體試題" in label:
            key = "traditional_pdf"
        elif "簡體試題" in label:
            key = "simplified_pdf"
        elif "線上音檔" in label:
            key = "online_audio"
        elif "音檔下載" in label:
            key = "audio_archive"
        elif "答案" in label:
            key = "answer_pdf"
        elif "聽力試題文本" in label:
            key = "transcript_pdf"
        elif "分數對照表" in label:
            key = "score_pdf"
        if key and key not in found:
            found[key] = url
    required = {"traditional_pdf", "simplified_pdf", "answer_pdf", "score_pdf"}
    if skill == "listening":
        required |= {"transcript_pdf", "online_audio"}
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
        components[skill] = _classify_links(row, OFFICIAL_PAGE, skill)
    return Sources(series, band, components)


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
