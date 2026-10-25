// "Een dag agentic engineering bij Ravago" — 23 October 2026. Written for the
// redesign rather than ported. The content follows the kata's own slides
// (github.com/Smartagents-be/kata, front/src/steps/step*/locales): the step
// names, each step's recap and the deck titles. Nothing is said about a
// participant, and, as on the kata page, no language or build tool is named.
import { p, h2, quote } from '../prose.mjs';

const KATA = {
  nl: '/nl/training/agentic-engineering-kata/',
  en: '/en/training/agentic-engineering-kata/',
  fr: '/fr/formation/kata-agentic-engineering/'
};

export const body = {
  nl: [
    p`Op 23 oktober gaven we de developers van **Ravago** een volle dag de agentic
      engineering kata. Het doel: van losse prompts naar een agent die betrouwbaar
      meewerkt in een echte codebase.`,
    p`De kata volgt een vaste opbouw. Elke stap eindigt in oefeningen op de eigen machine,
      met verborgen flags die pas verschijnen als de oplossing echt werkt.`,
    h2`Context, model, mechanismen`,
    p`De ochtend draaide rond één request: wat erin gaat, wat het kost en waar het
      antwoord vandaan komt. Tokens, het contextvenster, de sessie en de keuze van het
      model. **Wat in de context zit, stuurt het antwoord**, en meer context is niet
      gratis.`,
    p`Daarbij hoort een kritische blik. Een antwoord klinkt even zeker, of de agent nu je
      bestand las of het uit zijn geheugen haalde. Grounding en controle zijn dus geen
      extraatje.`,
    h2`Agentic engineering`,
    p`Daarna de kern van de dag. Wat de agent telkens opnieuw nodig heeft, hoort in de
      repository en niet in je prompt: instructies, skills, hooks en scripts. En **goede
      agentic engineering begint bij goede software engineering**, met de taal van de
      business in de code.`,
    p`Quality gates controleren de wijziging, niet wie ze maakte. Deterministische checks
      en mutatietesten laten de agent zijn eigen werk bewijzen. Verder: bijsturen door
      terug te spoelen in plaats van te corrigeren, de workflow kiezen op hoe lang de code
      blijft leven, en parallel werken met een eigen worktree per agent.`,
    quote`Een agent schrijft sneller dan jij leest. Laat een machine controleren wat een machine kan controleren.`,
    h2`Soft skills`,
    p`De dag sloot af bij wat er rond het werk verandert. De developer schuift op richting
      analist en test engineer, het proces wordt de bottleneck en een abonnement alleen
      koopt geen voorsprong. **Jij blijft de engineer**: wie het systeem begrijpt, hoeft
      niet elke regel zelf te lezen.`,
    h2`Na de training`,
    p`De repository en de slides blijven bij de deelnemers, zodat ze de stof op eigen tempo
      herhalen en meteen in hun eigen projecten toepassen. Dank aan **Ravago** voor de
      gastvrijheid en de sterke inbreng van het team.`,
    p`Wil je deze dag ook voor jouw developers? [Bekijk de kata](${KATA.nl}) of
      [neem contact op](#contact).`
  ],

  en: [
    p`On 23 October we spent a full day taking the developers at **Ravago** through the
      agentic engineering kata. The goal: from loose prompts to an agent that works
      reliably in a real codebase.`,
    p`The kata follows a fixed structure. Every step ends in exercises on the
      participants' own machines, with hidden flags that only appear once the solution
      really works.`,
    h2`Context, model, mechanisms`,
    p`The morning centred on a single request: what goes into it, what it costs and where
      the answer comes from. Tokens, the context window, the session and the choice of
      model. **What sits in the context steers the answer**, and more context is not
      free.`,
    p`That calls for a critical eye. An answer sounds just as sure whether the agent read
      your file or pulled it from memory. Grounding and verification are not optional
      extras.`,
    h2`Agentic engineering`,
    p`Then the core of the day. What the agent needs every time belongs in the repository,
      not in your prompt: instructions, skills, hooks and scripts. And **good agentic
      engineering starts with good software engineering**, with the language of the
      business in the code.`,
    p`Quality gates check the change, not who made it. Deterministic checks and mutation
      testing let the agent prove its own work. Beyond that: steering by rewinding rather
      than correcting, choosing the workflow by how long the code will live, and working
      in parallel with a worktree per agent.`,
    quote`An agent writes faster than you can read. Let a machine check what a machine can check.`,
    h2`Soft skills`,
    p`The day closed on what changes around the work. The developer moves towards analyst
      and test engineer, the process becomes the bottleneck, and a subscription alone buys
      no head start. **You are still the engineer**: understand the system, and you don't
      need to read every line yourself.`,
    h2`After the training`,
    p`The repository and the slides stay with the participants, so they can revisit the
      material at their own pace and apply it straight away in their own projects. Thanks
      to **Ravago** for the hospitality and to the team for their strong input.`,
    p`Want this day for your developers too? [Take a look at the kata](${KATA.en}) or
      [get in touch](#contact).`
  ],

  fr: [
    p`Le 23 octobre, nous avons consacré une journée entière au kata d'agentic engineering
      avec les développeurs de **Ravago**. L'objectif: passer de prompts isolés à un agent
      qui travaille de manière fiable dans une vraie base de code.`,
    p`Le kata suit une structure fixe. Chaque étape se termine par des exercices sur la
      propre machine des participants, avec des flags cachés qui n'apparaissent que
      lorsque la solution fonctionne vraiment.`,
    h2`Contexte, modèle, mécanismes`,
    p`La matinée s'est articulée autour d'une seule requête: ce qui y entre, ce qu'elle
      coûte et d'où vient la réponse. Les tokens, la fenêtre de contexte, la session et le
      choix du modèle. **Ce qui se trouve dans le contexte oriente la réponse**, et plus de
      contexte n'est pas gratuit.`,
    p`Cela demande un regard critique. Une réponse paraît tout aussi sûre, que l'agent ait
      lu votre fichier ou l'ait tirée de sa mémoire. L'ancrage et la vérification ne sont
      donc pas des options.`,
    h2`Agentic engineering`,
    p`Ensuite, le cœur de la journée. Ce dont l'agent a besoin à chaque fois a sa place
      dans le dépôt, pas dans votre prompt: instructions, skills, hooks et scripts. Et
      **un bon agentic engineering commence par un bon génie logiciel**, avec le
      vocabulaire du métier dans le code.`,
    p`Les quality gates contrôlent la modification, pas son auteur. Des contrôles
      déterministes et des tests de mutation permettent à l'agent de prouver son propre
      travail. Et aussi: corriger le cap en revenant en arrière plutôt qu'en corrigeant,
      choisir le workflow selon la durée de vie du code, et travailler en parallèle avec
      un worktree par agent.`,
    quote`Un agent écrit plus vite que vous ne lisez. Laissez une machine contrôler ce qu'une machine peut contrôler.`,
    h2`Soft skills`,
    p`La journée s'est terminée sur ce qui change autour du travail. Le développeur évolue
      vers un rôle d'analyste et de test engineer, le processus devient le goulot
      d'étranglement, et un abonnement seul n'achète aucune avance. **Vous restez
      l'ingénieur**: comprenez le système, et vous n'avez pas besoin de lire chaque ligne
      vous-même.`,
    h2`Après la formation`,
    p`Le dépôt et les slides restent aux participants, pour qu'ils puissent revoir la
      matière à leur rythme et l'appliquer aussitôt dans leurs propres projets. Merci à
      **Ravago** pour son accueil et à l'équipe pour sa participation active.`,
    p`Vous souhaitez cette journée pour vos développeurs? [Découvrez le kata](${KATA.fr})
      ou [contactez-nous](#contact).`
  ]
};
