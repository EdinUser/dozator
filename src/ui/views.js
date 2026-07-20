import { bg } from "../i18n/bg.js";

export function renderHomeScreen() {
  return `
    <section class="home-screen">
      <div class="mb-4">
        <h1>${bg.home.title}</h1>
      </div>
      <div class="action-grid">
        ${homeButton("dose", bg.calculators.dose.title, bg.calculators.dose.homeDescription)}
        ${homeButton("dilution", bg.calculators.dilution.title, bg.calculators.dilution.homeDescription)}
        ${homeButton("reconstitution", bg.calculators.reconstitution.title, bg.calculators.reconstitution.homeDescription)}
        ${homeButton("infusion", bg.calculators.infusion.title, bg.calculators.infusion.homeDescription)}
      </div>
    </section>
  `;
}

export function renderMenuItems() {
  return `
    ${menuButton("dose", bg.calculators.dose.title, bg.calculators.dose.menuDescription)}
    ${menuButton("dilution", bg.calculators.dilution.title, bg.calculators.dilution.menuDescription)}
    ${menuButton("reconstitution", bg.calculators.reconstitution.title, bg.calculators.reconstitution.menuDescription)}
    ${menuButton("infusion", bg.calculators.infusion.title, bg.calculators.infusion.menuDescription)}
  `;
}

export function renderCalculatorScreen(calculator) {
  return `
    <section class="calculator-screen">
      <button type="button" class="btn btn-link px-0 mb-3" data-action="home">${bg.actions.back}</button>
      <div class="section-heading">
        <div class="section-title">
          <h1>${calculator.title}</h1>
          <p>${calculator.subtitle}</p>
        </div>
        <button type="button" class="btn btn-outline-primary btn-sm calculator-history-button" data-action="show-calculator-history">${bg.actions.history}</button>
      </div>
      ${formTemplates[calculator.render]()}
      <div id="result" class="mt-4"></div>
    </section>
  `;
}

export function renderClinicalValidationScreen() {
  return `
    <section class="calculator-screen">
      <button type="button" class="btn btn-link px-0 mb-3" data-action="home">${bg.actions.back}</button>
      <div class="section-heading">
        <div class="section-title">
          <h1>${bg.validation.title}</h1>
          <p>${bg.validation.intro}</p>
        </div>
      </div>
      <div class="validation-list">
        ${bg.validation.sections
          .map(
            (section) => `
              <section class="result-block">
                <h2>${section.title}</h2>
                ${section.lines.map((line) => `<p>${line}</p>`).join("")}
              </section>
            `,
          )
          .join("")}
      </div>
      <p class="form-text">${bg.validation.documentNote}</p>
    </section>
  `;
}

export function renderResultPanel(result) {
  if (!result.ok) {
    return `
      <div class="alert alert-danger result-alert" role="alert" aria-label="${bg.result.errorRegionLabel}" tabindex="-1" data-result-panel>
        ${result.errors.map((error) => `<div>${error}</div>`).join("")}
      </div>
    `;
  }

  return `
    <section class="result-panel" aria-live="polite" aria-atomic="false" aria-label="${bg.result.successRegionLabel}" tabindex="-1" data-result-panel>
      <div class="result-primary">
        <span>${bg.result.title}</span>
        <strong>${result.primary}</strong>
      </div>
      ${result.warnings.length ? `<div class="alert alert-warning" role="alert">${result.warnings.map((warning) => `<div>${warning}</div>`).join("")}</div>` : ""}
      ${result.notices?.length ? renderNoticeBlock(result.notices) : ""}
      <div class="result-block">
        <h2>${bg.result.preparation}</h2>
        ${result.instructions.map((line) => `<p>${line}</p>`).join("")}
      </div>
      <div class="result-block">
        <h2>${bg.result.verification}</h2>
        ${result.traces.map((line) => `<code>${line}</code>`).join("")}
      </div>
      <div class="result-actions">
        <button type="button" class="btn btn-outline-secondary btn-lg" data-action="start-over">${bg.actions.newCalculation}</button>
        <button type="button" class="btn btn-outline-primary btn-lg" data-action="share-calculation">${bg.actions.shareQr}</button>
        <button type="button" class="btn btn-outline-primary btn-lg" data-action="save-favorite">${bg.actions.save}</button>
        <button type="button" class="btn btn-primary btn-lg" data-action="create-label">${bg.actions.createLabel}</button>
      </div>
    </section>
  `;
}

export function renderRestoreWarning() {
  return `
    <div class="alert alert-warning restore-warning" role="alert" tabindex="-1">
      ${bg.safety.restoredCalculation}
    </div>
  `;
}

export function renderLabelModal() {
  return `
    <div class="modal fade" id="labelModal" tabindex="-1" aria-labelledby="labelModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="labelModalTitle">${bg.label.title}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${bg.actions.close}"></button>
          </div>
          <div class="modal-body">
            <pre class="label-output" id="labelOutput"></pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-action="copy-label">${bg.actions.copy}</button>
            <button type="button" class="btn btn-primary" data-action="print-label">${bg.actions.print}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderShareModal() {
  return `
    <div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shareModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="shareModalTitle">${bg.sharing.title}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${bg.actions.close}"></button>
          </div>
          <div class="modal-body">
            <p class="share-help">${bg.sharing.help}</p>
            <p class="share-help">${bg.sharing.disclaimer}</p>
            <div class="qr-frame">
              <canvas id="shareQrCanvas" width="256" height="256" aria-label="${bg.sharing.qrAriaLabel}"></canvas>
            </div>
            <label class="form-label mt-3" for="shareUrl">${bg.sharing.urlLabel}</label>
            <textarea class="form-control share-url" id="shareUrl" rows="3" readonly></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-action="copy-share-link">${bg.actions.copyLink}</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">${bg.actions.done}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderHistoryModal() {
  return `
    <div class="modal fade" id="historyModal" tabindex="-1" aria-labelledby="historyModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="historyModalTitle">${bg.storage.historyTitle}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${bg.actions.close}"></button>
          </div>
          <div class="modal-body" id="historyList"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-danger" data-action="clear-history">${bg.storage.clearHistory}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderFavoritesModal() {
  return `
    <div class="modal fade" id="favoritesModal" tabindex="-1" aria-labelledby="favoritesModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="favoritesModalTitle">${bg.storage.favoritesTitle}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${bg.actions.close}"></button>
          </div>
          <div class="modal-body" id="favoritesList"></div>
        </div>
      </div>
    </div>
  `;
}

export function renderFavoriteNameModal() {
  return `
    <div class="modal fade" id="favoriteNameModal" tabindex="-1" aria-labelledby="favoriteNameModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form data-favorite-form>
            <div class="modal-header">
              <h2 class="modal-title fs-5" id="favoriteNameModalTitle">${bg.storage.favoriteModalTitle}</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${bg.actions.close}"></button>
            </div>
            <div class="modal-body">
              <label class="form-label" for="favoriteName">${bg.storage.favoriteNameLabel}</label>
              <input class="form-control form-control-lg" id="favoriteName" name="favoriteName" type="text" autocomplete="off" placeholder="${bg.storage.favoriteNamePlaceholder}">
              <div class="form-text">${bg.storage.noPatientData}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">${bg.actions.cancel}</button>
              <button type="submit" class="btn btn-primary">${bg.actions.save}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function renderStoredList(entries, emptyText, calculatorTitles = {}) {
  if (!entries.length) {
    return `<p class="empty-state">${emptyText}</p>`;
  }

  return `
    <div class="stored-list">
      ${entries.map((entry) => storedItem(entry, { calculatorTitle: calculatorTitles[entry.calculator] })).join("")}
    </div>
  `;
}

export function renderGroupedFavorites(entries, calculatorTitles) {
  if (!entries.length) {
    return `<p class="empty-state">${bg.storage.noFavorites}</p>`;
  }

  const groups = entries.reduce((grouped, entry) => {
    grouped[entry.calculator] ||= [];
    grouped[entry.calculator].push(entry);
    return grouped;
  }, {});

  return Object.entries(groups)
    .map(
      ([calculator, groupEntries]) => `
        <section class="stored-group">
          <h3>${calculatorTitles[calculator] || calculator}</h3>
          <div class="stored-list">
            ${groupEntries.map((entry) => storedItem(entry, { canDelete: true })).join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

export function renderHistoryAccordion(entries, calculatorTitles) {
  if (!entries.length) {
    return `<p class="empty-state">${bg.storage.noHistory}</p>`;
  }

  const groups = entries.reduce((grouped, entry) => {
    grouped[entry.calculator] ||= [];
    grouped[entry.calculator].push(entry);
    return grouped;
  }, {});

  return `
    <div class="accordion stored-accordion" id="historyAccordion">
      ${Object.entries(groups)
        .map(([calculator, groupEntries], index) => historyAccordionItem(calculator, groupEntries, calculatorTitles[calculator] || calculator, index))
        .join("")}
    </div>
  `;
}

export function renderAcknowledgement() {
  return `
    <div class="modal fade" id="safetyModal" tabindex="-1" aria-labelledby="safetyModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="safetyModalTitle">${bg.safety.firstUseTitle}</h2>
          </div>
          <div class="modal-body">
            ${bg.safety.firstUseLines.map((line) => `<p>${line}</p>`).join("")}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-lg w-100" data-bs-dismiss="modal" data-action="acknowledge">${bg.safety.acknowledge}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function storedItem(entry, options = {}) {
  return `
    <article class="stored-item">
      <div>
        ${options.calculatorTitle ? `<span class="stored-type">${options.calculatorTitle}</span>` : ""}
        <strong>${entry.name || entry.summary}</strong>
        ${entry.name ? `<small>${entry.summary}</small>` : ""}
        <time>${formatStoredTime(entry.createdAt)}</time>
      </div>
      <div class="stored-actions">
        <button type="button" class="btn btn-sm btn-outline-primary" data-action="open-stored" data-stored-id="${entry.id}">${bg.actions.open}</button>
        ${options.canDelete ? `<button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-favorite" data-stored-id="${entry.id}">${bg.actions.delete}</button>` : ""}
      </div>
    </article>
  `;
}

function historyAccordionItem(calculator, entries, title, index) {
  const headingId = `history-heading-${calculator}`;
  const collapseId = `history-collapse-${calculator}`;
  const show = index === 0;

  return `
    <section class="accordion-item">
      <h3 class="accordion-header" id="${headingId}">
        <button class="accordion-button ${show ? "" : "collapsed"}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${show ? "true" : "false"}" aria-controls="${collapseId}">
          <span>${title}</span>
          <small>${entries.length}</small>
        </button>
      </h3>
      <div id="${collapseId}" class="accordion-collapse collapse ${show ? "show" : ""}" aria-labelledby="${headingId}" data-bs-parent="#historyAccordion">
        <div class="accordion-body">
          <div class="stored-list">
            ${entries.map((entry) => storedItem(entry)).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function formatStoredTime(value) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function labelText(result, diluent) {
  const preparedAt = new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return [
    bg.label.medication,
    bg.label.totalAmount(result.label.totalAmount),
    bg.label.finalVolume(result.label.finalVolume),
    bg.label.concentration(result.label.concentration),
    bg.label.diluent(diluent),
    bg.label.preparedAt(preparedAt),
    bg.label.preparedBy,
    bg.label.checkedBy,
    "",
    bg.label.recipeTitle,
    result.label.recipe,
  ].join("\n");
}

export function updateModePanels(activeMode) {
  document.querySelectorAll("[data-mode-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.modePanel !== activeMode;
  });
}

const formTemplates = {
  dose: renderDoseForm,
  dilution: renderDilutionForm,
  reconstitution: renderReconstitutionForm,
  infusion: renderInfusionForm,
};

function renderDoseForm() {
  return `
    <form class="calculator-form" data-form novalidate>
      <fieldset>
        <legend>${bg.forms.dose.prescribedDose}</legend>
        ${numberWithUnit("requiredDose", bg.forms.dose.dose, bg.forms.common.dosePlaceholder, ["g", "mg", "µg"], "mg")}
      </fieldset>
      <fieldset>
        <legend>${bg.forms.dose.availableSolution}</legend>
        ${numberWithUnit("availableAmount", bg.forms.dose.amount, bg.forms.common.amountPlaceholder, ["g", "mg", "µg"], "mg")}
        ${numberWithUnit("availableVolume", bg.forms.dose.inVolume, bg.forms.common.volumePlaceholder, ["L", "mL"], "mL")}
      </fieldset>
      ${highAlertToggle()}
      ${submitButton()}
    </form>
  `;
}

function renderDilutionForm() {
  return `
    <form class="calculator-form" data-form novalidate>
      <fieldset>
        <legend>${bg.forms.dilution.container}</legend>
        ${numberWithUnit("availableAmount", bg.forms.dilution.containerAmount, bg.forms.common.amountPlaceholder, ["g", "mg", "µg"], "mg")}
        ${numberWithUnit("availableVolume", bg.forms.dilution.containerVolume, bg.forms.common.volumePlaceholder, ["L", "mL"], "mL")}
      </fieldset>
      <fieldset>
        <legend>${bg.forms.dilution.target}</legend>
        ${concentrationField("targetConcentration", bg.forms.dilution.targetAmountPerMl, bg.forms.common.amountPerMlPlaceholder, "mg/mL")}
      </fieldset>
      ${diluentField()}
      ${highAlertToggle()}
      ${submitButton()}
    </form>
  `;
}

function renderReconstitutionForm() {
  return `
    <form class="calculator-form" data-form novalidate>
      <fieldset>
        <legend>${bg.forms.reconstitution.vial}</legend>
        ${numberWithUnit("vialAmount", bg.forms.reconstitution.vialAmount, bg.forms.common.amountPlaceholder, ["g", "mg", "µg"], "g")}
      </fieldset>
      <fieldset>
        <legend>${bg.forms.reconstitution.powderDissolving}</legend>
        ${numberWithUnit("diluentVolume", bg.forms.reconstitution.diluentVolume, bg.forms.common.volumePlaceholder, ["L", "mL"], "mL", false)}
        ${numberWithUnit("finalVolume", bg.forms.reconstitution.finalVolumeAfterDissolving, bg.forms.common.volumePlaceholder, ["L", "mL"], "mL", false)}
        ${concentrationField("targetConcentration", bg.forms.reconstitution.targetAmountPerMl, bg.forms.common.amountPerMlPlaceholder, "mg/mL", false)}
      </fieldset>
      <fieldset>
        <legend>${bg.forms.reconstitution.optionalDose}</legend>
        ${numberWithUnit("requiredDose", bg.forms.reconstitution.doseToWithdraw, bg.forms.common.dosePlaceholder, ["g", "mg", "µg"], "mg", false)}
      </fieldset>
      ${diluentField()}
      ${highAlertToggle()}
      ${submitButton()}
    </form>
  `;
}

function renderInfusionForm() {
  return `
    <form class="calculator-form" data-form novalidate>
      <fieldset>
        <legend>${bg.forms.infusion.mode}</legend>
        <div class="calculator-mode-options" role="radiogroup" aria-label="${bg.forms.infusion.modeAriaLabel}">
          <input class="btn-check" type="radio" name="mode" id="mode-dose" value="doseRate" checked>
          <label class="calculator-mode-option" for="mode-dose">
            <strong>${bg.forms.infusion.doseRateMode}</strong>
            <small>${bg.forms.infusion.doseRateDescription}</small>
          </label>
          <input class="btn-check" type="radio" name="mode" id="mode-time" value="volumeTime">
          <label class="calculator-mode-option" for="mode-time">
            <strong>${bg.forms.infusion.volumeTimeMode}</strong>
            <small>${bg.forms.infusion.volumeTimeDescription}</small>
          </label>
        </div>
      </fieldset>
      <div data-mode-panel="doseRate">
        <fieldset>
          <legend>${bg.forms.infusion.infusion}</legend>
          ${numberWithUnit("medicationAmount", bg.forms.infusion.medicationAmount, bg.forms.common.amountPlaceholder, ["g", "mg", "µg"], "mg")}
          ${numberWithUnit("finalVolume", bg.forms.infusion.finalVolume, bg.forms.common.volumePlaceholder, ["L", "mL"], "mL")}
          ${numberWithUnit("patientWeight", bg.forms.infusion.patientWeight, bg.forms.common.weightPlaceholder, ["kg"], "kg", false)}
          ${numberWithUnit("prescribedRate", bg.forms.infusion.prescribedRate, bg.forms.common.ratePlaceholder, ["mg/h", "µg/h", "mg/kg/h", "µg/kg/h", "mg/kg/min", "µg/kg/min"], "mg/h")}
          ${numberWithUnit("hoursToRun", bg.forms.infusion.hoursToRun, bg.forms.common.hoursPlaceholder, ["h"], "h", false)}
        </fieldset>
        ${highAlertToggle()}
      </div>
      <div data-mode-panel="volumeTime" hidden>
        <fieldset>
          <legend>${bg.forms.infusion.volumeTime}</legend>
          ${numberWithUnit("volume", bg.forms.infusion.volume, bg.forms.common.volumePlaceholder, ["L", "mL"], "mL")}
          ${numberWithUnit("time", bg.forms.infusion.time, bg.forms.common.timePlaceholder, ["h", "min"], "h")}
        </fieldset>
      </div>
      ${submitButton()}
    </form>
  `;
}

function homeButton(key, title, text) {
  return `
    <button class="main-action" type="button" data-calculator="${key}">
      <span>${title}</span>
      <small>${text}</small>
    </button>
  `;
}

function concentrationField(name, label, placeholder, selectedUnit, required = true) {
  return numberWithUnit(name, label, placeholder, ["mg/mL", "µg/mL", "%"], selectedUnit, required);
}

function numberWithUnit(name, label, placeholder, units, selectedUnit, required = true) {
  return `
    <div class="field-row">
      <label class="form-label" for="${name}">${label}</label>
      <div class="input-group input-group-lg">
        <input class="form-control" id="${name}" name="${name}" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]+([\\.,][0-9]+)?" placeholder="${placeholder}" ${required ? "required" : ""}>
        <select class="form-select unit-select" name="${name}Unit" aria-label="${bg.forms.common.unitAriaLabel(label)}">
          ${units.map((unit) => `<option value="${unit}" ${unit === selectedUnit ? "selected" : ""}>${unit}</option>`).join("")}
        </select>
      </div>
      <div class="invalid-feedback field-error" id="${name}Error"></div>
    </div>
  `;
}

function highAlertToggle() {
  return `
    <div class="form-check form-switch high-alert">
      <input class="form-check-input" type="checkbox" role="switch" name="highAlert" id="highAlert">
      <label class="form-check-label" for="highAlert">${bg.forms.common.highAlertLabel}</label>
    </div>
  `;
}

function diluentField() {
  return `
    <div class="field-row">
      <label class="form-label" for="diluent">${bg.forms.common.diluentLabel}</label>
      <input class="form-control form-control-lg" id="diluent" name="diluent" type="text" autocomplete="off" placeholder="${bg.forms.common.diluentPlaceholder}">
    </div>
  `;
}

function submitButton() {
  return `<button type="submit" class="btn btn-primary btn-lg w-100 calculate-button">${bg.actions.calculate}</button>`;
}

function renderNoticeBlock(notices) {
  return `
    <div class="result-block conversion-block">
      <h2>${bg.result.conversionTitle}</h2>
      <div class="conversion-notice">${bg.result.conversionNotice}</div>
      ${notices.map((line) => `<code>${line}</code>`).join("")}
    </div>
  `;
}

function menuButton(key, title, text) {
  return `
    <button class="menu-item" type="button" data-calculator="${key}">
      <span>${title}</span>
      <small>${text}</small>
    </button>
  `;
}
