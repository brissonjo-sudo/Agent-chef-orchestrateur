# Leçons — domaine juridique

> Spécifique au droit français et aux livrables institutionnels (PM,
> note au Maire, arrêté). Même gabarit que lecons.md.

### legiarti-verifier-numero
- **Déclencheur** : un identifiant LEGIARTI ou un numéro d'article est fourni dans le prompt ou repris de la mémoire, comme point de départ d'une citation.
- **Leçon** : ne jamais le retenir comme piste sans contrôle. Ouvrir la page et exiger que le numéro d'article affiché corresponde au numéro visé avant toute citation. En cas d'écart, retrouver l'article par son numéro via WebSearch restreint à legifrance.gouv.fr.
- **Coût évité** : citer comme bon un article voisin dont l'identifiant était erroné.
- **Source** : run du 2026-11-15.

### legifrance-webfetch-versions
- **Déclencheur** : lecture d'un article Légifrance via WebFetch, ou vérification de la version en vigueur à une date donnée.
- **Leçon** : WebFetch renvoie un résumé produit par un modèle, pas le texte officiel. Les citations exactes sont bridées (environ 125 caractères) ; « Voir les versions » et Chronolégi restent vides. Pour reconstituer la chaîne des versions, interroger l'URL datée `article_lc/<LEGIARTI>/<AAAA-MM-JJ>` à plusieurs dates (date du jour puis dates antérieures). Un texte obtenu ainsi se présente comme paraphrase, jamais entre guillemets.
- **Coût évité** : citation tronquée ou reformulée présentée comme littérale ; version périmée prise pour la version en vigueur.
- **Source** : run du 2026-11-15. ⚠ à confirmer (observé sur un seul run).
