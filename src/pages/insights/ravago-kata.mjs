// "Een dag agentic engineering bij Ravago" — 23 October 2026. Written for the
// redesign rather than ported. Every claim about the day is the course's own
// (the kata page and ../kata-agentic-java): the step names, the flags, the
// build as the judge, the repository that stays with the group. Nothing is said
// about a participant that a participant did not say, and, as on the kata page,
// no language or build tool is named.
import { p, h2, quote } from '../prose.mjs';

const KATA = {
  nl: '/nl/training/agentic-engineering-kata/',
  en: '/en/training/agentic-engineering-kata/',
  fr: '/fr/formation/kata-agentic-engineering/'
};

export const body = {
  nl: [
    p`Bijna elke developer heeft intussen al eens een AI-agent code laten schrijven. Veel
      minder developers weten waarom diezelfde agent de ene keer briljant is en de
      volgende keer vol zelfvertrouwen de mist in gaat. Op 23 oktober zochten we dat een
      volle dag lang uit, samen met de developers van **Ravago**.`,
    p`Geen zaal met rijen stoelen en een spreker achteraan onverstaanbaar. Wel een ronde
      tafel, laptops open, koffie binnen handbereik en iedereen met zicht op hetzelfde
      scherm. Precies wat je wil voor een dag waarop niemand lang zou blijven
      stilzitten.`,
    h2`Eerst zien wat de agent ziet`,
    p`De ochtend begon bij de vraag die alles verklaart: **wat zit er eigenlijk in het
      contextvenster** van een agent? Je prompt, de tools, de sessie, de instructies die
      je zelf nooit typt. Elke laag kost tokens en elke laag kleurt het antwoord.`,
    p`Tom liet dat venster op het grote scherm laag per laag vollopen. Daarna was het
      aan de groep, op hun eigen machine en in een echte codebase. Want wie één keer heeft
      gezien hoe snel dat venster vol zit, stuurt een agent nooit meer op dezelfde manier
      aan.`,
    h2`Flags die je niet kan googelen`,
    p`Een kata leert door herhaling, en elke oefening bouwt voort op de vorige. In de
      code zitten **verborgen flags die pas verschijnen als je oplossing echt werkt**:
      als de software lokaal draait, de juiste meetpunten heeft of beter beveiligd is.
      Een antwoord opzoeken helpt je dus geen stap vooruit.`,
    p`Dat maakt van elke oefening een kleine puzzel met een eerlijk einde. Een flag is
      geen bewijs dat je de slide begreep. Het is het bewijs dat je het gedaan hebt.`,
    quote`Niet de agent beslist of de code goed genoeg is. De build beslist.`,
    h2`In de namiddag spreekt de build`,
    p`Na de middag kwam alles samen in de workshop. Met de agent als collega werk je aan
      bestaande code, en aan het eind velt **de geautomatiseerde build het oordeel**.
      Testdekking, complexiteit en mutatietesten: harde cijfers, geen buikgevoel.`,
    p`De dag sloot af bij het stuk dat vaak vergeten wordt. Wat verandert er aan je rol als
      developer? Wat kan je beloven en wat niet? En hoe neem je de rest van je team mee?
      De techniek levert pas iets op als het team er ook mee verder kan.`,
    h2`Wat er blijft na vandaag`,
    p`De repository blijft van de deelnemers, met alle oefeningen en exact dezelfde slides
      die op het scherm stonden. Zo kan iedereen morgen verder op eigen tempo, of een
      collega meenemen die er deze keer niet bij was.`,
    p`Dank aan **Ravago** voor de gastvrijheid en aan elke deelnemer voor de scherpe vragen
      en het doorzettingsvermogen tot de laatste flag.`,
    p`Wil je jouw developers ook een dag laten oefenen met een agent in een echte
      codebase? [Bekijk de kata](${KATA.nl}) of [laten we praten](#contact).`
  ],

  en: [
    p`By now almost every developer has let an AI agent write some code. Far fewer know why
      that same agent is brilliant one moment and confidently wrong the next. On
      23 October we spent a full day finding out, together with the developers at
      **Ravago**.`,
    p`No rows of chairs and a speaker nobody can hear from the back. Instead: a round
      table, laptops open, coffee within reach and everyone looking at the same screen.
      Exactly what you want for a day on which nobody would be sitting still for long.`,
    h2`First, see what the agent sees`,
    p`The morning started with the question that explains everything: **what is actually
      in an agent's context window**? Your prompt, the tools, the session, the
      instructions you never type yourself. Every layer costs tokens and every layer
      colours the answer.`,
    p`Tom filled that window layer by layer on the big screen. Then it was over to the
      group, on their own machines and in a real codebase. Once you have seen how quickly
      that window fills up, you never steer an agent the same way again.`,
    h2`Flags you can't look up`,
    p`A kata teaches through repetition, and every exercise builds on the one before. The
      code hides **flags that only appear once your solution really works**: when the
      software runs locally, has the right instrumentation or is better secured. Looking
      up an answer gets you nowhere.`,
    p`That turns every exercise into a small puzzle with an honest ending. A flag is not
      proof that you understood the slide. It is proof that you did the work.`,
    quote`The agent doesn't decide whether the code is good enough. The build does.`,
    h2`In the afternoon, the build has its say`,
    p`After lunch everything came together in the workshop. With the agent as a colleague
      you work on existing code, and at the end **the automated build gives the verdict**.
      Test coverage, complexity and mutation testing: hard numbers, not gut feeling.`,
    p`The day closed on the part that often gets forgotten. What changes about your role
      as a developer? What can you promise, and what can't you? And how do you bring the
      rest of your team along? The technology only pays off when the team can carry it
      forward.`,
    h2`What stays after today`,
    p`The repository stays with the participants, with every exercise and exactly the same
      slides that were on screen. So everyone can carry on tomorrow at their own pace, or
      bring along a colleague who wasn't there this time.`,
    p`Thanks to **Ravago** for the hospitality, and to every participant for the sharp
      questions and the persistence right up to the last flag.`,
    p`Want your developers to spend a day practising with an agent in a real codebase?
      [Take a look at the kata](${KATA.en}) or [let's talk](#contact).`
  ],

  fr: [
    p`Presque tous les développeurs ont déjà laissé un agent IA écrire du code. Bien moins
      savent pourquoi ce même agent est brillant un jour et se trompe avec aplomb le
      lendemain. Le 23 octobre, nous avons passé une journée entière à le découvrir, avec
      les développeurs de **Ravago**.`,
    p`Pas de rangées de chaises ni d'orateur inaudible au fond de la salle. Plutôt une
      table ronde, des laptops ouverts, du café à portée de main et tout le monde face au
      même écran. Exactement ce qu'il faut pour une journée où personne n'allait rester
      longtemps immobile.`,
    h2`D'abord, voir ce que voit l'agent`,
    p`La matinée a commencé par la question qui explique tout: **que contient vraiment la
      fenêtre de contexte** d'un agent? Votre prompt, les outils, la session, les
      instructions que vous ne tapez jamais vous-même. Chaque couche coûte des tokens et
      chaque couche influence la réponse.`,
    p`Tom a rempli cette fenêtre couche par couche sur le grand écran. Ensuite, c'était au
      groupe de jouer, sur sa propre machine et dans une vraie base de code. Une fois
      qu'on a vu à quelle vitesse cette fenêtre se remplit, on ne pilote plus jamais un
      agent de la même façon.`,
    h2`Des flags introuvables sur internet`,
    p`Un kata apprend par la répétition, et chaque exercice s'appuie sur le précédent. Le
      code cache **des flags qui n'apparaissent que lorsque votre solution fonctionne
      vraiment**: quand le logiciel tourne en local, qu'il est correctement instrumenté
      ou mieux sécurisé. Chercher la réponse ailleurs ne vous avance à rien.`,
    p`Chaque exercice devient ainsi une petite énigme avec une fin honnête. Un flag ne
      prouve pas que vous avez compris la slide. Il prouve que vous avez fait le
      travail.`,
    quote`Ce n'est pas l'agent qui décide si le code est assez bon. C'est le build.`,
    h2`L'après-midi, le build a le dernier mot`,
    p`Après le déjeuner, tout s'est rejoint dans l'atelier. Avec l'agent comme collègue,
      vous travaillez sur du code existant, et à la fin **le build automatisé rend son
      verdict**. Couverture de tests, complexité et tests de mutation: des chiffres
      concrets, pas une impression.`,
    p`La journée s'est terminée sur la partie qu'on oublie souvent. Qu'est-ce qui change
      dans votre rôle de développeur? Que pouvez-vous promettre, et que ne pouvez-vous
      pas? Et comment embarquer le reste de l'équipe? La technique ne rapporte que si
      l'équipe peut la porter plus loin.`,
    h2`Ce qui reste après aujourd'hui`,
    p`Le dépôt reste aux participants, avec tous les exercices et exactement les mêmes
      slides qu'à l'écran. Chacun peut donc continuer demain à son rythme, ou embarquer un
      collègue qui n'était pas là cette fois.`,
    p`Merci à **Ravago** pour son accueil, et à chaque participant pour ses questions
      pointues et sa persévérance jusqu'au dernier flag.`,
    p`Vous voulez que vos développeurs passent une journée à s'exercer avec un agent dans
      une vraie base de code? [Découvrez le kata](${KATA.fr}) ou
      [parlons-en](#contact).`
  ]
};
