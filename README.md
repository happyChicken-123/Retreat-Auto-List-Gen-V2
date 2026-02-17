# Retreat List Generator

Quick local static demo to import a CSV of students and generate cabin, bandana, and bus groupings.

Usage
- Open `index.html` in a browser (double-click or use a local static server).
 - Open `index.html` in a browser (double-click) or run a local static server for best results.

Run a local server (optional, recommended):
```bash
# Python 3 built-in server (run in project folder)
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```
- Click "Download sample CSV" to get a sample, or upload your CSV with columns `name,school,gender`.
- Set counts for cabins, bandana groups, and buses, then click "Generate".
- Download results as JSON.

Notes
- Cabins are allocated per gender proportionally to the provided student genders.
- Bandana groups are filled to mix students from different cabins and maintain proportional gender counts roughly.
- Buses are assigned whole cabins (no splitting of cabin members across buses).
# RetreatListGen
# RetreatListGenV2
