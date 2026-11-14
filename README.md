# Orchestration Locale — Claude Code

Orchestration native Claude Code : **Chef d'orchestre** (Opus) décompose une
demande, route chaque sous-tâche vers le sous-agent au modèle adapté, puis
synthétise. Optimisé pour le rendement qualité/token.

## Sous-agents

| Sous-agent          | Modèle | Rôle                                              |
|---------------------|--------|---------------------------------------------------|
| `chef-orchestre`    | Opus   | Décompose, analyse, route, synthétise             |
| `chercheur`         | Haiku  | Collecte / lecture volumineuse (amont)            |
| `juriste`           | Opus   | Droit français (skill `recherche-juridique`)      |
| `redacteur`         | Sonnet | Rédaction + accessibilité TDAH                    |
| `trieur`            | Haiku  | Extraction / classement                           |
| `verificateur`      | Sonnet | Contrôle qualité du livrable (aval)               |
| `archiviste`        | Haiku  | Capte les leçons en mémoire (apprentissage)       |

## Pipeline type

`collecte (chercheur)` → `production (juriste / redacteur)`
→ `contrôle (verificateur)` → `synthèse (chef-orchestre)`
→ `apprentissage (archiviste)`.

## Mémoire d'expérience

Le dossier `memoire/` est relu à chaque run (index d'abord, Grep ciblé ensuite)
et enrichi en fin de run par l'`archiviste`. C'est ce qui fait progresser
l'orchestration au lieu de plafonner.

```
memoire/
├── index.md             # carte des leçons — lue en premier
├── lecons.md            # leçons transverses
├── lecons-juridique.md  # leçons domaine droit
└── journal.md           # historique des runs (tâches longues)
```

## Prérequis

- [Claude Code](https://code.claude.com/docs) ; aucun autre outil (Node.js 20 seulement pour la validation).
- Deux skills, chargés automatiquement par les agents qui en dépendent (champ `skills:`) :
  - `recherche-juridique` pour `juriste` : dépôt [droit-francais-skill](https://github.com/brissonjo-sudo/droit-francais-skill) ;
  - `accessibilite-tdah` pour `redacteur` : dépôt [Skills-accessibilite](https://github.com/brissonjo-sudo/Skills-accessibilite).

  Sans eux, ces deux agents ne peuvent pas appliquer leur méthode.

## Installation

1. **Dans ce projet** : cloner le dépôt et lancer `claude` à sa racine. Les agents de
   `.claude/agents/` sont détectés automatiquement.
2. **Dans tous vos projets** : copier les fichiers de `.claude/agents/` dans
   `~/.claude/agents/`. La mémoire `memoire/` reste propre à chaque projet : copier aussi
   ce dossier à la racine du projet où l'orchestration doit apprendre.
3. **Vérifier** : la commande `/agents` de Claude Code liste les 7 agents ; à la racine du
   dépôt, `node scripts/validate-agents.mjs` affiche « Tous les agents sont valides ».
4. **Mettre à jour** : `git pull`, puis recopier les fichiers si vous avez choisi l'étape 2.
5. **Désinstaller** : supprimer les fichiers copiés de `~/.claude/agents/` (ou le dépôt).
## Utilisation

```
claude
> Utilise le Chef d'orchestre pour [tâche complexe]
```

Claude Code détecte automatiquement les agents dans `.claude/agents/`.
Voir `CLAUDE.md` pour le routage, l'accessibilité, la directive verbatim,
la mémoire et les règles de sécurité.

## CI

`scripts/validate-agents.mjs` valide à chaque push : frontmatter, modèle,
unicité, présence d'outils, et **cohérence de routage dans les deux sens**
(agent cité inexistant **ou** agent orphelin jamais routé → échec CI).
Workflow dans `.github/workflows/`.
## Retours

Ouvrir une *issue* : agent mal routé, skill non chargé, leçon de mémoire inutile.
Signaux suivis : à J+7, une installation essayée et son résultat ; à J+30, une
orchestration réelle rapportée (tâche, agents appelés, livrable utile ou non).

## Licence

MIT, voir [LICENSE](LICENSE).
