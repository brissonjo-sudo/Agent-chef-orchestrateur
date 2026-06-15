#!/usr/bin/env node
/**
 * Valide les sous-agents Claude Code dans .claude/agents/.
 * Zéro dépendance. Vérifie frontmatter, modèle, cohérence nom/fichier,
 * unicité, et que les agents cités dans l'orchestrateur existent.
 * Sort en code 1 si une erreur est trouvée (fait échouer la CI).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';

const AGENTS_DIR = '.claude/agents';
const MODELES_VALIDES = ['opus', 'sonnet', 'haiku', 'inherit'];

const erreurs = [];
const avertissements = [];

function lireChamp(frontmatter, champ) {
  const ligne = frontmatter
    .split('\n')
    .find((l) => l.trim().startsWith(`${champ}:`));
  if (!ligne) return null;
  return ligne.slice(ligne.indexOf(':') + 1).trim();
}

function extraireFrontmatter(contenu, fichier) {
  if (!contenu.startsWith('---')) {
    erreurs.push(`${fichier} : pas de frontmatter YAML (doit commencer par ---).`);
    return null;
  }
  const fin = contenu.indexOf('\n---', 3);
  if (fin === -1) {
    erreurs.push(`${fichier} : frontmatter non fermé (--- de fin manquant).`);
    return null;
  }
  return contenu.slice(3, fin);
}

if (!existsSync(AGENTS_DIR)) {
  console.error(`✗ Dossier introuvable : ${AGENTS_DIR}`);
  process.exit(1);
}

const fichiers = readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md'));
if (fichiers.length === 0) {
  console.error(`✗ Aucun agent dans ${AGENTS_DIR}`);
  process.exit(1);
}

const nomsVus = new Map();
const nomsDeclarés = new Set();

for (const fichier of fichiers) {
  const chemin = join(AGENTS_DIR, fichier);
  const contenu = readFileSync(chemin, 'utf8');
  const fm = extraireFrontmatter(contenu, fichier);
  if (!fm) continue;

  const name = lireChamp(fm, 'name');
  const model = lireChamp(fm, 'model');
  const description = lireChamp(fm, 'description');
  const nomFichier = basename(fichier, '.md');

  // Champs obligatoires
  if (!name) erreurs.push(`${fichier} : champ "name" manquant.`);
  if (!description) erreurs.push(`${fichier} : champ "description" manquant.`);
  if (!model) {
    erreurs.push(`${fichier} : champ "model" manquant.`);
  } else if (!MODELES_VALIDES.includes(model)) {
    erreurs.push(
      `${fichier} : model "${model}" invalide (attendu : ${MODELES_VALIDES.join(', ')}).`
    );
  }

  // Cohérence nom de fichier <-> name
  if (name && name !== nomFichier) {
    erreurs.push(
      `${fichier} : name "${name}" ≠ nom de fichier "${nomFichier}".`
    );
  }

  // Unicité
  if (name) {
    if (nomsVus.has(name)) {
      erreurs.push(`Doublon de name "${name}" (${fichier} et ${nomsVus.get(name)}).`);
    } else {
      nomsVus.set(name, fichier);
      nomsDeclarés.add(name);
    }
  }
}

// Cohérence du routage : les agents cités dans capitaine-america.md existent
const cheminOrch = join(AGENTS_DIR, 'capitaine-america.md');
if (existsSync(cheminOrch)) {
  const orch = readFileSync(cheminOrch, 'utf8');
  const cités = [...orch.matchAll(/`([a-z-]+)`\s*\((?:Opus|Sonnet|Haiku)\)/gi)]
    .map((m) => m[1].toLowerCase());
  for (const c of new Set(cités)) {
    if (c !== 'capitaine-america' && !nomsDeclarés.has(c)) {
      avertissements.push(
        `orchestrateur.md cite le sous-agent "${c}" mais aucun fichier ${c}.md trouvé.`
      );
    }
  }
}

// Rapport
console.log(`\nAgents analysés : ${fichiers.length} → ${[...nomsDeclarés].join(', ')}\n`);

if (avertissements.length) {
  console.log('⚠ Avertissements :');
  avertissements.forEach((a) => console.log(`  - ${a}`));
  console.log('');
}

if (erreurs.length) {
  console.error('✗ Erreurs :');
  erreurs.forEach((e) => console.error(`  - ${e}`));
  console.error(`\n${erreurs.length} erreur(s). Validation échouée.`);
  process.exit(1);
}

console.log('✓ Tous les agents sont valides.');
process.exit(0);
