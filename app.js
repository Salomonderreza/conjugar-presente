/* Oberfläche und Ablauf der Übung */
(function () {
  'use strict';
  var L = window.Logik, S = window.Speicher;
  function $(id) { return document.getElementById(id); }

  var el = {
    codebox: $('codebox'), codeAnzeige: $('code-anzeige'), codeKopieren: $('code-kopieren'),
    status: $('status'), levelNummer: $('level-nummer'), levelTitel: $('level-titel'), levelHinweis: $('level-hinweis'),
    fortschritt: $('fortschritt'), fortschrittText: $('fortschritt-text'), statistik: $('statistik'),
    uebung: $('uebung'), wiederholung: $('wiederholung'), aufgabe: $('aufgabe'), form: $('antwort-form'),
    antwort: $('antwort'), pruefen: $('pruefen'), rueckmeldung: $('rueckmeldung'),
    loesungZeigen: $('loesung-zeigen'), weiter: $('weiter'),
    fuss: $('fuss'), sync: $('sync-status'),
    dlgStart: $('dlg-start'), dlgCode: $('dlg-code'), dlgNeu: $('dlg-neu'), dlgInfo: $('dlg-info')
  };

  var lernstand = null;
  // Verbdaten: Original-Tabelle + Zusatzverben der Lehrkräfte (zusatzverben.txt)
  var ZUSATZ_SCHLUESSEL = 'spanisch-verben-zusatzverben';
  var daten = { verben: window.VERBDATEN.verben.slice() };
  var zusatzAnzahl = 0;
  window.ConjugaDaten = daten;
  var generator = new L.Generator(daten);

  function uebernimmZusatz(text) {
    var r = L.verbenMitZusatz(window.VERBDATEN, text);
    daten.verben = r.verben;
    zusatzAnzahl = r.zusatz.verben.length;
    generator.verben = daten.verben;
    window.ConjugaZusatz = { anzahl: zusatzAnzahl, geladen: true };
  }
  function ladeZusatzverben() {
    try { var gemerkt = window.localStorage.getItem(ZUSATZ_SCHLUESSEL); if (gemerkt) uebernimmZusatz(gemerkt); } catch (e) { /* egal */ }
    if (location.protocol === 'file:' || typeof fetch !== 'function') return; // lokal geöffnet: Datei nicht lesbar
    fetch('zusatzverben.txt', { cache: 'no-cache' }).then(function (a) {
      if (!a.ok) throw new Error(String(a.status));
      return a.text();
    }).then(function (text) {
      uebernimmZusatz(text);
      try { window.localStorage.setItem(ZUSATZ_SCHLUESSEL, text); } catch (e) { /* egal */ }
    }).catch(function () { /* ohne Zusatzverben weiterüben */ });
  }
  var aufgabe = null;
  var phase = 'erst';          // 'erst' | 'korrektur' | 'fertig'
  var korrekturFehler = 0;
  var syncLaeuft = false, syncNochmal = false;

  // ---------------------------------------------------------------------------
  // Hilfen
  // ---------------------------------------------------------------------------
  function zufallsBytes(n) { var a = new Uint8Array(n); window.crypto.getRandomValues(a); return a; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function oeffne(dlg) { if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', ''); }
  function schliesse(dlg) {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    // Nach dem Schließen zurück ins Eingabefeld
    if (lernstand && !document.querySelector('dialog[open]')) el.antwort.focus({ preventScroll: true });
  }
  function zahl(n) { return n.toLocaleString('de-DE'); }

  // ---------------------------------------------------------------------------
  // Anzeige
  // ---------------------------------------------------------------------------
  function zeigeLernstand(neuGefuellt) {
    var info = L.levelInfo(lernstand.level);
    el.codeAnzeige.textContent = L.zeigeCode(lernstand.code);
    el.levelNummer.textContent = 'Level ' + info.id;
    el.levelTitel.textContent = info.titel;
    el.levelHinweis.hidden = !info.hinweis;
    el.levelHinweis.textContent = info.hinweis || '';

    var html = '';
    for (var i = 0; i < L.SERIE_ZIEL; i++) {
      var klasse = i < lernstand.serie ? 'voll' : '';
      if (neuGefuellt && i === lernstand.serie - 1) klasse += ' neu';
      html += '<span class="' + klasse + '"></span>';
    }
    el.fortschritt.innerHTML = html;
    el.fortschritt.setAttribute('aria-valuenow', String(lernstand.serie));
    var rest = L.SERIE_ZIEL - lernstand.serie;
    var naechstes = L.naechstesLevel(lernstand.level);
    el.fortschrittText.innerHTML = '<strong>' + lernstand.serie + ' von ' + L.SERIE_ZIEL + '</strong> richtig in Folge · ' +
      (naechstes ? 'noch ' + rest + ' bis Level ' + naechstes : 'noch ' + rest + ' bis zum Abschluss');
    var quote = lernstand.bearbeitet ? Math.round(100 * lernstand.richtig / lernstand.bearbeitet) : 0;
    el.statistik.textContent = 'Bearbeitet: ' + zahl(lernstand.bearbeitet) + ' · Beim ersten Versuch richtig: ' +
      zahl(lernstand.richtig) + (lernstand.bearbeitet ? '\u00a0(' + quote + '\u00a0%)' : '');
  }

  function zeigeSync(status) {
    var texte = {
      'nur-lokal': 'Nur auf diesem Gerät gespeichert – der Speicherdienst ist noch nicht eingerichtet.',
      'speichert': 'Wird gespeichert …',
      'gespeichert': 'Lernstand gespeichert ✓',
      'offline': 'Gerade keine Verbindung – dein Lernstand ist auf diesem Gerät gesichert und wird später übertragen.'
    };
    el.sync.textContent = texte[status] || '';
    el.sync.classList.toggle('warnung', status === 'offline' || status === 'nur-lokal');
  }

  function zeigeAufgabe() {
    var t;
    if (aufgabe.pronomen === null) {
      t = '<span class="pron">(unpersönlich)</span> <span class="inf">haber</span> <span class="pfeil">→</span>' +
          '<span class="zusatz">„es gibt“</span>';
    } else {
      t = '<span class="pron">(' + esc(aufgabe.pronomen) + ')</span> <span class="inf">' + esc(aufgabe.infinitiv) +
          '</span> <span class="pfeil">→</span>';
    }
    el.aufgabe.innerHTML = t;
    el.wiederholung.hidden = !aufgabe.wiederholung;
    el.antwort.value = '';
    el.antwort.readOnly = false;
    el.antwort.className = '';
    el.rueckmeldung.innerHTML = '';
    el.rueckmeldung.className = 'rueckmeldung';
    el.loesungZeigen.hidden = false;   // Lösung kann jederzeit angezeigt werden
    el.weiter.hidden = true;
    el.pruefen.hidden = false;
    phase = 'erst';
    korrekturFehler = 0;
    el.antwort.focus({ preventScroll: true });
  }

  function neueAufgabe() {
    aufgabe = generator.naechste(lernstand.level);
    zeigeAufgabe();
  }

  function rueckmeldung(art, html) {
    el.rueckmeldung.className = 'rueckmeldung ' + art;
    el.rueckmeldung.innerHTML = html;
  }

  function zuWeiter() {
    phase = 'fertig';
    el.antwort.readOnly = true;
    el.pruefen.hidden = true;
    el.loesungZeigen.hidden = true;
    el.weiter.hidden = false;
    // Fokus im Eingabefeld lassen, damit Enter weiterführt und die Tastatur am Handy offen bleibt
    el.antwort.focus({ preventScroll: true });
  }

  function tabellenHinweis() {
    return aufgabe.hinweis ? '<p class="klein">Hinweis zur Tabelle: ' + esc(aufgabe.hinweis) + '</p>' : '';
  }

  // ---------------------------------------------------------------------------
  // Prüfen
  // ---------------------------------------------------------------------------
  function pruefen() {
    if (phase === 'fertig') { neueAufgabe(); return; }
    var r = L.pruefe(el.antwort.value, aufgabe.loesung);
    if (r.ergebnis === 'leer') { wackeln(); return; }
    var richtig = r.ergebnis !== 'falsch';
    var akzentHinweis = r.ergebnis === 'richtig_akzent_abweichend'
      ? '<p>So schreibt man es richtig: <strong lang="es">' + esc(aufgabe.loesung) + '</strong></p>' : '';

    if (phase === 'erst') {
      var e = L.werteErstantwortAus(lernstand, richtig);
      lernstand = e.stand;
      lernstand.stand = S.neuerStempel(lernstand.stand);
      lernstand.ausstehend = true;
      S.speichereLokal(lernstand);
      zeigeLernstand(richtig);
      synchronisieren();

      if (richtig) {
        el.antwort.className = 'ist-richtig';
        var extra = '';
        if (e.aufgestiegen) {
          var info = L.levelInfo(lernstand.level);
          extra = '<div class="aufstieg"><p class="titel">¡Fantástico! Du bist jetzt in Level ' + esc(info.id) + '.</p>' +
            '<p>' + esc(info.titel) + (info.hinweis ? '<br><span class="klein">' + esc(info.hinweis) + '</span>' : '') + '</p></div>';
        } else if (e.alleGeschafft) {
          extra = '<div class="aufstieg"><p class="titel">¡Enhorabuena! Du hast alle Level geschafft.</p>' +
            '<p>Du kannst in Level 15 mit allen unregelmäßigen Verben weiterüben.</p></div>';
        }
        rueckmeldung('gut', '<p class="titel">¡Correcto! Richtig.</p>' + akzentHinweis + tabellenHinweis() + extra);
        zuWeiter();
      } else {
        el.antwort.className = 'ist-falsch';
        generator.spaeterWiederholen(aufgabe);
        phase = 'korrektur';
        rueckmeldung('schlecht', '<p class="titel">Leider falsch. Versuch es noch einmal.</p>' + hinweisText(r.hinweis) +
          '<p class="klein">Die Serie beginnt wieder bei 0.</p>');
        el.antwort.select();
        wackeln();
      }
      return;
    }

    // Korrektur – zählt nicht für die Serie
    if (richtig) {
      el.antwort.className = 'ist-richtig';
      rueckmeldung('neutral', '<p class="titel">Jetzt stimmt’s!</p>' + akzentHinweis +
        '<p class="klein">Korrekturen zählen nicht für die Serie. Diese Aufgabe kommt gleich noch einmal.</p>' + tabellenHinweis());
      zuWeiter();
    } else {
      korrekturFehler++;
      el.antwort.className = 'ist-falsch';
      rueckmeldung('schlecht', '<p class="titel">Noch nicht richtig.</p>' + hinweisText(r.hinweis) +
        (korrekturFehler >= 2 ? '<p class="klein">Wenn du nicht weiterkommst, drücke auf „Lösung anzeigen“.</p>' : ''));
      el.antwort.select();
      wackeln();
    }
  }

  function hinweisText(h) {
    if (h === 'pronomen') return '<p>Bitte gib nur die Verbform ein – ohne Subjektpronomen.</p>';
    if (h === 'reflexiv') return '<p>Bei reflexiven Verben gehört das Reflexivpronomen zur Antwort.</p>';
    return '';
  }

  function wackeln() {
    el.antwort.classList.remove('wackeln');
    void el.antwort.offsetWidth;
    el.antwort.classList.add('wackeln');
  }

  function loesungAnzeigen() {
    if (phase === 'fertig') return;
    var zusatz = '';
    if (phase === 'erst') {
      // Lösung vor der ersten Antwort angesehen: zählt wie eine falsche Erstantwort
      lernstand = L.werteErstantwortAus(lernstand, false).stand;
      lernstand.stand = S.neuerStempel(lernstand.stand);
      lernstand.ausstehend = true;
      S.speichereLokal(lernstand);
      zeigeLernstand(false);
      synchronisieren();
      generator.spaeterWiederholen(aufgabe);
      zusatz = '<p class="klein">Die Serie beginnt wieder bei 0.</p>';
    }
    rueckmeldung('neutral', '<p class="titel">Lösung: <span lang="es">' + esc(aufgabe.loesung) + '</span></p>' +
      '<p class="klein">Diese Aufgabe kommt gleich noch einmal.</p>' + zusatz + tabellenHinweis());
    el.antwort.className = '';
    zuWeiter();
  }

  // ---------------------------------------------------------------------------
  // Speicherdienst
  // ---------------------------------------------------------------------------
  function synchronisieren() {
    if (!lernstand) return;
    if (!S.konfiguriert()) { zeigeSync('nur-lokal'); return; }
    if (syncLaeuft) { syncNochmal = true; return; }
    syncLaeuft = true;
    zeigeSync('speichert');
    var gesendet = lernstand.stand;
    S.abgleichen(lernstand).then(function (r) {
      syncLaeuft = false;
      // Während der Übertragung weitergeübt? Dann den neueren lokalen Stand behalten.
      if (lernstand.stand !== gesendet) { syncNochmal = true; }
      else if (r.quelle === 'server' && r.lernstand.code === lernstand.code) {
        var altesLevel = lernstand.level;
        lernstand = r.lernstand;
        zeigeLernstand(false);
        if (lernstand.level !== altesLevel && phase === 'erst' && !el.antwort.value) neueAufgabe();
      }
      zeigeSync(r.status);
      if (syncNochmal) { syncNochmal = false; synchronisieren(); }
    });
  }

  function starteMit(stand) {
    lernstand = stand;
    S.speichereLokal(lernstand);
    generator = new L.Generator(daten);
    el.codebox.hidden = el.status.hidden = el.uebung.hidden = el.fuss.hidden = false;
    zeigeLernstand(false);
    neueAufgabe();
    synchronisieren();
  }

  function neuBeginnen(meldung) {
    var code = L.erzeugeCode(zufallsBytes);
    var stand = L.neuerLernstand(code);
    stand.stand = S.neuerStempel(0);
    stand.ausstehend = true;
    if (!S.konfiguriert()) { starteMit(stand); return Promise.resolve(); }
    if (meldung) { meldung.className = 'dialog-meldung ok'; meldung.textContent = 'Code wird angelegt …'; }
    function versuch(n) {
      return S.anlegen(code).then(function (ergebnis) {
        if (ergebnis === null && n < 3) { // extrem unwahrscheinlich: Code schon vergeben
          code = L.erzeugeCode(zufallsBytes); stand.code = code; return versuch(n + 1);
        }
      });
    }
    // Ohne Verbindung trotzdem starten; der Code wird später angelegt.
    return versuch(0).catch(function () { }).then(function () { starteMit(stand); });
  }

  function codeLaden(eingabe, meldung, fertig) {
    var code = L.bereinigeCode(eingabe);
    meldung.className = 'dialog-meldung';
    if (!code) { meldung.textContent = 'Ein Code hat 12 Zeichen, zum Beispiel ABCD-EFGH-JKLM.'; return; }
    if (lernstand && lernstand.code === code) { fertig(); return; }
    if (!S.konfiguriert()) {
      meldung.textContent = 'Fortsetzen mit Code ist erst möglich, wenn der Speicherdienst eingerichtet ist.';
      return;
    }
    meldung.className = 'dialog-meldung ok';
    meldung.textContent = 'Lernstand wird geladen …';
    S.laden(code).then(function (server) {
      if (!server) {
        meldung.className = 'dialog-meldung';
        meldung.textContent = 'Diesen Code gibt es nicht. Bitte prüfe deine Eingabe.';
        return;
      }
      fertig();
      starteMit(S.uebernehme(server));
      zeigeSync('gespeichert');
    }).catch(function () {
      meldung.className = 'dialog-meldung';
      meldung.textContent = 'Keine Verbindung zum Speicherdienst. Bitte versuche es gleich noch einmal.';
    });
  }

  // ---------------------------------------------------------------------------
  // Ereignisse
  // ---------------------------------------------------------------------------
  el.form.addEventListener('submit', function (ev) { ev.preventDefault(); pruefen(); });
  el.antwort.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); pruefen(); }
  });
  el.weiter.addEventListener('click', function () { neueAufgabe(); });
  el.loesungZeigen.addEventListener('click', loesungAnzeigen);
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && phase === 'fertig' && document.activeElement !== el.antwort &&
        !document.querySelector('dialog[open]') && document.activeElement.tagName !== 'BUTTON') {
      ev.preventDefault(); neueAufgabe();
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll('.akzent'), function (k) {
    k.addEventListener('mousedown', function (ev) { ev.preventDefault(); }); // Fokus im Eingabefeld halten
    k.addEventListener('click', function () {
      if (el.antwort.readOnly) return;
      var z = k.getAttribute('data-zeichen');
      var a = el.antwort.selectionStart, b = el.antwort.selectionEnd, v = el.antwort.value;
      if (a === null || a === undefined) { a = b = v.length; }
      el.antwort.value = v.slice(0, a) + z + v.slice(b);
      el.antwort.focus();
      el.antwort.setSelectionRange(a + z.length, a + z.length);
    });
  });

  el.codeKopieren.addEventListener('click', function () {
    var text = L.zeigeCode(lernstand.code);
    function bestaetigt() {
      el.codeKopieren.textContent = 'Kopiert ✓';
      setTimeout(function () { el.codeKopieren.textContent = 'Kopieren'; }, 2000);
    }
    function ersatz() {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); bestaetigt(); } catch (e) { window.prompt('Code kopieren:', text); }
      document.body.removeChild(t);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(bestaetigt, ersatz);
    else ersatz();
  });

  // Start-Dialog
  $('start-neu').addEventListener('click', function () {
    neuBeginnen($('start-meldung')).then(function () { schliesse(el.dlgStart); });
  });
  $('start-code').addEventListener('click', function () { schliesse(el.dlgStart); oeffneCodeDialog(true); });
  el.dlgStart.addEventListener('cancel', function (ev) { ev.preventDefault(); }); // nicht wegklickbar

  // Code-Dialog
  var codeAusStart = false;
  function oeffneCodeDialog(ausStart) {
    codeAusStart = ausStart;
    $('code-eingabe').value = '';
    $('code-meldung').textContent = '';
    var warnung = $('code-warnung');
    if (lernstand) {
      warnung.hidden = false;
      warnung.innerHTML = 'Dein aktueller Code bleibt gültig. Notiere ihn, falls du zurückwechseln möchtest: <strong class="code">' +
        esc(L.zeigeCode(lernstand.code)) + '</strong>';
    } else warnung.hidden = true;
    oeffne(el.dlgCode);
    $('code-eingabe').focus();
  }
  function codeDialogZu() {
    schliesse(el.dlgCode);
    if (codeAusStart && !lernstand) oeffne(el.dlgStart);
  }
  $('oeffne-code').addEventListener('click', function () { oeffneCodeDialog(false); });
  $('code-abbrechen').addEventListener('click', codeDialogZu);
  el.dlgCode.addEventListener('cancel', function (ev) { ev.preventDefault(); codeDialogZu(); });
  $('code-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    codeLaden($('code-eingabe').value, $('code-meldung'), function () { schliesse(el.dlgCode); });
  });

  // Neu-Dialog
  $('oeffne-neu').addEventListener('click', function () {
    $('neu-alter-code').textContent = L.zeigeCode(lernstand.code);
    oeffne(el.dlgNeu);
  });
  $('neu-abbrechen').addEventListener('click', function () { schliesse(el.dlgNeu); });
  $('neu-bestaetigen').addEventListener('click', function () {
    schliesse(el.dlgNeu);
    neuBeginnen(null);
  });

  // Info-Dialog
  $('oeffne-info').addEventListener('click', function () {
    $('zusatz-info').textContent = zusatzAnzahl
      ? 'Zusätzlich haben Lehrkräfte ' + zusatzAnzahl + (zusatzAnzahl === 1 ? ' Verb' : ' Verben') + ' ergänzt.' : '';
    $('levelliste').innerHTML = L.LEVEL.map(function (l) {
      return '<li' + (lernstand && l.id === lernstand.level ? ' class="aktuell"' : '') + '><span class="nr">' + esc(l.id) +
        '</span><span>' + esc(l.titel) + '</span></li>';
    }).join('');
    oeffne(el.dlgInfo);
  });
  $('info-schliessen').addEventListener('click', function () { schliesse(el.dlgInfo); });

  // Erneut abgleichen, wenn das Gerät wieder online ist oder die Seite wieder sichtbar wird
  window.addEventListener('online', synchronisieren);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') synchronisieren();
  });

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  ladeZusatzverben();
  var gespeichert = S.ladeLokal();
  if (gespeichert && L.bereinigeCode(gespeichert.code) && L.levelInfo(gespeichert.level)) {
    starteMit(gespeichert);
  } else {
    oeffne(el.dlgStart);
  }
})();
