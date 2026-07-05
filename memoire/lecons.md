# Leçons transverses

> Patterns, pièges et règles apprises, valables tous domaines.
> Une leçon = un bloc atomique court. Pas de redite.

<!-- Gabarit d'une leçon :
### titre-court-en-ancre
- **Déclencheur** : quand cette leçon s'applique
- **Leçon** : la règle à appliquer
- **Coût évité** : ce que ça aurait raté/coûté
- **Source** : run du AAAA-MM-JJ
-->

### markdown-blocs-code-barriers

- **Déclencheur** : vérification d'intégrité de fichiers Markdown comportant plusieurs blocs de code
- **Leçon** : compter les barrières ``` (doivent être en nombre PAIR). Un nombre impair laisse le fichier ouvert et transforme tout le contenu en bloc de code, masquant les erreurs jusqu'au rendu.
- **Coût évité** : corruption silencieuse du rendu, faux négatifs en validation statique
- **Source** : 2026-06-18

### validateur-yaml-robuste

- **Déclencheur** : implémentation d'un parseur de frontmatter YAML sans vérification stricte
- **Leçon** : ne pas chercher un champ par regex simple sur tout le contenu. Parser strictement : borner au frontmatter (---…---), ignorer les continuations indentées de scalaires repliés (`description: >`), valider la structure avant de décréter une absence ou une présence.
- **Coût évité** : faux positifs/négatifs masquant vraies incohérences ; validation contaminée par le contenu du document
- **Source** : 2026-06-18

### verification-doit-bloquer

- **Déclencheur** : ajout d'une vérification de cohérence (ex : routage vers agents) dans une pipeline d'intégration continue
- **Leçon** : si une vérification détecte une incohérence CRITIQUE (défaut qui change le comportement), elle DOIT faire échouer (exit ≠ 0). Un avertissement non bloquant laisse passer le code défectueux au vert. Avertissement = info utile mais non critique ; incohérence = doit bloquer.
- **Coût évité** : défauts silencieux en production, faux sentiment de sécurité
- **Source** : 2026-06-18

### regles-securite-vs-config

- **Déclencheur** : documenter une règle de sécurité ou de privilèges (ex : « seul l'agent X peut écrire »)
- **Leçon** : la règle en prose doit être VÉRIFIÉE contre la configuration réelle (frontmatter, manifest, outils attribués). Une règle qui n'existe que dans la documentation est pire qu'absente : elle crée une fausse confiance. Chaque affirmation de sécurité doit être soit automatisée (vérification), soit validée à la main à chaque run.
- **Coût évité** : faux sentiment de sécurité, violation silencieuse de règles de privilèges, audit crédule
- **Source** : 2026-07-05

### dependance-dure-et-abstention

- **Déclencheur** : un agent dépend d'une ressource externe (skill méthodologique, API, fichier, etc.) dès sa mission nominale
- **Leçon** : si la dépendance est DURE (absente = mission impossible) ET l'ENJEU EST FORT (production d'actes, décisions critiques), il faut une clause d'abstention EXPLICITE en cas d'absence, ET un fallback proportionnel au risque. Un faible enjeu peut avoir « essayer, continuer quand même » ; un fort enjeu doit avoir « abstention + signalement » (fail-safe).
- **Coût évité** : cascade de défaillance, comportement dégradé sans avertissement, production invalide due à ressources manquantes
- **Source** : 2026-07-05

### mission-agent-vs-outils

- **Déclencheur** : définir la mission d'un agent, surtout s'il doit VÉRIFIER ou GARANTIR quelque chose
- **Leçon** : la mission ne doit pas dépasser ce que ses OUTILS permettent réellement de garantir. Si l'agent doit vérifier l'accès à un site web mais n'a pas d'outils web, le filet est illusoire. Mieux : soit lui donner les outils (upgrade), soit réduire la mission (vérifier syntaxe au lieu de validité externe), soit accepter la limite et la documenter (⚠ vérification incomplète).
- **Coût évité** : faux sentiment de sécurité, filet de contrôle perforé, risque élevé non couvert
- **Source** : 2026-07-05
