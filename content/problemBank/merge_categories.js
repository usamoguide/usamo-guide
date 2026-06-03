/**
 * merge_categories.js
 *
 * Reads each per-exam JSON from categories/, enriches every problem with:
 *   1. The AoPS wiki URL  (from problem_links.json)
 *   2. The answer letter   (from answer_keys/<exam>_answers.txt)
 *
 * Writes the merged result to merged/<exam>.json
 *
 * Usage:  node content/problemBank/merge_categories.js
 *   (run from repo root)
 */

const fs = require('fs');
const path = require('path');

const BANK_DIR     = path.join(__dirname);
const CATEGORIES   = path.join(BANK_DIR, 'categories');
const MERGED       = path.join(BANK_DIR, 'merged');
const LINKS_FILE   = path.join(BANK_DIR, 'problem_links.json');
const ANSWER_KEYS  = path.join(BANK_DIR, 'answer_keys');

// ── Load problem links ──────────────────────────────────────────────────
const problemLinks = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));

// ── Parse an answer-key text file ────────────────────────────────────────
function parseAnswerKey(filePath) {
  const answers = {};
  if (!fs.existsSync(filePath)) return answers;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    // Matches lines like "Problem  1: A" or "Problem 25: E"
    const m = line.match(/^Problem\s+(\d+):\s*([A-E])\s*$/);
    if (m) {
      answers[m[1]] = m[2];
    }
  }
  return answers;
}

// ── Ensure output directory exists ───────────────────────────────────────
if (!fs.existsSync(MERGED)) {
  fs.mkdirSync(MERGED, { recursive: true });
}

// ── Process each category file ───────────────────────────────────────────
const categoryFiles = fs.readdirSync(CATEGORIES).filter(f => f.endsWith('.json'));

let totalExams = 0;
let totalProblems = 0;
let skippedExams = 0;

for (const file of categoryFiles) {
  const raw = fs.readFileSync(path.join(CATEGORIES, file), 'utf8');
  let examData;
  try {
    examData = JSON.parse(raw);
  } catch (e) {
    console.error(`  ✗ JSON parse error in ${file}: ${e.message}`);
    continue;
  }

  const examTitle = examData.exam;

  // Skip empty stubs (AMC 8 files you haven't done yet)
  if (!examData.problems || examData.problems.length === 0) {
    skippedExams++;
    continue;
  }

  // Look up links and answer key for this exam
  const links = problemLinks[examTitle] || {};
  const answerKeyFile = path.join(ANSWER_KEYS, `${examTitle}_answers.txt`);
  const answers = parseAnswerKey(answerKeyFile);

  let missingLinks = 0;
  let missingAnswers = 0;

  // Enrich each problem
  const mergedProblems = examData.problems.map((problem, idx) => {
    const problemNum = String(idx + 1);

    // Inject URL
    const url = links[problemNum] || null;
    if (!url) missingLinks++;

    // Inject answer letter
    const answer = answers[problemNum] || null;
    if (!answer) missingAnswers++;

    return {
      ...problem,
      url: url,
      answer: answer,
    };
  });

  const merged = {
    exam: examTitle,
    problems: mergedProblems,
  };

  // Write merged file
  const outPath = path.join(MERGED, file);
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));

  totalExams++;
  totalProblems += mergedProblems.length;

  let status = `  ✓ ${examTitle}: ${mergedProblems.length} problems`;
  if (missingLinks > 0)   status += ` (${missingLinks} missing URLs)`;
  if (missingAnswers > 0) status += ` (${missingAnswers} missing answers)`;
  console.log(status);
}

console.log(`\n━━━ Merge complete ━━━`);
console.log(`  Merged: ${totalExams} exams, ${totalProblems} problems`);
if (skippedExams > 0) {
  console.log(`  Skipped: ${skippedExams} empty exam stubs`);
}
