# Orchestration Locale — Claude Code

Projet d'orchestration **native** : le Chef d'orchestre décompose, route vers
des sous-agents spécialisés (chacun verrouillé sur le modèle adapté), puis
synthétise. Conçu pour optimiser le rendement qualité/token.

## Architecture

```
.claude/agents/
├── chef-orchestre.md      # Opus   — décompose, analyse, route, synthétise
├── chercheur.md           # Haiku  — collecte / lecture volumineuse (amont)
├── juriste.md             # Opus   — droit français (skill recherche-juridique)
├── redacteur.md           # Sonnet — rédaction + accessibilité TDAH
├── trieur.md              # Haiku  — extraction / classement
├── verificateur.md        # Sonnet — contrôle qualité du livrable (aval)
└── archiviste.md          # Haiku  — capte les leçons en mémoire (apprentissage)

memoire/                   # Mémoire d'expérience (relue à chaque run)
├── index.md               # carte des leçons — lue en premier, recherche Grep
├── lecons.md              # leçons transverses
├── lecons-juridique.md    # leçons domaine droit
└── journal.md             # historique des runs (tâches longues)
```

## Pipeline type

`chercheur` (collecte) → `juriste` / `redacteur` (production)
→ `verificateur` (contrôle) → synthèse par le Chef d'orchestre.

## Routage (qualité/token optimisé)

| Type de sous-tâche                 | Sous-agent      | Modèle |
|------------------------------------|-----------------|--------|
| Collecte, recherche brute, lecture | `chercheur`     | Haiku  |
| Droit français, acte officiel      | `juriste`       | Opus   |
| Rédaction, synthèse rédigée        | `redacteur`     | Sonnet |
| Extraction, tri, classement        | `trieur`        | Haiku  |
| Contrôle qualité du livrable        | `verificateur`  | Sonnet |
| Capture des leçons (fin de run)    | `archiviste`    | Haiku  |

Logique de découpe : on sépare la **collecte bruyante** (chercheur, Haiku)
du **raisonnement** (juriste/Chef d'orchestre, Opus), et on ajoute un filet
de **contrôle** (verificateur) avant tout livrable à enjeu. Le contexte des
agents Opus reste propre → meilleure qualité à coût maîtrisé.

## Accessibilité TDAH

L'utilisateur est TDAH. Le `redacteur` applique le skill `accessibilite-tdah`
sur tout rendu qui lui est destiné (régime A : explication, synthèse,
conseil). Exception : le corps d'un acte officiel garde ses codes formels
(régime B). Voir `redacteur.md`.

## Apprentissage par mémoire d'expérience

L'agent ne « réapprend » pas au sens ML (ses poids ne changent pas). Il
accumule une **mémoire écrite** relue à chaque run : c'est ce qui le fait
progresser au lieu de plafonner.

Boucle :
1. **Début de run** — le Chef d'orchestre lit `memoire/index.md` et applique
   les leçons pertinentes (via Grep ciblé, jamais tout le fichier).
2. **Fin de run** — l'`archiviste` extrait au plus 3 leçons utiles,
   dédoublonne, range dans `memoire/`, met à jour l'index.

Garde-fous (sinon la mémoire devient du bruit coûteux) :
- Rien de non-évident → on n'écrit rien.
- Déduplication obligatoire avant écriture.
- Leçon douteuse marquée `⚠ à confirmer`, validée plus tard.
- Pas de donnée sensible dans une leçon : on écrit la règle, pas le cas.
- **Hygiène de croissance** : `journal.md` est archivé/purgé périodiquement
  (ex. rotation mensuelle) et `index.md` reste plafonné — la mémoire ne doit
  pas grossir indéfiniment, sinon son coût de relecture annule le gain.

Complément natif possible : l'**auto memory** de Claude Code (notes que
Claude écrit depuis tes corrections, chargées au démarrage) peut tourner
en parallèle. Notre `memoire/` reste la source maîtrisée et versionnée
dans le repo.

## Directive verbatim (montage à modèle principal léger)

Si la fenêtre principale tourne sur un modèle léger (Sonnet) et que
le Chef d'orchestre produit le vrai livrable, **ne pas le re-résumer** : le
re-résumé est lossy et peut aplatir des réserves critiques (réserves
juridiques, abstentions). Consigne à appliquer :

> « Restitue la sortie du Chef d'orchestre sans la résumer, sauf demande
> contraire explicite. »

Réglage modèle principal recommandé : **Sonnet** (pas Haiku — Haiku au
sommet plafonne le tier des sous-agents et route mal). Opus réservé au
Chef d'orchestre et au `juriste`. (Réglage côté application/CLI, hors repo.)

## Utilisation

Session Claude Code à la racine du projet :

```
> Utilise le Chef d'orchestre pour [ta demande complexe]
```

Invocation directe d'un sous-agent :

```
> Demande au chercheur de ramener l'article L. 2212-2 CGCT à jour
```

## Règles structure (maintenabilité)

- 1 sous-agent = 1 responsabilité = 1 fichier.
- Modèle verrouillé dans le frontmatter (`model:`) → coût prévisible.
- Outil de délégation : `Agent` dans le `tools:` de `chef-orchestre`
  (nom actuel de l'outil de sous-agents Claude Code ; `Task` était l'ancien).
- `tools:` minimal par agent (moindre privilège).
- Nouvelle compétence → nouveau fichier `.claude/agents/<nom>.md`,
  puis référencer le routage dans le Chef d'orchestre (sinon la CI signale
  un agent orphelin).

## Sécurité

- Aucun agent n'a `Bash` par défaut.
- `chercheur`, `juriste`, `trieur`, `verificateur` : lecture seule.
- `redacteur` et `archiviste` peuvent écrire des fichiers (`Write`, `Edit`)
  — `redacteur` pour les livrables, `archiviste` pour la mémoire.
