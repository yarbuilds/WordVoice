import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface Settings {
  microphone: string;
  engine: string;
  autoCopyAfterPaste: boolean;
  whisperModel: string;
  groqApiKey: string;
  recordingMode: string;
  hotkey: string;
}

interface MicDevice {
  name: string;
  is_default: boolean;
}

interface DownloadProgress {
  downloaded: number;
  total: number;
  percent: number;
}

interface HistoryEntry {
  id: string;
  text: string;
  created_at: number;
  engine: string;
  microphone: string;
}

interface DictionaryEntry {
  id: string;
  heard: string;
  replacement: string;
  created_at: number;
}

// DOM elements
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const micSelect = document.getElementById("mic-select") as HTMLSelectElement;
const testMicBtn = document.getElementById("test-mic-btn") as HTMLButtonElement;
const micTestStatus = document.getElementById("mic-test-status")!;
const copyAfterPasteOn = document.getElementById("copy-after-paste-on")!;
const copyAfterPasteOff = document.getElementById("copy-after-paste-off")!;
const engineLocal = document.getElementById("engine-local")!;
const engineCloud = document.getElementById("engine-cloud")!;
const localSettings = document.getElementById("local-settings")!;
const cloudSettings = document.getElementById("cloud-settings")!;
const modelSelect = document.getElementById("model-select") as HTMLSelectElement;
const downloadBtn = document.getElementById("download-btn")!;
const downloadProgress = document.getElementById("download-progress")!;
const progressFill = document.getElementById("progress-fill")!;
const groqKey = document.getElementById("groq-key") as HTMLInputElement;
const modeToggle = document.getElementById("mode-toggle")!;
const modePtt = document.getElementById("mode-ptt")!;
const hotkeyText = document.getElementById("hotkey-text")!;
const clearHistoryBtn = document.getElementById("clear-history-btn") as HTMLButtonElement | null;
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const historyCount = document.getElementById("history-count");
const historyLatest = document.getElementById("history-latest");
const dictionaryHeard = document.getElementById("dictionary-heard") as HTMLInputElement | null;
const dictionaryReplacement = document.getElementById("dictionary-replacement") as HTMLInputElement | null;
const saveDictionaryBtn = document.getElementById("save-dictionary-btn") as HTMLButtonElement | null;
const clearDictionaryBtn = document.getElementById("clear-dictionary-btn") as HTMLButtonElement | null;
const dictionaryStatus = document.getElementById("dictionary-status");
const dictionaryList = document.getElementById("dictionary-list");
const dictionaryEmpty = document.getElementById("dictionary-empty");

// Section navigation
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.getAttribute("data-section");
    navItems.forEach((n) => n.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));
    item.classList.add("active");
    document.getElementById(`section-${target}`)?.classList.add("active");
  });
});

// Window drag — titlebar and topbar empty space
const titlebar = document.getElementById("titlebar")!;
const topbar = document.getElementById("topbar");
const appWindow = getCurrentWindow();

titlebar.addEventListener("mousedown", (e) => {
  if ((e.target as HTMLElement).closest("button, select, input, a, .nav-item")) return;
  appWindow.startDragging();
});

topbar?.addEventListener("mousedown", (e) => {
  if ((e.target as HTMLElement).closest("button, select, input, a, .nav-item")) return;
  appWindow.startDragging();
});

let currentSettings: Settings;
let historyEntries: HistoryEntry[] = [];
let dictionaryEntries: DictionaryEntry[] = [];

async function loadSettings() {
  currentSettings = await invoke<Settings>("get_settings");

  // Populate mic dropdown
  const mics = await invoke<MicDevice[]>("list_microphones");
  micSelect.innerHTML = "";
  mics.forEach((mic) => {
    const option = document.createElement("option");
    option.value = mic.name;
    option.textContent = mic.name + (mic.is_default ? " (default)" : "");
    micSelect.appendChild(option);
  });
  micSelect.value = currentSettings.microphone;
  if (!micSelect.value && mics.length > 0) {
    micSelect.value = mics.find((mic) => mic.is_default)?.name ?? mics[0].name;
    currentSettings.microphone = micSelect.value;
    await saveSettings();
  }
  testMicBtn.disabled = mics.length === 0;

  // Engine
  setEngine(currentSettings.engine);

  // Clipboard behavior
  setAutoCopyAfterPaste(currentSettings.autoCopyAfterPaste);

  // Model
  modelSelect.value = currentSettings.whisperModel;
  await checkModelStatus();

  // Groq key
  groqKey.value = currentSettings.groqApiKey;

  // Recording mode
  setRecordingMode(currentSettings.recordingMode);

  // Hotkey
  hotkeyText.textContent = currentSettings.hotkey.replace("CmdOrCtrl", "Cmd");

  await loadHistory();
  await loadDictionary();
}

function setEngine(engine: string) {
  currentSettings.engine = engine;
  engineLocal.classList.toggle("active", engine === "local");
  engineCloud.classList.toggle("active", engine === "cloud");
  localSettings.classList.toggle("hidden", engine !== "local");
  cloudSettings.classList.toggle("hidden", engine !== "cloud");
}

function setRecordingMode(mode: string) {
  currentSettings.recordingMode = mode;
  modeToggle.classList.toggle("active", mode === "toggle");
  modePtt.classList.toggle("active", mode === "push-to-talk");
}

function setAutoCopyAfterPaste(enabled: boolean) {
  currentSettings.autoCopyAfterPaste = enabled;
  copyAfterPasteOn.classList.toggle("active", enabled);
  copyAfterPasteOff.classList.toggle("active", !enabled);
}

async function checkModelStatus() {
  const downloaded = await invoke<boolean>("check_model_downloaded", {
    modelSize: modelSelect.value,
  });
  downloadBtn.textContent = downloaded ? "\u2713" : "Download";
  (downloadBtn as HTMLButtonElement).disabled = downloaded;
}

async function saveSettings() {
  currentSettings.microphone = micSelect.value;
  currentSettings.whisperModel = modelSelect.value;
  currentSettings.groqApiKey = groqKey.value;
  await invoke("save_settings", { settings: currentSettings });
}

async function loadHistory() {
  historyEntries = await invoke<HistoryEntry[]>("get_history");
  renderHistory();
}

function formatHistoryDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function loadDictionary() {
  dictionaryEntries = await invoke<DictionaryEntry[]>("get_dictionary");
  renderDictionary();
}

function renderDictionary() {
  if (!dictionaryList || !dictionaryEmpty) return;

  if (dictionaryEntries.length === 0) {
    dictionaryEmpty.classList.remove("hidden");
    dictionaryList.classList.add("hidden");
    dictionaryList.innerHTML = "";
    return;
  }

  dictionaryEmpty.classList.add("hidden");
  dictionaryList.classList.remove("hidden");
  dictionaryList.innerHTML = dictionaryEntries
    .map(
      (entry) => `
        <article class="dictionary-card" data-dictionary-id="${entry.id}">
          <div class="dictionary-card-copy">
            <span class="dictionary-chip">Heard as</span>
            <h3>${escapeHtml(entry.heard)}</h3>
          </div>
          <div class="dictionary-arrow">→</div>
          <div class="dictionary-card-copy">
            <span class="dictionary-chip accent">Replace with</span>
            <h3>${escapeHtml(entry.replacement)}</h3>
          </div>
          <div class="dictionary-card-actions">
            <button class="btn-secondary dictionary-action danger" data-action="delete">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderHistory() {
  if (!historyList || !historyEmpty || !historyCount || !historyLatest) return;

  historyCount.textContent = String(historyEntries.length);
  historyLatest.textContent = historyEntries.length
    ? formatHistoryDate(historyEntries[0].created_at)
    : "No history yet";

  if (historyEntries.length === 0) {
    historyEmpty.classList.remove("hidden");
    historyList.classList.add("hidden");
    historyList.innerHTML = "";
    return;
  }

  historyEmpty.classList.add("hidden");
  historyList.classList.remove("hidden");
  historyList.innerHTML = historyEntries
    .map((entry) => {
      const preview = entry.text.length > 240 ? `${entry.text.slice(0, 240)}...` : entry.text;
      return `
        <article class="history-card" data-history-id="${entry.id}">
          <div class="history-card-head">
            <div>
              <div class="history-card-meta">
                <span>${formatHistoryDate(entry.created_at)}</span>
                <span class="history-dot"></span>
                <span>${escapeHtml(entry.engine)}</span>
              </div>
              <h3 class="history-card-title">${escapeHtml(preview)}</h3>
            </div>
            <div class="history-card-actions">
              <button class="btn-secondary history-action" data-action="copy">Copy</button>
              <button class="btn-secondary history-action" data-action="paste">Paste</button>
              <button class="btn-secondary history-action danger" data-action="delete">Delete</button>
            </div>
          </div>
          <p class="history-card-body">${escapeHtml(entry.text)}</p>
          <div class="history-card-foot">
            <span>${escapeHtml(entry.microphone)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function setMicTestStatus(message: string, tone: "success" | "error" | "info") {
  micTestStatus.textContent = message;
  micTestStatus.classList.remove("hidden", "success", "error", "info");
  micTestStatus.classList.add(tone);
}

function setDictionaryStatus(message: string, tone: "success" | "error" | "info") {
  if (!dictionaryStatus) return;
  dictionaryStatus.textContent = message;
  dictionaryStatus.classList.remove("hidden", "success", "error", "info");
  dictionaryStatus.classList.add(tone);
}

// Event listeners
engineLocal.addEventListener("click", () => {
  setEngine("local");
  saveSettings();
});

engineCloud.addEventListener("click", () => {
  setEngine("cloud");
  saveSettings();
});

micSelect.addEventListener("change", () => saveSettings());

testMicBtn.addEventListener("click", async () => {
  testMicBtn.disabled = true;
  testMicBtn.textContent = "Testing...";
  setMicTestStatus("Listening to the selected microphone...", "info");

  try {
    await invoke("test_microphone", { micName: micSelect.value });
    setMicTestStatus("Microphone is connected and responding.", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setMicTestStatus(message, "error");
  } finally {
    testMicBtn.disabled = micSelect.options.length === 0;
    testMicBtn.textContent = "Test Mic";
  }
});

copyAfterPasteOn.addEventListener("click", () => {
  setAutoCopyAfterPaste(true);
  saveSettings();
});

copyAfterPasteOff.addEventListener("click", () => {
  setAutoCopyAfterPaste(false);
  saveSettings();
});

clearHistoryBtn?.addEventListener("click", async () => {
  clearHistoryBtn.disabled = true;
  try {
    await invoke("clear_history");
    historyEntries = [];
    renderHistory();
  } finally {
    clearHistoryBtn.disabled = false;
  }
});

saveDictionaryBtn?.addEventListener("click", async () => {
  const heard = dictionaryHeard?.value.trim() ?? "";
  const replacement = dictionaryReplacement?.value.trim() ?? "";

  if (!heard || !replacement) {
    setDictionaryStatus("Enter both the heard phrase and the replacement text.", "error");
    return;
  }

  saveDictionaryBtn.disabled = true;
  try {
    const entry = await invoke<DictionaryEntry>("save_dictionary_entry", {
      heard,
      replacement,
    });
    dictionaryEntries = [entry, ...dictionaryEntries.filter((item) => item.id !== entry.id)];
    renderDictionary();
    if (dictionaryHeard) dictionaryHeard.value = "";
    if (dictionaryReplacement) dictionaryReplacement.value = "";
    setDictionaryStatus("Dictionary term saved. Future transcripts will use it.", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setDictionaryStatus(message, "error");
  } finally {
    saveDictionaryBtn.disabled = false;
  }
});

clearDictionaryBtn?.addEventListener("click", async () => {
  clearDictionaryBtn.disabled = true;
  try {
    await invoke("clear_dictionary");
    dictionaryEntries = [];
    renderDictionary();
    setDictionaryStatus("Dictionary cleared.", "info");
  } finally {
    clearDictionaryBtn.disabled = false;
  }
});

modelSelect.addEventListener("change", async () => {
  await checkModelStatus();
  saveSettings();
});

downloadBtn.addEventListener("click", async () => {
  (downloadBtn as HTMLButtonElement).disabled = true;
  downloadProgress.classList.remove("hidden");
  progressFill.style.width = "0%";

  try {
    await invoke("download_model", { modelSize: modelSelect.value });
    downloadBtn.textContent = "\u2713";
  } catch (e) {
    downloadBtn.textContent = "Retry";
    (downloadBtn as HTMLButtonElement).disabled = false;
    console.error("Download failed:", e);
  }
  downloadProgress.classList.add("hidden");
});

groqKey.addEventListener("change", () => saveSettings());

modeToggle.addEventListener("click", () => {
  setRecordingMode("toggle");
  saveSettings();
});

modePtt.addEventListener("click", () => {
  setRecordingMode("push-to-talk");
  saveSettings();
});

// Listen for recording state changes
listen<string>("recording-state", (event) => {
  const state = event.payload;
  if (!statusDot || !statusText) return;
  statusDot.className = "";
  if (state === "Recording") {
    statusDot.classList.add("recording");
    statusText.textContent = "Recording...";
  } else if (state === "Transcribing") {
    statusDot.classList.add("transcribing");
    statusText.textContent = "Transcribing...";
  } else {
    statusDot.classList.add("ready");
    statusText.textContent = "Ready";
  }
});

// Listen for download progress
listen<DownloadProgress>("download-progress", (event) => {
  const { percent } = event.payload;
  progressFill.style.width = `${percent}%`;
});

listen<HistoryEntry>("history-updated", (event) => {
  historyEntries = [event.payload, ...historyEntries.filter((entry) => entry.id !== event.payload.id)];
  renderHistory();
});

historyList?.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>(".history-action");
  if (!button) return;

  const card = button.closest<HTMLElement>("[data-history-id]");
  const entryId = card?.dataset.historyId;
  const action = button.dataset.action;
  if (!entryId || !action) return;

  button.disabled = true;
  try {
    if (action === "copy") {
      await invoke("copy_history_entry", { entryId });
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    } else if (action === "paste") {
      await invoke("paste_history_entry", { entryId });
      button.textContent = "Pasted";
      setTimeout(() => {
        button.textContent = "Paste";
      }, 1200);
    } else if (action === "delete") {
      await invoke("delete_history_entry", { entryId });
      historyEntries = historyEntries.filter((entry) => entry.id !== entryId);
      renderHistory();
    }
  } finally {
    if (action !== "delete") {
      button.disabled = false;
    }
  }
});

dictionaryList?.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>(".dictionary-action");
  if (!button) return;

  const card = button.closest<HTMLElement>("[data-dictionary-id]");
  const entryId = card?.dataset.dictionaryId;
  if (!entryId) return;

  button.disabled = true;
  try {
    await invoke("delete_dictionary_entry", { entryId });
    dictionaryEntries = dictionaryEntries.filter((entry) => entry.id !== entryId);
    renderDictionary();
    setDictionaryStatus("Dictionary term removed.", "info");
  } finally {
    button.disabled = false;
  }
});

// Initialize
loadSettings();
