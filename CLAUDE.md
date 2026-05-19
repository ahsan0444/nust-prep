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

## Quality Rules

1. Questions must be original, exam-quality, matching NUST GNET style
2. Verbal: include grammar corrections, short RC passages (2-3 sentences), analogies, vocabulary
3. Analytical: include seating arrangements, Venn diagrams, data tables, logical puzzles
4. Never repeat questions from previous days — check existing files
5. If last session accuracy was 90%+, increase hard questions to 40%
6. All math questions must have correct, verified answers
