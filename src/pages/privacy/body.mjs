// The privacy notice, in the three languages the site is published in.
//
// Every factual claim here is read off the code, except what a processor does
// with the data once it has left the site, which is stated as what we can and
// cannot confirm. The ones that are easy to get wrong are worth naming:
//
//   • The public pages set no cookies and load nothing third-party. The only
//     external host in a built public page is the LinkedIn href in the footer,
//     and it is a link, not a request. `localStorage` appears only under
//     /secured/.
//   • Art. 13 is answered item by item, 13(2)(e) included: "Wat we verzamelen"
//     ends by saying nothing here is obligatory and what follows from not
//     giving it.
//   • Both ways to reach a person are links. The number was plain text and four
//     ordinary spaces, so it broke across two lines at a 768px tablet — on the
//     page where it is an art. 13(1)(a) contact detail rather than a convenience.
//   • The clause says "no cookies *of our own*", and `privacy.description`, the
//     page's search snippet, carries the same qualifier. It did not, for a
//     round, while the body conceded that touching the form loads Turnstile.
//   • /secured/ does set one cookie and the notice says so: `export_session`,
//     written by `functions/secured/login.js` with `Max-Age=604800`. Seven days
//     is that number, not a rounding. Two drafts said this site sets no cookies
//     at all, which is false in the absolute on a page whose whole posture is
//     that every claim is read off the code.
//   • Turnstile loads on the first interaction with the form and never before.
//   • The rate limiter keys on the caller's IP and stores the counter in KV with
//     `expirationTtl: 7200`, so that record is gone two hours later.
//   • n8n forwards, and may keep execution data. Its workflow retention setting
//     is not in this repository, so the notice says "may" and offers deletion.
//
// The 24-month retention is a commitment, not an observation: nothing in the
// code enforces it. Shorten the number here if it is not realistic.
//
// The opening sentence is `privacy.lede` in src/i18n, printed in the head as the
// standfirst: as the first block of the body it sat under the clause index at
// every width below 1000px, which put the summary after its own contents.
//
// One href in the copy is not a URL: `clause:NN` is the NNth `h2` of this
// notice, resolved in privacy.mjs against the same derivation the clause index
// uses. A cross-reference in a document nobody reads end to end has to be a link
// — "zie hieronder" is useless to a reader who arrived from the index — and the
// ordinal is safe because the three languages carry the same eight clauses in
// the same order.
import { p, h2, list } from '../prose.mjs';

const CONTROLLER = 'SmartAgents BV';
const VAT = 'BE 1037.114.694';
const EMAIL = 'info@smartagents.be';
const PHONE = '+32 11 11 10 20';
/* Repeated from `components/contact-form/contact-form.mjs` rather than imported
   from it: that module imports the privacy page for the form's own consent
   line, so importing it back from here would close a cycle and put these
   constants in the temporal dead zone depending on which side is evaluated
   first. Two strings, and the number is the same one in the footer. */
const PHONE_HREF = 'tel:+3211111020';

/* ------------------------------------------------------------------ *
 * Nederlands
 * ------------------------------------------------------------------ */

const nl = [
  h2`Wie is verantwoordelijk`,
  p`${CONTROLLER}, ${VAT}, Mijnschoolstraat 18, 3580 Beringen, België, is de
    verwerkingsverantwoordelijke. Je bereikt ons op
    [${EMAIL}](mailto:${EMAIL}) of op [${PHONE}](${PHONE_HREF}). We hebben geen
    functionaris voor gegevensbescherming aangesteld: je vraag komt rechtstreeks bij een van
    de twee zaakvoerders terecht.`,

  h2`Wat we verzamelen`,
  p`Er is één plek op deze website waar je gegevens achterlaat, en dat is het
    contactformulier. Daarnaast verwerken we, zoals elke website, technische
    gegevens die nodig zijn om de pagina te tonen en om misbruik tegen te gaan.`,
  list([
    `**Het contactformulier.** Je naam, je e-mailadres en je bericht, en je
     bedrijf als je dat invult. Het formulier stuurt ook twee verborgen velden
     mee: een vaste onderwerpregel en de naam van de pagina waarop je het
     invulde, zodat we weten waarover je vraag gaat.`,
    `**Je IP-adres.** Onze server gebruikt het om te controleren dat je een mens
     bent en om te tellen hoeveel berichten er vanaf één adres komen.`,
    `**Gewone serverlogs** bij onze hostingpartner, die horen bij het uitleveren
     van een webpagina.`
  ]),
  p`Je bent niet verplicht ons iets te geven. Het formulier invullen is een
    keuze; laat je het staan, dan verandert er niets en missen we alleen de
    gegevens die we nodig hebben om je te antwoorden. Bellen of mailen kan
    natuurlijk ook.`,
  p`We verzamelen niets anders. Er is geen analytics, geen tracking, geen
    advertentiepixel en geen profilering op deze website. We nemen ook geen
    beslissingen over jou op een geautomatiseerde manier.`,

  h2`Waarom, en op welke grond`,
  p`Je bericht verwerken we om erop te antwoorden en om de stappen te zetten die
    je vraagt voor er eventueel een samenwerking is. Dat is artikel 6, lid 1, b)
    en f) van de AVG: de uitvoering van precontractuele stappen op je verzoek,
    en ons gerechtvaardigd belang om op een vraag te kunnen antwoorden.`,
  p`Je IP-adres verwerken we om het formulier te beschermen tegen spam en
    misbruik. Dat is ons gerechtvaardigd belang, artikel 6, lid 1, f): zonder die bescherming
    is een open formulier binnen een dag onbruikbaar.`,

  h2`Wie je bericht te zien krijgt`,
  p`Je bericht gaat niet verder dan deze partijen, en we verkopen of verhuren
    je gegevens aan niemand.`,
  list([
    `**Cloudflare** host deze website, levert de spamcontrole (Turnstile) en
     bewaart kortstondig de teller die aan je IP-adres hangt.`,
    `**n8n Cloud** verwerkt je bericht en stuurt het door. Daarbij kunnen berichtgegevens in de uitvoeringsgeschiedenis worden opgeslagen.`,
    `**Slack** is waar je bericht bij ons binnenkomt, samen met een e-mail naar
     onze eigen mailbox.`
  ]),
  p`Cloudflare en Slack zijn bedrijven die gegevens ook buiten de Europese
    Economische Ruimte kunnen verwerken. Dat gebeurt op basis van de
    standaardcontractbepalingen van de Europese Commissie; een kopie daarvan
    kun je bij ons opvragen via [${EMAIL}](mailto:${EMAIL}). n8n Cloud draait in
    de EU-regio.`,

  h2`Hoe lang we het bijhouden`,
  list([
    `**Je bericht** blijft in onze Slack en onze mailbox staan zolang we ermee
     bezig zijn, en daarna tot 24 maanden na ons laatste contact. Word je klant,
     dan valt je dossier onder de bewaartermijnen van die samenwerking.`,
    `**De teller op je IP-adres** verdwijnt vanzelf, twee uur na je laatste bericht.`,
    `**Uitvoeringsgegevens bij n8n** kunnen bewaard blijven. We kunnen daarvoor geen automatische verwijdering na een vaste termijn bevestigen. Je kunt ons vragen je berichtgegevens te laten verwijderen.`,
    `**Serverlogs** vallen onder de bewaartermijnen van onze hostingpartner.`
  ]),
  p`Wil je het eerder weg, dan volstaat een mail. Zie [Je rechten](clause:07).`,

  h2`Cookies`,
  p`Op de publieke pagina's van deze website plaatsen we zelf geen cookies, en er
    staat dan ook geen cookiebanner. Als je het contactformulier aanraakt, laadt
    de spamcontrole van Cloudflare, en die kan daarbij zelf een technisch gegeven
    plaatsen dat ze nodig heeft om de controle uit te voeren. Raak je het
    formulier niet aan, dan gebeurt dat niet.`,
  p`Er is één uitzondering, en die ligt buiten het publieke deel van de site. Wie
    op het afgeschermde gedeelte inlogt, krijgt daarbij één strikt noodzakelijke
    sessiecookie die na zeven dagen vervalt. Die is er alleen om de aanmelding te
    onthouden; hij volgt jou niet en hij komt niet op een publieke pagina terecht.`,
  p`Je browser bewaart wel pagina's en afbeeldingen van deze site zodat ze de
    tweede keer sneller openen. Dat blijft op je eigen toestel, bevat geen
    persoonsgegevens, en je wist het met de gewone knop om browsergegevens te
    verwijderen.`,

  h2`Je rechten`,
  p`Je hebt het recht om je gegevens in te kijken, te laten verbeteren of te
    laten wissen, om de verwerking te laten beperken, om er bezwaar tegen te
    maken, en om ze in een leesbaar formaat mee te krijgen. Mail naar
    [${EMAIL}](mailto:${EMAIL}) en we handelen het binnen de maand af. We vragen
    geen kosten en we vragen ook niet meer bewijs dan nodig om zeker te zijn dat
    jij het bent.`,
  p`Ben je niet tevreden met hoe we dat doen, dan kun je klacht indienen bij de
    Gegevensbeschermingsautoriteit, Drukpersstraat 35, 1000 Brussel,
    [contact@apd-gba.be](mailto:contact@apd-gba.be). We horen het liever eerst
    zelf, maar dat recht staat los van ons.`,

  h2`Wijzigingen`,
  p`Verandert er iets aan wat we verwerken, dan passen we deze pagina aan en
    werken we de datum bovenaan bij.`
];

/* ------------------------------------------------------------------ *
 * English
 * ------------------------------------------------------------------ */

const en = [
  h2`Who is responsible`,
  p`${CONTROLLER}, ${VAT}, Mijnschoolstraat 18, 3580 Beringen, Belgium, is the data controller.
    You can reach us at [${EMAIL}](mailto:${EMAIL}) or on
    [${PHONE}](${PHONE_HREF}). We have not
    appointed a data protection officer: your question goes straight to one of the two
    founders.`,

  h2`What we collect`,
  p`There is one place on this site where you leave data behind, and that is the
    contact form. Beyond it we process, as every website does, the technical
    data needed to serve a page and to keep the form from being abused.`,
  list([
    `**The contact form.** Your name, your e-mail address and your message, plus
     your company if you fill it in. The form also sends two hidden fields: a
     fixed subject line and the name of the page you filled it in on, so we know
     what your question is about.`,
    `**Your IP address.** Our server uses it to check that you are a person and
     to count how many messages come from one address.`,
    `**Ordinary server logs** at our hosting provider, of the kind that come
     with serving a web page.`
  ]),
  p`You are under no obligation to give us anything. Filling in the form is a
    choice; leave it and nothing changes, except that we do not have what we
    would need in order to answer you. Calling or mailing works just as well.`,
  p`We collect nothing else. There is no analytics, no tracking, no advertising
    pixel and no profiling on this site. We also make no automated decisions
    about you.`,

  h2`Why, and on what basis`,
  p`We process your message in order to answer it and to take the steps you are
    asking for before there is any engagement. That is article 6(1)(b) and (f)
    of the GDPR: pre-contractual steps at your own request, and our legitimate
    interest in being able to answer a question.`,
  p`We process your IP address to protect the form against spam and abuse. That is our
    legitimate interest, article 6(1)(f): without that protection an open form is unusable
    within a day.`,

  h2`Who sees your message`,
  p`Your message goes no further than these parties, and we neither sell nor
    rent your data to anyone.`,
  list([
    `**Cloudflare** hosts this site, provides the spam check (Turnstile) and
     briefly holds the counter attached to your IP address.`,
    `**n8n Cloud** processes and forwards your message. Message data may also be saved in its execution history.`,
    `**Slack** is where your message arrives with us, alongside an e-mail to our
     own mailbox.`
  ]),
  p`Cloudflare and Slack are companies that may also process data outside the
    European Economic Area. That happens under the European Commission's
    standard contractual clauses; mail [${EMAIL}](mailto:${EMAIL}) for a copy of
    them. n8n Cloud runs in the EU region.`,

  h2`How long we keep it`,
  list([
    `**Your message** stays in our Slack and our mailbox while we are working on
     it, and after that for up to 24 months from our last contact. If you become
     a client, your file falls under the retention terms of that engagement.`,
    `**The counter on your IP address** disappears by itself, two hours after your last
     message.`,
    `**Execution data at n8n** may be retained. We cannot confirm automatic deletion after a fixed period. You can ask us to have your message data removed.`,
    `**Server logs** are subject to our hosting provider's retention periods.`
  ]),
  p`If you would rather we removed it sooner, an e-mail is enough. See
    [Your rights](clause:07).`,

  h2`Cookies`,
  p`On the public pages of this site we set no cookies of our own, which is why
    there is no cookie banner. If you interact with the contact form,
    Cloudflare's spam check loads, and it may itself place a technical value it
    needs in order to run the check. If you do not touch the form, that does not
    happen.`,
  p`There is one exception, and it sits outside the public part of the site.
    Signing in to the password-protected area sets a single strictly necessary
    session cookie that expires after seven days. It is there to remember the
    sign-in and nothing else; it does not follow you, and it never reaches a
    public page.`,
  p`Your browser does keep pages and images from this site so that they open
    faster the second time. That stays on your own device, holds no personal
    data, and clears with the ordinary button for clearing browsing data.`,

  h2`Your rights`,
  p`You have the right to see your data, to have it corrected or erased, to have
    the processing restricted, to object to it, and to receive it in a readable
    format. Mail [${EMAIL}](mailto:${EMAIL}) and we will deal with it within a
    month. We charge nothing, and we ask for no more proof than we need to be
    sure it is you.`,
  p`If you are not satisfied with how we handle it, you can complain to the
    Belgian Data Protection Authority, Drukpersstraat 35, 1000 Brussels,
    [contact@apd-gba.be](mailto:contact@apd-gba.be). We would rather hear it
    first ourselves, but that right does not depend on us.`,

  h2`Changes`,
  p`If what we process changes, we update this page and the date at the top.`
];

/* ------------------------------------------------------------------ *
 * Français
 * ------------------------------------------------------------------ */

const fr = [
  h2`Qui est responsable`,
  p`${CONTROLLER}, ${VAT}, Mijnschoolstraat 18, 3580 Beringen, en Belgique, est le responsable
    du traitement. Vous nous joignez à [${EMAIL}](mailto:${EMAIL}) ou au
    [${PHONE}](${PHONE_HREF}). Nous n'avons pas désigné de délégué à la
    protection des données : votre question arrive directement chez l'un des deux
    fondateurs.`,

  h2`Ce que nous recueillons`,
  p`Il y a un seul endroit sur ce site où vous laissez des données, et c'est le
    formulaire de contact. À côté de cela, nous traitons, comme tout site web,
    les données techniques nécessaires pour afficher une page et pour empêcher
    que le formulaire soit détourné.`,
  list([
    `**Le formulaire de contact.** Votre nom, votre adresse e-mail et votre
     message, ainsi que votre entreprise si vous la renseignez. Le formulaire
     envoie aussi deux champs masqués : une ligne d'objet fixe et le nom de la
     page depuis laquelle vous l'avez rempli, pour que nous sachions sur quoi
     porte votre question.`,
    `**Votre adresse IP.** Notre serveur s'en sert pour vérifier que vous êtes
     une personne et pour compter combien de messages proviennent d'une même
     adresse.`,
    `**Des journaux de serveur ordinaires** chez notre hébergeur, de ceux qui
     accompagnent la remise d'une page web.`
  ]),
  p`Vous n'êtes tenu de rien nous fournir. Remplir le formulaire est un choix ;
    si vous ne le faites pas, rien ne change, si ce n'est que nous n'avons pas ce
    qu'il nous faudrait pour vous répondre. Un appel ou un e-mail fait tout aussi
    bien l'affaire.`,
  p`Nous ne recueillons rien d'autre. Il n'y a sur ce site ni analytique, ni
    traçage, ni pixel publicitaire, ni profilage. Nous ne prenons pas non plus
    de décision automatisée à votre sujet.`,

  h2`Pourquoi, et sur quelle base`,
  p`Nous traitons votre message afin d'y répondre et d'accomplir les démarches
    que vous demandez avant toute collaboration. C'est l'article 6, paragraphe
    1, b) et f) du RGPD : des mesures précontractuelles prises à votre demande,
    et notre intérêt légitime à pouvoir répondre à une question.`,
  p`Nous traitons votre adresse IP pour protéger le formulaire du spam et des
    abus. C'est notre intérêt légitime, article 6, paragraphe 1, f) : sans cette protection,
    un formulaire ouvert devient inutilisable en une journée.`,

  h2`Qui voit votre message`,
  p`Votre message ne va pas plus loin que ces parties, et nous ne vendons ni ne
    louons vos données à qui que ce soit.`,
  list([
    `**Cloudflare** héberge ce site, fournit le contrôle antispam (Turnstile) et
     conserve brièvement le compteur rattaché à votre adresse IP.`,
    `**n8n Cloud** traite et transmet votre message. Les données du message peuvent aussi être enregistrées dans l'historique des exécutions.`,
    `**Slack** est l'endroit où votre message nous parvient, en même temps qu'un
     e-mail vers notre propre boîte.`
  ]),
  p`Cloudflare et Slack sont des sociétés susceptibles de traiter des données
    en dehors de l'Espace économique européen. Cela se fait sur la base des
    clauses contractuelles types de la Commission européenne ; vous pouvez nous
    en demander une copie à [${EMAIL}](mailto:${EMAIL}). n8n Cloud tourne dans la
    région UE.`,

  h2`Combien de temps nous le gardons`,
  list([
    `**Votre message** reste dans notre Slack et notre boîte mail tant que nous
     nous en occupons, puis jusqu'à 24 mois après notre dernier contact. Si vous
     devenez client, votre dossier relève des durées de conservation de cette
     collaboration.`,
    `**Le compteur lié à votre adresse IP** disparaît de lui-même, deux heures après votre
     dernier message.`,
    `**Les données d'exécution chez n8n** peuvent être conservées. Nous ne pouvons pas confirmer leur suppression automatique après une durée fixe. Vous pouvez nous demander de faire supprimer les données de votre message.`,
    `**Les journaux serveur** sont soumis aux durées de conservation de notre hébergeur.`
  ]),
  p`Si vous préférez que nous l'effacions plus tôt, un e-mail suffit. Voyez
    [Vos droits](clause:07).`,

  h2`Cookies`,
  p`Sur les pages publiques de ce site, nous ne déposons aucun cookie de notre
    fait, et c'est pourquoi il n'y a pas de bandeau cookies. Si vous interagissez
    avec le formulaire de contact, le contrôle antispam de Cloudflare se charge,
    et il peut lui-même déposer une valeur technique dont il a besoin pour
    effectuer ce contrôle. Si vous ne touchez pas au formulaire, cela n'arrive
    pas.`,
  p`Il y a une exception, et elle se situe hors de la partie publique du site.
    Toute personne qui se connecte à l'espace protégé par mot de passe reçoit un
    seul cookie de session strictement nécessaire, qui expire après sept jours.
    Il ne sert qu'à mémoriser la connexion : il ne vous suit pas et n'arrive
    jamais sur une page publique.`,
  p`Votre navigateur conserve en revanche des pages et des images de ce site
    pour qu'elles s'ouvrent plus vite la deuxième fois. Cela reste sur votre
    appareil, ne contient pas de données personnelles, et s'efface avec le
    bouton habituel de suppression des données de navigation.`,

  h2`Vos droits`,
  p`Vous avez le droit de consulter vos données, de les faire rectifier ou
    effacer, d'en faire limiter le traitement, de vous y opposer, et de les
    recevoir dans un format lisible. Écrivez à
    [${EMAIL}](mailto:${EMAIL}) et nous traitons la demande dans le mois. Nous
    ne facturons rien et nous ne demandons pas plus de preuves qu'il n'en faut
    pour être sûrs qu'il s'agit bien de vous.`,
  p`Si notre manière de faire ne vous satisfait pas, vous pouvez introduire une
    plainte auprès de l'Autorité de protection des données, rue de la Presse 35,
    1000 Bruxelles, [contact@apd-gba.be](mailto:contact@apd-gba.be). Nous
    préférons l'entendre d'abord nous-mêmes, mais ce droit ne dépend pas de
    nous.`,

  h2`Modifications`,
  p`Si ce que nous traitons change, nous modifions cette page et déplaçons la
    date de mise à jour en haut.`
];

export const body = { nl, en, fr };
