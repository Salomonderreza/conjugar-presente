# ¡Conjuga! – Spanische Verben im Präsens

Web-App zum Üben der spanischen Präsens-Konjugation. Die Bedienung ist deutsch, Verben und Antworten sind spanisch. Die App läuft im Browser und braucht keine Installation. Den Lernstand speichert sie über einen Fortsetzungscode im Speicherdienst **Supabase** (Region EU). Zusätzlich behält sie eine Kopie auf dem Gerät, damit sie auch ohne Verbindung funktioniert.

- **Frontend:** statische Dateien, veröffentlicht über **GitHub Pages**
- **Speicherdienst:** **Supabase** (kostenloser Tarif, Rechenzentrum Frankfurt)
- **Eigener Server:** nicht nötig – der Browser spricht direkt mit Supabase

Welche Verben in welchem Level vorkommen und wie die Aufgaben gewichtet sind, steht in [DOKUMENTATION.md](DOKUMENTATION.md).

---

## 1. Sofort ausprobieren (ohne Einrichtung)

Öffne die Datei `index.html` per Doppelklick im Browser. Die App steckt komplett in dieser einen Datei, sie funktioniert also auch, wenn du sie allein kopierst oder direkt aus der ZIP öffnest. Ohne Speicherdienst speichert sie aber **nur auf diesem Gerät**. Darauf weist sie unten auf der Seite hin. Fortsetzen mit Code auf anderen Geräten geht erst nach Schritt 2.

## 2. Speicherdienst einrichten (Supabase, einmalig ca. 10 Minuten)

1. Lege unter [supabase.com](https://supabase.com) ein kostenloses Konto an.
2. **New project** anlegen:
   - Name beliebig, z. B. `conjuga`
   - ein Datenbank-Passwort vergeben (wird für die App nicht gebraucht, aber gut aufheben)
   - **Region: Central EU (Frankfurt)**
3. Warte, bis das Projekt bereit ist (1–2 Minuten).
4. Öffne links den **SQL Editor** → **New query**.
5. Öffne die Datei `einrichtung.sql` mit einem Texteditor, kopiere den **gesamten Inhalt** in das Feld und klicke auf **Run**.
   Die Meldung lautet „Success. No rows returned“. Das Skript kannst du bei Bedarf gefahrlos erneut ausführen.
6. Hole dir die beiden Zugangsdaten. Du findest sie über den Knopf **Connect** oben im Projekt oder unter **Project Settings → API Keys**:
   - **Project URL**, z. B. `https://abcdefghijkl.supabase.co`
   - **Publishable key** (beginnt mit `sb_publishable_…`). Bei älteren Projekten heißt er **anon public** (beginnt mit `eyJ…`). Beide funktionieren.
   - ⚠️ Den **Secret key** bzw. **service_role key** niemals verwenden.
7. Öffne `index.html` mit einem Texteditor (z. B. Editor/Notepad: Rechtsklick → Öffnen mit), suche nach **ZUGANGSDATEN** und ersetze dort die beiden Platzhalter:

   ```js
   var KONFIGURATION = {
     supabaseUrl: 'https://abcdefghijkl.supabase.co',
     supabaseKey: 'sb_publishable_…'
   };
   ```

Der Publishable Key ist für den Browser gedacht und darf öffentlich sichtbar sein. Die Datenbank ist so eingerichtet, dass man damit nur einen einzelnen Lernstand lesen oder ändern kann, und nur mit dem vollständigen Code. Alle Lernstände auflisten kann man damit nicht.

## 3. Veröffentlichen mit GitHub Pages

1. Lege auf [github.com](https://github.com) ein neues **öffentliches** Repository an, z. B. `spanische-verben`.
2. Lade die Dateien hoch: **Add file → Upload files**, alle Dateien aus dem Ordner markieren und hineinziehen (oder über „choose your files“ auswählen), dann **Commit changes**.
   Zum Laufen braucht die App nur die `index.html`. Die übrigen Dateien schaden nicht und halten alles an einem Ort.
3. **Settings → Pages**: unter „Build and deployment“ **Deploy from a branch** wählen, Branch **main**, Ordner **/ (root)** → **Save**.
4. Nach 1–2 Minuten ist die App erreichbar unter
   `https://DEIN-GITHUB-NAME.github.io/spanische-verben/`

Für spätere Änderungen lädst du die geänderte Datei einfach erneut hoch.

## 4. Kurz prüfen

1. App öffnen → **Neu beginnen** → einige Aufgaben lösen. Unten steht „Lernstand gespeichert ✓“.
2. In Supabase unter **Table Editor → lernstand** erscheint eine Zeile mit deinem Code.
3. Auf einem zweiten Gerät die App öffnen → **Ich habe schon einen Code** → Code eingeben. Level und Fortschritt sind dieselben.

## 5. Pausieren des kostenlosen Projekts verhindern

Supabase pausiert kostenlose Projekte, wenn sie eine Woche lang kaum genutzt werden, z. B. in den Ferien. Die gespeicherten Daten bleiben erhalten. Das Projekt muss dann aber im Supabase-Dashboard über **Resume project** wieder gestartet werden. Solange es pausiert, zeigt die App „Gerade keine Verbindung“ und speichert nur auf dem jeweiligen Gerät.

Damit das nicht passiert, gibt es einen kleinen automatischen Ablauf, der sich alle drei Tage bei Supabase meldet. Er liest die Zugangsdaten aus der `index.html`. GitHub führt solche Abläufe nur aus dem Unterordner `.github/workflows` aus. Lege ihn deshalb einmalig direkt auf GitHub an:

1. Im Repository **Add file → Create new file**.
2. Als Dateinamen genau eintippen: `.github/workflows/speicherdienst-wach-halten.yml`
   (Bei jedem `/` legt GitHub automatisch einen Ordner an.)
3. Den gesamten Inhalt der Datei `speicherdienst-wach-halten.yml` hineinkopieren → **Commit changes**.

Die Datei `speicherdienst-wach-halten.yml` im Hauptordner selbst bewirkt nichts. Sie dient nur als Vorlage.

- Kontrolle: im Repository unter **Actions** → „Speicherdienst wach halten“. Dort kannst du ihn auch per **Run workflow** sofort starten.
- GitHub schaltet solche zeitgesteuerten Abläufe ab, wenn im öffentlichen Repository 60 Tage lang nichts geändert wurde. Schau deshalb ab und zu unter **Actions** nach: Dort lässt sich der Ablauf mit einem Klick wieder aktivieren.

## 6. Neue Verben ergänzen (für Lehrkräfte)

Neue Verben kommen in die Datei `zusatzverben.txt`. Dafür braucht es keinen Code und kein erneutes Hochladen der App.

1. Im GitHub-Repository die Datei `zusatzverben.txt` anklicken → Stift-Symbol (**Edit this file**).
2. Unter der passenden Gruppen-Überschrift eine Zeile ergänzen: **Infinitiv; yo-Form**
   ```
   [o-ue]
   volver; vuelvo
   ```
   Reflexive Verben schreibt man so: `levantarse; me levanto`
3. **Commit changes** klicken. Nach 1–2 Minuten ist das Verb in der App. Wer die App gerade offen hat, sieht es nach dem nächsten Neuladen.
4. Zur Kontrolle die Prüfseite öffnen: `https://DEIN-GITHUB-NAME.github.io/spanische-verben/pruefen.html`. Sie zeigt alle Formen, die die App gebildet hat. Fehlerhafte Zeilen sind rot markiert, auffällige gelb, jeweils mit Erklärung. Text lässt sich dort auch vor dem Speichern ausprobieren.

Die Gruppen-Überschriften lauten `[ar]`, `[er]`, `[ir]`, `[1. Person]`, `[e-ie]`, `[o-ue]`, `[e-i]` und `[i-y]`. Eine Zeile mit Fehler überspringt die App einfach, die Übung läuft weiter. Ein Verb entfernt man, indem man seine Zeile löscht. Die Lernstände der SuS bleiben davon unberührt.

Wichtig: Neue Verben erscheinen nur in der veröffentlichten App auf GitHub Pages. Öffnet man die `index.html` direkt vom eigenen Rechner, kann der Browser die Zusatzdatei nicht lesen. Dann gibt es nur die Verben aus der Original-Tabelle.

## Aufbau

Alle Dateien liegen in einem einzigen Ordner, ohne Unterordner.

```
index.html                       die komplette App
zusatzverben.txt                 von Lehrkräften ergänzte Verben (Schritt 6)
pruefen.html                     Prüfseite für die Zusatzverben (Schritt 6)
einrichtung.sql                  Datenbanktabelle und Funktionen für Supabase (Schritt 2)
speicherdienst-wach-halten.yml   hält den Speicherdienst wach (Schritt 5)
README.md, DOKUMENTATION.md      Anleitung und Dokumentation

Nur für Änderungen am Programm:
vorlage.html, style.css          Seite und Gestaltung
pruefen-vorlage.html             Prüfseite (Vorlage)
konfiguration.js                 Zugangsdaten
verben.js                        Verbdaten aus „Tablas de conjugaciones.docx“
logik.js                         Level, Gewichtung, Aufgabenauswahl, Antwortprüfung
speicher.js                      Speichern lokal und bei Supabase
app.js                           Bedienung
bauen.py                         erzeugt index.html und pruefen.html aus den Einzeldateien
test.js                          automatische Tests
```

## Anpassen

Für Änderungen am Programm bearbeitest du die Einzeldateien und erzeugst danach die `index.html` neu.

- **Gewichtungen** (z. B. 90 % Stammwechsel-Formen, 60 % yo, Anteile der Mischlevel) stehen gesammelt am Anfang von `logik.js`.
- **Verbdaten der Original-Tabelle** stehen in `verben.js`. Neue Verben gehören aber in `zusatzverben.txt` (Schritt 6).
- Trag deine Zugangsdaten auch in `konfiguration.js` ein. Sonst überschreibt der nächste Bauschritt sie in der `index.html` mit den Platzhaltern.
- `index.html` und `pruefen.html` neu erzeugen: im Ordner den Befehl `python bauen.py` ausführen (dafür muss [Python](https://www.python.org) installiert sein).
- Tests (dafür muss [Node.js](https://nodejs.org) installiert sein): `node test.js`. Sie prüfen die Antwortregeln und den Levelaufstieg und simulieren 10.000 Aufgaben je Level, um die Gewichtung nachzuweisen.

## Datenschutz

Die App erhebt keine Namen, E-Mail-Adressen oder sonstigen persönlichen Angaben. In der Datenbank stehen nur: Code, Level, aktuelle Serie, Anzahl bearbeiteter und beim ersten Versuch richtig gelöster Aufgaben sowie Zeitstempel. Lernstände, die 12 Monate nicht genutzt wurden, werden automatisch gelöscht.

Technisch verarbeiten GitHub (Auslieferung der Seite) und Supabase (Speicherung) beim Aufruf die IP-Adresse der Geräte. Wenn du die App im Schulbetrieb einsetzt, stimme das kurz mit der zuständigen Datenschutzstelle bzw. dem Schulträger ab. Das hier ist keine Rechtsberatung.
