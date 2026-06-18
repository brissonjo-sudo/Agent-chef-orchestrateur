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
