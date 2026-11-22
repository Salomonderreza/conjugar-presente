# Dokumentation: Verbgruppen, Gewichtung, Regeln

## Quelle

Die einzige Quelle für Verben und Formen sind die Konjugationstabellen **„Tablas de conjugaciones.docx“**. Die App enthält keine zusätzlichen Verben oder Formen. Die Daten stehen in `verben.js` und sind in die `index.html` eingebettet.

## Verbgruppen und Level

| Level | Inhalt | Verben |
|---|---|---|
| 1 | regelmäßig -ar (28) | hablar, comprar, estudiar, escuchar, trabajar, tomar, bailar, visitar, preguntar, necesitar, **llamarse**, nadar, patinar, chatear, coquetear, cocinar, preparar, tocar, pasear, terminar, viajar, ordenar, ganar, adivinar, **apellidarse**, pronunciar, desayunar, cenar |
| 2 | regelmäßig -er (8) | comer, leer, aprender, responder, comprender, correr, creer, deber |
| 3 | Mischung -ar/-er | wie Level 1 und 2 |
| 4 | regelmäßig -ir (6) | vivir, escribir, recibir, abrir, existir, discutir |
| 5 | Mischung -ar/-er/-ir | wie Level 1, 2 und 4 |
| 6 | unregelmäßige 1. Person (13) | conocer, ver, estar, hacer, saber, poner, traer, salir, caer, valer, dar, traducir, conducir |
| 7 | Mischung | Level 1–6 |
| 7,5 | ser, ir, hay (3) | ser, ir, haber (nur unpersönlich: hay) |
| 8 | e → ie (9) | pensar, querer, sentir, empezar, perder, mentir, cerrar, **tener\***, **venir\*** |
| 9 | Mischung | Level 1–8 |
| 10 | o → ue (8) | poder, contar, dormir, jugar, probar, costar, apostar, almorzar |
| 11 | Mischung | Level 1–10 |
| 12 | e → i (4) | pedir, repetir, reír, **decir\*** |
| 13 | Mischung | Level 1–12 |
| 14 | i → y (4) | construir, intuir, destruir, **oír\*** |
| 15 | Mischung nur unregelmäßiger Verben | Level 6, 7,5, 8, 10, 12, 14 |

**Fett:** reflexive Verben. Die Antwort enthält das Reflexivpronomen (me llamo).
**\*:** doppelte Unregelmäßigkeit. Die Tabelle führt diese Verben auch bei „irregularidad en la primera persona“ und in einem eigenen Abschnitt. Die App fragt sie **nur in ihrer Stammwechselgruppe** ab, nicht in Level 6. Die Formen sind in allen drei Tabellenabschnitten identisch.

## Hinweise zur Tabelle (Unklarheiten und Abweichungen)

| Stelle | Tabelle | Umgang in der App |
|---|---|---|
| creer, vosotros | „creeís“ | Akzent in der Tabelle vertauscht. Die App verwendet nach Rücksprache **creéis** und zeigt bei dieser Aufgabe einen Hinweis zur Korrektur. Da Akzente nicht bewertet werden, gilt auch die Eingabe „creeís“ als richtig. Angezeigt wird dann „creéis“. |
| jugar | in der Gruppe o → ue | Die Form juego zeigt tatsächlich **u → ue**. jugar bleibt in Level 10 (wie in der Tabelle). Level 10 und die jugar-Aufgaben zeigen einen Hinweis. |
| Abschnitt 8 | Überschrift „VERBOS **REGULARES** CON CAMBIO **I + Y**“ | Die Tabelle nennt die Gruppe regelmäßig, laut Vorgabe zählt sie zu den unregelmäßigen Gruppen. „i + y“ beschreibt den Vorgang genauer als „i → y“: Es wird ein y **eingeschoben** (construir → construyo). Level 14 zeigt dazu einen Hinweis. |
| haber | nur „hay“ in der Zeile der 3. Person Singular | Aufgabe: „(unpersönlich) haber →“ mit dem Zusatz „es gibt“. |
| Schreibweise | teils Großbuchstaben (CHATEO, CIERRO, ALMUERZO …) | Für die App in Kleinbuchstaben übernommen, inhaltlich unverändert. |

## Was als „unregelmäßige Form“ zählt

Eine Form ist unregelmäßig, wenn sie von der regelmäßigen Bildung abweicht (Stamm des Infinitivs + Präsensendung). **Reine Akzentunterschiede zählen nicht** (z. B. oímos, reímos, estás).

In allen Stammwechselgruppen sind danach genau dieselben Pronomen unregelmäßig: yo, tú, él, ella, usted, ellos, ellas, ustedes (8 von 10). Regelmäßig sind nosotros und vosotros. In Level 6 ist nur yo unregelmäßig.

## Gewichtung

### Anteil der Verbgruppen je Level

| Level | -ar | -er | -ir | 1. Person | ser/ir/hay | e→ie | o→ue | e→i | i→y | unregelmäßig gesamt |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 100 % | – | – | – | – | – | – | – | – | 0 % |
| 2 | – | 100 % | – | – | – | – | – | – | – | 0 % |
| 3 | 50 % | 50 % | – | – | – | – | – | – | – | 0 % |
| 4 | – | – | 100 % | – | – | – | – | – | – | 0 % |
| 5 | 40 % | 30 % | 30 % | – | – | – | – | – | – | 0 % |
| 6 | – | – | – | 100 % | – | – | – | – | – | 100 % |
| 7 | 28 % | 21 % | 21 % | 30 % | – | – | – | – | – | **30 %** |
| 7,5 | – | – | – | – | 100 % | – | – | – | – | 100 % |
| 8 | – | – | – | – | – | 100 % | – | – | – | 100 % |
| 9 | 24 % | 18 % | 18 % | 10 % | 10 % | 20 % | – | – | – | **40 %** |
| 10 | – | – | – | – | – | – | 100 % | – | – | 100 % |
| 11 | 20 % | 15 % | 15 % | 8,3 % | 8,3 % | 8,3 % | 25 % | – | – | **50 %** |
| 12 | – | – | – | – | – | – | – | 100 % | – | 100 % |
| 13 | 16 % | 12 % | 12 % | 7,5 % | 7,5 % | 7,5 % | 7,5 % | 30 % | – | **60 %** |
| 14 | – | – | – | – | – | – | – | – | 100 % | 100 % |
| 15 | – | – | – | 10 % | 10 % | 10 % | 10 % | 10 % | 50 % | **100 %** |

So ergeben sich die Mischlevel:
- Der **Anteil unregelmäßiger Verben** steigt von Mischlevel zu Mischlevel: 30 → 40 → 50 → 60 → 100 %.
- Der **regelmäßige Teil** verteilt sich auf -ar 40 %, -er 30 % und -ir 30 %.
- Vom **unregelmäßigen Teil** gehen 50 % an die zuletzt eingeführte Gruppe. Die anderen 50 % verteilen sich gleichmäßig auf die älteren unregelmäßigen Gruppen.
- Ein Level verwendet nur Gruppen, die bis dahin eingeführt wurden.

Innerhalb einer Gruppe kommen alle Verben gleich oft vor. Ausnahme ist die Gruppe ser/ir/hay: **hay 15 %**, ser und ir je 42,5 %. Mit hay gibt es nur eine einzige Aufgabe, deshalb kommt es seltener vor.

### Pronomen: die Gewichtung richtet sich nach der Gruppe des Verbs, nicht nach dem Level

| Verbgruppe | Regel | je Pronomen |
|---|---|---|
| regelmäßig, e → i, ser, ir | alle Pronomen gleich oft | je 10 % |
| e → ie, o → ue, i → y | 90 % unregelmäßige Formen, 10 % die übrigen | yo, tú, él, ella, usted, ellos, ellas, ustedes je 11,25 %; nosotros, vosotros je 5 % |
| unregelmäßige 1. Person | überwiegend yo | yo 60 %; die anderen neun je 4,4 % |

él/ella/usted und ellos/ellas/ustedes haben jeweils dieselbe Form, erscheinen in den Aufgaben aber als eigene Pronomen.

**Hinweis zur Vorgabe:** Die ursprüngliche Vorgabe sah „überwiegend yo“ für alle „unregelmäßigen Verben in gemischten Aufgaben“ vor. Das hätte der 90-%-Regel bei den Stammwechselverben widersprochen. Umgesetzt ist deshalb die vereinbarte Rangfolge: „überwiegend yo“ gilt in Level 6 **und in allen Mischleveln für die Verben mit unregelmäßiger 1. Person**. Stammwechselverben folgen auch in Mischleveln der 90-%-Regel. e → i ist bewusst nicht Teil der 90-%-Regel und wird gleichmäßig geübt.

### Weitere Regeln der Aufgabenauswahl

- Dieselbe Kombination aus Verb und Pronomen kommt nie zweimal hintereinander.
- Dasselbe Verb kommt nicht direkt hintereinander, sofern die Gruppe mehr als drei Verben hat. Bei ser/ir/hay würde das sonst die Gewichtung verzerren.
- Eine Aufgabe mit falscher Erstantwort kommt nach 3–5 Aufgaben noch einmal (als „Wiederholung“ markiert). Die Wiederholung zählt wie eine neue Aufgabe. Beim Levelwechsel werden offene Wiederholungen verworfen.

### Nachweis durch Simulation

`node test.js` erzeugt je Level 10.000 Aufgaben und prüft, dass alle Anteile höchstens 2 Prozentpunkte vom Sollwert abweichen. Ergebnis eines Testlaufs:

```
Level 6:   yo bei 1.-Person-Verben 59,4 %
Level 7:   -ar 29,1 %, -er 21,0 %, -ir 20,5 %, 1. Person 29,3 %
Level 7,5: hay 14,1 %
Level 8:   Stammwechsel-Formen 89,5 %
Level 9:   -ar 23,9 %, -er 17,7 %, -ir 18,6 %, e→ie 19,9 %, 1. Person 10,3 %, ser/ir/hay 9,5 %
Level 13:  -ar 16,4 %, -er 11,8 %, -ir 12,5 %, e→i 29,0 %, je 7,4–7,8 % für die älteren Gruppen
Level 15:  i→y 48,4 %, die anderen Gruppen je 10,0–10,7 %, Stammwechsel-Formen 90,1 %
```

## Zusatzverben von Lehrkräften

Lehrkräfte können in `zusatzverben.txt` weitere Verben ergänzen. Anzugeben sind nur Gruppe (über die Überschrift), Infinitiv und yo-Form. Die übrigen fünf Formen bildet die App so:

| Form | Bildung |
|---|---|
| yo | wie angegeben |
| tú, él/ella/usted, ellos/ellas/ustedes | Stamm + regelmäßige Endung. Bei e → ie, o → ue und e → i ändert sich der **letzte** passende Vokal im Stamm (bei jugar u → ue). Bei i → y wird ein y eingeschoben. Akzente aus der yo-Form werden übernommen (envío → envías, sonrío → sonríes). |
| nosotros, vosotros | Stamm + regelmäßige Endung (Stammvokal unverändert). Bei -ir-Verben mit Stamm auf Vokal: -ímos (oímos, sonreímos). Bei einsilbigen Formen ohne Akzent (veis, dais). |

Diese Regeln reproduzieren 79 der 80 Verben der Original-Tabelle (ohne ser, ir, hay) exakt. Bei **estar** fehlen in drei Formen die Akzente (estás, está, están), weil sich das aus Infinitiv und yo-Form nicht ableiten lässt. Da Akzente nicht bewertet werden, wirkt sich so etwas nur auf die angezeigte Schreibweise aus.

Zusatzverben werden wie Tabellenverben behandelt: Sie kommen in den Leveln ihrer Gruppe und in den Mischleveln vor. Welche Formen unregelmäßig sind, ermittelt die App automatisch, das braucht die 90-%-Regel und die yo-Gewichtung. Innerhalb einer Gruppe kommen alle Verben gleich oft vor. Ein Verb aus der Original-Tabelle lässt sich nicht noch einmal ergänzen.

**Geprüft wird automatisch:** Gruppe bekannt? Endung passend zur Gruppe? yo-Form vorhanden? Vokal für den Stammwechsel vorhanden? Verb doppelt? Solche Zeilen werden **nicht** übernommen (rot markiert auf der Prüfseite). **Nur ein Hinweis (gelb):** Die yo-Form zeigt keinen erwarteten Stammwechsel, sie ist in einer regelmäßigen Gruppe unregelmäßig, oder sie endet nicht auf -o.

**Laden:** Die App liest `zusatzverben.txt` bei jedem Start neu vom Server und merkt sich die Liste für die Nutzung ohne Verbindung.

## Antwortregeln

- Eingegeben wird **nur die Verbform**. Steht ein Subjektpronomen davor (yo compro, él habla, usted …), ist die Antwort falsch, und die App weist darauf hin.
- **Reflexive Verben:** Das Reflexivpronomen gehört dazu (me llamo). Fehlt es, ist die Antwort falsch, mit Hinweis.
- **Akzente werden nicht bewertet.** Fehlende, falsch gesetzte und zusätzliche Akzente sind egal (z. B. hablais, creeís, hablá). Die Antwort gilt als richtig und zählt für die Serie. Weicht die Schreibweise ab, zeigt die App vor der nächsten Aufgabe die korrekte Schreibweise.
- Groß-/Kleinschreibung und Leerzeichen am Anfang oder Ende spielen keine Rolle.
- ñ und ü kommen in den Tabellenformen nicht vor. Die Tastenleiste bietet deshalb á, é und í.

## Ablauf bei Fehlern und Levelaufstieg

1. **„Lösung anzeigen“** steht bei jeder Aufgabe jederzeit zur Verfügung. Wird die Lösung angezeigt, bevor die Aufgabe richtig gelöst ist, zählt das wie eine falsche Erstantwort: Die Serie beginnt bei 0, und die Aufgabe kommt nach 3–5 Aufgaben noch einmal. Nach einer falschen Erstantwort zählt das Anzeigen nicht noch einmal zusätzlich.
2. Ist die **Erstantwort falsch**, wird sie rot markiert. Die Lösung bleibt verborgen, und die Serie springt auf 0.
3. Die lernende Person **korrigiert selbst**. Eine richtige Korrektur zählt **nicht** für die Serie.
4. **Zehn richtige Erstantworten hintereinander** führen ins nächste Level. Die Serie beginnt dort bei 0.
5. Nach Level 15 erscheint ein Glückwunsch. Danach geht es mit Level 15 weiter.
6. Freie Levelwahl, Zurückstufen und eine Lehrkraftansicht sind nicht vorgesehen.

Statistik: „Bearbeitet“ zählt jede Aufgabe einmal. „Beim ersten Versuch richtig“ zählt nur richtige Erstantworten.

## Lernstand und Fortsetzungscode

- **Code:** 12 Zeichen in drei Vierergruppen (z. B. `K7QM-X2HD-9RTB`). Die Zeichen sind A–Z ohne I und O sowie die Ziffern 2–9, verwechselbare Zeichen sind also ausgeschlossen. Erzeugt wird der Code mit dem Zufallsgenerator des Browsers. Das ergibt rund 10¹⁸ Möglichkeiten (60 Bit), ein Code lässt sich also praktisch nicht erraten.
- Bei der Eingabe spielen Groß-/Kleinschreibung, Leerzeichen und Bindestriche keine Rolle.
- **Gespeichert** werden Code, Level, Serie, Anzahl bearbeiteter Aufgaben, Anzahl richtiger Erstantworten und ein Zeitstempel.
- **Speicherorte:** immer lokal im Browser und, sofern eingerichtet, bei Supabase. Ohne Verbindung wird der Stand lokal gesichert und später automatisch übertragen.
- **Mehrere Geräte:** Es gilt der neuere Stand. Wird auf zwei Geräten gleichzeitig ohne Verbindung geübt, setzt sich der später gespeicherte Stand durch (die Stände werden nicht zusammengeführt).
- **Schutz:** Die Tabelle ist für den öffentlichen Zugriff gesperrt. Lesen und Schreiben geht nur über Datenbankfunktionen und nur mit dem vollständigen Code. Ein unbekannter Code wird verzögert beantwortet, das bremst systematisches Durchprobieren aus.
- **Aufräumen:** Lernstände, die 12 Monate nicht genutzt wurden, werden gelöscht.
