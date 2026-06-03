const fs = require('fs');
const path = require('path');

const SOURCE_FILE = './content/problemBank/bank.json';
const UNMAPPED_FILE = './unmapped_problems.json';

const categoryMap = {
  // ── Arithmetic ──
  "Fraction, Decimal, Percent Conversions": "content/1_Foundations/Fraction_Decimal_Percent.problems.json",
  "Proportional Reasoning": "content/1_Foundations/Proportional_Reasoning.problems.json",
  "Rates and Kinematics": "content/1_Foundations/Kinematics_Rates.problems.json",
  "Estimation and Bounding": "content/1_Foundations/Estimation_Bounding.problems.json",
  "Absolute Value and Integer Operations": "content/1_Foundations/Absolute_Value_Integers.problems.json",

  // ── Data ──
  "Mean, Median, Mode, and Harmonic Mean": "content/1_Foundations/Mean_Median_Mode_Harmonic.problems.json",
  "Chart and Graph Interpretation": "content/1_Foundations/Chart_Graph_Interpretation.problems.json",
  "Venn Diagrams and Sets": "content/1_Foundations/Venn_Diagrams_Sets.problems.json",

  // ── Algebra ──
  "Word Problem Translation": "content/1_Foundations/Word_Problem_Translation.problems.json",
  "Linear Equations": "content/1_Foundations/Linear_Equations_Inequalities.problems.json",
  "Systems of Equations": "content/1_Foundations/Systems_of_Equations.problems.json",
  "Defined Operations": "content/1_Foundations/Defined_Operations.problems.json",
  "Arithmetic Sequences": "content/1_Foundations/Arithmetic_Sequences.problems.json",
  "Exponent Rules": "content/1_Foundations/Exponent_Rules.problems.json",
  "Geometric Sequences": "content/1_Foundations/Geometric_Sequences.problems.json",
  "Inequalities": "content/1_Foundations/Linear_Equations_Inequalities.problems.json",

  // ── Number Theory ──
  "Primes and Composites": "content/1_Foundations/Primes_Composites.problems.json",
  "Divisibility Rules": "content/1_Foundations/Divisibility_Rules.problems.json",
  "Prime Factorization": "content/1_Foundations/Prime_Factorization.problems.json",
  "GCD and LCM": "content/1_Foundations/GCD_LCM.problems.json",
  "Divisor Counting Formulas": "content/1_Foundations/Divisor_Counting_Formulas.problems.json",
  "Base Number Systems": "content/1_Foundations/Base_Number_Systems.problems.json",
  "Introduction to Modular Arithmetic": "content/1_Foundations/Modular_Arithmetic_Intro.problems.json",
  "Units Digit and Periodicity": "content/1_Foundations/Units_Digit_Periodicity.problems.json",
  "Linear Diophantine Equations": "content/1_Foundations/Linear_Equations_Inequalities.problems.json",

  // ── Combinatorics ──
  "Counting Fundamentals": "content/1_Foundations/Counting_Fundamentals.problems.json",
  "Systematic Casework": "content/1_Foundations/Systematic_Casework.problems.json",
  "Permutations and Combinations": "content/1_Foundations/Permutations_Combinations.problems.json",
  "Inclusion-Exclusion Principle": "content/1_Foundations/Inclusion_Exclusion.problems.json",
  "Pigeonhole Principle": "content/1_Foundations/Pigeonhole_Principles.problems.json",
  "Extremal Principle": "content/1_Foundations/Extremal_Principle.problems.json",
  "Introduction to Probability": "content/1_Foundations/Intro_Probability.problems.json",
  "Introduction to Geometric Probability": "content/1_Foundations/Geometric_Probability_Intro.problems.json",

  // ── Geometry ──
  "Triangle Fundamentals": "content/1_Foundations/Triangle_Fundamentals.problems.json",
  "Triangle Angle Sum": "content/1_Foundations/Triangle_Angle_Sum.problems.json",
  "Triangle Area Formulas": "content/1_Foundations/Triangle_Area_Formulas.problems.json",
  "Similarity Basics": "content/1_Foundations/Similarity_Basics.problems.json",
  "Coordinate Geometry Basics": "content/1_Foundations/Coordinate_Geometry_Basics.problems.json",
  "Special Quadrilaterals": "content/1_Foundations/Special_Quadrilaterals.problems.json",
  "Circle Angles": "content/1_Foundations/Circle_Angles.problems.json",
  "Composite Figures and Shaded Areas": "content/1_Foundations/Composite_Figures_Shaded_Areas.problems.json",
  "Angle Chasing and Parallel Lines": "content/1_Foundations/Angle_Chasing_Parallel_Lines.problems.json",

  // ── Legacy / catch-all ──
  "No Category": null,
};

const main = () => {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Source file ${SOURCE_FILE} not found!`);
    return;
  }

  const rawData = fs.readFileSync(SOURCE_FILE, 'utf8');
  let bankData;
  try {
    bankData = JSON.parse(rawData);
  } catch (e) {
    console.error("Error parsing ajhsme_all.json", e);
    return;
  }

  const unmapped = [];
  const modifiedFiles = new Set();
  
  // Create a map to hold the parsed target files in memory
  const targets = {};

  bankData.exams.forEach(examObj => {
    examObj.problems.forEach(p => {
      const cat = p.categorization;
      const targetPath = categoryMap[cat];

      if (!targetPath) {
        unmapped.push(p);
        return;
      }

      if (!fs.existsSync(targetPath)) {
        console.warn(`Target file ${targetPath} does not exist for category ${cat}! Dropping to unmapped.`);
        unmapped.push(p);
        return;
      }

      // Read target if not loaded
      if (!targets[targetPath]) {
        try {
          targets[targetPath] = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        } catch(e) {
          fs.appendFileSync('parse_errors.log', `Error parsing ${targetPath}: ${e.message}\n`);
          // Skip mapping this problem since target is invalid
          unmapped.push(p);
          return;
        }
      }

      // Convert answers to interaction object format
      let interaction = { type: "none" };
      if (p.answerChoices && p.answer) {
        // Find correct index
        const letters = ["A", "B", "C", "D", "E"];
        const correctIndex = letters.indexOf(p.answer);
        if (correctIndex !== -1 && p.answerChoices.length > 0) {
          interaction = {
            type: "mcq",
            choices: p.answerChoices,
            correctIndex
          };
        }
      }

      // Construct final schema-compliant problem
      const newProblem = {
        uniqueId: p.uniqueId,
        name: p.name,
        url: p.url,
        source: p.source,
        difficulty: p.difficulty || "Normal",
        isStarred: p.isStarred || false,
        tags: p.tags || [],
        statement: p.statement,
        interaction: interaction,
        solutionMetadata: p.solutionMetadata || { kind: "none" }
      };

      // Append to "practice" array avoiding duplicates
      if (!targets[targetPath].practice) {
        targets[targetPath].practice = [];
      }
      
      const isDuplicate = targets[targetPath].practice.some(existing => existing.uniqueId === newProblem.uniqueId);
      if (!isDuplicate) {
        targets[targetPath].practice.push(newProblem);
        modifiedFiles.add(targetPath);
      } else {
        // We can just silently skip or log if you ever want to see duplicates
      }
    });
  });

  // Save modified files
  modifiedFiles.forEach(file => {
    fs.writeFileSync(file, JSON.stringify(targets[file], null, 2));
    console.log(`Updated ${file}`);
  });

  // Save unmapped
  if (unmapped.length > 0) {
    fs.writeFileSync(UNMAPPED_FILE, JSON.stringify(unmapped, null, 2));
    console.log(`Saved ${unmapped.length} unmapped problems to ${UNMAPPED_FILE}`);
  }

  console.log("Migration complete!");
};

main();
