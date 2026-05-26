# Learning Section — Design Spec
**Date:** 2026-05-26  
**Status:** Approved

---

## Overview

Add a dedicated Learning section to the NUST Prep Electron app. Users can browse all exam topics across all three sections (Verbal, Analytical, Quantitative), read full lessons, and take interactive mini quizzes — independently of the daily practice schedule.

---

## Goals

- Cover every topic from all three exam sections, available from Day 1
- Accessible both as a dedicated study mode and as a mid-test reference
- Content generated once by Claude Code routine; refreshed on explicit request
- Weak topics (from `progress.json`) surfaced prominently but all topics always accessible

---

## Data Model

### File Location
```
data/learning/verbal_lessons.json
data/learning/analytical_lessons.json
data/learning/quantitative_lessons.json
```

### Lesson Object Schema
```json
{
  "topic": "Parallelism & Sentence Structure",
  "section": "verbal",
  "summary": "One-paragraph concept explanation",
  "key_rules": ["Rule 1", "Rule 2", "Rule 3"],
  "worked_examples": [
    {
      "question": "Sentence or scenario",
      "wrong": "Incorrect version",
      "correct": "Correct version",
      "why": "Brief explanation of the fix"
    }
  ],
  "common_mistakes": ["Mistake 1", "Mistake 2"],
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

Each section file is a JSON array of these lesson objects. Each topic from the CLAUDE.md topic lists gets one lesson object. Quiz contains 3–5 MCQs per topic.

---

## App Architecture

### New Page States
| State | Description |
|---|---|
| `"learn"` | Topic browser — section tabs + topic list |
| `"lesson"` | Full lesson view for a selected topic |

### New State Fields
```js
learnSection: "verbal",   // active section tab
lessons: [],              // loaded lessons array for active section
currentLesson: null,      // lesson object currently being viewed
lessonAnswers: {},        // { qIndex: "B" } — quiz answers
lessonShowAnswers: {},    // { qIndex: true } — revealed answers
lessonPrevPage: "home",   // page to return to ("home" or "test")
```

### New IPC Handler (main.js)
- `load-lessons(section)` — reads `data/learning/{section}_lessons.json`, returns array or `[]` if file missing
- `fs.watch` on `data/learning/` — fires `learning-updated` event to renderer when any file changes

### Navigation Entry Points
1. **Home page** — "📚 Learn" button added to existing `btn-row`
2. **Test page header** — small ghost "Learn" button; navigates to learn section, stores `lessonPrevPage = "test"` so back button returns to test at same question index

---

## UI Design

All UI reuses existing CSS classes and design tokens from `index.html` — `.card`, `.btn`, `.tag`, `.option-btn`, `.section-label`, `.explanation`, `.pbar`. Single-column layout, 820px max-width container, no sidebars or grids.

### Learn Page (Topic Browser)

**Header:** standard app header — "Learn" title, topic count + weak count as subtitle

**Section Tabs:** three `.btn` buttons (Verbal=green, Analytical=purple, Quantitative=blue) matching existing `SECTIONS` colors. Active tab uses section color background, inactive uses `.btn-ghost`. Switching tab calls `load-lessons(section)` IPC and re-renders list.

**Weak Topics Banner:** conditional — renders only if weak topics exist. Red-tinted `.card` listing topic names + accuracy. Same style as weak topics shown on home page.

**Topic List:** scrollable list of `.card` elements, sorted weak-first then alphabetical.
- Weak topic card: red border tint (`rgba(239,68,68,0.15)`), red "WEAK" `.tag`, accuracy %, read time (derived: total word count / 200wpm, rounded to nearest minute)
- Normal topic card: standard `.card` border, accuracy % as `.tag` or "Not yet studied" in muted text
- Click → navigates to `"lesson"` page

### Lesson Page (Full Lesson View)

**Header:** back `←` `.btn-ghost` + topic name `h2` + WEAK `.tag` if applicable. Back navigates to `lessonPrevPage` (either `"learn"` or `"test"`).

**Content sections** — each a `.card` block, rendered in order:
1. **Concept** — summary paragraph in `.explanation` style
2. **Key Rules** — small cards with green left border (`border-left: 3px solid var(--green)`)
3. **Worked Examples** — wrong line in red, correct line in green, `why` as `.explanation`
4. **Common Mistakes** — red-tinted `.tag` list
5. **Exam Tips** — amber-tinted `.tag` list
6. **Mini Quiz** — 3–5 MCQs using `.option-btn` exactly like test mode

**Mini Quiz behavior:**
- `.option-btn` with same selected/correct/wrong classes as `renderTest()`
- Click option → immediately show correct/wrong state + `.explanation` below that question
- Each question independently interactive (no submit-all)
- No score tracking — learning only, not recorded to `progress.json`

---

## Content Coverage

Topics to cover per section (from CLAUDE.md):

**Quantitative (13 topics):** Percentages, Ratio & Proportion, Profit Loss & Discount, Time Speed & Distance, Work & Pipes, Number Properties & Divisibility, Probability & Combinatorics, Geometry & Mensuration, Coordinate Geometry, Sequences Series & Interest, Quadratic Equations, Averages & Mixtures, Algebra & Inequalities

**Verbal (11 topics):** Subject-Verb Agreement, Parallelism & Sentence Structure, Modifier Placement, Tense Consistency, Sentence Correction, Reading Comprehension, Synonyms & Antonyms, Vocabulary in Context, Analogies, Sentence Completion, Critical Reading

**Analytical (12 topics):** Syllogisms, Conditional Logic (If-Then), Strengthen & Weaken Arguments, Assumption Questions, Paradox & Explain, Data Interpretation, Linear Arrangement, Circular Arrangement, Blood Relations, Direction Sense, Coding-Decoding, Ranking & Ordering

**Total: 36 lesson objects across 3 files.**

---

## Routine Behavior

### First-Run (one-time generation)
Claude Code checks if all 3 lesson files exist in `data/learning/`. If any are missing → generate all 3. Each file covers all topics for that section as full lesson objects. This is independent of the daily question generation routine.

### Refresh (explicit)
User tells Claude Code "regenerate learning content" → routine overwrites all 3 files with fresh content.

### Weak Topic Weighting
Used **only in the UI** for sort order and badges. Content generation treats all topics equally — every topic gets the same depth and quality regardless of accuracy.

---

## Files Changed

| File | Change |
|---|---|
| `app/index.html` | Add learn/lesson pages, new state fields, IPC calls, navigation buttons |
| `app/main.js` | Add `load-lessons` IPC handler, `fs.watch` on `data/learning/` |
| `app/preload.js` | Expose `loadLessons`, `onLearningUpdated` |
| `CLAUDE.md` | Add Step for learning file generation (first-run check + all-topics coverage) |
| `data/learning/` | New directory (gitignored like `data/questions/`) |

---

## Out of Scope

- Lesson progress tracking (marking topics as "read")
- Search/filter within topic list
- User-editable notes on lessons
- Offline AI generation (requires Claude API integration)
