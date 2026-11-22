/* Übungslogik: Level, Gewichtung, Aufgabenauswahl, Antwortprüfung.
   Läuft im Browser (globales Objekt „Logik“) und in Node (für die Tests). */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Pronomen
  // ---------------------------------------------------------------------------
  var PRONOMEN = ['yo', 'tú', 'él', 'ella', 'usted', 'nosotros', 'vosotros', 'ellos', 'ellas', 'ustedes'];
  // Welche Tabellenzeile zu welchem Pronomen gehört
  var PRONOMEN_FORM = {
    'yo': 'yo', 'tú': 'tu', 'él': 'el', 'ella': 'el', 'usted': 'el',
    'nosotros': 'nosotros', 'vosotros': 'vosotros',
    'ellos': 'ellos', 'ellas': 'ellos', 'ustedes': 'ellos'
  };
  // Subjektpronomen, die nicht vor der Verbform stehen dürfen
  var SUBJEKTPRONOMEN = ['yo', 'tu', 'tú', 'el', 'él', 'ella', 'usted', 'ud', 'ud.', 'nosotros', 'nosotras',
    'vosotros', 'vosotras', 'ellos', 'ellas', 'ustedes', 'uds', 'uds.'];

  // ---------------------------------------------------------------------------
  // Verbgruppen
  // ---------------------------------------------------------------------------
  var GRUPPEN = {
    ar: { name: 'regelmäßige Verben auf -ar', unregelmaessig: false },
    er: { name: 'regelmäßige Verben auf -er', unregelmaessig: false },
    ir: { name: 'regelmäßige Verben auf -ir', unregelmaessig: false },
    yo_irregular: { name: 'Verben mit unregelmäßiger 1. Person', unregelmaessig: true },
    absolut_irregular: { name: 'ser, ir und hay', unregelmaessig: true },
    e_ie: { name: 'Verben mit e → ie', unregelmaessig: true },
    o_ue: { name: 'Verben mit o → ue', unregelmaessig: true },
    e_i: { name: 'Verben mit e → i', unregelmaessig: true },
    i_y: { name: 'Verben mit i → y', unregelmaessig: true }
  };

  // ---------------------------------------------------------------------------
  // Level und Anteile der Gruppen (Summe je Level = 1).
  // Herleitung siehe DOKUMENTATION.md:
  //   Mischlevel: regelmäßiger Teil -ar 40 % / -er 30 % / -ir 30 %;
  //   unregelmäßiger Teil: 50 % zuletzt eingeführte Gruppe, Rest gleichmäßig.
  // ---------------------------------------------------------------------------
  function mix(regelAnteil, regelGruppen, neueste, aeltere) {
    var a = {};
    var regelGewichte = { ar: 0.4, er: 0.3, ir: 0.3 };
    var summe = 0;
    regelGruppen.forEach(function (g) { summe += regelGewichte[g]; });
    regelGruppen.forEach(function (g) { a[g] = regelAnteil * regelGewichte[g] / summe; });
    var unreg = 1 - regelAnteil;
    if (aeltere.length === 0) {
      a[neueste] = unreg;
    } else {
      a[neueste] = unreg * 0.5;
      aeltere.forEach(function (g) { a[g] = unreg * 0.5 / aeltere.length; });
    }
    return a;
  }

  var REGEL = ['ar', 'er', 'ir'];
  var LEVEL = [
    { id: '1', titel: 'Regelmäßige Verben auf -ar', anteile: { ar: 1 } },
    { id: '2', titel: 'Regelmäßige Verben auf -er', anteile: { er: 1 } },
    { id: '3', titel: 'Mischung: regelmäßige Verben auf -ar und -er', anteile: { ar: 0.5, er: 0.5 } },
    { id: '4', titel: 'Regelmäßige Verben auf -ir', anteile: { ir: 1 } },
    { id: '5', titel: 'Mischung: regelmäßige Verben auf -ar, -er und -ir', anteile: { ar: 0.4, er: 0.3, ir: 0.3 } },
    { id: '6', titel: 'Verben mit unregelmäßiger 1. Person', anteile: { yo_irregular: 1 } },
    { id: '7', titel: 'Mischung: regelmäßige Verben und unregelmäßige 1. Person', anteile: mix(0.7, REGEL, 'yo_irregular', []) },
    { id: '7,5', titel: 'ser, ir und hay', anteile: { absolut_irregular: 1 } },
    { id: '8', titel: 'Verben mit e → ie', anteile: { e_ie: 1 } },
    { id: '9', titel: 'Mischung aller bisherigen Gruppen', anteile: mix(0.6, REGEL, 'e_ie', ['yo_irregular', 'absolut_irregular']) },
    { id: '10', titel: 'Verben mit o → ue', hinweis: 'Besonderheit: Bei jugar wechselt u → ue (juego). Die Tabelle führt jugar in dieser Gruppe.', anteile: { o_ue: 1 } },
    { id: '11', titel: 'Mischung aller bisherigen Gruppen', anteile: mix(0.5, REGEL, 'o_ue', ['yo_irregular', 'absolut_irregular', 'e_ie']) },
    { id: '12', titel: 'Verben mit e → i', anteile: { e_i: 1 } },
    { id: '13', titel: 'Mischung aller bisherigen Gruppen', anteile: mix(0.4, REGEL, 'e_i', ['yo_irregular', 'absolut_irregular', 'e_ie', 'o_ue']) },
    { id: '14', titel: 'Verben mit i → y', hinweis: 'Bei diesen Verben wird ein y eingeschoben (construir → construyo). Die Tabelle schreibt „i + y“.', anteile: { i_y: 1 } },
    { id: '15', titel: 'Mischung aller unregelmäßigen Verben', anteile: mix(0, [], 'i_y', ['yo_irregular', 'absolut_irregular', 'e_ie', 'o_ue', 'e_i']) }
  ];
  var LEVEL_IDS = LEVEL.map(function (l) { return l.id; });
  var SERIE_ZIEL = 10;

  // Pronomen-Gewichtung je Verbgruppe
  var STAMMWECHSEL_90 = ['e_ie', 'o_ue', 'i_y'];
  var ANTEIL_UNREG_PRONOMEN = 0.9;
  var ANTEIL_YO = 0.6;
  // Verbgewichte in der Gruppe ser/ir/hay
  var ANTEIL_HAY = 0.15;

  function levelInfo(id) {
    for (var i = 0; i < LEVEL.length; i++) if (LEVEL[i].id === id) return LEVEL[i];
    return null;
  }
  function naechstesLevel(id) {
    var i = LEVEL_IDS.indexOf(id);
    return (i >= 0 && i < LEVEL_IDS.length - 1) ? LEVEL_IDS[i + 1] : null;
  }

  // ---------------------------------------------------------------------------
  // Zufall
  // ---------------------------------------------------------------------------
  function waehle(eintraege, rng) { // eintraege: [[wert, gewicht], ...]
    var summe = 0, i;
    for (i = 0; i < eintraege.length; i++) summe += eintraege[i][1];
    var r = rng() * summe;
    for (i = 0; i < eintraege.length; i++) {
      r -= eintraege[i][1];
      if (r < 0) return eintraege[i][0];
    }
    return eintraege[eintraege.length - 1][0];
  }

  function pronomenGewichte(verb) {
    var g = verb.gruppe;
    if (verb.infinitiv === 'haber') return [[null, 1]];
    if (g === 'yo_irregular') {
      return PRONOMEN.map(function (p) { return [p, p === 'yo' ? ANTEIL_YO : (1 - ANTEIL_YO) / 9]; });
    }
    if (STAMMWECHSEL_90.indexOf(g) >= 0) {
      var unreg = PRONOMEN.filter(function (p) { return verb.abweichend_von_regel.indexOf(PRONOMEN_FORM[p]) >= 0; });
      var reg = PRONOMEN.filter(function (p) { return unreg.indexOf(p) < 0; });
      if (unreg.length === 0 || reg.length === 0) return PRONOMEN.map(function (p) { return [p, 1]; });
      return PRONOMEN.map(function (p) {
        return [p, unreg.indexOf(p) >= 0 ? ANTEIL_UNREG_PRONOMEN / unreg.length : (1 - ANTEIL_UNREG_PRONOMEN) / reg.length];
      });
    }
    return PRONOMEN.map(function (p) { return [p, 1]; });
  }

  function verbGewichte(verben) {
    var hatHay = verben.some(function (v) { return v.infinitiv === 'haber'; });
    if (!hatHay) return verben.map(function (v) { return [v, 1]; });
    var andere = verben.length - 1;
    return verben.map(function (v) { return [v, v.infinitiv === 'haber' ? ANTEIL_HAY : (1 - ANTEIL_HAY) / andere]; });
  }

  // ---------------------------------------------------------------------------
  // Aufgaben
  // ---------------------------------------------------------------------------
  function erstelleAufgabe(verb, pronomen) {
    var loesung = pronomen === null ? verb.formen.unpersoenlich : verb.formen[PRONOMEN_FORM[pronomen]];
    var hinweis = verb.hinweis_tabelle || null;
    // Der creer-Hinweis betrifft nur die vosotros-Form
    if (verb.infinitiv === 'creer' && pronomen !== 'vosotros') hinweis = null;
    return {
      infinitiv: verb.infinitiv,
      gruppe: verb.gruppe,
      pronomen: pronomen,
      loesung: loesung,
      reflexiv: !!verb.reflexiv,
      hinweis: hinweis,
      schluessel: verb.infinitiv + '|' + pronomen
    };
  }

  function Generator(daten, rng) {
    this.verben = daten.verben;
    this.rng = rng || Math.random;
    this.letzte = null;
    this.letztesVerb = null;
    this.wiederholungen = []; // {aufgabe, faellig}
    this.level = null;
  }

  Generator.prototype.verbenDerGruppe = function (gruppe) {
    return this.verben.filter(function (v) { return v.gruppe === gruppe; });
  };

  Generator.prototype.zufallsAufgabe = function (levelId) {
    var info = levelInfo(levelId);
    var gruppen = Object.keys(info.anteile).filter(function (g) { return info.anteile[g] > 0; })
      .map(function (g) { return [g, info.anteile[g]]; });
    var gruppe = waehle(gruppen, this.rng);
    var verb = waehle(verbGewichte(this.verbenDerGruppe(gruppe)), this.rng);
    var pronomen = waehle(pronomenGewichte(verb), this.rng);
    return erstelleAufgabe(verb, pronomen);
  };

  Generator.prototype.naechste = function (levelId) {
    if (this.level !== levelId) { this.wiederholungen = []; this.level = levelId; }
    var self = this;
    this.wiederholungen.forEach(function (w) { w.faellig -= 1; });
    // fällige Wiederholung zuerst
    for (var i = 0; i < this.wiederholungen.length; i++) {
      var w = this.wiederholungen[i];
      if (w.faellig <= 0 && (!this.letzte || w.aufgabe.schluessel !== this.letzte.schluessel)) {
        this.wiederholungen.splice(i, 1);
        return this.merke(w.aufgabe, true);
      }
    }
    var aufgabe, versuche = 0;
    do {
      aufgabe = this.zufallsAufgabe(levelId);
      versuche++;
    } while (versuche < 50 && this.letzte && (
      aufgabe.schluessel === self.letzte.schluessel ||
      // dasselbe Verb nicht direkt nacheinander, falls die Gruppe genug Auswahl hat
      // (bei ser/ir/hay würde das sonst die Gewichtung verzerren)
      (aufgabe.infinitiv === self.letzte.infinitiv && self.verbenDerGruppe(aufgabe.gruppe).length > 3)
    ));
    return this.merke(aufgabe, false);
  };

  Generator.prototype.merke = function (aufgabe, istWiederholung) {
    this.letzte = aufgabe;
    var kopie = {};
    for (var k in aufgabe) kopie[k] = aufgabe[k];
    kopie.wiederholung = istWiederholung;
    return kopie;
  };

  // Nach einer falschen Erstantwort: Aufgabe kommt 3–5 Aufgaben später erneut
  Generator.prototype.spaeterWiederholen = function (aufgabe) {
    var bereits = this.wiederholungen.some(function (w) { return w.aufgabe.schluessel === aufgabe.schluessel; });
    if (bereits) return;
    var kopie = {};
    for (var k in aufgabe) if (k !== 'wiederholung') kopie[k] = aufgabe[k];
    this.wiederholungen.push({ aufgabe: kopie, faellig: 3 + Math.floor(this.rng() * 3) });
  };

  function aufgabenText(aufgabe) {
    if (aufgabe.pronomen === null) return '(unpersönlich) haber →';
    return '(' + aufgabe.pronomen + ') ' + aufgabe.infinitiv + ' →';
  }

  // ---------------------------------------------------------------------------
  // Antwortprüfung
  // ---------------------------------------------------------------------------
  function normalisiere(text) {
    return String(text || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('es');
  }
  // Entfernt alle Akzente und sonstigen diakritischen Zeichen
  function ohneAkzent(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  }
  // Akzente werden nicht bewertet: fehlende, falsch gesetzte und zusätzliche Akzente sind egal
  function gleichOhneAkzente(eingabe, loesung) {
    return ohneAkzent(eingabe) === ohneAkzent(loesung);
  }

  /* Ergebnis:
     { ergebnis: 'richtig' | 'richtig_akzent_abweichend' | 'falsch' | 'leer',
       hinweis: null | 'pronomen' | 'reflexiv' } */
  function pruefe(eingabeRoh, loesungRoh) {
    var eingabe = normalisiere(eingabeRoh);
    var loesung = normalisiere(loesungRoh);
    if (!eingabe) return { ergebnis: 'leer', hinweis: null };
    var woerter = eingabe.split(' ');
    var loesungsWoerter = loesung.split(' ');
    if (woerter.length > 1 && SUBJEKTPRONOMEN.indexOf(ohneAkzent(woerter[0])) >= 0 && SUBJEKTPRONOMEN.indexOf(loesungsWoerter[0]) < 0) {
      return { ergebnis: 'falsch', hinweis: 'pronomen' };
    }
    if (eingabe === loesung) return { ergebnis: 'richtig', hinweis: null };
    if (gleichOhneAkzente(eingabe, loesung)) return { ergebnis: 'richtig_akzent_abweichend', hinweis: null };
    if (loesungsWoerter.length === 2) {
      var verbteil = loesungsWoerter[1];
      if (gleichOhneAkzente(eingabe, verbteil)) return { ergebnis: 'falsch', hinweis: 'reflexiv' };
    }
    return { ergebnis: 'falsch', hinweis: null };
  }

  // ---------------------------------------------------------------------------
  // Lernstand
  // ---------------------------------------------------------------------------
  function neuerLernstand(code) {
    return { code: code, level: '1', serie: 0, bearbeitet: 0, richtig: 0, stand: 0 };
  }

  /* Wertet eine Erstantwort aus und gibt den neuen Lernstand zurück.
     Rückgabe: { stand, aufgestiegen: bool, alleGeschafft: bool } */
  function werteErstantwortAus(lernstand, richtig) {
    var s = {};
    for (var k in lernstand) s[k] = lernstand[k];
    s.bearbeitet += 1;
    var aufgestiegen = false, alleGeschafft = false;
    if (richtig) {
      s.richtig += 1;
      s.serie += 1;
      if (s.serie >= SERIE_ZIEL) {
        s.serie = 0;
        var n = naechstesLevel(s.level);
        if (n) { s.level = n; aufgestiegen = true; } else { alleGeschafft = true; }
      }
    } else {
      s.serie = 0;
    }
    return { stand: s, aufgestiegen: aufgestiegen, alleGeschafft: alleGeschafft };
  }

  // ---------------------------------------------------------------------------
  // Fortsetzungscode: 12 Zeichen, ohne verwechselbare Zeichen (0/O, 1/I)
  // ---------------------------------------------------------------------------
  var CODE_ZEICHEN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 Zeichen → 60 Bit Zufall
  function erzeugeCode(zufallsBytes) {
    var bytes = zufallsBytes(12), code = '';
    for (var i = 0; i < 12; i++) code += CODE_ZEICHEN[bytes[i] % 32]; // 256 ist durch 32 teilbar: gleichverteilt
    return code;
  }
  function bereinigeCode(eingabe) {
    var c = String(eingabe || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(c) ? c : null;
  }
  function zeigeCode(code) {
    return code.slice(0, 4) + '-' + code.slice(4, 8) + '-' + code.slice(8, 12);
  }

  // ---------------------------------------------------------------------------
  // Zusatzverben von Lehrkräften (Datei zusatzverben.txt)
  // Je Zeile: Infinitiv; yo-Form – unter der Überschrift der passenden Gruppe.
  // Die übrigen fünf Formen bildet die App selbst.
  // ---------------------------------------------------------------------------
  var ZUSATZ_GRUPPEN = {
    'ar': 'ar', 'er': 'er', 'ir': 'ir',
    '1.person': 'yo_irregular', '1person': 'yo_irregular', 'erstePerson': 'yo_irregular', 'yo': 'yo_irregular',
    'e-ie': 'e_ie', 'eie': 'e_ie', 'o-ue': 'o_ue', 'oue': 'o_ue', 'e-i': 'e_i', 'ei': 'e_i', 'i-y': 'i_y', 'iy': 'i_y'
  };
  var ZUSATZ_UEBERSCHRIFT = {
    ar: '[ar]', er: '[er]', ir: '[ir]', yo_irregular: '[1. Person]', e_ie: '[e-ie]', o_ue: '[o-ue]', e_i: '[e-i]', i_y: '[i-y]'
  };
  var ENDUNGEN = { ar: ['o', 'as', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'imos', 'ís', 'en'] };
  var FORM_SCHLUESSEL = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'];
  var REFLEXIV = ['me', 'te', 'se', 'nos', 'os', 'se'];
  var YO_OHNE_O = ['sé', 'doy', 'estoy', 'voy', 'soy', 'he'];

  function gruppeAusUeberschrift(text) {
    var k = ohneAkzent(text.toLowerCase())
      .replace(/→|->|–|—/g, '-').replace(/\s+/g, '').replace(/^-/, '').replace(/^verbos?/, '');
    if (ZUSATZ_GRUPPEN[k]) return ZUSATZ_GRUPPEN[k];
    if (/^(1|erste|1\.)/.test(k) || k.indexOf('person') >= 0) return 'yo_irregular';
    return null;
  }

  function ersetzeLetztes(stamm, von, nach) {
    var i = stamm.lastIndexOf(von);
    return i < 0 ? null : stamm.slice(0, i) + nach + stamm.slice(i + von.length);
  }
  function endetMitVokal(s) { return /[aeo]$/.test(ohneAkzent(s)); }

  /* Bildet alle sechs Formen. Ergebnis: { fehler, warnungen, verb } */
  function bildeFormen(infinitivRoh, gruppe, yoRoh) {
    var fehler = [], warnungen = [];
    var inf = normalisiere(infinitivRoh), yo = normalisiere(yoRoh);
    if (!/^[a-zñáéíóúü]+$/.test(inf)) return { fehler: ['Der Infinitiv enthält ungültige Zeichen oder Leerzeichen.'], warnungen: [] };
    var reflexiv = /(ar|er|ir|ír)se$/.test(inf);
    var basis = reflexiv ? inf.slice(0, -2) : inf;
    var endung = ohneAkzent(basis).slice(-2);
    if (!ENDUNGEN[endung]) return { fehler: ['Ein Infinitiv endet auf -ar, -er oder -ir (bzw. -arse, -erse, -irse).'], warnungen: [] };
    if ((gruppe === 'ar' || gruppe === 'er' || gruppe === 'ir') && endung !== gruppe) {
      return { fehler: ['Das Verb endet auf -' + endung + ', steht aber in der Gruppe [' + gruppe + '].'], warnungen: [] };
    }
    if (!yo) return { fehler: ['Die yo-Form fehlt. Schreibe sie hinter ein Semikolon, z. B. „cantar; canto“.'], warnungen: [] };
    if (reflexiv) yo = yo.replace(/^me /, '');
    if (!/^[a-zñáéíóúü]+$/.test(yo)) return { fehler: ['Die yo-Form darf nur ein Wort sein (ohne „yo“; bei reflexiven Verben ohne oder mit „me“).'], warnungen: [] };

    var stamm = basis.slice(0, -2);
    var end = ENDUNGEN[endung];
    var regelYo = stamm + 'o';

    // Stamm für tú, él/ella/usted, ellos/ellas/ustedes
    var schuhStamm = stamm;
    if (gruppe === 'e_ie') schuhStamm = ersetzeLetztes(stamm, 'e', 'ie');
    else if (gruppe === 'o_ue') schuhStamm = ersetzeLetztes(stamm, 'o', 'ue') || ersetzeLetztes(stamm, 'u', 'ue');
    else if (gruppe === 'e_i') schuhStamm = ersetzeLetztes(stamm, 'e', 'i');
    else if (gruppe === 'i_y') {
      schuhStamm = stamm + 'y';
      if (!/(uir|oír|oir)$/.test(basis)) warnungen.push('Zur Gruppe i → y gehören normalerweise Verben auf -uir.');
    }
    if (schuhStamm === null) {
      var vokal = { e_ie: 'e', o_ue: 'o', e_i: 'e' }[gruppe];
      return { fehler: ['Im Stamm „' + stamm + '“ gibt es kein „' + vokal + '“ für den Wechsel. Stimmt die Gruppe?'], warnungen: [] };
    }
    // Akzente aus der yo-Form übernehmen (envío → envías, río → ríes)
    if (/o$/.test(yo)) {
      var yoStamm = yo.slice(0, -1);
      if (yoStamm !== schuhStamm && ohneAkzent(yoStamm) === ohneAkzent(schuhStamm)) schuhStamm = yoStamm;
    }

    var nosotros = stamm + end[3], vosotros = stamm + end[4];
    if (endung === 'ir' && endetMitVokal(stamm)) nosotros = stamm + 'ímos';           // oímos, reímos
    if (!/[aeiouáéíóú]/.test(stamm)) vosotros = stamm + ohneAkzent(end[4]);          // veis, dais
    var formen = [yo, schuhStamm + end[1], schuhStamm + end[2], nosotros, vosotros, schuhStamm + end[5]];

    // Plausibilitätsprüfungen (nur Hinweise)
    if (!/o$/.test(yo) && YO_OHNE_O.indexOf(yo) < 0) warnungen.push('Die yo-Form endet nicht auf -o. Bitte prüfen.');
    var yoRegelmaessig = ohneAkzent(yo) === ohneAkzent(regelYo);
    if ((gruppe === 'ar' || gruppe === 'er' || gruppe === 'ir') && !yoRegelmaessig) {
      warnungen.push('Die yo-Form ist nicht regelmäßig (regelmäßig wäre „' + regelYo + '“). Gehört das Verb in die Gruppe [1. Person]? Bei reinen Schreibänderungen wie cojo oder venzo ist es richtig so.');
    }
    if (gruppe === 'yo_irregular' && yoRegelmaessig) {
      warnungen.push('Die yo-Form ist regelmäßig. Gehört das Verb wirklich in die Gruppe [1. Person]?');
    }
    if ((gruppe === 'e_ie' || gruppe === 'o_ue' || gruppe === 'e_i') && yoRegelmaessig) {
      warnungen.push('Die yo-Form zeigt keinen Stammwechsel. Stimmt die Gruppe?');
    }

    if (reflexiv) formen = formen.map(function (f, i) { return REFLEXIV[i] + ' ' + f; });
    var verb = { infinitiv: inf, gruppe: gruppe, formen: {}, reflexiv: reflexiv, zusatz: true, abweichend_von_regel: [] };
    var regel = [regelYo].concat(end.slice(1).map(function (e) { return stamm + e; }));
    FORM_SCHLUESSEL.forEach(function (k, i) {
      verb.formen[k] = formen[i];
      var ohneRefl = reflexiv ? formen[i].split(' ')[1] : formen[i];
      if (ohneAkzent(ohneRefl) !== ohneAkzent(regel[i])) verb.abweichend_von_regel.push(k);
    });
    return { fehler: fehler, warnungen: warnungen, verb: verb };
  }

  /* Liest den Text von zusatzverben.txt.
     Ergebnis: { verben: [...], zeilen: [{ nr, text, gruppe, status: 'ok'|'warnung'|'fehler', meldungen, verb }] } */
  function leseZusatzverben(text, basisVerben) {
    var bekannt = {};
    (basisVerben || []).forEach(function (v) { bekannt[v.infinitiv] = 'in der Original-Tabelle'; });
    var gruppe = null, zeilen = [], verben = [];
    String(text || '').replace(/^﻿/, '').split(/\r?\n/).forEach(function (roh, index) {
      var zeile = roh.trim();
      if (!zeile || zeile.charAt(0) === '#') return;
      var nr = index + 1;
      var kopf = zeile.match(/^\[(.*)\]$/);
      if (kopf) {
        gruppe = gruppeAusUeberschrift(kopf[1]);
        if (!gruppe) zeilen.push({ nr: nr, text: zeile, gruppe: null, status: 'fehler', meldungen: ['Unbekannte Gruppe. Erlaubt sind: [ar], [er], [ir], [1. Person], [e-ie], [o-ue], [e-i], [i-y].'] });
        return;
      }
      var eintrag = { nr: nr, text: zeile, gruppe: gruppe, status: 'ok', meldungen: [] };
      zeilen.push(eintrag);
      if (!gruppe) { eintrag.status = 'fehler'; eintrag.meldungen.push('Die Zeile steht unter keiner gültigen Gruppen-Überschrift.'); return; }
      var teile = zeile.split(/\s*[;,:=\t]\s*/).filter(function (t) { return t !== ''; });
      if (teile.length > 2) { eintrag.status = 'fehler'; eintrag.meldungen.push('Bitte nur Infinitiv und yo-Form angeben, z. B. „cantar; canto“.'); return; }
      var r = bildeFormen(teile[0], gruppe, teile[1] || '');
      if (r.fehler.length) { eintrag.status = 'fehler'; eintrag.meldungen = r.fehler; return; }
      if (bekannt[r.verb.infinitiv]) {
        eintrag.status = 'fehler';
        eintrag.meldungen.push('„' + r.verb.infinitiv + '“ ist schon ' + bekannt[r.verb.infinitiv] + ' enthalten.');
        return;
      }
      bekannt[r.verb.infinitiv] = 'weiter oben in dieser Datei (Zeile ' + nr + ')';
      if (r.warnungen.length) { eintrag.status = 'warnung'; eintrag.meldungen = r.warnungen; }
      eintrag.verb = r.verb;
      verben.push(r.verb);
    });
    return { verben: verben, zeilen: zeilen };
  }

  function verbenMitZusatz(basisDaten, zusatzText) {
    var z = leseZusatzverben(zusatzText, basisDaten.verben);
    return { verben: basisDaten.verben.concat(z.verben), zusatz: z };
  }

  var Logik = {
    PRONOMEN: PRONOMEN, PRONOMEN_FORM: PRONOMEN_FORM, GRUPPEN: GRUPPEN, LEVEL: LEVEL, LEVEL_IDS: LEVEL_IDS,
    SERIE_ZIEL: SERIE_ZIEL, levelInfo: levelInfo, naechstesLevel: naechstesLevel,
    pronomenGewichte: pronomenGewichte, Generator: Generator, aufgabenText: aufgabenText,
    pruefe: pruefe, normalisiere: normalisiere, neuerLernstand: neuerLernstand,
    werteErstantwortAus: werteErstantwortAus, erzeugeCode: erzeugeCode, bereinigeCode: bereinigeCode,
    zeigeCode: zeigeCode, bildeFormen: bildeFormen, leseZusatzverben: leseZusatzverben,
    verbenMitZusatz: verbenMitZusatz, ZUSATZ_UEBERSCHRIFT: ZUSATZ_UEBERSCHRIFT
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Logik;
  else global.Logik = Logik;
})(this);
