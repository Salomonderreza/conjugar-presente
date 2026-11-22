/* Automatische Tests: node tests/test.js */
'use strict';
var assert = require('assert');
var Logik = require('./logik.js');
var DATEN = require('./verben.js');

var fehler = 0, ok = 0;
function test(name, fn) {
  try { fn(); ok++; console.log('  ✓ ' + name); }
  catch (e) { fehler++; console.log('  ✗ ' + name + '\n    ' + e.message); }
}
function rngMitSeed(seed) { // Mulberry32
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function prozent(x) { return (x * 100).toFixed(1) + ' %'; }

console.log('\nAntwortprüfung');
test('richtige Form', function () { assert.strictEqual(Logik.pruefe('compro', 'compro').ergebnis, 'richtig'); });
test('Groß-/Kleinschreibung und Leerzeichen egal', function () { assert.strictEqual(Logik.pruefe('  Compro ', 'compro').ergebnis, 'richtig'); });
test('Subjektpronomen ist falsch', function () {
  var r = Logik.pruefe('yo compro', 'compro');
  assert.strictEqual(r.ergebnis, 'falsch'); assert.strictEqual(r.hinweis, 'pronomen');
});
test('Subjektpronomen mit Akzent ist falsch', function () { assert.strictEqual(Logik.pruefe('él habla', 'habla').hinweis, 'pronomen'); });
test('Reflexiv richtig', function () { assert.strictEqual(Logik.pruefe('me llamo', 'me llamo').ergebnis, 'richtig'); });
test('Reflexiv mit Subjektpronomen falsch', function () { assert.strictEqual(Logik.pruefe('yo me llamo', 'me llamo').ergebnis, 'falsch'); });
test('Reflexivpronomen fehlt', function () {
  var r = Logik.pruefe('llamo', 'me llamo');
  assert.strictEqual(r.ergebnis, 'falsch'); assert.strictEqual(r.hinweis, 'reflexiv');
});
test('falsches Reflexivpronomen', function () { assert.strictEqual(Logik.pruefe('te llamo', 'me llamo').ergebnis, 'falsch'); });
test('fehlender Akzent ist richtig', function () { assert.strictEqual(Logik.pruefe('hablais', 'habláis').ergebnis, 'richtig_akzent_abweichend'); });
test('fehlender Akzent: creeis → creéis', function () { assert.strictEqual(Logik.pruefe('creeis', 'creéis').ergebnis, 'richtig_akzent_abweichend'); });
test('falsch gesetzter Akzent ist richtig (creeís)', function () { assert.strictEqual(Logik.pruefe('creeís', 'creéis').ergebnis, 'richtig_akzent_abweichend'); });
test('zusätzlicher Akzent ist richtig (hablá)', function () { assert.strictEqual(Logik.pruefe('hablá', 'habla').ergebnis, 'richtig_akzent_abweichend'); });
test('anderer Akzenttyp ist richtig (hàblo)', function () { assert.strictEqual(Logik.pruefe('hàblo', 'hablo').ergebnis, 'richtig_akzent_abweichend'); });
test('Akzente egal, falsche Endung bleibt falsch', function () { assert.strictEqual(Logik.pruefe('hablás', 'hablo').ergebnis, 'falsch'); });
test('Reflexiv mit falschem Akzent richtig', function () { assert.strictEqual(Logik.pruefe('mé llamo', 'me llamo').ergebnis, 'richtig_akzent_abweichend'); });
test('Subjektpronomen ohne Akzent erkannt (el habla)', function () { assert.strictEqual(Logik.pruefe('el habla', 'habla').hinweis, 'pronomen'); });
test('falsche Endung ist falsch', function () { assert.strictEqual(Logik.pruefe('hablo', 'hablas').ergebnis, 'falsch'); });
test('regelmäßige statt unregelmäßiger Form ist falsch', function () { assert.strictEqual(Logik.pruefe('teno', 'tengo').ergebnis, 'falsch'); });
test('sé ohne Akzent akzeptiert', function () { assert.strictEqual(Logik.pruefe('se', 'sé').ergebnis, 'richtig_akzent_abweichend'); });
test('zerlegte Akzente (NFD) werden erkannt', function () { assert.strictEqual(Logik.pruefe('habláis', 'habláis').ergebnis, 'richtig'); });
test('leere Eingabe', function () { assert.strictEqual(Logik.pruefe('   ', 'hablo').ergebnis, 'leer'); });
test('hay', function () { assert.strictEqual(Logik.pruefe('hay', 'hay').ergebnis, 'richtig'); });

console.log('\nVerbdaten');
test('83 Verben, jede Aufgabe hat eine Lösung', function () {
  assert.strictEqual(DATEN.verben.length, 83);
  var g = new Logik.Generator(DATEN, rngMitSeed(1));
  DATEN.verben.forEach(function (v) {
    Logik.pronomenGewichte(v).forEach(function (pg) {
      var loesung = pg[0] === null ? v.formen.unpersoenlich : v.formen[Logik.PRONOMEN_FORM[pg[0]]];
      assert.ok(loesung && loesung.length > 0, v.infinitiv + ' ' + pg[0]);
    });
  });
});
test('Doppelt unregelmäßige Verben nur in ihrer Stammwechselgruppe', function () {
  var erwartet = { tener: 'e_ie', venir: 'e_ie', decir: 'e_i', 'oír': 'i_y' };
  Object.keys(erwartet).forEach(function (inf) {
    var treffer = DATEN.verben.filter(function (v) { return v.infinitiv === inf; });
    assert.strictEqual(treffer.length, 1, inf);
    assert.strictEqual(treffer[0].gruppe, erwartet[inf], inf);
  });
});
test('creer vosotros korrigiert', function () {
  var creer = DATEN.verben.filter(function (v) { return v.infinitiv === 'creer'; })[0];
  assert.strictEqual(creer.formen.vosotros, 'creéis');
});

console.log('\nLevel und Serie');
test('16 Level einschließlich 7,5 in richtiger Reihenfolge', function () {
  assert.deepStrictEqual(Logik.LEVEL_IDS, ['1', '2', '3', '4', '5', '6', '7', '7,5', '8', '9', '10', '11', '12', '13', '14', '15']);
});
test('Anteile je Level ergeben 100 %', function () {
  Logik.LEVEL.forEach(function (l) {
    var s = 0; Object.keys(l.anteile).forEach(function (g) { s += l.anteile[g]; });
    assert.ok(Math.abs(s - 1) < 1e-9, l.id + ': ' + s);
  });
});
test('Anteil unregelmäßiger Verben steigt in den Mischleveln', function () {
  var vorher = -1;
  ['7', '9', '11', '13', '15'].forEach(function (id) {
    var a = Logik.levelInfo(id).anteile, u = 0;
    Object.keys(a).forEach(function (g) { if (Logik.GRUPPEN[g].unregelmaessig) u += a[g]; });
    assert.ok(u > vorher, id); vorher = u;
  });
});
test('Nur bereits eingeführte Gruppen', function () {
  var eingefuehrt = {};
  Logik.LEVEL.forEach(function (l) {
    var gruppen = Object.keys(l.anteile);
    var neu = gruppen.filter(function (g) { return !eingefuehrt[g]; });
    assert.ok(neu.length <= 1, 'Level ' + l.id + ' führt mehrere neue Gruppen ein: ' + neu);
    if (neu.length) assert.strictEqual(gruppen.length, 1, 'Level ' + l.id + ' mischt eine neue Gruppe');
    gruppen.forEach(function (g) { eingefuehrt[g] = true; });
  });
});
test('10 richtige Erstantworten → Aufstieg, Serie 0', function () {
  var s = Logik.neuerLernstand('X');
  for (var i = 0; i < 9; i++) s = Logik.werteErstantwortAus(s, true).stand;
  assert.strictEqual(s.serie, 9); assert.strictEqual(s.level, '1');
  var r = Logik.werteErstantwortAus(s, true);
  assert.ok(r.aufgestiegen); assert.strictEqual(r.stand.level, '2'); assert.strictEqual(r.stand.serie, 0);
});
test('falsche Erstantwort setzt Serie zurück und zählt nicht als richtig', function () {
  var s = Logik.neuerLernstand('X'); s.serie = 7; s.bearbeitet = 7; s.richtig = 7;
  var r = Logik.werteErstantwortAus(s, false).stand;
  assert.strictEqual(r.serie, 0); assert.strictEqual(r.bearbeitet, 8); assert.strictEqual(r.richtig, 7);
});
test('Level 7 → 7,5 → 8', function () {
  assert.strictEqual(Logik.naechstesLevel('7'), '7,5'); assert.strictEqual(Logik.naechstesLevel('7,5'), '8');
});
test('Level 15 bleibt bestehen', function () {
  var s = Logik.neuerLernstand('X'); s.level = '15'; s.serie = 9;
  var r = Logik.werteErstantwortAus(s, true);
  assert.ok(r.alleGeschafft); assert.strictEqual(r.stand.level, '15'); assert.strictEqual(r.stand.serie, 0);
});

console.log('\nFortsetzungscode');
test('Code hat 12 gültige Zeichen und ist bereinigbar', function () {
  var crypto = require('crypto');
  for (var i = 0; i < 1000; i++) {
    var c = Logik.erzeugeCode(function (n) { return crypto.randomBytes(n); });
    assert.strictEqual(Logik.bereinigeCode(Logik.zeigeCode(c).toLowerCase()), c);
  }
  assert.strictEqual(Logik.bereinigeCode('ABCD-EFGH-JKL'), null);
  assert.strictEqual(Logik.bereinigeCode('ABCD-EFGH-JKLO'), null);
});

console.log('\nZusatzverben (Lehrkräfte)');
function ohne(t) { return t.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
test('Formenbildung trifft alle Tabellenverben (estar nur ohne Akzente)', function () {
  DATEN.verben.forEach(function (v) {
    if (v.gruppe === 'absolut_irregular') return;
    var r = Logik.bildeFormen(v.infinitiv, v.gruppe, v.formen.yo);
    assert.strictEqual(r.fehler.length, 0, v.infinitiv);
    Object.keys(v.formen).forEach(function (k) {
      if (v.infinitiv === 'estar') assert.strictEqual(ohne(r.verb.formen[k]), ohne(v.formen[k]), v.infinitiv + ' ' + k);
      else assert.strictEqual(r.verb.formen[k], v.formen[k], v.infinitiv + ' ' + k);
    });
    assert.deepStrictEqual(r.verb.abweichend_von_regel, v.abweichend_von_regel, v.infinitiv);
    assert.strictEqual(r.warnungen.length, 0, v.infinitiv + ': ' + r.warnungen);
  });
});
var BEISPIELE = [
  ['ar', 'enviar', 'envío', 'envío envías envía enviamos enviáis envían'],
  ['ar', 'levantarse', 'me levanto', 'me levanto|te levantas|se levanta|nos levantamos|os levantáis|se levantan'],
  ['er', 'vender', 'vendo', 'vendo vendes vende vendemos vendéis venden'],
  ['yo_irregular', 'ofrecer', 'ofrezco', 'ofrezco ofreces ofrece ofrecemos ofrecéis ofrecen'],
  ['e_ie', 'mantener', 'mantengo', 'mantengo mantienes mantiene mantenemos mantenéis mantienen'],
  ['o_ue', 'acostarse', 'me acuesto', 'me acuesto|te acuestas|se acuesta|nos acostamos|os acostáis|se acuestan'],
  ['e_i', 'seguir', 'sigo', 'sigo sigues sigue seguimos seguís siguen'],
  ['e_i', 'sonreír', 'sonrío', 'sonrío sonríes sonríe sonreímos sonreís sonríen'],
  ['i_y', 'incluir', 'incluyo', 'incluyo incluyes incluye incluimos incluís incluyen']
];
BEISPIELE.forEach(function (b) {
  test('Formen: ' + b[1], function () {
    var r = Logik.bildeFormen(b[1], b[0], b[2]);
    var soll = b[3].indexOf('|') >= 0 ? b[3].split('|') : b[3].split(' ');
    assert.deepStrictEqual(['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'].map(function (k) { return r.verb.formen[k]; }), soll);
  });
});
test('Datei lesen: Gruppen, Kommentare, Trennzeichen, Fehler', function () {
  var text = '# Kommentar\n[ar]\ncantar; canto\n\n[e → ie]\nentender , entiendo\n[o-ue]\ncomer; como\n[xyz]\nfoo; fo\n[er]\nvivir; vivo\ncomer; como\nleer; leo\n';
  var r = Logik.leseZusatzverben(text, DATEN.verben);
  assert.deepStrictEqual(r.verben.map(function (v) { return v.infinitiv + ':' + v.gruppe; }), ['cantar:ar', 'entender:e_ie']);
  var fehler = r.zeilen.filter(function (z) { return z.status === 'fehler'; }).map(function (z) { return z.nr; });
  assert.deepStrictEqual(fehler, [8, 9, 10, 12, 13, 14]);
});
test('Warnung bei unpassender yo-Form', function () {
  var r = Logik.leseZusatzverben('[e-ie]\nentender; entendo\n[ar]\nandar; ando\n', DATEN.verben);
  assert.strictEqual(r.zeilen[0].status, 'warnung');
  assert.strictEqual(r.zeilen[1].status, 'ok');
});
test('Zusatzverben erscheinen in den Aufgaben ihrer Level', function () {
  var m = Logik.verbenMitZusatz(DATEN, '[ar]\ncantar; canto\n[o-ue]\nvolver; vuelvo\n');
  var g = new Logik.Generator({ verben: m.verben }, rngMitSeed(5)), gefunden = {};
  for (var i = 0; i < 3000; i++) gefunden[g.naechste('1').infinitiv] = true;
  for (i = 0; i < 2000; i++) gefunden[g.naechste('10').infinitiv] = true;
  assert.ok(gefunden.cantar && gefunden.volver);
  var v = m.verben.filter(function (x) { return x.infinitiv === 'volver'; })[0];
  assert.deepStrictEqual(v.abweichend_von_regel, ['yo', 'tu', 'el', 'ellos']);
});

console.log('\nSimulation: 10.000 Aufgaben je Level');
var N = 10000, TOL = 0.02;
var verbNachName = {}; DATEN.verben.forEach(function (v) { verbNachName[v.infinitiv] = v; });
var tabelle = [];
Logik.LEVEL.forEach(function (l) {
  test('Level ' + l.id, function () {
    var g = new Logik.Generator(DATEN, rngMitSeed(42 + l.id.length * 7 + parseFloat(l.id.replace(',', '.')) * 100));
    var gruppen = {}, pron = {}, unregPron = 0, stammwechsel = 0, yoInYoGruppe = 0, yoGruppe = 0, hay = 0, letzte = null, wdh = 0;
    for (var i = 0; i < N; i++) {
      var a = g.naechste(l.id);
      // einige falsche Antworten simulieren, damit Wiederholungen mitgetestet werden
      if (i % 7 === 0) g.spaeterWiederholen(a);
      if (a.wiederholung) wdh++;
      assert.ok(l.anteile[a.gruppe] > 0, 'unerlaubte Gruppe ' + a.gruppe);
      if (letzte) assert.notStrictEqual(a.schluessel, letzte, 'gleiche Aufgabe direkt hintereinander');
      letzte = a.schluessel;
      gruppen[a.gruppe] = (gruppen[a.gruppe] || 0) + 1;
      if (a.pronomen === null) hay++;
      else pron[a.pronomen] = (pron[a.pronomen] || 0) + 1;
      if (['e_ie', 'o_ue', 'i_y'].indexOf(a.gruppe) >= 0) {
        stammwechsel++;
        if (verbNachName[a.infinitiv].abweichend_von_regel.indexOf(Logik.PRONOMEN_FORM[a.pronomen]) >= 0) unregPron++;
      }
      if (a.gruppe === 'yo_irregular') { yoGruppe++; if (a.pronomen === 'yo') yoInYoGruppe++; }
    }
    var zeile = { level: l.id, gruppen: {}, hinweise: [] };
    Object.keys(l.anteile).forEach(function (gr) {
      var ist = (gruppen[gr] || 0) / N;
      zeile.gruppen[gr] = ist;
      assert.ok(Math.abs(ist - l.anteile[gr]) <= TOL, gr + ': soll ' + prozent(l.anteile[gr]) + ', ist ' + prozent(ist));
    });
    if (stammwechsel) {
      var q = unregPron / stammwechsel;
      zeile.hinweise.push('Stammwechsel-Formen: ' + prozent(q));
      assert.ok(Math.abs(q - 0.9) <= TOL, 'Stammwechsel-Pronomen ' + prozent(q));
    }
    if (yoGruppe) {
      var y = yoInYoGruppe / yoGruppe;
      zeile.hinweise.push('yo bei 1.-Person-Verben: ' + prozent(y));
      assert.ok(Math.abs(y - 0.6) <= TOL + 0.01, 'yo-Anteil ' + prozent(y));
    }
    if (l.id === '7,5') {
      zeile.hinweise.push('hay: ' + prozent(hay / N));
      assert.ok(Math.abs(hay / N - 0.15) <= TOL, 'hay ' + prozent(hay / N));
    }
    // regelmäßige Level: alle zehn Pronomen ungefähr gleich (je 10 %)
    if (['1', '2', '3', '4', '5'].indexOf(l.id) >= 0) {
      Logik.PRONOMEN.forEach(function (p) {
        assert.ok(Math.abs((pron[p] || 0) / N - 0.1) <= TOL, p + ' ' + prozent((pron[p] || 0) / N));
      });
    }
    assert.ok(wdh > 0, 'keine Wiederholungen');
    tabelle.push(zeile);
  });
});

console.log('\nErgebnis der Simulation (Ist-Anteile):');
tabelle.forEach(function (z) {
  console.log('  Level ' + z.level + ': ' + Object.keys(z.gruppen).map(function (g) { return g + ' ' + prozent(z.gruppen[g]); }).join(', ') +
    (z.hinweise.length ? ' | ' + z.hinweise.join(', ') : ''));
});

console.log('\n' + ok + ' Tests bestanden, ' + fehler + ' fehlgeschlagen.');
process.exit(fehler ? 1 : 0);
