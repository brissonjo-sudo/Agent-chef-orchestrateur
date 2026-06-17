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
