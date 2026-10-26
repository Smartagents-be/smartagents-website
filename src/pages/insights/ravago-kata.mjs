// "Een dag agentic engineering bij Ravago" — 23 October 2026. Written for the
// redesign rather than ported. The content follows the kata's own material
// (github.com/Smartagents-be/kata, front/src/steps/step*/locales): the recaps
// of steps 1 and 2 and the headings of step 3, which the day closed on as an
// open conversation rather than a lesson. Nothing is said about a participant,
// and, as on the kata page, no language or build tool is named. The closing
// paragraph keeps to the terms on the Ravago code page: the material is for the
// participants' own use, so it does not say they can pass it on.
import { p, h2, quote } from '../prose.mjs';

const KATA = {
  nl: '/nl/training/agentic-engineering-kata/',
  en: '/en/training/agentic-engineering-kata/',
  fr: '/fr/formation/kata-agentic-engineering/'
};

export const body = {
  nl: [
    p`Op 23 oktober zaten we een volle dag met een groep developers van **Ravago** rond de
      tafel voor de agentic engineering kata. Iedereen werkte op zijn eigen laptop, met
      zijn eigen AI-assistent en het oefenproject van de kata.`,
    p`Uitleg wisselde de hele dag af met oefeningen en demo's. In de oefeningen zoek je
      verborgen flags, en die vind je pas als je oplossing echt draait. Zo merk je meteen
      of je agent zijn werk gedaan heeft.`,
    h2`Wat er in één vraag zit`,
    p`We begonnen bij wat er gebeurt als je een agent iets vraagt. We keken naar tokens,
      naar wat er allemaal in het contextvenster belandt en naar waarom de sessie je
      rekening bepaalt. **Wat in de context zit, bepaalt het antwoord**, en alles wat
      erin staat, gaat bij elke beurt opnieuw mee.`,
    p`Een antwoord klinkt even zeker of de agent nu je bestand gelezen heeft of zelf
      heeft ingevuld wat hij niet wist. Daarom vraag je bij twijfel waar hij het gezien
      heeft, of om een test die faalt.`,
    h2`Werken met agents`,
    p`Het grootste deel van de dag ging over hoe je met agents samenwerkt. Wat een agent
      telkens opnieuw nodig heeft, zet je in de repository en niet in je prompt. **Een
      correctie die je voor de derde keer typt, hoort in een bestand.**`,
    p`Een agent schrijft sneller code dan jij ze kan lezen, dus elke regel zelf nalezen
      hou je niet vol. Je geeft hem checks die hij na elke stap zelf kan draaien, en de
      beslissingen neem je zelf.`,
    quote`Laat een machine controleren wat een machine kan controleren.`,
    p`Gaat de agent de verkeerde kant op, dan spoel je terug naar het bericht waar het
      misliep. Een correctie erachteraan blijft in de context hangen en gaat bij elke
      beurt mee.`,
    p`Ook de werkwijze hangt af van de code. Voor een prototype dat je weggooit, volstaat
      een korte vraag. Code die blijft, krijgt eerst een spec in de repository.`,
    p`We keken ook naar meerdere agents tegelijk, elk in een eigen worktree, en naar een
      bouwer en een criticus die elkaars werk nakijken. Meer agents geven meer output,
      maar je aandacht blijft dezelfde. Splits dus alleen werk waarvan elk stuk een eigen
      check heeft.`,
    h2`Wat dit met ons werk doet`,
    p`We sloten de dag af met een open gesprek over hoe ons werk verandert en hoe we
      daarmee omgaan.`,
    p`We legden een paar stellingen op tafel. Wie minder zelf schrijft, leest en test
      meer en schuift op richting analist en test engineer. Management rekent soms op
      tien keer zoveel output, terwijl typen nooit was waar een project op wachtte. En
      het abonnement dat jij neemt, neemt je concurrent ook.`,
    p`Wie twijfelt of hij dit al goed genoeg kan, staat er niet alleen voor: niemand doet
      dit al lang. Je hoeft niet elke regel te begrijpen, wel het systeem. **Jij blijft
      de engineer.**`,
    h2`Na de dag`,
    p`De deelnemers houden de repository en de slides, in het Nederlands en het Engels,
      zodat ze alles later nog eens kunnen nalezen. Dank aan Ravago voor de ontvangst, en
      aan iedereen die mee aan tafel zat.`,
    p`Wil je zo'n dag ook voor jouw developers? [Bekijk de kata](${KATA.nl}) of
      [neem contact op](#contact).`
  ],

  en: [
    p`On 23 October we spent a full day round the table with a group of developers at
      **Ravago** for the agentic engineering kata. Everyone worked on their own laptop,
      with their own AI assistant and the kata's practice project.`,
    p`Explanation alternated with exercises and demos all day. In the exercises you look
      for hidden flags, and you only find them once your solution actually runs. That
      tells you straight away whether your agent did its job.`,
    h2`What goes into a single question`,
    p`We started with what happens when you ask an agent something. We looked at tokens,
      at everything that ends up in the context window, and at why the session decides
      your bill. **What sits in the context decides the answer**, and all of it goes
      along again on every turn.`,
    p`An answer sounds just as sure whether the agent read your file or filled in what it
      didn't know. So when in doubt, you ask where it saw it, or for a failing test.`,
    h2`Working with agents`,
    p`Most of the day was about how you work together with agents. What an agent needs
      every time goes in the repository, not in your prompt. **A correction you type for the
      third time belongs in a file.**`,
    p`An agent writes code faster than you can read it, so reading every line yourself
      doesn't last. You give it checks it can run itself after every step, and you make
      the decisions.`,
    quote`Let a machine check what a machine can check.`,
    p`When the agent heads the wrong way, you rewind to the message where it went wrong.
      A correction added on top stays in the context and goes along on every turn.`,
    p`The way of working depends on the code too. For a prototype you will throw away, a
      short request is enough. Code that stays gets a spec in the repository first.`,
    p`We also looked at several agents at once, each in its own worktree, and at a
      builder and a critic that check each other's work. More agents give more output,
      but your attention stays the same. So only split work where each piece has its own
      check.`,
    h2`What this does to our work`,
    p`We closed the day with an open conversation about how our work is changing and how
      we deal with it.`,
    p`We put a few statements on the table. If you write less yourself, you read and test
      more, and you move towards analyst and test engineer. Management sometimes counts
      on ten times the output, while typing was never what a project was waiting on. And
      the subscription you take out, your competitor takes out too.`,
    p`If you doubt whether you are good enough at this yet, you are not alone: nobody has
      been doing it for long. You don't need to understand every line, but you do need to
      understand the system. **You are still the engineer.**`,
    h2`After the day`,
    p`The participants keep the repository and the slides, in Dutch and English, so they
      can go back over everything later. Thanks to Ravago for having us, and to everyone
      who sat at the table.`,
    p`Want a day like this for your developers? [Take a look at the kata](${KATA.en}) or
      [get in touch](#contact).`
  ],

  fr: [
    p`Le 23 octobre, nous avons passé une journée entière autour de la table avec un groupe de
      développeurs de **Ravago** pour le kata d'agentic engineering. Chacun travaillait
      sur son propre ordinateur portable, avec son propre assistant IA et le projet
      d'exercice du kata.`,
    p`Les explications ont alterné toute la journée avec des exercices et des démos. Dans
      les exercices, vous cherchez des flags cachés, et vous ne les trouvez que lorsque
      votre solution tourne vraiment. Vous voyez donc tout de suite si votre agent a fait
      son travail.`,
    h2`Ce que contient une seule question`,
    p`Nous avons commencé par ce qui se passe quand vous posez une question à un agent.
      Nous avons regardé les tokens, tout ce qui atterrit dans la fenêtre de contexte, et
      pourquoi la session détermine votre facture. **Ce qui se trouve dans le contexte
      détermine la réponse**, et tout cela repart à chaque tour.`,
    p`Une réponse paraît tout aussi sûre, que l'agent ait lu votre fichier ou qu'il ait
      complété lui-même ce qu'il ne savait pas. En cas de doute, demandez-lui donc où il
      l'a vu, ou un test qui échoue.`,
    h2`Travailler avec des agents`,
    p`L'essentiel de la journée portait sur la manière de collaborer avec des agents.
      Ce dont un agent a besoin à chaque fois a sa place dans le dépôt, pas dans votre prompt.
      **Une correction que vous tapez pour la troisième fois doit aller dans un
      fichier.**`,
    p`Un agent écrit du code plus vite que vous ne pouvez le lire, et relire chaque ligne
      vous-même ne tient pas sur la durée. Vous lui donnez des contrôles qu'il peut lancer
      lui-même après chaque étape, et c'est vous qui prenez les décisions.`,
    quote`Laissez une machine contrôler ce qu'une machine peut contrôler.`,
    p`Quand l'agent part dans la mauvaise direction, vous revenez au message où les choses
      ont dérapé. Une correction ajoutée par-dessus reste dans le contexte et repart à
      chaque tour.`,
    p`La façon de travailler dépend aussi du code. Pour un prototype que vous jetterez,
      une courte demande suffit. Le code qui reste reçoit d'abord une spec dans le dépôt.`,
    p`Nous avons aussi regardé plusieurs agents en parallèle, chacun dans son propre
      worktree, et un constructeur et un critique qui vérifient le travail l'un de
      l'autre. Plus d'agents donnent plus de résultats, mais votre attention reste la
      même. Ne découpez donc que le travail dont chaque morceau a son propre contrôle.`,
    h2`Ce que cela change à notre travail`,
    p`Nous avons terminé la journée par une discussion ouverte sur la façon dont notre
      travail évolue et sur la manière d'y faire face.`,
    p`Nous avons mis quelques affirmations sur la table. Qui écrit moins lui-même lit et
      teste davantage, et évolue vers un rôle d'analyste et de test engineer. Le
      management compte parfois sur un rendement dix fois plus élevé, alors que ce n'est
      jamais la frappe qui a fait attendre un projet. Et l'abonnement que vous prenez,
      votre concurrent le prend aussi.`,
    p`Si vous doutez d'être déjà assez à l'aise avec tout cela, vous n'êtes pas seul:
      personne ne le fait depuis longtemps. Vous n'avez pas besoin de comprendre chaque
      ligne, mais bien le système. **Vous restez l'ingénieur.**`,
    h2`Après la journée`,
    p`Les participants gardent le dépôt et les slides, en néerlandais et en anglais, pour
      pouvoir tout relire plus tard. Merci à Ravago pour son accueil, et à tous ceux qui
      étaient autour de la table.`,
    p`Vous souhaitez une journée comme celle-ci pour vos développeurs?
      [Découvrez le kata](${KATA.fr}) ou [contactez-nous](#contact).`
  ]
};
