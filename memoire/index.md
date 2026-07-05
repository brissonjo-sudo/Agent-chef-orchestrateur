# Index mémoire — carte des leçons

> Lu EN PREMIER par Capitaine America. Sert à trouver la bonne leçon sans
> tout relire. Une ligne = un pointeur. Recherche par mot-clé (Grep).

Format : `mot-clés | fichier#ancre | résumé en 1 ligne`

<!-- LEÇONS (le plus récent en haut) -->

sécurité, privilèges, frontmatter, documentation | lecons.md#regles-securite-vs-config | Vérifier une règle de sécurité contre la config réelle, pas seulement la prose
dépendance, abstention, robustesse, fail-safe | lecons.md#dependance-dure-et-abstention | Dépendance dure à fort enjeu exige abstention explicite + fallback proportionné
mission, outils, vérification, garantie | lecons.md#mission-agent-vs-outils | Mission d'un agent ne doit pas dépasser ce que ses outils permettent de garantir
validation, markdown, intégrité | lecons.md#markdown-blocs-code-barriers | Compter les barrières ``` (pair) pour détecter les blocs de code corrompus
yaml, parsing, frontmatter, robustesse | lecons.md#validateur-yaml-robuste | Parser strictement : borner au frontmatter, ignorer continuations repliées, valider structure
ci, exit-code, vérification, critique | lecons.md#verification-doit-bloquer | Si vérification détecte incohérence critique, elle doit faire échouer (exit ≠ 0)

<!-- Exemple de ligne :
légifrance, abrogation, vigueur | lecons-juridique.md#verifier-version | Toujours confirmer la version en vigueur à la date, pas la dernière publiée
-->
