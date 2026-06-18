# Index mémoire — carte des leçons

> Lu EN PREMIER par Capitaine America. Sert à trouver la bonne leçon sans
> tout relire. Une ligne = un pointeur. Recherche par mot-clé (Grep).

Format : `mot-clés | fichier#ancre | résumé en 1 ligne`

<!-- LEÇONS (le plus récent en haut) -->

validation, markdown, intégrité | lecons.md#markdown-blocs-code-barriers | Compter les barrières ``` (pair) pour détecter les blocs de code corrompus
yaml, parsing, frontmatter, robustesse | lecons.md#validateur-yaml-robuste | Parser strictement : borner au frontmatter, ignorer continuations repliées, valider structure
ci, exit-code, vérification, critique | lecons.md#verification-doit-bloquer | Si vérification détecte incohérence critique, elle doit faire échouer (exit ≠ 0)

<!-- Exemple de ligne :
légifrance, abrogation, vigueur | lecons-juridique.md#verifier-version | Toujours confirmer la version en vigueur à la date, pas la dernière publiée
-->
