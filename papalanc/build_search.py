#!/usr/bin/env python3
"""Build search.json for the cookbook home page search box.

Reads every recipe entry in index.html, pulls the text of each linked recipe
page (and PDF, when pdftotext is installed), and writes search.json next to
index.html.  Run from anywhere:  python3 ~/papalanccooks/build_search.py
"""
import html
import json
import os
import re
import shutil
import subprocess
import tempfile
import urllib.parse
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.abspath(__file__))
NOISE = ["Back to Cookbook", "WELCOME", "Print"]


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in ("style", "script", "button", "title"):
            self.skip += 1
        if tag in ("p", "li", "br", "h1", "h2", "h3", "h4", "div", "tr"):
            self.out.append(" ")

    def handle_endtag(self, tag):
        if tag in ("style", "script", "button", "title") and self.skip:
            self.skip -= 1

    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)


def page_text(path):
    p = Text()
    with open(path, encoding="utf-8", errors="replace") as fh:
        s = fh.read()
    s = re.sub(r'<p class="original".*?</p>', " ", s, flags=re.S)
    s = re.sub(r'<a class="back".*?</a>', " ", s, flags=re.S)
    p.feed(s)
    t = html.unescape(" ".join(p.out))
    for n in NOISE:
        t = t.replace(n, " ")
    return re.sub(r"\s+", " ", t).strip()


def pdf_text(path):
    if not shutil.which("pdftotext"):
        return ""
    try:
        r = subprocess.run(["pdftotext", "-q", path, "-"], capture_output=True, text=True, timeout=30)
        return re.sub(r"\s+", " ", r.stdout).strip()
    except Exception:
        return ""


CACHE = os.path.join(ROOT, "ocr_cache.json")
try:
    ocr_cache = json.load(open(CACHE, encoding="utf-8"))
except Exception:
    ocr_cache = {}


def ocr_image(path):
    try:
        r = subprocess.run(["tesseract", path, "-", "--psm", "6"], capture_output=True, text=True, timeout=120)
        return re.sub(r"\s+", " ", r.stdout).strip()
    except Exception:
        return ""


def ocr_pdf(path):
    with tempfile.TemporaryDirectory() as td:
        try:
            subprocess.run(["pdftoppm", "-r", "200", "-png", path, os.path.join(td, "p")], timeout=120, capture_output=True)
        except Exception:
            return ""
        return " ".join(ocr_image(os.path.join(td, f)) for f in sorted(os.listdir(td)))


def cached(path, fn):
    key = "%s|%d" % (path, int(os.path.getmtime(path)))
    if key not in ocr_cache:
        ocr_cache[key] = fn(path)
    return ocr_cache[key]


def local(href):
    h = urllib.parse.unquote(href.split("#")[0])
    while h.startswith("../"):
        h = h[3:]
    return h


idx = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
sections = [(m.start(), html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip())
            for m in re.finditer(r"<h2>(.*?)</h2>", idx)]
sections = [(p, re.sub(r"\s*\(\d+\)$", "", t)) for p, t in sections]

records = []
for m in re.finditer(r'<li class="recipe" id="([^"]+)">(.*?)</li>', idx, re.S):
    rid, body = m.group(1), m.group(2)
    title_html = re.search(r'<div class="recipe-title">(.*?)</div>', body, re.S)
    title = html.unescape(re.sub(r"<[^>]+>", "", title_html.group(1))).replace("★", "").strip()
    sec = ""
    for pos, name in sections:
        if pos < m.start():
            sec = name
    links = []
    for lm in re.finditer(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', body, re.S):
        href = lm.group(1)
        if href.startswith("#") or href.startswith("http"):
            continue
        label = html.unescape(re.sub(r"<[^>]+>", "", lm.group(2))).strip()
        links.append([label, local(href)])
    texts = []
    for _, href in links:
        path = os.path.join(ROOT, href)
        if not os.path.isfile(path):
            continue
        if href.lower().endswith(".html"):
            texts.append(page_text(path))
        elif href.lower().endswith(".pdf"):
            t = pdf_text(path)
            if len(t) < 40 and shutil.which("tesseract") and shutil.which("pdftoppm"):
                t = cached(path, ocr_pdf)  # scanned PDF with no text layer
            texts.append(t)
        elif href.lower().endswith((".jpg", ".jpeg", ".png")) and shutil.which("tesseract"):
            texts.append(cached(path, ocr_image))
        elif href.lower().endswith(".txt"):
            texts.append(re.sub(r"\s+", " ", open(path, encoding="utf-8", errors="replace").read()).strip())
    records.append({"id": rid, "t": title, "s": sec, "l": links, "x": " ".join(t for t in texts if t)})

with open(CACHE, "w", encoding="utf-8") as fh:
    json.dump(ocr_cache, fh, ensure_ascii=False)
with open(os.path.join(ROOT, "search.json"), "w", encoding="utf-8") as fh:
    json.dump(records, fh, ensure_ascii=False, separators=(",", ":"))
with_text = sum(1 for r in records if r["x"])
print("recipes:", len(records), "with searchable text:", with_text, "title only:", len(records) - with_text)
print("size KB:", os.path.getsize(os.path.join(ROOT, "search.json")) // 1024)
