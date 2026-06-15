#!/usr/bin/env node
/**
 * Valide les sous-agents Claude Code dans .claude/agents/.
 * Zéro dépendance. Vérifie frontmatter, modèle, cohérence nom/fichier,
 * unicité, présence d'outils, et cohérence de routage DANS LES DEUX SENS :
 *   - tout agent cité par l'orchestrateur doit exister (sinon ERREUR) ;
 *   - tout agent présent doit être routé par l'orchestrateur (sinon ERREUR : orphelin).
 * Sort en code 1 si une erreur est trouvée (fait échouer la CI).
 *
 * Durcissements vs version initiale :
 *   1. Routage incohérent = ERREUR (et non simple avertissement).
 *   2. Détection des agents orphelins (présents mais jamais routés).
 *   3. Champ "tools" obligatoire et non vide (moindre privilège explicite).
 *   4. Lecture des descriptions en bloc YAML ( > ou | ) : une description
 *      "vide sous un >" n'est plus considérée comme présente.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';

const AGENTS_DIR = '.claude/agents';
const ORCHESTRATEUR = 'capitaine-america';
const MODELES_VALIDES = ['opus', 'sonnet', 'haiku', 'inherit'];

const erreurs = [];
const avertissements = [];

/** Lit un champ "clé: valeur" simple OU un bloc scalaire ( > / | ). */
function lireChamp(frontmatter, champ) {
  const lignes = frontmatter.split('\n');
  const idx = lignes.findIndex((l) => l.trim().startsWith(`${champ}:`));
  if (idx === -1) return null;
  const brut = lignes[idx].slice(lignes[idx].indexOf(':') + 1).trim();
  if (brut === '>' || brut === '|' || brut === '>-' || brut === '|-') {
    const corps = [];
    for (let i = idx + 1; i < lignes.length; i++) {
      if (/^\s+\S/.test(lignes[i])) corps.push(lignes[i].trim());
      else if (lignes[i].trim() === '') continue;
      else break;
    }
    return corps.join(' ').trim() || null;
  }
  return brut || null;
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
const nomsDeclares = new Set();

for (const fichier of fichiers) {
  const chemin = join(AGENTS_DIR, fichier);
  const contenu = readFileSync(chemin, 'utf8');
  const fm = extraireFrontmatter(contenu, fichier);
  if (!fm) continue;

  const name = lireChamp(fm, 'name');
  const model = lireChamp(fm, 'model');
  const description = lireChamp(fm, 'description');
  const tools = lireChamp(fm, 'tools');
  const nomFichier = basename(fichier, '.md');

  if (!name) erreurs.push(`${fichier} : champ "name" manquant.`);
  if (!description) erreurs.push(`${fichier} : champ "description" manquant ou vide.`);
  if (!model) {
    erreurs.push(`${fichier} : champ "model" manquant.`);
  } else if (!MODELES_VALIDES.includes(model)) {
    erreurs.push(`${fichier} : model "${model}" invalide (attendu : ${MODELES_VALIDES.join(', ')}).`);
  }
  if (!tools) {
    erreurs.push(`${fichier} : champ "tools" manquant ou vide (moindre privilege explicite).`);
  }
  if (name && name !== nomFichier) {
    erreurs.push(`${fichier} : name "${name}" ≠ nom de fichier "${nomFichier}".`);
  }
  if (name) {
    if (nomsVus.has(name)) erreurs.push(`Doublon de name "${name}" (${fichier} et ${nomsVus.get(name)}).`);
    else { nomsVus.set(name, fichier); nomsDeclares.add(name); }
  }
}

const cheminOrch = join(AGENTS_DIR, `${ORCHESTRATEUR}.md`);
if (!existsSync(cheminOrch)) {
  erreurs.push(`Orchestrateur introuvable : ${ORCHESTRATEUR}.md attendu.`);
} else {
  const orch = readFileSync(cheminOrch, 'utf8');
  const cites = new Set(
    [...orch.matchAll(/`([a-z-]+)`\s*\((?:Opus|Sonnet|Haiku)\)/gi)].map((m) => m[1].toLowerCase())
  );
  for (const c of cites) {
    if (c !== ORCHESTRATEUR && !nomsDeclares.has(c)) {
      erreurs.push(`Routage incoherent : "${ORCHESTRATEUR}" route vers "${c}" mais ${c}.md n'existe pas.`);
    }
  }
  for (const nom of nomsDeclares) {
    if (nom !== ORCHESTRATEUR && !cites.has(nom)) {
      erreurs.push(`Agent orphelin : "${nom}" existe mais n'est route nulle part dans ${ORCHESTRATEUR}.md.`);
    }
  }
}

console.log(`\nAgents analyses : ${fichiers.length} → ${[...nomsDeclares].join(', ')}\n`);
if (avertissements.length) { console.log('⚠ Avertissements :'); avertissements.forEach((a) => console.log(`  - ${a}`)); console.log(''); }
if (erreurs.length) {
  console.error('✗ Erreurs :');
  erreurs.forEach((e) => console.error(`  - ${e}`));
  console.error(`\n${erreurs.length} erreur(s). Validation echouee.`);
  process.exit(1);
}
console.log('✓ Tous les agents sont valides.');
process.exit(0);
