# Orchestration Locale — Claude Code

Orchestration **native** Claude Code : Capitaine America (Opus)
décompose une demande, route chaque sous-tâche vers le sous-agent au modèle
adapté, puis synthétise. Optimisé pour le rendement qualité/token.

## Sous-agents

| Sous-agent     | Modèle | Rôle                                       |
|----------------|--------|--------------------------------------------|
| `capitaine-america`| Opus   | Décompose, analyse, route, synthétise      |
| `chercheur`    | Haiku  | Collecte / lecture volumineuse (amont)     |
| `juriste`      | Opus   | Droit français (skill recherche-juridique) |
| `redacteur`    | Sonnet | Rédaction + accessibilité TDAH             |
| `trieur`       | Haiku  | Extraction / classement                    |
| `verificateur` | Sonnet | Contrôle qualité du livrable (aval)        |
| `archiviste`   | Haiku  | Capte les leçons en mémoire (apprentissage)|

## Pipeline type

collecte (`chercheur`) → production (`juriste` / `redacteur`)
→ contrôle (`verificateur`) → synthèse.

## Utilisation

```bash
claude
> Utilise Capitaine America pour [tâche complexe]
```

Claude Code détecte automatiquement les agents dans `.claude/agents/`.

Voir `CLAUDE.md` pour le routage, l'accessibilité, la directive verbatim
et les règles de sécurité.

## CI

`scripts/validate-agents.mjs` valide à chaque push (workflow
`.github/workflows/`) le frontmatter, le modèle et la cohérence du routage
déclaré dans `capitaine-america.md`. Toute anomalie détectée fait échouer la
CI. (La cohérence avec les tables de `CLAUDE.md`/`README.md` n'est pas
contrôlée automatiquement.)

`scripts/run-evals.mjs --check` valide en plus, à chaque push, le schéma des
scénarios-témoins d'`evals/cases/` et la couverture des agents routables —
c'est le complément qui juge la *sortie* du pipeline, pas seulement sa
structure. Mode `--run` (hors CI, opt-in) : exécute réellement chaque
scénario via le CLI `claude` et vérifie les propriétés attendues. Voir
`evals/cases/*.json` pour le format d'un cas.
