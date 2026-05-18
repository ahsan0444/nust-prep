# NUST NET Prep — macOS App + Claude Code Routine

## What This Is

A complete exam prep system that:
- **Runs as a macOS app** in your Dock (always running in background)
- **Claude Code generates 50-60 questions daily at 2 AM** automatically
- **Questions auto-import** into the app — just open and start practicing
- **Tracks everything** — scores, weak topics, progress, projected score

## Quick Setup (5 minutes)

### Step 1: Copy to Shared folder
```bash
cp -r nust-prep /Users/Shared/nust-prep
```

### Step 2: Install the app
```bash
cd /Users/Shared/nust-prep
chmod +x install.sh
./install.sh
```
This will:
- Install Node.js dependencies
- Build the Electron app
- Create `NUST Prep.app` in your `/Applications` folder
- Add it to Login Items (launches on startup)
- Set up the Claude Code routine

### Step 3: Set up the Claude Code routine
```bash
cd /Users/Shared/nust-prep
claude routine add nust-daily-prep \
  --schedule "0 2 * * *" \
  --project-dir /Users/Shared/nust-prep \
  --allowedTools "Edit,Write,Read" \
  --description "Generate daily NUST GNET practice questions"
```

Or manually via Claude Code:
```
claude
/routine add nust-daily-prep --schedule "0 2 * * *"
```
When prompted for the task, paste the contents of `CLAUDE.md`.

### Step 4: You're done!
- The app icon appears in your Dock
- Every morning at 2 AM, Claude Code generates fresh questions
- Open the app after work → today's questions are ready → practice → review

## Daily Workflow

1. **Click the NUST Prep icon** in your Dock
2. Today's questions are pre-loaded (generated at 2 AM)
3. **Take the test** — 50 questions, timed
4. **Review mistakes** — see explanations, topic breakdown
5. **Check progress** — projected score, weak areas, trend

## File Structure
```
/Users/Shared/nust-prep/
├── install.sh              ← one-time setup script
├── CLAUDE.md               ← instructions for Claude Code routine
├── package.json            ← Electron app config
├── app/
│   ├── main.js             ← Electron main process (tray, background)
│   ├── index.html          ← the prep UI
│   └── preload.js          ← bridge between app and filesystem
├── data/
│   ├── questions/           ← daily question JSONs (auto-generated)
│   │   ├── day01_verbal.json
│   │   └── ...
│   ├── results/
│   │   └── progress.json    ← your score history
│   └── schedule.json        ← current day, schedule config
├── scripts/
│   └── generate-prompt.md   ← exact prompt Claude Code uses
└── icons/
    └── icon.png             ← app icon
```

## Troubleshooting

**App doesn't appear in Dock?**
Run: `open /Applications/NUST\ Prep.app`

**Questions not generating?**
Check Claude Code routine: `claude routine list`
Manual generate: Open Claude Code in `/Users/Shared/nust-prep` and say "generate today's questions"

**Want to reset progress?**
Delete `data/results/progress.json` — it'll recreate on next launch.
