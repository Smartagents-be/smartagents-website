// "Hello world, hello AI era" — 21 April 2026, the first post. Ported from the
// Eleventy blog on `main` (blog/posts/2026-04-21-smartagents-lancering.md and
// its en/ and fr/ translations), unchanged.
import { p, quote, list } from './prose.mjs';

export const body = {
  nl: [
    p`Elk gesprek met een ondernemer of manager begint op hetzelfde punt. Ze zien AI
      aankomen. Ze weten dat het relevant is. Maar de eerste stap, concreet, in hun
      eigen context, ontbreekt.`,
    p`Wij kennen dat patroon na twintig jaar technologiebedrijven bouwen in België.
      Van JArchitects tot We+, telkens opnieuw dezelfde kloof tussen wat technologie
      kan en wat bedrijven er in de praktijk mee doen.`,
    quote`Bedrijven weten dat AI iets voor hen kan betekenen, maar ze weten niet waar
      te beginnen. Wij overbruggen die kloof, van strategie tot concrete
      implementatie.`,
    p`Zo is SmartAgents ontstaan. We werken op drie niveaus:`,
    list([
      `we brengen processen in kaart en elimineren manueel werk`,
      `we trainen teams zodat ze AI zelf leren hanteren`,
      `we bouwen ai agents, software die taken volledig zelfstandig uitvoert.`
    ]),
    p`Het eerste wat we aanbieden is de **SmartScan**: een korte doorlichting die in
      kaart brengt waar AI bij jou het meeste verschil maakt. Daarmee pakken we ook
      direct de eerste van onze diensten aan.`
  ],

  en: [
    p`Every conversation with a business owner or manager starts at the same place.
      They see AI coming. They know it matters. But the first concrete step, in their
      own context, with their own processes, is missing.`,
    p`We have seen that pattern for over twenty years of building technology companies
      in Belgium. From JArchitects to We+, again and again, the same gap between what
      technology can do and what businesses actually manage to do with it.`,
    quote`Companies know that AI can do something for them, but they don't know where
      to start. We bridge that gap, from strategy to concrete implementation.`,
    p`That's why SmartAgents exists. We work on three levels:`,
    list([
      `mapping processes and cutting out manual work`,
      `training teams so they can use AI themselves`,
      `and building ai agents, software that carries out tasks fully autonomously.`
    ]),
    p`The first thing we offer is the **SmartScan**: a short assessment that maps out
      where AI will make the biggest difference for you and your team. This directly
      tackles the first of our services.`
  ],

  fr: [
    p`Chaque conversation avec un dirigeant ou un manager commence au même endroit.
      Ils voient l'IA arriver. Ils savent qu'elle est pertinente. Mais la première
      étape concrète, dans leur propre contexte, avec leurs propres processus, fait
      défaut.`,
    p`Nous connaissons ce schéma après vingt ans passés à bâtir des entreprises
      technologiques en Belgique. De JArchitects à We+, encore et toujours le même
      fossé entre ce que la technologie permet et ce que les entreprises en font
      réellement dans la pratique.`,
    quote`Les entreprises savent que l'IA peut leur apporter quelque chose, mais elles
      ne savent pas par où commencer. Nous comblons ce fossé, de la stratégie à
      l'implémentation concrète.`,
    p`C'est ainsi qu'est née SmartAgents. Nous travaillons sur trois niveaux :`,
    list([
      `nous cartographions les processus et éliminons le travail manuel`,
      `nous formons les équipes pour qu'elles apprennent à utiliser l'IA elles-mêmes`,
      `nous construisons des agents IA, des logiciels qui exécutent des tâches de
       façon entièrement autonome.`
    ]),
    p`La première chose que nous proposons est le **SmartScan**: une analyse rapide
      qui identifie là où l'IA fait la plus grande différence chez vous. Cela
      s'attaque ainsi directement au premier de nos services.`
  ]
};
