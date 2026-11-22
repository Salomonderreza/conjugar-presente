/* Zugangsdaten zum Speicherdienst (Supabase).
   Beide Werte findest du in Supabase unter „Project Settings → API Keys“ bzw. im „Connect“-Dialog.
   Der Publishable Key (oder der ältere „anon“-Key) ist für die Verwendung im Browser gedacht
   und darf öffentlich sein. Den Secret Key / service_role-Key hier NIEMALS eintragen.
   Solange hier die Platzhalter stehen, speichert die App nur lokal im Browser. */
var KONFIGURATION = {
  supabaseUrl: 'https://DEIN-PROJEKT.supabase.co',
  supabaseKey: 'DEIN-SCHLUESSEL'
};
