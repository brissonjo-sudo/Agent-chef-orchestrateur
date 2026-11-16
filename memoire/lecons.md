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

### sous-agents-arriere-plan-attendre
- **Déclencheur** : le Chef d'orchestre lance plusieurs sous-agents via l'outil Agent, même si la consigne demande l'avant-plan.
- **Leçon** : le harnais peut exécuter ces sous-agents en arrière-plan. Ne pas enchaîner l'étape suivante ni synthétiser avant la notification de fin de chaque sous-agent concerné.
- **Coût évité** : synthèse bâtie sur des résultats incomplets, à reprendre.
- **Source** : run du 2026-11-15. ⚠ à confirmer (comportement du harnais, observé sur un seul run).
