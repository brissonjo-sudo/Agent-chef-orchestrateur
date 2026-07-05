#!/usr/bin/env node
/**
 * Harnais d'éval du pipeline d'orchestration. Zéro dépendance.
 *
 * --check (défaut, CI) : valide le schéma des cas et la couverture des
 *   agents routables (chaque agent doit apparaître dans au moins un cas).
 *   Déterministe, rapide, bloquant (exit 1 si anomalie).
 *
 * --run : exécute réellement chaque cas via `claude -p` (le pipeline
 *   complet, capitaine-america inclus), capture la sortie dans
 *   evals/runs/<horodatage>/<id>.txt et vérifie les `proprietes` déclarées.
 *   Non déterministe, coûte des tokens, jamais appelé par la CI.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const CASES_DIR = 'evals/cases';
const RUNS_DIR = 'evals/runs';
const ROUTABLE_AGENTS = ['chercheur', 'juriste', 'redacteur', 'trieur', 'verificateur'];
const TYPES_PROPRIETE_VALIDES = ['contient', 'absent', 'regex'];

const mode = process.argv.includes('--run') ? 'run' : 'check';

function chargerCas() {
  if (!existsSync(CASES_DIR)) {
    console.error(`✗ Dossier introuvable : ${CASES_DIR}`);
    process.exit(1);
  }
  const fichiers = readdirSync(CASES_DIR).filter((f) => f.endsWith('.json'));
  if (fichiers.length === 0) {
    console.error(`✗ Aucun cas dans ${CASES_DIR}`);
    process.exit(1);
  }
  const erreurs = [];
  const cas = [];
  for (const fichier of fichiers) {
    const chemin = join(CASES_DIR, fichier);
    let data;
    try {
      data = JSON.parse(readFileSync(chemin, 'utf8'));
    } catch (e) {
      erreurs.push(`${fichier} : JSON invalide (${e.message}).`);
      continue;
    }
    for (const champ of ['id', 'description', 'tache', 'agents_attendus', 'proprietes']) {
      if (!(champ in data)) erreurs.push(`${fichier} : champ "${champ}" manquant.`);
    }
    if (!Array.isArray(data.agents_attendus)) {
      erreurs.push(`${fichier} : "agents_attendus" doit être un tableau.`);
    }
    if (!Array.isArray(data.proprietes) || data.proprietes.length === 0) {
      erreurs.push(`${fichier} : "proprietes" doit être un tableau non vide.`);
    } else {
      for (const p of data.proprietes) {
        if (!TYPES_PROPRIETE_VALIDES.includes(p.type)) {
          erreurs.push(
            `${fichier} : type de propriété "${p.type}" invalide (attendu : ${TYPES_PROPRIETE_VALIDES.join(', ')}).`
          );
        }
      }
    }
    cas.push(data);
  }
  if (erreurs.length) {
    console.error('✗ Erreurs de schéma :');
    erreurs.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  return cas;
}

function verifierCouverture(cas) {
  const couverts = new Set(cas.flatMap((c) => c.agents_attendus));
  const manquants = ROUTABLE_AGENTS.filter((a) => !couverts.has(a));
  if (manquants.length) {
    console.error(`✗ Agents non couverts par aucun cas d'éval : ${manquants.join(', ')}.`);
    process.exit(1);
  }
}

function verifierPropriete(sortie, p) {
  if (p.type === 'contient') return sortie.includes(p.valeur);
  if (p.type === 'absent') return !sortie.includes(p.valeur);
  if (p.type === 'regex') return new RegExp(p.valeur, 'i').test(sortie);
  return false;
}

if (mode === 'check') {
  const cas = chargerCas();
  verifierCouverture(cas);
  console.log(`\n✓ ${cas.length} cas d'éval valides, ${ROUTABLE_AGENTS.length} agents routables couverts.`);
  process.exit(0);
}

// mode --run : exécution réelle, non bloquante pour la CI
const cas = chargerCas();
const horodatage = new Date().toISOString().replace(/[:.]/g, '-');
const dossierRun = join(RUNS_DIR, horodatage);
mkdirSync(dossierRun, { recursive: true });

console.log(`\nExécution de ${cas.length} cas via le CLI claude (headless)…\n`);

let echecs = 0;
for (const c of cas) {
  process.stdout.write(`- ${c.id}… `);
  let sortie;
  try {
    sortie = execFileSync(
      'claude',
      ['-p', `Utilise capitaine-america pour : ${c.tache}`],
      { encoding: 'utf8', timeout: 120_000 }
    );
  } catch (e) {
    console.log(`✗ échec d'exécution (${e.message})`);
    echecs++;
    continue;
  }
  writeFileSync(join(dossierRun, `${c.id}.txt`), sortie);

  const resultats = c.proprietes.map((p) => ({ p, ok: verifierPropriete(sortie, p) }));
  const ok = resultats.every((r) => r.ok);
  console.log(ok ? '✓' : '✗');
  if (!ok) {
    echecs++;
    resultats.filter((r) => !r.ok).forEach((r) =>
      console.log(`    propriété manquée : ${r.p.type} "${r.p.valeur}"`)
    );
  }
}

console.log(`\nSorties capturées dans ${dossierRun}/`);
console.log(
  echecs
    ? `\n⚠ ${echecs}/${cas.length} cas en échec (indicatif — ne bloque pas la CI).`
    : `\n✓ ${cas.length}/${cas.length} cas conformes.`
);
process.exit(0);
