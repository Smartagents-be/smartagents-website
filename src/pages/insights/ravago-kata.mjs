// "Een dag agentic engineering bij Ravago" — 23 October 2026. Written for the
// redesign rather than ported. The content follows the kata's own material
// (github.com/Smartagents-be/kata, front/src/steps/step*/locales): the morning
// is step 1 and its recap, the afternoon step 2 (the repository, and the
// "opstellingen" in which several agents work together), and the day closed on
// step 3 as an open conversation rather than a lesson. Nothing is said about a
// participant, and, as on the kata page, no language or build tool is named.
// The closing paragraph keeps to the terms on the Ravago code page: the
// material is for the participants' own use, so it does not say they can pass
// it on.
import { p, h2, quote, list } from '../prose.mjs';

const KATA = {
  nl: '/nl/training/agentic-engineering-kata/',
  en: '/en/training/agentic-engineering-kata/',
  fr: '/fr/formation/kata-agentic-engineering/'
};

export const body = {
  nl: [
    p`Op 23 oktober zaten we een volle dag met een groep developers van **Ravago** rond
      de tafel voor de agentic engineering kata. Iedereen werkte op zijn eigen laptop, met
      zijn eigen AI-assistent. Theorie, demo's en oefeningen wisselden elkaar af.`,
    h2`Hoe een agent echt werkt`,
    p`In de voormiddag begonnen we bij de basis: wat er met je vraag gebeurt, wat de agent
      echt leest en wat dat kost. Wie dat doorheeft, kan zelf veel doen om beter met een
      agent samen te werken. Daarvoor gaven we concrete tips:`,
    list([
      `je prompt: noem het doel, de bestanden die ertoe doen en wat niet mag`,
      `je context: geef het bestand dat ertoe doet in plaats van de hele map`,
      `je sessie: begin een nieuwe sessie voor elke taak, want alles wat erin zit, gaat
        bij elke vraag opnieuw mee`,
      `je model: probeer een goedkoper model op een afgebakende taak en kijk het
        resultaat na`
    ]),
    h2`Je repository inrichten`,
    p`In de namiddag ging het over de repository. Wat de agent elke keer nodig heeft, zet
      je in bestanden: korte instructies, skills voor wat je vaak doet en hooks voor wat
      altijd moet gebeuren. Omdat die bestanden in de repository staan, werkt het hele
      team met dezelfde afspraken.`,
    p`Daarna bekeken we hoe je meerdere agents laat samenwerken: een bouwer en een
      criticus die elkaars werk nakijken, of agents die elk in een eigen worktree naast
      elkaar werken. Checks die de agents zelf draaien, bewaken de kwaliteit.`,
    quote`Laat een machine controleren wat een machine kan controleren.`,
    h2`Wat dit met ons werk doet`,
    p`We sloten af met een open gesprek over hoe ons werk verandert en hoe we daarmee
      omgaan. Wie minder zelf schrijft, leest en test meer. Management verwacht soms tien
      keer zoveel output, terwijl typen nooit de bottleneck was. En wie twijfelt of hij
      dit al goed genoeg kan: niemand doet dit al lang. **Jij blijft de engineer.**`,
    p`De deelnemers houden de repository en de slides, zodat ze alles later kunnen
      nalezen. Dank aan Ravago voor de ontvangst.`,
    p`Wil je zo'n dag ook voor jouw developers? [Bekijk de kata](${KATA.nl}) of
      [neem contact op](#contact).`
  ],

  en: [
    p`On 23 October we spent a full day round the table with a group of developers at
      **Ravago** for the agentic engineering kata. Everyone worked on their own laptop,
      with their own AI assistant. Theory, demos and exercises took turns.`,
    h2`How an agent really works`,
    p`In the morning we started with the basics: what happens to your question, what the
      agent actually reads and what that costs. Once you see that, there is a lot you can
      do yourself to work better with an agent. We gave concrete tips for it:`,
    list([
      `your prompt: name the goal, the files that matter and what is off limits`,
      `your context: hand over the file that matters instead of the whole folder`,
      `your session: start a new one for every task, because everything in it goes
        along again with every question`,
      `your model: try a cheaper model on a well-scoped task and check the result`
    ]),
    h2`Setting up your repository`,
    p`The afternoon was about the repository. What the agent needs every time goes into
      files: short instructions, skills for what you do often and hooks for what must
      always happen. Because those files live in the repository, the whole team works to
      the same agreements.`,
    p`Then we looked at how to get several agents working together: a builder and a
      critic checking each other's work, or agents working side by side, each in its own
      worktree. Checks the agents run themselves keep the quality up.`,
    quote`Let a machine check what a machine can check.`,
    h2`What this does to our work`,
    p`We closed with an open conversation about how our work is changing and how we deal
      with it. If you write less yourself, you read and test more. Management sometimes
      expects ten times the output, while typing was never the bottleneck. And if you
      doubt whether you are good enough at this yet: nobody has been doing it for long.
      **You are still the engineer.**`,
    p`The participants keep the repository and the slides, so they can go back over
      everything later. Thanks to Ravago for having us.`,
    p`Want a day like this for your developers? [Take a look at the kata](${KATA.en}) or
      [get in touch](#contact).`
  ],

  fr: [
    p`Le 23 octobre, nous avons passé une journée entière autour de la table avec un
      groupe de développeurs de **Ravago** pour le kata d'agentic engineering. Chacun
      travaillait sur son propre ordinateur portable, avec son propre assistant IA.
      Théorie, démos et exercices se sont succédé.`,
    h2`Comment un agent fonctionne vraiment`,
    p`Le matin, nous sommes partis des bases: ce qui arrive à votre question, ce que
      l'agent lit réellement et ce que cela coûte. Une fois que vous le voyez, vous pouvez
      faire beaucoup vous-même pour mieux collaborer avec un agent. Nous avons donné des
      conseils concrets:`,
    list([
      `votre prompt: nommez l'objectif, les fichiers qui comptent et ce qui est interdit`,
      `votre contexte: donnez le fichier qui compte plutôt que tout le dossier`,
      `votre session: commencez-en une nouvelle pour chaque tâche, car tout ce qu'elle
        contient repart à chaque question`,
      `votre modèle: essayez un modèle moins cher sur une tâche bien délimitée et
        vérifiez le résultat`
    ]),
    h2`Organiser votre dépôt`,
    p`L'après-midi portait sur le dépôt. Ce dont l'agent a besoin à chaque fois va dans
      des fichiers: des instructions courtes, des skills pour ce que vous faites souvent
      et des hooks pour ce qui doit toujours se produire. Comme ces fichiers sont dans le
      dépôt, toute l'équipe travaille avec les mêmes conventions.`,
    p`Nous avons ensuite vu comment faire collaborer plusieurs agents: un constructeur et
      un critique qui vérifient le travail l'un de l'autre, ou des agents qui travaillent
      côte à côte, chacun dans son propre worktree. Des contrôles que les agents lancent
      eux-mêmes veillent à la qualité.`,
    quote`Laissez une machine contrôler ce qu'une machine peut contrôler.`,
    h2`Ce que cela change à notre travail`,
    p`Nous avons terminé par une discussion ouverte sur la façon dont notre travail
      évolue et sur la manière d'y faire face. Qui écrit moins lui-même lit et teste
      davantage. Le management attend parfois un rendement dix fois plus élevé, alors que
      la frappe n'a jamais été le goulot d'étranglement. Et si vous doutez d'être déjà
      assez à l'aise: personne ne fait cela depuis longtemps. **Vous restez
      l'ingénieur.**`,
    p`Les participants gardent le dépôt et les slides, pour pouvoir tout relire plus
      tard. Merci à Ravago pour son accueil.`,
    p`Vous souhaitez une journée comme celle-ci pour vos développeurs?
      [Découvrez le kata](${KATA.fr}) ou [contactez-nous](#contact).`
  ]
};
