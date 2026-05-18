const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nustPrep", {
  getProgress: () => ipcRenderer.invoke("get-progress"),
  saveProgress: (data) => ipcRenderer.invoke("save-progress", data),
  getSchedule: () => ipcRenderer.invoke("get-schedule"),
  getTodayQuestions: () => ipcRenderer.invoke("get-today-questions"),
  listAvailableDays: () => ipcRenderer.invoke("list-available-days"),
  loadQuestionsFile: (filename) => ipcRenderer.invoke("load-questions-file", filename),
  importQuestionsJSON: (data) => ipcRenderer.invoke("import-questions-json", data),
  onQuestionsUpdated: (callback) => ipcRenderer.on("questions-updated", (_, filename) => callback(filename)),
});
