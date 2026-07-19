import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import QRCode from "qrcode";
import "./styles.css";
import { calculateDose } from "./calculators/dose.js";
import { calculateDilution } from "./calculators/dilution.js";
import { calculateReconstitution } from "./calculators/reconstitution.js";
import { calculateInfusionDoseRate, calculateInfusionVolumeTime } from "./calculators/infusion.js";
import {
  labelText,
  renderAcknowledgement,
  renderCalculatorScreen,
  renderFavoriteNameModal,
  renderFavoritesModal,
  renderGroupedFavorites,
  renderHistoryAccordion,
  renderHistoryModal,
  renderHomeScreen,
  renderMenuItems,
  renderLabelModal,
  renderStoredList,
  renderResultPanel,
  renderShareModal,
  updateModePanels,
} from "./ui/views.js";
import { buildShareUrl, readSharedCalculation } from "./share/share-link.js";
import { deleteFavorite, makeCalculationEntry, readFavorites, readHistory, saveFavorite, saveHistoryEntry } from "./storage/calculation-store.js";
import { calculationSummary } from "./storage/summaries.js";

const acknowledgementKey = "dozator-safety-acknowledged";
const themeKey = "dozator-theme";
const app = document.querySelector("#app");
let activeCalculator = null;
let lastResult = null;
let lastSubmittedValues = null;
let labelModal = null;
let shareModal = null;
let historyModal = null;
let favoritesModal = null;
let favoriteNameModal = null;

const calculators = {
  dose: {
    title: "Доза от готов разтвор",
    subtitle: "Изчислява обема за изтегляне от налична концентрация.",
    render: "dose",
    calculate: calculateDose,
  },
  dilution: {
    title: "Разреждане до концентрация",
    subtitle: "Изчислява лекарство и разтворител за желана крайна концентрация.",
    render: "dilution",
    calculate: calculateDilution,
  },
  reconstitution: {
    title: "Разтваряне на флакон",
    subtitle: "Изчислява концентрация след разтваряне и обем за изтегляне.",
    render: "reconstitution",
    calculate: calculateReconstitution,
  },
  infusion: {
    title: "Инфузионна скорост",
    subtitle: "Изчислява mL/h по доза или по обем и време.",
    render: "infusion",
    calculate: calculateInfusion,
  },
};

renderApp();

function renderApp() {
  app.innerHTML = `
    <header class="app-header">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between gap-3">
          <button class="brand-button" type="button" data-action="home" aria-label="Начало">Дозатор</button>
          <div class="header-actions">
            <button class="btn btn-sm btn-light" type="button" data-action="toggle-theme" id="themeToggle"></button>
            <button class="btn btn-sm btn-light fav-shortcut" type="button" data-action="show-favorites" aria-label="Запазени изчисления">☆</button>
            <button class="btn btn-sm btn-light" type="button" data-bs-toggle="offcanvas" data-bs-target="#appMenu" aria-controls="appMenu" aria-label="Меню">
              Меню
            </button>
          </div>
        </div>
        <div class="safety-strip mt-3" role="note">
          Проверява аритметиката. Не замества назначение, инструкция на производителя, аптека или болничен протокол.
        </div>
      </div>
    </header>

    <main class="container app-main">
      <section id="screen"></section>
    </main>

    ${renderLabelModal()}
    ${renderShareModal()}
    ${renderHistoryModal()}
    ${renderFavoritesModal()}
    ${renderFavoriteNameModal()}
    ${renderAcknowledgement()}
    <div class="offcanvas offcanvas-end" tabindex="-1" id="appMenu" aria-labelledby="appMenuTitle">
      <div class="offcanvas-header">
        <h2 class="offcanvas-title fs-5" id="appMenuTitle">Меню</h2>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Затвори"></button>
      </div>
      <div class="offcanvas-body">
        <div class="menu-section-title">Калкулатори</div>
        <div class="menu-list">
          ${renderMenuItems()}
        </div>
        <div class="menu-placeholder mt-4">
          <div class="menu-section-title">Памет</div>
          <button class="menu-item" type="button" data-action="show-history">
            <span>История</span>
            <small>Последните 10 за всеки калкулатор</small>
          </button>
          <button class="menu-item" type="button" data-action="show-favorites">
            <span>Запазени</span>
            <small>Често използвани изчисления</small>
          </button>
        </div>
      </div>
    </div>
  `;

  labelModal = new bootstrap.Modal(document.querySelector("#labelModal"));
  shareModal = new bootstrap.Modal(document.querySelector("#shareModal"));
  historyModal = new bootstrap.Modal(document.querySelector("#historyModal"));
  favoritesModal = new bootstrap.Modal(document.querySelector("#favoritesModal"));
  favoriteNameModal = new bootstrap.Modal(document.querySelector("#favoriteNameModal"));
  applyTheme(getTheme());
  wireEvents();
  if (!loadSharedCalculation()) {
    renderHome();
  }
  showFirstUseNotice();
}

function wireEvents() {
  app.addEventListener("click", handleClick);
  app.addEventListener("submit", handleSubmit);
  app.addEventListener("change", handleChange);
}

function handleClick(event) {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const calculator = event.target.closest("[data-calculator]")?.dataset.calculator;

  if (calculator) {
    activeCalculator = calculator;
    lastResult = null;
    lastSubmittedValues = null;
    hideOpenMenu();
    renderCalculator(calculator);
    return;
  }

  if (action === "home" || action === "start-over") {
    activeCalculator = null;
    lastResult = null;
    lastSubmittedValues = null;
    hideOpenMenu();
    renderHome();
    return;
  }

  if (action === "toggle-theme") {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
    return;
  }

  if (action === "acknowledge") {
    localStorage.setItem(acknowledgementKey, "yes");
    return;
  }

  if (action === "create-label" && lastResult) {
    populateLabel(lastResult);
    labelModal.show();
    return;
  }

  if (action === "copy-label") {
    copyLabel();
    return;
  }

  if (action === "print-label") {
    window.print();
    return;
  }

  if (action === "edit-input") {
    document.querySelector("[data-input-summary]")?.remove();
    const form = document.querySelector("[data-form]");
    form?.classList.remove("is-collapsed");
    form?.setAttribute("aria-expanded", "true");
    return;
  }

  if (action === "share-calculation" && lastResult && lastSubmittedValues) {
    showShareQr();
    return;
  }

  if (action === "copy-share-link") {
    copyShareLink();
    return;
  }

  if (action === "save-favorite" && lastResult && lastSubmittedValues) {
    document.querySelector("#favoriteName").value = "";
    favoriteNameModal.show();
    return;
  }

  if (action === "show-history") {
    hideOpenMenu();
    showHistory();
    return;
  }

  if (action === "show-calculator-history" && activeCalculator) {
    showHistory(activeCalculator);
    return;
  }

  if (action === "show-favorites") {
    hideOpenMenu();
    showFavorites();
    return;
  }

  if (action === "open-stored") {
    openStoredEntry(event.target.closest("[data-stored-id]").dataset.storedId);
    return;
  }

  if (action === "delete-favorite") {
    deleteFavorite(localStorage, event.target.closest("[data-stored-id]").dataset.storedId);
    showFavorites();
  }
}

function handleSubmit(event) {
  if (event.target.matches("[data-favorite-form]")) {
    handleFavoriteSubmit(event);
    return;
  }

  if (!event.target.matches("[data-form]")) {
    return;
  }

  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(new FormData(form).entries());
  values.highAlert = form.querySelector("[name='highAlert']")?.checked ?? false;

  const result = calculators[activeCalculator].calculate(values);
  lastResult = result.ok ? result : null;
  lastSubmittedValues = result.ok ? values : null;
  document.querySelector("#result").innerHTML = renderResultPanel(result);

  if (result.ok) {
    saveHistoryEntry(localStorage, makeCalculationEntry(activeCalculator, calculationSummary(activeCalculator, values), values));
    document.querySelector("[data-input-summary]")?.remove();
    form.insertAdjacentHTML("beforebegin", collapsedInputSummary(activeCalculator, values));
    form.classList.add("is-collapsed");
    form.setAttribute("aria-expanded", "false");
    return;
  }

  form.classList.remove("is-collapsed");
  form.setAttribute("aria-expanded", "true");
}

function handleFavoriteSubmit(event) {
  event.preventDefault();

  if (!lastSubmittedValues) {
    return;
  }

  const name = new FormData(event.target).get("favoriteName") || "";
  saveFavorite(localStorage, makeCalculationEntry(activeCalculator, calculationSummary(activeCalculator, lastSubmittedValues), lastSubmittedValues, name));
  favoriteNameModal.hide();
}

function handleChange(event) {
  if (event.target.matches("[name='mode']")) {
    updateModePanels(event.target.value);
  }
}

function renderHome() {
  document.querySelector("#screen").innerHTML = renderHomeScreen();
}

function renderCalculator(key) {
  document.querySelector("#screen").innerHTML = renderCalculatorScreen(calculators[key]);
}

function openStoredEntry(id) {
  const entry = [...readHistory(localStorage), ...readFavorites(localStorage)].find((storedEntry) => storedEntry.id === id);

  if (!entry || !calculators[entry.calculator]) {
    return;
  }

  historyModal.hide();
  favoritesModal.hide();
  loadCalculation(entry.calculator, entry.values);
}

function showHistory(calculator = null) {
  const title = calculator ? `История: ${calculators[calculator].title}` : "История";
  const emptyText = calculator ? "Няма последни изчисления за този калкулатор." : "Няма последни изчисления.";
  document.querySelector("#historyModalTitle").textContent = title;
  document.querySelector("#historyList").innerHTML = calculator
    ? renderStoredList(readHistory(localStorage, calculator), emptyText, calculatorTitles())
    : renderHistoryAccordion(readHistory(localStorage), calculatorTitles());
  historyModal.show();
}

function showFavorites() {
  document.querySelector("#favoritesList").innerHTML = renderGroupedFavorites(readFavorites(localStorage), calculatorTitles());
  favoritesModal.show();
}

function calculatorTitles() {
  return Object.fromEntries(Object.entries(calculators).map(([key, calculator]) => [key, calculator.title]));
}

function loadCalculation(calculator, values) {
  activeCalculator = calculator;
  lastSubmittedValues = values;
  renderCalculator(calculator);
  restoreFormValues(values);

  const result = calculators[calculator].calculate(values);
  lastResult = result.ok ? result : null;
  document.querySelector("#result").innerHTML = renderResultPanel(result);

  const form = document.querySelector("[data-form]");
  if (result.ok && form) {
    form.insertAdjacentHTML("beforebegin", collapsedInputSummary(calculator, values));
    form.classList.add("is-collapsed");
    form.setAttribute("aria-expanded", "false");
  }
}

function loadSharedCalculation() {
  const shared = readSharedCalculation();

  if (!shared || !calculators[shared.calculator]) {
    return false;
  }

  activeCalculator = shared.calculator;
  loadCalculation(shared.calculator, shared.values);

  return true;
}

function restoreFormValues(values) {
  Object.entries(values).forEach(([name, value]) => {
    const field =
      name === "mode"
        ? document.querySelector(`[name="${name}"][value="${value}"]`)
        : document.querySelector(`[name="${name}"]`);

    if (!field) {
      return;
    }

    if (field.type === "checkbox") {
      field.checked = value === true || value === "on";
      return;
    }

    if (field.type === "radio") {
      field.checked = true;
      return;
    }

    field.value = value;
  });

  const mode = document.querySelector("[name='mode']:checked")?.value;
  if (mode) {
    updateModePanels(mode);
  }
}

function collapsedInputSummary(key, values) {
  const lines = {
    dose: [`Доза: ${values.requiredDose} ${values.requiredDoseUnit}`, `Налично: ${values.availableAmount} ${values.availableAmountUnit} в ${values.availableVolume} ${values.availableVolumeUnit}`],
    dilution: [`Налично: ${values.availableAmount} ${values.availableAmountUnit} в ${values.availableVolume} ${values.availableVolumeUnit}`, `Желано: ${values.targetAmount} ${values.targetAmountUnit} в ${values.targetVolume} ${values.targetVolumeUnit}`, `Краен обем: ${values.finalVolume} ${values.finalVolumeUnit}`],
    reconstitution: [`Флакон: ${values.vialAmount} ${values.vialAmountUnit}`, `Разтворител: ${values.diluentVolume} ${values.diluentVolumeUnit}`, `Краен обем: ${values.finalVolume} ${values.finalVolumeUnit}`],
    infusion:
      values.mode === "volumeTime"
        ? [`Обем: ${values.volume} ${values.volumeUnit}`, `Време: ${values.time} ${values.timeUnit}`]
        : [`Количество: ${values.medicationAmount} ${values.medicationAmountUnit}`, `Краен обем: ${values.finalVolume} ${values.finalVolumeUnit}`, `Скорост: ${values.prescribedRate} ${values.prescribedRateUnit}`],
  }[key];

  return `
    <section class="input-summary" data-input-summary>
      <div>
        <span>Въведени данни</span>
        <strong>${calculators[key].title}</strong>
        ${lines.map((line) => `<small>${line}</small>`).join("")}
      </div>
      <button type="button" class="btn btn-outline-primary" data-action="edit-input">Промени</button>
    </section>
  `;
}

function showFirstUseNotice() {
  if (localStorage.getItem(acknowledgementKey)) {
    return;
  }

  const modal = new bootstrap.Modal(document.querySelector("#safetyModal"), {
    backdrop: "static",
    keyboard: false,
  });
  modal.show();
}

function getTheme() {
  return localStorage.getItem(themeKey) || "light";
}

function applyTheme(theme) {
  localStorage.setItem(themeKey, theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  const toggle = document.querySelector("#themeToggle");

  if (toggle) {
    toggle.textContent = theme === "dark" ? "Светла" : "Тъмна";
    toggle.setAttribute("aria-label", theme === "dark" ? "Включи светла тема" : "Включи тъмна тема");
  }
}

function hideOpenMenu() {
  const menu = document.querySelector("#appMenu.show");

  if (menu) {
    bootstrap.Offcanvas.getOrCreateInstance(menu).hide();
  }
}

function calculateInfusion(input) {
  return input.mode === "volumeTime" ? calculateInfusionVolumeTime(input) : calculateInfusionDoseRate(input);
}

function populateLabel(result) {
  const diluent = document.querySelector("[name='diluent']")?.value?.trim() || "__________";
  document.querySelector("#labelOutput").textContent = labelText(result, diluent);
}

async function copyLabel() {
  const text = document.querySelector("#labelOutput").textContent;
  await navigator.clipboard.writeText(text);
}

async function showShareQr() {
  const shareUrl = buildShareUrl(activeCalculator, lastSubmittedValues);
  const canvas = document.querySelector("#shareQrCanvas");
  const urlField = document.querySelector("#shareUrl");

  urlField.value = shareUrl;
  await QRCode.toCanvas(canvas, shareUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 256,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  shareModal.show();
}

async function copyShareLink() {
  await navigator.clipboard.writeText(document.querySelector("#shareUrl").value);
}
