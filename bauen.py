"""Baut aus den Einzeldateien die fertigen Seiten (CSS und JavaScript eingebettet):
  vorlage.html          → index.html   (die Übung)
  pruefen-vorlage.html  → pruefen.html (Prüfseite für Zusatzverben)
Aufruf im selben Ordner:  python bauen.py
Die Zugangsdaten werden aus konfiguration.js übernommen."""
import re, pathlib
hier = pathlib.Path(__file__).resolve().parent
css = (hier / 'style.css').read_text(encoding='utf-8')

def einbetten(m):
    name = m.group(1)
    code = (hier / name).read_text(encoding='utf-8')
    if name == 'konfiguration.js':
        code = ('/* ===================== ZUGANGSDATEN ZUM SPEICHERDIENST =====================\n'
                '   Hier die Project URL und den Publishable Key von Supabase eintragen (siehe README). */\n'
                + code + '/* ========================================================================== */\n')
    assert '</script' not in code.lower()
    return '<script>\n/* ---- ' + name + ' ---- */\n' + code + '</script>'

for quelle, ziel in [('vorlage.html', 'index.html'), ('pruefen-vorlage.html', 'pruefen.html')]:
    html = (hier / quelle).read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '</style>')
    html = re.sub(r'<script src="([a-z]+\.js)"></script>', einbetten, html)
    assert '<script src=' not in html and 'href="style.css"' not in html
    (hier / ziel).write_text(html, encoding='utf-8')
    print(ziel, 'gebaut:', len(html.encode('utf-8')) // 1024, 'KB')
