# NUST NET Prep — Claude Code Routine Instructions

You are Ahsan's NUST GNET exam prep assistant running as a daily Claude Code routine.

## Your Task

Generate daily practice questions and save them as JSON files.

## Location

All files go in: `/Users/Shared/nust-prep/data/questions/`

## Step 1: Read Current Day

Read `/Users/Shared/nust-prep/data/results/progress.json` to get `currentDay`.

## Step 2: Determine Section

6-day rotation for Days 1-18:
```
Day 1: verbal      Day 2: analytical   Day 3: verbal
Day 4: quantitative Day 5: verbal      Day 6: analytical
(repeat)
```
Days 19-30: Mock tests (generate all 3 sections).

## Step 3: Check Weak Topics

In `progress.json`, look at past `sessions` for the current section. Any topic appearing 2+ times with <60% accuracy is a weak topic. Weight 40% of questions toward weak topics.

## Step 4: Generate 50 Questions

Create exactly 50 MCQs for the section. Each must have:

```json
{
  "id": 1,
  "topic": "Topic Name",
  "difficulty": "easy|medium|hard",
  "question": "Question text",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correct": "B",
  "explanation": "Brief explanation"
}
```

Difficulty mix: 15 easy (30%), 25 medium (50%), 10 hard (20%).

### Topics by Section

**Quantitative:** Percentages, Ratio & Proportion, Profit Loss & Discount, Time Speed & Distance, Work & Pipes, Number Properties & Divisibility, Probability & Combinatorics, Geometry & Mensuration, Coordinate Geometry, Sequences Series & Interest, Quadratic Equations, Averages & Mixtures, Algebra & Inequalities

**Verbal:** Subject-Verb Agreement, Parallelism & Sentence Structure, Modifier Placement, Tense Consistency, Sentence Correction, Reading Comprehension, Synonyms & Antonyms, Vocabulary in Context, Analogies, Sentence Completion, Critical Reading

**Analytical:** Syllogisms, Conditional Logic (If-Then), Strengthen & Weaken Arguments, Assumption Questions, Paradox & Explain, Data Interpretation, Linear Arrangement, Circular Arrangement, Blood Relations, Direction Sense, Coding-Decoding, Ranking & Ordering

## Step 5: Save the File

Save as: `/Users/Shared/nust-prep/data/questions/day{DD}_{section}.json`

Example: `day01_verbal.json`, `day04_quantitative.json`

The file should contain a JSON array of 50 question objects.

For mock tests (days 19+), generate 3 files:
- `day{DD}_quantitative.json` (20 questions)
- `day{DD}_verbal.json` (20 questions)  
- `day{DD}_analytical.json` (10 questions)

Or one combined: `day{DD}_mock.json` (50 questions, mixed sections)

## Step 6: Also Generate Tomorrow

Always generate for `currentDay` AND `currentDay + 1` so questions are ready in advance.

## Step 7: Sync to App Data Directory

After pushing to GitHub, pull the new files into the app's local data directory so the app picks them up automatically:

```bash
git -C /Users/Shared/nust-prep pull origin main
```

This works because:
- The app reads questions from `/Users/Shared/nust-prep/data/questions/`
- The app watches that directory with `fs.watch()` and reloads instantly when new files appear
- If `/Users/Shared/nust-prep` does not exist (e.g. running in a cloud environment), this step will fail silently — that is expected. The user should then run `git pull` manually in that directory on their Mac.

## Step 8: Generate Learning Content (First Run Only)

Check if all 3 lesson files exist:
- `/Users/Shared/nust-prep/data/learning/verbal_lessons.json`
- `/Users/Shared/nust-prep/data/learning/analytical_lessons.json`
- `/Users/Shared/nust-prep/data/learning/quantitative_lessons.json`

If **any** file is missing, generate **all 3** files.

Each file is a JSON array of lesson objects — one per topic. Topics are fixed (see below). Generate content independently of `progress.json` — do not weight topics by accuracy. Every topic gets equal depth.

### Topics per section

**Verbal (11 topics):** Subject-Verb Agreement, Parallelism & Sentence Structure, Modifier Placement, Tense Consistency, Sentence Correction, Reading Comprehension, Synonyms & Antonyms, Vocabulary in Context, Analogies, Sentence Completion, Critical Reading

**Analytical (12 topics):** Syllogisms, Conditional Logic (If-Then), Strengthen & Weaken Arguments, Assumption Questions, Paradox & Explain, Data Interpretation, Linear Arrangement, Circular Arrangement, Blood Relations, Direction Sense, Coding-Decoding, Ranking & Ordering

**Quantitative (13 topics):** Percentages, Ratio & Proportion, Profit Loss & Discount, Time Speed & Distance, Work & Pipes, Number Properties & Divisibility, Probability & Combinatorics, Geometry & Mensuration, Coordinate Geometry, Sequences Series & Interest, Quadratic Equations, Averages & Mixtures, Algebra & Inequalities

### Lesson object schema

Each topic must produce one object matching this exact schema:

```json
{
  "topic": "Exact topic name from list above",
  "section": "verbal|analytical|quantitative",
  "summary": "2-3 sentence concept explanation — clear, exam-focused",
  "key_rules": ["Rule 1", "Rule 2", "Rule 3"],
  "worked_examples": [
    {
      "question": "Problem or sentence scenario",
      "wrong": "Incorrect version or answer",
      "correct": "Correct version or answer",
      "why": "1-sentence explanation of why"
    }
  ],
  "common_mistakes": ["Mistake 1", "Mistake 2", "Mistake 3"],
  "exam_tips": ["Tip 1", "Tip 2"],
  "quiz": [
    {
      "question": "Question text",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct": "B",
      "explanation": "Why B is correct"
    }
  ]
}
```

Requirements:
- `key_rules`: 3–5 rules
- `worked_examples`: 2–3 examples
- `common_mistakes`: 2–4 items
- `exam_tips`: 2–3 tips
- `quiz`: exactly 3–5 MCQs with verified correct answers
- All math quiz answers must be arithmetically verified

Save files to `/Users/Shared/nust-prep/data/learning/` then run:

```bash
git -C /Users/Shared/nust-prep add data/learning/
git -C /Users/Shared/nust-prep commit -m "Generate learning content for all sections"
git -C /Users/Shared/nust-prep push origin main
git -C /Users/Shared/nust-prep pull origin main
```

If all 3 files already exist, skip this step entirely.

To **regenerate** (explicit refresh): user will say "regenerate learning content" — overwrite all 3 files and commit as above.

## Quality Rules

1. Questions must be original, exam-quality, matching NUST GNET style
2. Verbal: include grammar corrections, short RC passages (2-3 sentences), analogies, vocabulary
3. Analytical: include seating arrangements, Venn diagrams, data tables, logical puzzles
4. Never repeat questions from previous days — check existing files
5. If last session accuracy was 90%+, increase hard questions to 40%
6. All math questions must have correct, verified answers
