# Builds content/documents/documents.json and copies the PDFs into public/documents/, from the files downloaded once from the legacy
# site into .agent/docs-src/ (not committed; the 2020 and 2023 annual reports and the 2018-2023 plan are resampled to 120 dpi here) plus the 2021 annual report compressed to 120 dpi (.agent/pdf/ar2021-120.pdf, Jordan's choice).
# Meeting dates and meeting-minutes titles are read from each PDF's first page, and so is the bylaws adoption date. The titles of the annual reports
# and strategic plans and the series names are typed here; the year of each is checked against the first-page text and the CSV says where it came
# from (the 2022 annual report is image-only: its year is the legacy file name's). Needs PyMuPDF (a scratch tool, not a project dependency). Also
# writes agent/parity/documents-sources.csv (provenance: legacy address, hosted name, where the year came from, a short text excerpt without addresses).
# Run from the repository root: .agent/venv/bin/python agent/parity/documents-build.py
import csv, json, os, re, shutil, glob
import pymupdf
ROOT = os.getcwd()
SRC = '.agent/docs-src'
MONTHS = {m: i + 1 for i, m in enumerate(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])}
FULL = {'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April', 'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August', 'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'}
def first_page(path):
    d = pymupdf.open(path); return re.sub(r'\s+', ' ', d[0].get_text()).strip()
def legacy_url(name):
    for u in LEG:
        if u.endswith('/' + name): return u
    return ''
SLIM = {'Annual_Report_2020_Final.pdf', 'Annual-Report-2023-FINAL.pdf', 'StrategicPlan_SinglePages.pdf'}
LEG = [r['url'] for r in csv.DictReader(open('agent/parity/legacy-files.csv', encoding='utf8'))]
docs, rows = [], []
def add(kind, title, year, hosted, src, series=None, date=None, note=None, text=''):
    year_from = 'first-page text' if str(year) in text else 'legacy file name (the PDF has no readable first-page text)'
    d = {'title': title, 'kind': kind}
    if series: d['series'] = series
    d['year'] = year
    if date: d['date'] = date
    d['file'] = '/documents/' + hosted
    if note: d['note'] = note
    docs.append(d)
    os.makedirs(os.path.dirname('public/documents/' + hosted), exist_ok=True)
    orig = os.path.basename(src)
    if orig in SLIM:
        # Jordan's choice (6 Oct): the three largest files are resampled like the 2021 report; the text is unchanged
        z = pymupdf.open(src); z.rewrite_images(dpi_threshold=140, dpi_target=120, quality=70); z.save('public/documents/' + hosted, garbage=4, deflate=True); z.close()
        src = 'public/documents/' + hosted; slimmed = True
    else:
        shutil.copyfile(src, 'public/documents/' + hosted); slimmed = False
    rows.append({'title': title, 'kind': kind, 'hosted_as': '/documents/' + hosted, 'legacy_file': (legacy_url(orig) + (' (hosted copy resampled to 120 dpi)' if slimmed else '')) if legacy_url(orig) else '(compressed copy of the 2021 report; original is Annual_Report_2021_-_Visual.pdf, 27.7 MB)', 'size_bytes': os.path.getsize(src), 'year_from': year_from, 'first_page_text_read': re.sub(r'https?://\S+', '', text)[:90].strip()})
# ---- meeting minutes: the date is the one the document states on its first page
special = {'2018_Membership_Minutes.pdf', 'Minutes-2023-01-Board-Meeting_v2.docx.pdf'}
for f in sorted(glob.glob(SRC + '/*.pdf')):
    n = os.path.basename(f)
    if 'inute' not in n: continue
    t = first_page(f)
    if n == '2018_Membership_Minutes.pdf':
        m = re.search(r'Membership Meeting Minutes (December) (\d{1,2}), (\d{4})', t); mo, d1, y = 'dec', int(m.group(2)), int(m.group(3)); title = f'Membership meeting minutes, {FULL[mo]} {d1}, {y}'; end = None
    elif n.startswith('Minutes-2023-01'):
        m = re.search(r'Meeting (January) (\d{1,2}) – (\d{1,2}), (\d{4})', t); mo, d1, end, y = 'jan', int(m.group(2)), int(m.group(3)), int(m.group(4)); title = f'Winter Board of Directors meeting minutes, January {d1}–{end}, {y}'
    else:
        m = re.search(r'Meeting Minutes ([A-Z][a-z]{2,8})\.? (\d{1,2})(?: ?[-–] ?(\d{1,2}))?, (\d{4})', t)
        if not m: raise SystemExit('no date read from ' + n)
        mo = m.group(1)[:3].lower(); d1 = int(m.group(2)); end = int(m.group(3)) if m.group(3) else None; y = int(m.group(4))
        title = f'Board meeting minutes, {FULL[mo]} {d1}{"–" + str(end) if end else ""}, {y}'
    date = f'{y}-{MONTHS[mo]:02d}-{d1:02d}'
    add('minutes', title, y, f'minutes/{date}-' + ('membership' if n.startswith('2018') else 'board') + '-meeting-minutes.pdf', f, date=date, text=t)
# ---- the rest
def one(name): return f'{SRC}/{name}'
bt = first_page(one('2024-07-24-Bylaws_Final.docx.pdf'))
bm = re.search(r'ADOPTED BY ELECTRONIC VOTE OF MORE THAN SIXTY PERCENT OF MEMBERS, ([A-Z][a-z]+ \d{1,2}, \d{4})', bt)
add('governance', 'Bylaws', int(bm.group(1)[-4:]), 'governance/bylaws-2024.pdf', one('2024-07-24-Bylaws_Final.docx.pdf'), note=f'Adopted by electronic vote of the members, {bm.group(1)}. Text revised July 2024.', text=bt)
add('plan', 'Strategic Plan 2023–2028', 2023, 'strategic-plans/strategic-plan-2023-2028.pdf', one('Strategic-Plan-2023-Final.1.pdf'), series='Strategic plans', text=first_page(one('Strategic-Plan-2023-Final.1.pdf')))
add('plan', 'Strategic Plan 2018–2023', 2018, 'strategic-plans/strategic-plan-2018-2023.pdf', one('StrategicPlan_SinglePages.pdf'), series='Strategic plans', text=first_page(one('StrategicPlan_SinglePages.pdf')))
for y, name in [(2020, 'Annual_Report_2020_Final.pdf'), (2022, 'Annual-Report-2022_FINAL.pdf'), (2023, 'Annual-Report-2023-FINAL.pdf'), (2024, 'Annual-Report-2024.pdf'), (2025, '2025-Annual-Report_Final_reduced.pdf')]:
    add('report', f'{y} Annual Report', y, f'annual-reports/annual-report-{y}.pdf', one(name), series='Annual reports', text=first_page(one(name)))
add('report', '2021 Annual Report', 2021, 'annual-reports/annual-report-2021.pdf', '.agent/pdf/ar2021-120.pdf', series='Annual reports', text=first_page('.agent/pdf/ar2021-120.pdf'))
# display order: kind, then newest first (the page groups and sorts; the file is kept readable)
order = {'governance': 0, 'plan': 1, 'report': 2, 'minutes': 3}
docs.sort(key=lambda d: (order[d['kind']], -d['year'], d.get('date', ''), d['title']))
os.makedirs('content/documents', exist_ok=True)
json.dump(docs, open('content/documents/documents.json', 'w', encoding='utf8'), indent=2, ensure_ascii=False); open('content/documents/documents.json', 'a').write('\n')
with open('agent/parity/documents-sources.csv', 'w', newline='', encoding='utf8') as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()), lineterminator='\n'); w.writeheader(); w.writerows(sorted(rows, key=lambda r: r['hosted_as']))
print(len(docs), 'documents;', sum(os.path.getsize('public/documents/' + d['file'][len('/documents/'):]) for d in docs) // 1000000, 'MB hosted')
