// "Wat werkt en wat niet" — 5 June 2026. Ported from the Eleventy blog on
// `main` (blog/posts/2026-06-05-wat-werkt-en-wat-niet.md and its en/ and fr/
// translations). The closing link pointed at the launch post in the old /blog/
// tree; it now uses `insight:launch`, which the renderer resolves to that
// article's URL in whichever language the page is being built for.
import { p, h2, quote, list } from '../prose.mjs';

export const body = {
  nl: [
    p`Er is een patroon dat we keer op keer zien bij organisaties die met AI beginnen
      werken. Mensen die al sterk waren in hun vak worden indrukwekkend productief.
      Mensen die het vroeger moeilijker hadden, krijgen met AI een hefboom die ze dat
      verschil kan laten overbruggen, als ze het aangrijpen als leermoment.`,
    p`AI is geen grote gelijkmaker. Maar het is wel een kans voor iedereen die bereid
      is mee te evolueren.`,
    h2`De mens blijft de baseline`,
    p`Een goede medewerker die AI leert gebruiken, werkt niet alleen sneller. De
      kwaliteit van wat ze afleveren verveelvoudigt. Iemand die een goed rapport kon
      schrijven, schrijft er nu vijf in dezelfde tijd, elk even strak. Iemand die slim
      structureert, doet dat nu ook in processen die vroeger te complex waren om aan
      te pakken.`,
    p`Dat is precies waarom AI-training en bewuste toepassing zo belangrijk zijn. De
      technologie zelf maakt het verschil niet. De manier waarop mensen ermee leren
      werken, bepaalt wie er écht op vooruitgaat.`,
    p`Dat is geen argument tegen AI. Het is een argument voor investeren in het juiste
      fundament: begrip, vaardigheden en gerichte toepassing.`,
    h2`Archaïsche processen vallen door de mand`,
    p`Neem de PowerPoint. We spenderen er uren aan, soms dagen. Het resultaat is een
      file die je eenmalig gebruikt, moeilijk deelt, niet doorzoekbaar is en na de
      presentatie vrijwel nooit meer wordt bekeken.`,
    p`Met AI kan je vandaag in tien à twintig minuten een website bouwen die
      functioneert als een interactief slide deck. Rijker in content, makkelijker te
      delen, altijd bereikbaar, en bijwerkbaar zonder opnieuw van nul te beginnen.`,
    p`Dit is geen randfenomeen. Het is een illustratie van een bredere verschuiving:
      wat vroeger uren kostte omwille van technische drempels, kost nu minuten. De
      waarde zit niet langer in de technische uitvoering. De waarde zit in het denken
      erachter, de structuur, de boodschap, de toepassing.`,
    quote`De PowerPoint was nooit het doel. De PowerPoint was de prijs die je betaalde
      om je boodschap over te brengen. Die prijs bestaat niet meer.`,
    h2`De shift is al bezig, maar de kloof groeit`,
    p`We bevinden ons nog aan het begin van een lange curve. AI wordt niet rustiger of
      minder relevant. Het wordt verder ingebed in elk werkproces, elk platform, elke
      workflow.`,
    p`Organisaties die vandaag investeren in AI-vaardigheden bouwen een voorsprong op
      die straks moeilijk in te halen valt. Niet omdat ze betere tools hebben, maar
      omdat hun mensen weten hoe ze die tools moeten sturen. Dat is het verschil dat
      telt.`,
    p`Wie het schip mist, mist meer dan efficiency. Ze missen de omzet die vrijkomt
      wanneer mensen die vroeger vastliepen op uitvoering, nu bezig zijn met wat écht
      waarde toevoegt.`,
    h2`Waar beginnen?`,
    p`De verschuiving begint niet met tools. Ze begint met bewustzijn.`,
    list([
      `**Wat kan AI goed?** Herhaalbare taken, tekst samenvatten en schrijven, data
       analyseren, informatie structureren, eerste versies bouwen.`,
      `**Wat kan AI minder goed?** Oordelen met context, ethische afwegingen, relaties
       onderhouden, onverwachte situaties navigeren.`,
      `**Welke processen zijn verouderd?** Niet alles wat we gewend zijn, is ook
       zinvol. PowerPoints, lange interne rapporten, handmatige statusupdates: veel
       daarvan zijn gewoonten, geen keuzes.`,
      `**Waar zit de meeste wrijving?** Dat is vaak ook waar AI de meeste ruimte
       vrijmaakt.`
    ]),
    p`De organisaties die het verste staan, zijn niet die met de grootste
      AI-budgetten. Het zijn die waar mensen bewust werken met AI, waar ze weten wat
      ze delegeren en wat ze zelf houden. Waar ze AI inzetten om sneller te leveren,
      niet om verantwoordelijkheid te verschuiven.`,
    p`Dat is het fundament waarop SmartAgents werkt. Bewustzijn eerst. Daarna
      toepassing. En dan schalen. Het is ook precies waarom training van bij het begin
      één van onze drie pijlers was — [iets wat we bij onze lancering al op tafel
      legden](insight:launch).`
  ],

  en: [
    p`There is a pattern we see again and again in organisations that start working
      with AI. People who were already strong in their field become impressively
      productive. People who previously found things harder now have a lever that can
      help close that gap, if they treat it as a learning opportunity.`,
    p`AI is not a great equaliser. But it is a genuine chance for anyone willing to
      grow with it.`,
    h2`The human is still the baseline`,
    p`A strong employee who learns to use AI doesn't just work faster. The quality of
      what they deliver multiplies. Someone who could write a solid report now writes
      five of them in the same time, each just as tight. Someone with a sharp instinct
      for structure now applies it to processes that were previously too complex to
      tackle.`,
    p`That is precisely why AI training and deliberate application matter so much. The
      technology itself does not make the difference. How people learn to work with it
      determines who actually moves forward.`,
    p`That is not an argument against AI. It is an argument for investing in the right
      foundation: understanding, skills, and deliberate application where it actually
      matters.`,
    h2`Archaic processes get exposed`,
    p`Take the PowerPoint. We spend hours on them, sometimes days. The result is a
      file used once, hard to share, unsearchable, and rarely looked at again after
      the meeting ends.`,
    p`With AI, you can build a website in ten to twenty minutes that functions as an
      interactive slide deck. Richer in content, easier to share, always accessible,
      and updatable without starting from scratch. The whole thing takes a fraction of
      the time and delivers far more.`,
    p`This is not a fringe example. It illustrates a broader shift: what used to take
      hours because of technical barriers now takes minutes. The value is no longer in
      the technical execution. The value sits in the thinking behind it: the
      structure, the message, the application.`,
    quote`The PowerPoint was never the goal. It was the price you paid to get your
      message across. That price no longer exists.`,
    h2`The shift is already happening, but the gap is widening`,
    p`We are still at the early part of a long curve. AI is not getting quieter or
      less relevant. It is becoming more deeply embedded in every work process, every
      platform, every workflow.`,
    p`Organisations that invest in AI skills today are building a lead that will be
      hard to close later. Not because they have better tools, but because their
      people know how to direct those tools. That is the difference that matters.`,
    p`Those who miss the boat lose more than efficiency. They lose the revenue that
      opens up when people who were previously stuck on execution are now focused on
      what actually creates value.`,
    h2`Where to start`,
    p`The shift does not begin with tools. It begins with awareness.`,
    list([
      `**What is AI good at?** Repeatable tasks, summarising and writing text,
       analysing data, structuring information, building first drafts.`,
      `**What is AI less good at?** Contextual judgement, ethical trade-offs,
       maintaining relationships, navigating unexpected situations.`,
      `**Which processes are outdated?** Not everything we are used to is actually
       useful. PowerPoints, long internal reports, manual status updates: many of
       these are habits, not choices.`,
      `**Where is the most friction?** That is often also where AI frees up the most
       space.`
    ]),
    p`The organisations furthest ahead are not the ones with the largest AI budgets.
      They are the ones where people work with AI deliberately, where they know what
      to delegate and what to keep, where they use AI to deliver faster rather than to
      shift responsibility.`,
    p`That is the foundation SmartAgents works from. Awareness first. Application
      second. Then scale. It is also exactly why training was one of our three pillars
      from the very beginning — [something we put on the table at our
      launch](insight:launch).`
  ],

  fr: [
    p`Il y a un schéma que nous observons sans cesse dans les organisations qui
      commencent à travailler avec l'IA. Les personnes déjà fortes dans leur métier
      deviennent remarquablement productives. Celles qui éprouvaient auparavant plus
      de difficultés disposent désormais d'un levier qui peut les aider à combler cet
      écart, à condition de le saisir comme une occasion d'apprendre.`,
    p`L'IA n'est pas un grand égalisateur. Mais elle constitue une véritable chance
      pour quiconque est prêt à évoluer avec elle.`,
    h2`L'humain reste la référence`,
    p`Un bon collaborateur qui apprend à utiliser l'IA ne travaille pas seulement plus
      vite. La qualité de ce qu'il livre se multiplie. Quelqu'un qui savait rédiger un
      bon rapport en écrit aujourd'hui cinq dans le même temps, tous aussi soignés.
      Quelqu'un qui a le sens de la structure l'applique désormais à des processus
      autrefois trop complexes pour être abordés.`,
    p`C'est précisément pour cela que la formation à l'IA et son application réfléchie
      comptent autant. La technologie en elle-même ne fait pas la différence. C'est la
      manière dont les personnes apprennent à s'en servir qui détermine qui progresse
      réellement.`,
    p`Ce n'est pas un argument contre l'IA. C'est un argument en faveur de
      l'investissement dans les bonnes fondations : la compréhension, les compétences
      et l'application ciblée.`,
    h2`Les processus archaïques sont mis à nu`,
    p`Prenez le PowerPoint. Nous y passons des heures, parfois des jours. Le résultat
      est un fichier utilisé une seule fois, difficile à partager, impossible à
      parcourir et presque jamais consulté une fois la présentation terminée.`,
    p`Avec l'IA, vous pouvez aujourd'hui construire en dix à vingt minutes un site web
      qui fonctionne comme un diaporama interactif. Plus riche en contenu, plus facile
      à partager, toujours accessible et modifiable sans devoir tout recommencer de
      zéro.`,
    p`Ce n'est pas un phénomène marginal. C'est l'illustration d'une évolution plus
      large : ce qui prenait des heures à cause de barrières techniques prend désormais
      quelques minutes. La valeur ne réside plus dans l'exécution technique. La valeur
      réside dans la réflexion qui la sous-tend : la structure, le message,
      l'application.`,
    quote`Le PowerPoint n'a jamais été le but. Le PowerPoint était le prix à payer
      pour faire passer votre message. Ce prix n'existe plus.`,
    h2`Le changement est déjà en cours, mais l'écart se creuse`,
    p`Nous n'en sommes encore qu'au début d'une longue courbe. L'IA ne va pas se
      calmer ni perdre en pertinence. Elle s'intègre de plus en plus profondément dans
      chaque processus de travail, chaque plateforme, chaque flux de travail.`,
    p`Les organisations qui investissent aujourd'hui dans les compétences en IA
      bâtissent une avance qui sera bientôt difficile à rattraper. Non parce qu'elles
      disposent de meilleurs outils, mais parce que leurs collaborateurs savent
      comment piloter ces outils. C'est cette différence qui compte.`,
    p`Ceux qui ratent le coche perdent plus que de l'efficacité. Ils perdent le
      chiffre d'affaires qui se libère lorsque les personnes qui butaient autrefois
      sur l'exécution se consacrent désormais à ce qui crée réellement de la valeur.`,
    h2`Par où commencer ?`,
    p`Le changement ne commence pas par les outils. Il commence par la prise de
      conscience.`,
    list([
      `**Qu'est-ce que l'IA fait bien ?** Les tâches répétitives, résumer et rédiger
       des textes, analyser des données, structurer l'information, produire des
       premières versions.`,
      `**Qu'est-ce que l'IA fait moins bien ?** Juger avec le contexte, les arbitrages
       éthiques, entretenir les relations, naviguer dans des situations imprévues.`,
      `**Quels processus sont dépassés ?** Tout ce dont nous avons l'habitude n'a pas
       forcément du sens. Les PowerPoints, les longs rapports internes, les mises à
       jour de statut manuelles : beaucoup relèvent de l'habitude, pas du choix.`,
      `**Où se trouvent les plus grandes frictions ?** C'est souvent là aussi que l'IA
       libère le plus d'espace.`
    ]),
    p`Les organisations les plus avancées ne sont pas celles qui disposent des plus
      gros budgets IA. Ce sont celles où les personnes travaillent consciemment avec
      l'IA, où elles savent ce qu'elles délèguent et ce qu'elles gardent. Où elles
      utilisent l'IA pour livrer plus vite, et non pour déplacer la responsabilité.`,
    p`C'est le fondement sur lequel SmartAgents travaille. La prise de conscience
      d'abord. L'application ensuite. Puis la mise à l'échelle. C'est aussi exactement
      pourquoi la formation a été dès le départ l'un de nos trois piliers :
      [quelque chose que nous avons mis sur la table dès notre
      lancement](insight:launch).`
  ]
};
