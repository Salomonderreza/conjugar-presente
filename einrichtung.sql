-- =====================================================================
-- Spanische Verben – Speicherdienst (Supabase)
-- Einmal komplett im SQL Editor von Supabase ausführen („Run“).
-- Das Skript kann gefahrlos erneut ausgeführt werden.
--
-- Gespeichert wird nur: Code, Level, Serie, Anzahl bearbeiteter und
-- beim ersten Versuch richtig gelöster Aufgaben, Zeitstempel.
-- Keine Namen, keine E-Mail-Adressen, keine IP-Adressen.
-- =====================================================================

create table if not exists public.lernstand (
  code         text primary key check (code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$'),
  level        text not null default '1'
               check (level in ('1','2','3','4','5','6','7','7,5','8','9','10','11','12','13','14','15')),
  serie        integer not null default 0 check (serie between 0 and 9),
  bearbeitet   integer not null default 0 check (bearbeitet >= 0),
  richtig      integer not null default 0 check (richtig >= 0 and richtig <= bearbeitet),
  stand        bigint  not null default 0,          -- Zeitpunkt der letzten Änderung auf dem Gerät (ms)
  erstellt     timestamptz not null default now(),
  aktualisiert timestamptz not null default now()
);

-- Direkter Tabellenzugriff ist gesperrt. Lesen und Schreiben geht nur
-- über die drei Funktionen unten, und nur mit dem vollständigen Code.
alter table public.lernstand enable row level security;
revoke all on public.lernstand from anon, authenticated;

-- ---------------------------------------------------------------------
-- Neuen Lernstand anlegen. Gibt null zurück, falls der Code schon existiert.
-- Räumt nebenbei Lernstände auf, die 12 Monate nicht genutzt wurden.
-- ---------------------------------------------------------------------
create or replace function public.lernstand_anlegen(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.lernstand;
begin
  delete from public.lernstand where aktualisiert < now() - interval '12 months';
  insert into public.lernstand (code) values (p_code)
  on conflict (code) do nothing
  returning * into r;
  if r.code is null then
    return null;
  end if;
  return jsonb_build_object('code', r.code, 'level', r.level, 'serie', r.serie,
                            'bearbeitet', r.bearbeitet, 'richtig', r.richtig, 'stand', r.stand);
end;
$$;

-- ---------------------------------------------------------------------
-- Lernstand laden. Unbekannter Code: null (mit kurzer Verzögerung,
-- damit massenhaftes Durchprobieren von Codes ausgebremst wird).
-- ---------------------------------------------------------------------
create or replace function public.lernstand_laden(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.lernstand;
begin
  update public.lernstand set aktualisiert = now()
  where code = p_code
  returning * into r;
  if r.code is null then
    perform pg_sleep(0.5);
    return null;
  end if;
  return jsonb_build_object('code', r.code, 'level', r.level, 'serie', r.serie,
                            'bearbeitet', r.bearbeitet, 'richtig', r.richtig, 'stand', r.stand);
end;
$$;

-- ---------------------------------------------------------------------
-- Lernstand speichern. Der neuere Stand gewinnt: Ist auf dem Server schon
-- ein neuerer Stand (z. B. von einem anderen Gerät), bleibt dieser erhalten.
-- Gibt immer den aktuellen Serverstand zurück (oder null bei unbekanntem Code).
-- ---------------------------------------------------------------------
create or replace function public.lernstand_speichern(
  p_code text, p_level text, p_serie integer, p_bearbeitet integer, p_richtig integer, p_stand bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.lernstand;
begin
  update public.lernstand
     set level = p_level, serie = p_serie, bearbeitet = p_bearbeitet,
         richtig = p_richtig, stand = p_stand, aktualisiert = now()
   where code = p_code and stand < p_stand
  returning * into r;
  if r.code is null then
    update public.lernstand set aktualisiert = now()
    where code = p_code
    returning * into r;
  end if;
  if r.code is null then
    perform pg_sleep(0.5);
    return null;
  end if;
  return jsonb_build_object('code', r.code, 'level', r.level, 'serie', r.serie,
                            'bearbeitet', r.bearbeitet, 'richtig', r.richtig, 'stand', r.stand);
end;
$$;

-- ---------------------------------------------------------------------
-- Lebenszeichen für die automatische Aktivierung (siehe README, Schritt 5).
-- ---------------------------------------------------------------------
create or replace function public.lernstand_ping()
returns integer
language sql
security definer
set search_path = public
as $$ select count(*)::integer from public.lernstand where false; $$;

-- Rechte: nur diese Funktionen dürfen von der App aufgerufen werden.
revoke execute on function public.lernstand_anlegen(text) from public;
revoke execute on function public.lernstand_laden(text) from public;
revoke execute on function public.lernstand_speichern(text, text, integer, integer, integer, bigint) from public;
revoke execute on function public.lernstand_ping() from public;
grant execute on function public.lernstand_anlegen(text) to anon, authenticated;
grant execute on function public.lernstand_laden(text) to anon, authenticated;
grant execute on function public.lernstand_speichern(text, text, integer, integer, integer, bigint) to anon, authenticated;
grant execute on function public.lernstand_ping() to anon, authenticated;
