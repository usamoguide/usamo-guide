/**
 * build_bank.js
 *
 * Reads every merged per-exam JSON from merged/ and combines them into
 * a single bank.json with the structure:
 *
 *   {
 *     "totalExams": N,
 *     "totalProblems": M,
 *     "exams": [ ...all exam objects... ]
 *   }
 *
 * Usage:  node content/problemBank/build_bank.js
 *   (run from repo root)
 */

const fs = require('fs');
const path = require('path');

const BANK_DIR  = path.join(__dirname);
const MERGED    = path.join(BANK_DIR, 'merged');
const BANK_FILE = path.join(BANK_DIR, 'bank.json');

// ── Read all merged files ────────────────────────────────────────────────
const mergedFiles = fs.readdirSync(MERGED)
  .filter(f => f.endsWith('.json'))
  .sort(); // Alphabetical = chronological for these filenames

const exams = [];
let totalProblems = 0;

for (const file of mergedFiles) {
  const raw = fs.readFileSync(path.join(MERGED, file), 'utf8');
  let examData;
  try {
    examData = JSON.parse(raw);
  } catch (e) {
    console.error(`  ✗ JSON parse error in merged/${file}: ${e.message}`);
    continue;
  }

  // Skip exams with no problems
  if (!examData.problems || examData.problems.length === 0) {
    continue;
  }

  exams.push(examData);
  totalProblems += examData.problems.length;
  console.log(`  ✓ ${examData.exam}: ${examData.problems.length} problems`);
}

// ── Build and write bank.json ────────────────────────────────────────────
const bank = {
  totalExams: exams.length,
  totalProblems: totalProblems,
  exams: exams,
};

fs.writeFileSync(BANK_FILE, JSON.stringify(bank, null, 2));

console.log(`\n━━━ Bank build complete ━━━`);
console.log(`  ${bank.totalExams} exams, ${bank.totalProblems} problems`);
console.log(`  Written to ${BANK_FILE}`);
