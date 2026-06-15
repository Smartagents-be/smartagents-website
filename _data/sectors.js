// Sector showcase for the homepage: per sector the top 10 AI solutions we offer.
// Rendered as tabs in home/page.njk. Titles and descriptions are kept as
// separate fields so no em-dash separator ends up in the copy.

module.exports = {
  nl: [
    {
      id: 'bouw',
      name: 'Bouw',
      solutions: [
        { title: 'Offerteopmaak', desc: 'Bestekken en offertes opgesteld uit uw eigen prijsdatabank.' },
        { title: 'Werfplanning', desc: 'Planning en capaciteit afgestemd op weer, levering en bezetting.' },
        { title: 'Plananalyse', desc: 'Bouwplannen en lastenboeken doorzocht op risico\'s en hoeveelheden.' },
        { title: 'Hoeveelhedenstaat', desc: 'Automatische opmeting van hoeveelheden uit plannen en modellen.' },
        { title: 'Onderaannemers opvolgen', desc: 'Documenten, attesten en vervaldata centraal bewaakt.' },
        { title: 'Veiligheidsrapportage', desc: 'Werfverslagen en veiligheidsdocumenten sneller opgesteld.' },
        { title: 'Factuurcontrole', desc: 'Inkomende facturen gematcht aan bestelbon en levering.' },
        { title: 'Werfopvolging met beeld', desc: 'Werffoto\'s automatisch gelabeld en gekoppeld aan de juiste fase.' },
        { title: 'Aanbestedingen volgen', desc: 'Relevante openbare aanbestedingen gefilterd en samengevat.' },
        { title: 'Nacalculatie', desc: 'Werkelijke kosten vergeleken met de raming voor scherpere offertes.' }
      ]
    },
    {
      id: 'distributie',
      name: 'Distributie',
      solutions: [
        { title: 'Vraagvoorspelling', desc: 'Verkoop voorspeld per artikel om uw voorraad scherp te zetten.' },
        { title: 'Voorraadoptimalisatie', desc: 'Bestelpunten en veiligheidsvoorraad automatisch berekend.' },
        { title: 'Orderverwerking', desc: 'Inkomende orders uit mail en PDF automatisch ingelezen.' },
        { title: 'Productdata verrijken', desc: 'Productbeschrijvingen en categorieën automatisch aangevuld.' },
        { title: 'Prijsbeheer', desc: 'Marges en concurrentieprijzen bewaakt en bijgestuurd.' },
        { title: 'Klantenservice-assistent', desc: 'Vragen over levering en voorraad meteen beantwoord.' },
        { title: 'Leveranciersopvolging', desc: 'Levertijden en betrouwbaarheid per leverancier gemeten.' },
        { title: 'Retourafhandeling', desc: 'Retours geclassificeerd en sneller verwerkt.' },
        { title: 'Offertes en bestellingen', desc: 'Offertes opgesteld uit uw catalogus en prijsafspraken.' },
        { title: 'Foutdetectie', desc: 'Afwijkende bestellingen en facturen automatisch gemarkeerd.' }
      ]
    },
    {
      id: 'transport',
      name: 'Transport',
      solutions: [
        { title: 'Ritplanning', desc: 'Routes en ladingen geoptimaliseerd op tijd, kost en uitstoot.' },
        { title: 'Documentverwerking', desc: 'CMR, vrachtbrieven en douanestukken automatisch gelezen.' },
        { title: 'Zendingen opvolgen', desc: 'Status en vertragingen proactief gesignaleerd.' },
        { title: 'Capaciteitsplanning', desc: 'Chauffeurs en voertuigen afgestemd op de vraag.' },
        { title: 'Tariefberekening', desc: 'Offertes en tarieven berekend per traject en lading.' },
        { title: 'Predictief onderhoud', desc: 'Voertuigonderhoud gepland voor er stilstand optreedt.' },
        { title: 'Klachtafhandeling', desc: 'Schade- en klachtdossiers samengevat en sneller afgehandeld.' },
        { title: 'Facturatiecontrole', desc: 'Ritten gematcht aan facturen en contractprijzen.' },
        { title: 'Douane en compliance', desc: 'Stukken gecontroleerd op volledigheid en regelgeving.' },
        { title: 'Klantcommunicatie', desc: 'Leverbevestigingen en aankomsttijden automatisch verstuurd.' }
      ]
    },
    {
      id: 'maakindustrie',
      name: 'Maakindustrie',
      solutions: [
        { title: 'Productieplanning', desc: 'Planning afgestemd op orders, voorraad en capaciteit.' },
        { title: 'Kwaliteitscontrole', desc: 'Visuele inspectie van producten met beeldherkenning.' },
        { title: 'Predictief onderhoud', desc: 'Storingen voorspeld uit machinedata.' },
        { title: 'Calculatie en offerte', desc: 'Maakofferte berekend uit tekeningen en stuklijsten.' },
        { title: 'Werkinstructies', desc: 'Instructies en documentatie automatisch gegenereerd.' },
        { title: 'Voorraad en inkoop', desc: 'Grondstoffen tijdig besteld op basis van verbruik.' },
        { title: 'Storingsanalyse', desc: 'Oorzaken van uitval sneller opgespoord.' },
        { title: 'Documentbeheer', desc: 'Normen, certificaten en revisies centraal beheerd.' },
        { title: 'Energieverbruik', desc: 'Verbruik per lijn gemeten en geoptimaliseerd.' },
        { title: 'Orderopvolging', desc: 'Status per order zichtbaar van bestelling tot levering.' }
      ]
    },
    {
      id: 'renewable',
      name: 'Renewable',
      solutions: [
        { title: 'Opbrengstvoorspelling', desc: 'Productie van zon en wind voorspeld per installatie.' },
        { title: 'Onderhoudsplanning', desc: 'Inspecties en onderhoud gepland op basis van prestatie.' },
        { title: 'Storingsdetectie', desc: 'Afwijkende prestatie van panelen of turbines gemarkeerd.' },
        { title: 'Energiehandel', desc: 'Verbruik en teruglevering afgestemd op marktprijzen.' },
        { title: 'Dimensionering en offerte', desc: 'Installaties berekend uit verbruik en dak- of terreindata.' },
        { title: 'Subsidies en regelgeving', desc: 'Relevante steun en verplichtingen opgevolgd.' },
        { title: 'Dossierbeheer', desc: 'Aanvragen en keuringen automatisch opgevolgd.' },
        { title: 'Inspectie met beeld', desc: 'Drone- en thermische beelden automatisch beoordeeld.' },
        { title: 'Verbruiksinzicht', desc: 'Klanten inzicht gegeven in verbruik en besparing.' },
        { title: 'Rapportage', desc: 'Prestatie- en duurzaamheidsrapporten automatisch opgesteld.' }
      ]
    },
    {
      id: 'diensten',
      name: 'Dienstensector',
      solutions: [
        { title: 'Documentopstelling', desc: 'Voorstellen, contracten en rapporten sneller opgesteld.' },
        { title: 'Kennisassistent', desc: 'Eigen documenten en knowhow doorzoekbaar via één vraag.' },
        { title: 'E-mailtriage', desc: 'Inkomende mail geclassificeerd en eerste antwoorden voorbereid.' },
        { title: 'Offertes en voorstellen', desc: 'Offertes opgesteld op maat van de aanvraag.' },
        { title: 'Facturatie en opvolging', desc: 'Facturen opgesteld en openstaande posten bewaakt.' },
        { title: 'Planning en boekingen', desc: 'Afspraken en capaciteit automatisch afgestemd.' },
        { title: 'Klantenservice-assistent', desc: 'Veelgestelde vragen meteen en correct beantwoord.' },
        { title: 'Rapportage en analyse', desc: 'Data uit uw systemen samengevat tot heldere rapporten.' },
        { title: 'Onboarding', desc: 'Nieuwe klanten en medewerkers vlotter ingewerkt.' },
        { title: 'Dossiersamenvatting', desc: 'Lange dossiers en verslagen samengevat in seconden.' }
      ]
    }
  ],

  en: [
    {
      id: 'bouw',
      name: 'Construction',
      solutions: [
        { title: 'Quotation drafting', desc: 'Tenders and quotes generated from your own pricing database.' },
        { title: 'Site planning', desc: 'Scheduling and capacity aligned with weather, delivery and crew.' },
        { title: 'Plan analysis', desc: 'Drawings and specifications scanned for risks and quantities.' },
        { title: 'Quantity take-off', desc: 'Automatic measurement of quantities from plans and models.' },
        { title: 'Subcontractor tracking', desc: 'Documents, certificates and deadlines monitored centrally.' },
        { title: 'Safety reporting', desc: 'Site reports and safety documents drafted faster.' },
        { title: 'Invoice control', desc: 'Incoming invoices matched to purchase orders and deliveries.' },
        { title: 'Visual progress tracking', desc: 'Site photos auto-tagged and linked to the right project phase.' },
        { title: 'Tender monitoring', desc: 'Relevant public tenders filtered and summarised.' },
        { title: 'Cost review', desc: 'Actual costs compared to the estimate for sharper quotes.' }
      ]
    },
    {
      id: 'distributie',
      name: 'Distribution',
      solutions: [
        { title: 'Demand forecasting', desc: 'Sales forecast per item to keep your stock tight.' },
        { title: 'Inventory optimisation', desc: 'Reorder points and safety stock calculated automatically.' },
        { title: 'Order processing', desc: 'Incoming orders read from email and PDF automatically.' },
        { title: 'Product data enrichment', desc: 'Product descriptions and categories completed automatically.' },
        { title: 'Price management', desc: 'Margins and competitor prices monitored and adjusted.' },
        { title: 'Customer service assistant', desc: 'Delivery and stock questions answered instantly.' },
        { title: 'Supplier tracking', desc: 'Lead times and reliability measured per supplier.' },
        { title: 'Returns handling', desc: 'Returns classified and processed faster.' },
        { title: 'Quotes and orders', desc: 'Quotes built from your catalogue and price agreements.' },
        { title: 'Error detection', desc: 'Unusual orders and invoices flagged automatically.' }
      ]
    },
    {
      id: 'transport',
      name: 'Transport',
      solutions: [
        { title: 'Route planning', desc: 'Routes and loads optimised for time, cost and emissions.' },
        { title: 'Document processing', desc: 'CMRs, waybills and customs papers read automatically.' },
        { title: 'Shipment tracking', desc: 'Status and delays flagged proactively.' },
        { title: 'Capacity planning', desc: 'Drivers and vehicles matched to demand.' },
        { title: 'Rate calculation', desc: 'Quotes and rates calculated per route and load.' },
        { title: 'Predictive maintenance', desc: 'Vehicle maintenance planned before breakdowns occur.' },
        { title: 'Claims handling', desc: 'Damage and complaint cases summarised and resolved faster.' },
        { title: 'Billing control', desc: 'Trips matched to invoices and contract prices.' },
        { title: 'Customs and compliance', desc: 'Documents checked for completeness and regulation.' },
        { title: 'Customer communication', desc: 'Delivery confirmations and arrival times sent automatically.' }
      ]
    },
    {
      id: 'maakindustrie',
      name: 'Manufacturing',
      solutions: [
        { title: 'Production planning', desc: 'Scheduling aligned with orders, stock and capacity.' },
        { title: 'Quality control', desc: 'Visual inspection of products with image recognition.' },
        { title: 'Predictive maintenance', desc: 'Failures predicted from machine data.' },
        { title: 'Costing and quoting', desc: 'Make quotes calculated from drawings and bills of materials.' },
        { title: 'Work instructions', desc: 'Instructions and documentation generated automatically.' },
        { title: 'Inventory and purchasing', desc: 'Raw materials ordered on time based on usage.' },
        { title: 'Downtime analysis', desc: 'Causes of failure traced faster.' },
        { title: 'Document management', desc: 'Standards, certificates and revisions managed centrally.' },
        { title: 'Energy use', desc: 'Consumption per line measured and optimised.' },
        { title: 'Order tracking', desc: 'Status per order visible from order to delivery.' }
      ]
    },
    {
      id: 'renewable',
      name: 'Renewable',
      solutions: [
        { title: 'Yield forecasting', desc: 'Solar and wind output forecast per installation.' },
        { title: 'Maintenance planning', desc: 'Inspections and maintenance planned on performance.' },
        { title: 'Fault detection', desc: 'Underperforming panels or turbines flagged.' },
        { title: 'Energy trading', desc: 'Use and feed-in aligned with market prices.' },
        { title: 'Sizing and quoting', desc: 'Installations sized from usage and roof or site data.' },
        { title: 'Subsidies and regulation', desc: 'Relevant support and obligations tracked.' },
        { title: 'Case management', desc: 'Applications and inspections followed up automatically.' },
        { title: 'Image-based inspection', desc: 'Drone and thermal imagery assessed automatically.' },
        { title: 'Consumption insight', desc: 'Customers given insight into use and savings.' },
        { title: 'Reporting', desc: 'Performance and sustainability reports generated automatically.' }
      ]
    },
    {
      id: 'diensten',
      name: 'Services',
      solutions: [
        { title: 'Document drafting', desc: 'Proposals, contracts and reports drafted faster.' },
        { title: 'Knowledge assistant', desc: 'Your own documents and know-how searchable with one question.' },
        { title: 'Email triage', desc: 'Incoming mail classified and first replies prepared.' },
        { title: 'Quotes and proposals', desc: 'Quotes built to fit the request.' },
        { title: 'Invoicing and follow-up', desc: 'Invoices drafted and outstanding items monitored.' },
        { title: 'Scheduling and bookings', desc: 'Appointments and capacity aligned automatically.' },
        { title: 'Customer service assistant', desc: 'Frequent questions answered instantly and correctly.' },
        { title: 'Reporting and analysis', desc: 'Data from your systems summarised into clear reports.' },
        { title: 'Onboarding', desc: 'New clients and staff brought up to speed faster.' },
        { title: 'Case summarisation', desc: 'Long files and reports summarised in seconds.' }
      ]
    }
  ],

  fr: [
    {
      id: 'bouw',
      name: 'Construction',
      solutions: [
        { title: "Rédaction de devis", desc: "Métrés et devis générés à partir de votre propre base de prix." },
        { title: "Planning de chantier", desc: "Planning et capacité adaptés à la météo, aux livraisons et à l'occupation." },
        { title: "Analyse de plans", desc: "Plans et cahiers des charges analysés pour en extraire risques et quantités." },
        { title: "Métré des quantités", desc: "Mesure automatique des quantités à partir des plans et des modèles." },
        { title: "Suivi des sous-traitants", desc: "Documents, attestations et échéances suivis de façon centralisée." },
        { title: "Rapports de sécurité", desc: "Rapports de chantier et documents de sécurité rédigés plus vite." },
        { title: "Contrôle des factures", desc: "Factures entrantes rapprochées du bon de commande et de la livraison." },
        { title: "Suivi de chantier par l'image", desc: "Photos de chantier étiquetées automatiquement et liées à la bonne phase." },
        { title: "Veille des appels d'offres", desc: "Appels d'offres publics pertinents filtrés et résumés." },
        { title: "Calcul a posteriori", desc: "Coûts réels comparés à l'estimation pour des devis plus précis." }
      ]
    },
    {
      id: 'distributie',
      name: 'Distribution',
      solutions: [
        { title: "Prévision de la demande", desc: "Ventes prévues par article pour ajuster vos stocks." },
        { title: "Optimisation des stocks", desc: "Points de commande et stock de sécurité calculés automatiquement." },
        { title: "Traitement des commandes", desc: "Commandes entrantes lues automatiquement depuis les e-mails et PDF." },
        { title: "Enrichissement des données produit", desc: "Descriptions et catégories de produits complétées automatiquement." },
        { title: "Gestion des prix", desc: "Marges et prix concurrents surveillés et ajustés." },
        { title: "Assistant service client", desc: "Questions sur la livraison et le stock répondues immédiatement." },
        { title: "Suivi des fournisseurs", desc: "Délais et fiabilité mesurés par fournisseur." },
        { title: "Gestion des retours", desc: "Retours classés et traités plus rapidement." },
        { title: "Devis et commandes", desc: "Devis générés à partir de votre catalogue et de vos accords de prix." },
        { title: "Détection des erreurs", desc: "Commandes et factures anormales signalées automatiquement." }
      ]
    },
    {
      id: 'transport',
      name: 'Transport',
      solutions: [
        { title: "Planification des tournées", desc: "Itinéraires et chargements optimisés sur le temps, le coût et les émissions." },
        { title: "Traitement des documents", desc: "CMR, lettres de voiture et documents douaniers lus automatiquement." },
        { title: "Suivi des expéditions", desc: "Statut et retards signalés de façon proactive." },
        { title: "Planification des capacités", desc: "Chauffeurs et véhicules adaptés à la demande." },
        { title: "Calcul des tarifs", desc: "Devis et tarifs calculés par trajet et par chargement." },
        { title: "Maintenance prédictive", desc: "Entretien des véhicules planifié avant toute immobilisation." },
        { title: "Gestion des réclamations", desc: "Dossiers de dommages et réclamations résumés et traités plus vite." },
        { title: "Contrôle de la facturation", desc: "Tournées rapprochées des factures et des prix contractuels." },
        { title: "Douane et conformité", desc: "Documents vérifiés quant à leur exhaustivité et à la réglementation." },
        { title: "Communication client", desc: "Confirmations de livraison et heures d'arrivée envoyées automatiquement." }
      ]
    },
    {
      id: 'maakindustrie',
      name: 'Industrie manufacturière',
      solutions: [
        { title: "Planification de la production", desc: "Planning adapté aux commandes, au stock et à la capacité." },
        { title: "Contrôle qualité", desc: "Inspection visuelle des produits par reconnaissance d'image." },
        { title: "Maintenance prédictive", desc: "Pannes anticipées à partir des données machines." },
        { title: "Calcul et devis", desc: "Devis de fabrication calculé à partir des plans et des nomenclatures." },
        { title: "Instructions de travail", desc: "Instructions et documentation générées automatiquement." },
        { title: "Stock et achats", desc: "Matières premières commandées à temps selon la consommation." },
        { title: "Analyse des pannes", desc: "Causes des arrêts identifiées plus rapidement." },
        { title: "Gestion documentaire", desc: "Normes, certificats et révisions gérés de façon centralisée." },
        { title: "Consommation d'énergie", desc: "Consommation mesurée et optimisée par ligne." },
        { title: "Suivi des commandes", desc: "Statut par commande visible de la commande à la livraison." }
      ]
    },
    {
      id: 'renewable',
      name: 'Énergies renouvelables',
      solutions: [
        { title: "Prévision de production", desc: "Production solaire et éolienne prévue par installation." },
        { title: "Planification de l'entretien", desc: "Inspections et entretien planifiés selon les performances." },
        { title: "Détection des défaillances", desc: "Performances anormales des panneaux ou éoliennes signalées." },
        { title: "Négoce d'énergie", desc: "Consommation et réinjection alignées sur les prix du marché." },
        { title: "Dimensionnement et devis", desc: "Installations calculées à partir de la consommation et des données de toiture ou de terrain." },
        { title: "Primes et réglementation", desc: "Aides et obligations pertinentes suivies." },
        { title: "Gestion des dossiers", desc: "Demandes et contrôles suivis automatiquement." },
        { title: "Inspection par l'image", desc: "Images de drone et images thermiques évaluées automatiquement." },
        { title: "Vision de la consommation", desc: "Clients informés de leur consommation et de leurs économies." },
        { title: "Rapports", desc: "Rapports de performance et de durabilité générés automatiquement." }
      ]
    },
    {
      id: 'diensten',
      name: 'Secteur des services',
      solutions: [
        { title: "Rédaction de documents", desc: "Propositions, contrats et rapports rédigés plus vite." },
        { title: "Assistant de connaissances", desc: "Vos documents et votre savoir-faire interrogeables en une seule question." },
        { title: "Tri des e-mails", desc: "Courriers entrants classés et premières réponses préparées." },
        { title: "Devis et propositions", desc: "Devis rédigés sur mesure selon la demande." },
        { title: "Facturation et suivi", desc: "Factures établies et postes ouverts surveillés." },
        { title: "Planning et réservations", desc: "Rendez-vous et capacité ajustés automatiquement." },
        { title: "Assistant service client", desc: "Questions fréquentes répondues immédiatement et correctement." },
        { title: "Rapports et analyses", desc: "Données de vos systèmes résumées en rapports clairs." },
        { title: "Onboarding", desc: "Nouveaux clients et collaborateurs intégrés plus rapidement." },
        { title: "Synthèse de dossiers", desc: "Longs dossiers et comptes rendus résumés en quelques secondes." }
      ]
    }
  ]
};
