"""Descarga las tipografías de la web (Google Fonts, subconjunto latino) a public/assets/fonts y escribe src/fonts.css.
Así la página no envía la IP del visitante a Google (RGPD) y el CSP puede ser estricto ('self').
Uso: python tools/fetch-fonts.py   (necesita conexión; los woff2 y fonts.css resultantes se versionan)"""
import os, re, urllib.request

CSS_URL = ("https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Syne:wght@600;700;800"
           "&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
OUT = "public/assets/fonts"

req = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=30).read()
css = req(CSS_URL).decode()
os.makedirs(OUT, exist_ok=True)

faces, files = [], {}
for sub, body in re.findall(r"/\* ([\w-]+) \*/\s*@font-face\s*\{(.*?)\}", css, re.S):
    if sub != "latin":
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
    wt = re.search(r"font-weight:\s*(\d+)", body).group(1)
    url = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
    rng = re.search(r"unicode-range:\s*([^;]+);", body).group(1)
    if url not in files:      # Google reutiliza el mismo archivo variable para varios pesos
        name = f"{fam.lower().replace(' ', '-')}-{wt}.woff2"
        with open(f"{OUT}/{name}", "wb") as f:
            f.write(req(url))
        files[url] = name
    faces.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{wt};font-display:swap;"
                 f"src:url(/assets/fonts/{files[url]}) format('woff2');unicode-range:{rng}}}")

with open("src/fonts.css", "w", encoding="utf-8") as f:
    f.write("/* generado por tools/fetch-fonts.py: tipografías alojadas en la propia web (subconjunto latino) */\n" + "\n".join(faces) + "\n")
print(len(faces), "caras,", len(files), "archivos:", ", ".join(sorted(files.values())))
