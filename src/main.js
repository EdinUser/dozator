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
  renderClinicalValidationScreen,
  renderHomeScreen,
  renderMenuItems,
  renderLabelModal,
  renderRestoreWarning,
  renderStoredList,
  renderResultPanel,
  renderShareModal,
  updateModePanels,
} from "./ui/views.js";
import { buildShareUrl, readSharedCalculation } from "./share/share-link.js";
import { clearHistory, deleteFavorite, makeCalculationEntry, readFavorites, readHistory, saveFavorite, saveHistoryEntry } from "./storage/calculation-store.js";
import { calculationSummary } from "./storage/summaries.js";
import { bg } from "./i18n/bg.js";

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
let currentHistoryCalculator = null;

const calculators = {
  dose: {
    title: bg.calculators.dose.title,
    subtitle: bg.calculators.dose.subtitle,
    render: "dose",
    calculate: calculateDose,
  },
  dilution: {
    title: bg.calculators.dilution.title,
    subtitle: bg.calculators.dilution.subtitle,
    render: "dilution",
    calculate: calculateDilution,
  },
  reconstitution: {
    title: bg.calculators.reconstitution.title,
    subtitle: bg.calculators.reconstitution.subtitle,
    render: "reconstitution",
    calculate: calculateReconstitution,
  },
  infusion: {
    title: bg.calculators.infusion.title,
    subtitle: bg.calculators.infusion.subtitle,
    render: "infusion",
    calculate: calculateInfusion,
  },
};

renderApp();

function renderApp() {
  app.innerHTML = `
    <a class="skip-link" href="#screen">${bg.app.skipToContent}</a>
    <header class="app-header">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between gap-3">
          <button class="brand-button" type="button" data-action="home" aria-label="${bg.app.home}">
            <img class="brand-icon" src="/favicon.svg" alt="" aria-hidden="true">
            <span>${bg.app.name}</span>
          </button>
          <div class="header-actions">
            <button class="btn btn-sm btn-light" type="button" data-action="toggle-theme" id="themeToggle"></button>
            <button class="btn btn-sm btn-light fav-shortcut" type="button" data-action="show-favorites" aria-label="${bg.storage.favoritesTitle}">☆</button>
            <button class="btn btn-sm btn-light" type="button" data-bs-toggle="offcanvas" data-bs-target="#appMenu" aria-controls="appMenu" aria-label="${bg.app.menu}">
              ${bg.app.menu}
            </button>
          </div>
        </div>
        <div class="safety-strip mt-3" role="note">
          ${bg.app.safetyStrip}
        </div>
      </div>
    </header>

    <main class="container app-main">
      <section id="screen" tabindex="-1"></section>
    </main>

    ${renderLabelModal()}
    ${renderShareModal()}
    ${renderHistoryModal()}
    ${renderFavoritesModal()}
    ${renderFavoriteNameModal()}
    ${renderAcknowledgement()}
    <div class="offcanvas offcanvas-end" tabindex="-1" id="appMenu" aria-labelledby="appMenuTitle">
      <div class="offcanvas-header">
        <h2 class="offcanvas-title fs-5" id="appMenuTitle">${bg.app.menu}</h2>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="${bg.actions.close}"></button>
      </div>
      <div class="offcanvas-body">
        <div class="menu-section-title">${bg.menu.calculators}</div>
        <div class="menu-list">
          ${renderMenuItems()}
        </div>
        <div class="menu-placeholder mt-4">
          <div class="menu-section-title">${bg.menu.memory}</div>
          <button class="menu-item" type="button" data-action="show-history">
            <span>${bg.actions.history}</span>
            <small>${bg.menu.historyDescription}</small>
          </button>
          <button class="menu-item" type="button" data-action="show-favorites">
            <span>${bg.menu.savedTitle}</span>
            <small>${bg.menu.savedDescription}</small>
          </button>
        </div>
        <div class="menu-placeholder mt-4">
          <div class="menu-section-title">${bg.menu.safetyAndValidation}</div>
          <button class="menu-item" type="button" data-action="show-clinical-validation">
            <span>${bg.menu.validationTitle}</span>
            <small>${bg.menu.validationDescription}</small>
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
  app.addEventListener("input", handleInput);
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

  if (action === "clear-history") {
    clearHistory(localStorage);
    showHistory(currentHistoryCalculator);
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

  if (action === "show-clinical-validation") {
    activeCalculator = null;
    lastResult = null;
    lastSubmittedValues = null;
    hideOpenMenu();
    renderClinicalValidation();
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
  clearFieldErrors(form);
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
    focusResult();
    return;
  }

  form.classList.remove("is-collapsed");
  form.setAttribute("aria-expanded", "true");
  applyFieldErrors(form, result.fieldErrors || []);
  focusFirstError(form);
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

function handleInput(event) {
  if (event.target.matches("[data-form] .form-control")) {
    clearFieldError(event.target);
  }
}

function renderHome() {
  document.querySelector("#screen").innerHTML = renderHomeScreen();
}

function renderCalculator(key) {
  document.querySelector("#screen").innerHTML = renderCalculatorScreen(calculators[key]);
}

function renderClinicalValidation() {
  document.querySelector("#screen").innerHTML = renderClinicalValidationScreen();
}

function openStoredEntry(id) {
  const entry = [...readHistory(localStorage), ...readFavorites(localStorage)].find((storedEntry) => storedEntry.id === id);

  if (!entry || !calculators[entry.calculator]) {
    return;
  }

  historyModal.hide();
  favoritesModal.hide();
  loadCalculation(entry.calculator, entry.values, { restored: true });
}

function showHistory(calculator = null) {
  currentHistoryCalculator = calculator;
  const title = calculator ? bg.storage.historyForCalculator(calculators[calculator].title) : bg.storage.historyTitle;
  const emptyText = calculator ? bg.storage.noCalculatorHistory : bg.storage.noHistory;
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

function loadCalculation(calculator, values, options = {}) {
  activeCalculator = calculator;
  lastSubmittedValues = values;
  renderCalculator(calculator);
  restoreFormValues(values);

  const result = calculators[calculator].calculate(values);
  lastResult = result.ok ? result : null;
  document.querySelector("#result").innerHTML = `${options.restored ? renderRestoreWarning() : ""}${renderResultPanel(result)}`;

  const form = document.querySelector("[data-form]");
  if (result.ok && form) {
    form.insertAdjacentHTML("beforebegin", collapsedInputSummary(calculator, values));
    form.classList.add("is-collapsed");
    form.setAttribute("aria-expanded", "false");
  }
  focusResult();
}

function loadSharedCalculation() {
  const shared = readSharedCalculation();

  if (!shared || !calculators[shared.calculator]) {
    return false;
  }

  activeCalculator = shared.calculator;
  loadCalculation(shared.calculator, shared.values, { restored: true });

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

function clearFieldErrors(form) {
  form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    clearFieldError(field);
  });

  form.querySelectorAll(".field-row.has-error").forEach((row) => row.classList.remove("has-error"));
  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function clearFieldError(field) {
  field.removeAttribute("aria-invalid");
  field.classList.remove("is-invalid");

  const describedBy = (field.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter((id) => id && !id.endsWith("Error"))
    .join(" ");

  if (describedBy) {
    field.setAttribute("aria-describedby", describedBy);
  } else {
    field.removeAttribute("aria-describedby");
  }

  const error = document.querySelector(`#${field.name}Error`);
  error?.closest(".field-row")?.classList.remove("has-error");

  if (error) {
    error.textContent = "";
  }
}

function applyFieldErrors(form, fieldErrors) {
  fieldErrors.forEach((fieldError) => {
    const field = form.querySelector(`[name="${fieldError.name}"]`);
    const error = form.querySelector(`#${fieldError.name}Error`);

    if (!field || !error) {
      return;
    }

    const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    describedBy.add(error.id);
    field.setAttribute("aria-describedby", [...describedBy].join(" "));
    field.setAttribute("aria-invalid", "true");
    field.classList.add("is-invalid");
    error.textContent = fieldError.message;
    error.closest(".field-row")?.classList.add("has-error");
  });
}

function focusFirstError(form) {
  const firstInvalidField = form.querySelector("[aria-invalid='true']");

  if (firstInvalidField) {
    firstInvalidField.focus();
    return;
  }

  focusResult();
}

function focusResult() {
  document.querySelector("[data-result-panel]")?.focus({ preventScroll: false });
}

function collapsedInputSummary(key, values) {
  const lines = bg.inputSummary[key](values);

  return `
    <section class="input-summary" data-input-summary>
      <div>
        <span>${bg.result.enteredData}</span>
        <strong>${calculators[key].title}</strong>
        ${lines.map((line) => `<small>${line}</small>`).join("")}
      </div>
      <button type="button" class="btn btn-outline-primary" data-action="edit-input">${bg.actions.edit}</button>
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
    toggle.textContent = theme === "dark" ? bg.theme.lightButton : bg.theme.darkButton;
    toggle.setAttribute("aria-label", theme === "dark" ? bg.theme.enableLight : bg.theme.enableDark);
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
