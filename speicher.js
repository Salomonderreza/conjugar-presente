/* Speicherung: lokal im Browser (immer) und im Speicherdienst Supabase (wenn eingerichtet).
   Der neuere Stand gewinnt. Ohne Verbindung wird lokal gespeichert und später übertragen. */
(function (global) {
  'use strict';
  var SCHLUESSEL = 'spanisch-verben-lernstand';
  var cfg = global.KONFIGURATION || {};

  function konfiguriert() {
    return !!(cfg.supabaseUrl && cfg.supabaseKey &&
      cfg.supabaseUrl.indexOf('DEIN-PROJEKT') < 0 && cfg.supabaseKey.indexOf('DEIN-SCHLUESSEL') < 0);
  }

  // --- lokal ---------------------------------------------------------------
  function ladeLokal() {
    try {
      var roh = global.localStorage.getItem(SCHLUESSEL);
      return roh ? JSON.parse(roh) : null;
    } catch (e) { return null; }
  }
  function speichereLokal(lernstand) {
    try { global.localStorage.setItem(SCHLUESSEL, JSON.stringify(lernstand)); return true; }
    catch (e) { return false; }
  }
  function loescheLokal() {
    try { global.localStorage.removeItem(SCHLUESSEL); } catch (e) { /* egal */ }
  }

  // --- Supabase ------------------------------------------------------------
  function rpc(name, argumente) {
    var url = cfg.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/' + name;
    var steuerung = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var zeitlimit = setTimeout(function () { if (steuerung) steuerung.abort(); }, 10000);
    return fetch(url, {
      method: 'POST',
      headers: {
        'apikey': cfg.supabaseKey,
        'Authorization': 'Bearer ' + cfg.supabaseKey, // bei neuen Schlüsseln erlaubt, wenn identisch mit apikey
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(argumente || {}),
      signal: steuerung ? steuerung.signal : undefined
    }).then(function (antwort) {
      clearTimeout(zeitlimit);
      if (!antwort.ok) {
        return antwort.text().then(function (t) {
          var f = new Error('Speicherdienst antwortet mit ' + antwort.status + ': ' + t);
          f.status = antwort.status;
          throw f;
        });
      }
      return antwort.json();
    }, function (f) { clearTimeout(zeitlimit); throw f; });
  }

  function anlegen(code) { return rpc('lernstand_anlegen', { p_code: code }); }
  function laden(code) { return rpc('lernstand_laden', { p_code: code }); }
  function speichern(s) {
    return rpc('lernstand_speichern', {
      p_code: s.code, p_level: s.level, p_serie: s.serie,
      p_bearbeitet: s.bearbeitet, p_richtig: s.richtig, p_stand: s.stand
    });
  }

  /* Gleicht den lokalen Stand mit dem Server ab.
     Ergebnis: { lernstand, quelle: 'lokal' | 'server', status: 'gespeichert' | 'offline' | 'nur-lokal' } */
  function abgleichen(lokal) {
    if (!konfiguriert()) return Promise.resolve({ lernstand: lokal, quelle: 'lokal', status: 'nur-lokal' });
    return speichern(lokal).then(function (server) {
      if (server === null) {
        // Code ist auf dem Server noch unbekannt (z. B. offline angelegt): jetzt anlegen
        return anlegen(lokal.code).then(function () { return speichern(lokal); });
      }
      return server;
    }).then(function (server) {
      if (!server) throw new Error('Lernstand konnte nicht angelegt werden');
      if (server.stand > lokal.stand) {
        var neu = uebernehme(server);
        speichereLokal(neu);
        return { lernstand: neu, quelle: 'server', status: 'gespeichert' };
      }
      lokal.ausstehend = false;
      speichereLokal(lokal);
      return { lernstand: lokal, quelle: 'lokal', status: 'gespeichert' };
    }).catch(function () {
      lokal.ausstehend = true;
      speichereLokal(lokal);
      return { lernstand: lokal, quelle: 'lokal', status: 'offline' };
    });
  }

  function uebernehme(server) {
    return {
      code: server.code, level: String(server.level), serie: Number(server.serie),
      bearbeitet: Number(server.bearbeitet), richtig: Number(server.richtig),
      stand: Number(server.stand), ausstehend: false
    };
  }

  function neuerStempel(alt) { return Math.max(Date.now(), (alt || 0) + 1); }

  global.Speicher = {
    konfiguriert: konfiguriert, ladeLokal: ladeLokal, speichereLokal: speichereLokal,
    loescheLokal: loescheLokal, anlegen: anlegen, laden: laden, abgleichen: abgleichen,
    uebernehme: uebernehme, neuerStempel: neuerStempel
  };
})(this);
