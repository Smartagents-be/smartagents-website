# Export Beveiliging — Design Spec

**Datum:** 2026-03-27
**Status:** Goedgekeurd

## Doel

De bestanden onder `/export/*` (rapporten, intake-templates) zijn momenteel publiek toegankelijk via de Cloudflare Pages deployment. Deze spec beschrijft hoe toegang beperkt wordt tot gebruikers met het juiste wachtwoord.

## Architectuur

Twee Cloudflare Pages Functions in een nieuwe `functions/` map:

```
functions/
  export/
    login.js        → GET: loginpagina  |  POST: wachtwoordvalidatie + cookie
    [[path]].js     → middleware: bewaakt alle /export/* requests
```

De statische bestanden in `dist/export/` worden niet verplaatst. De middleware proxiet geldige requests via `env.ASSETS.fetch(request)`.

Routeprioriteit: `login.js` heeft voorrang op `[[path]].js`, waardoor `/export/login` zelf niet bewaakt wordt.

## Auth Flow

1. Gebruiker bezoekt een URL onder `/export/*`
2. `[[path]].js` controleert op cookie `export_session`
3. Geen geldig cookie → redirect naar `/export/login?redirect=<originele-url>`
4. Gebruiker vult wachtwoord in op loginpagina
5. POST naar `/export/login` → vergelijk met env var `EXPORT_PASSWORD`
6. Match → genereer HMAC-SHA256 token (via Web Crypto API, secret uit `EXPORT_SESSION_SECRET`)
7. Zet cookie `export_session` met waarde = HMAC-token
   - `HttpOnly`, `Secure`, `SameSite=Strict`, `Max-Age=604800` (7 dagen)
8. Redirect naar originele URL
9. Volgende requests: cookie aanwezig en HMAC geldig → `env.ASSETS.fetch()` serveert bestand
10. Verkeerd wachtwoord → loginpagina opnieuw met foutmelding

## Beveiliging

- Cookie kan niet worden vervalst zonder `EXPORT_SESSION_SECRET`
- HMAC gebruikt Web Crypto API (beschikbaar in Cloudflare Workers runtime)
- Cookie is `HttpOnly` (niet leesbaar via JavaScript) en `Secure` (alleen HTTPS)
- Wachtwoord nooit opgeslagen in code — altijd via Cloudflare Pages env var

## Environment Variabelen

In te stellen via Cloudflare Pages dashboard → Settings → Environment Variables:

| Naam | Beschrijving |
|------|-------------|
| `EXPORT_PASSWORD` | Het gedeelde wachtwoord voor toegang |
| `EXPORT_SESSION_SECRET` | Willekeurige string voor HMAC-signing (min. 32 tekens) |

## Loginpagina Stijl

- Donkere achtergrond, cyan accent `#00d8ff` (SmartAgents huisstijl)
- Merknaam "SmartAgents" bovenaan
- Ondertitel: "Beveiligde documenten"
- Één wachtwoordveld + "Toegang" knop
- Foutmelding bij verkeerd wachtwoord
- Geen gebruikersnaam vereist

## Bestanden die worden aangemaakt/gewijzigd

| Bestand | Actie |
|---------|-------|
| `functions/export/login.js` | Nieuw |
| `functions/export/[[path]].js` | Nieuw |

Geen wijzigingen aan `.eleventy.js`, `dist/`, of bestaande pagina's.
