const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const DATA_DIR = "/Users/Shared/nust-prep/data";
const QUESTIONS_DIR = path.join(DATA_DIR, "questions");
const RESULTS_DIR = path.join(DATA_DIR, "results");
const PROGRESS_FILE = path.join(RESULTS_DIR, "progress.json");
const SCHEDULE_FILE = path.join(DATA_DIR, "schedule.json");

// Ensure directories exist
[QUESTIONS_DIR, RESULTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Initialize schedule if needed
if (!fs.existsSync(SCHEDULE_FILE)) {
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify({
    currentDay: 1,
    totalDays: 30,
    phase1Days: 18,
    rotation: ["verbal", "analytical", "verbal", "quantitative", "verbal", "analytical"],
    questionsPerDay: 50
  }, null, 2));
}

// Initialize progress if needed
if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    currentDay: 1,
    sessions: [],
    mockSessions: []
  }, null, 2));
}

let mainWindow = null;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "NUST Prep",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#030712",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Hide instead of close (keep in background)
  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Create a simple tray icon (16x16 template image)
  const iconPath = path.join(__dirname, "..", "icons", "tray-icon.png");
  let trayIcon;
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } else {
    // Fallback: create a simple icon
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip("NUST Prep");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open NUST Prep",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "Today's Status",
      click: () => {
        const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
        const day = progress.currentDay;
        const schedule = getSchedule(day);
        const hasQs = todayHasQuestions(day, schedule);
        const { dialog } = require("electron");
        dialog.showMessageBox({
          type: "info",
          title: "NUST Prep — Day " + day,
          message: `Day ${day}: ${schedule.label}\nQuestions ready: ${hasQs ? "Yes ✓" : "No ✗"}`,
        });
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function getSchedule(day) {
  const config = JSON.parse(fs.readFileSync(SCHEDULE_FILE, "utf8"));
  if (day > config.phase1Days) {
    return { type: "mock", section: null, label: "Mock Test" };
  }
  const sec = config.rotation[(day - 1) % config.rotation.length];
  return { type: "practice", section: sec, label: sec.charAt(0).toUpperCase() + sec.slice(1) + " Practice" };
}

function todayHasQuestions(day, schedule) {
  const paddedDay = String(day).padStart(2, "0");
  if (schedule.type === "mock") {
    return fs.existsSync(path.join(QUESTIONS_DIR, `day${paddedDay}_mock.json`));
  }
  return fs.existsSync(path.join(QUESTIONS_DIR, `day${paddedDay}_${schedule.section}.json`));
}

// ── IPC Handlers (bridge between UI and filesystem) ──

ipcMain.handle("get-progress", () => {
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
});

ipcMain.handle("save-progress", (_, data) => {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
  return true;
});

ipcMain.handle("get-schedule", () => {
  return JSON.parse(fs.readFileSync(SCHEDULE_FILE, "utf8"));
});

ipcMain.handle("get-today-questions", () => {
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  const day = progress.currentDay;
  const schedule = getSchedule(day);
  const paddedDay = String(day).padStart(2, "0");

  let filePath;
  if (schedule.type === "mock") {
    filePath = path.join(QUESTIONS_DIR, `day${paddedDay}_mock.json`);
  } else {
    filePath = path.join(QUESTIONS_DIR, `day${paddedDay}_${schedule.section}.json`);
  }

  if (fs.existsSync(filePath)) {
    const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return { questions, section: schedule.section || "quantitative", day, schedule };
  }
  return { questions: null, section: schedule.section, day, schedule };
});

ipcMain.handle("list-available-days", () => {
  const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const match = f.match(/day(\d+)_(\w+)\.json/);
    if (match) return { day: parseInt(match[1]), section: match[2], file: f };
    return null;
  }).filter(Boolean);
});

ipcMain.handle("load-questions-file", (_, filename) => {
  const filePath = path.join(QUESTIONS_DIR, filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return null;
});

ipcMain.handle("import-questions-json", (_, { day, section, questions }) => {
  const paddedDay = String(day).padStart(2, "0");
  const filename = `day${paddedDay}_${section}.json`;
  const filePath = path.join(QUESTIONS_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
  return { success: true, filename };
});

// Watch questions directory for new files
fs.watch(QUESTIONS_DIR, (eventType, filename) => {
  if (filename && filename.endsWith(".json") && mainWindow) {
    mainWindow.webContents.send("questions-updated", filename);
  }
});

// ── App lifecycle ──

app.on("ready", () => {
  createWindow();
  createTray();
});

app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});

// Keep app running when all windows closed (tray mode)
app.on("window-all-closed", (e) => {
  // Don't quit on macOS
});

// Auto-start on login (macOS)
if (process.platform === "darwin") {
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
  });
}
