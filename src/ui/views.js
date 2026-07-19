export function renderHomeScreen() {
  return `
    <section class="home-screen">
      <div class="mb-4">
        <h1>Какво подготвяте?</h1>
      </div>
      <div class="action-grid">
        ${homeButton("dose", "Доза от готов разтвор", "Колко mL да се изтеглят")}
        ${homeButton("dilution", "Разреждане до концентрация", "Колко лекарство и разтворител")}
        ${homeButton("reconstitution", "Разтваряне на флакон", "Крайна концентрация и обем")}
        ${homeButton("infusion", "Инфузионна скорост", "mL/h по доза или време")}
      </div>
    </section>
  `;
}

export function renderMenuItems() {
  return `
    ${menuButton("dose", "Доза от готов разтвор", "Обем за изтегляне")}
    ${menuButton("dilution", "Разреждане до концентрация", "Лекарство плюс разтворител")}
    ${menuButton("reconstitution", "Разтваряне на флакон", "Концентрация след разтваряне")}
    ${menuButton("infusion", "Инфузионна скорост", "Скорост на помпа")}
  `;
}

export function renderCalculatorScreen(calculator) {
  return `
    <section class="calculator-screen">
      <button type="button" class="btn btn-link px-0 mb-3" data-action="home">Назад</button>
      <div class="section-heading">
        <div class="section-title">
          <h1>${calculator.title}</h1>
          <p>${calculator.subtitle}</p>
        </div>
        <button type="button" class="btn btn-outline-primary btn-sm calculator-history-button" data-action="show-calculator-history">История</button>
      </div>
      ${formTemplates[calculator.render]()}
      <div id="result" class="mt-4"></div>
    </section>
  `;
}

export function renderResultPanel(result) {
  if (!result.ok) {
    return `
      <div class="alert alert-danger" role="alert">
        ${result.errors.map((error) => `<div>${error}</div>`).join("")}
      </div>
    `;
  }

  return `
    <section class="result-panel" aria-live="polite">
      <div class="result-primary">
        <span>Резултат</span>
        <strong>${result.primary}</strong>
      </div>
      ${result.warnings.length ? `<div class="alert alert-warning">${result.warnings.map((warning) => `<div>${warning}</div>`).join("")}</div>` : ""}
      ${result.notices?.length ? renderNoticeBlock(result.notices) : ""}
      <div class="result-block">
        <h2>Подготовка</h2>
        ${result.instructions.map((line) => `<p>${line}</p>`).join("")}
      </div>
      <div class="result-block">
        <h2>Проверка</h2>
        ${result.traces.map((line) => `<code>${line}</code>`).join("")}
      </div>
      <div class="result-actions">
        <button type="button" class="btn btn-outline-secondary btn-lg" data-action="start-over">Ново</button>
        <button type="button" class="btn btn-outline-primary btn-lg" data-action="share-calculation">QR код</button>
        <button type="button" class="btn btn-outline-primary btn-lg" data-action="save-favorite">Запази</button>
        <button type="button" class="btn btn-primary btn-lg" data-action="create-label">Етикет</button>
      </div>
    </section>
  `;
}

export function renderLabelModal() {
  return `
    <div class="modal fade" id="labelModal" tabindex="-1" aria-labelledby="labelModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="labelModalTitle">Етикет за подготовка</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body">
            <pre class="label-output" id="labelOutput"></pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-action="copy-label">Копирай</button>
            <button type="button" class="btn btn-primary" data-action="print-label">Печат</button>
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
            <h2 class="modal-title fs-5" id="shareModalTitle">QR код за изчислението</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body">
            <p class="share-help">Сканирането отваря същото изчисление и го преизчислява в браузъра.</p>
            <div class="qr-frame">
              <canvas id="shareQrCanvas" width="256" height="256" aria-label="QR код"></canvas>
            </div>
            <label class="form-label mt-3" for="shareUrl">Връзка</label>
            <textarea class="form-control share-url" id="shareUrl" rows="3" readonly></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-action="copy-share-link">Копирай връзка</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Готово</button>
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
            <h2 class="modal-title fs-5" id="historyModalTitle">История</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body" id="historyList"></div>
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
            <h2 class="modal-title fs-5" id="favoritesModalTitle">Запазени изчисления</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
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
              <h2 class="modal-title fs-5" id="favoriteNameModalTitle">Запази изчисление</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
            </div>
            <div class="modal-body">
              <label class="form-label" for="favoriteName">Име по желание</label>
              <input class="form-control form-control-lg" id="favoriteName" name="favoriteName" type="text" autocomplete="off" placeholder="например: честа подготовка">
              <div class="form-text">Не въвеждайте лични данни на пациент.</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отказ</button>
              <button type="submit" class="btn btn-primary">Запази</button>
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
    return `<p class="empty-state">Няма запазени изчисления.</p>`;
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
    return `<p class="empty-state">Няма последни изчисления.</p>`;
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
            <h2 class="modal-title fs-5" id="safetyModalTitle">Преди употреба</h2>
          </div>
          <div class="modal-body">
            <p>Използвайте само ако сте обучен медицински специалист.</p>
            <p>Проверете назначението, продукта, концентрацията и протокола независимо.</p>
            <p>Дозатор не препоръчва лекарство, доза, разтворител или срок на годност.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-lg w-100" data-bs-dismiss="modal" data-action="acknowledge">Разбирам</button>
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
        <button type="button" class="btn btn-sm btn-outline-primary" data-action="open-stored" data-stored-id="${entry.id}">Отвори</button>
        ${options.canDelete ? `<button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-favorite" data-stored-id="${entry.id}">Изтрий</button>` : ""}
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
    "Лекарство: __________",
    `Общо количество: ${result.label.totalAmount || "__________"}`,
    `Краен обем: ${result.label.finalVolume || "__________"}`,
    `Концентрация: ${result.label.concentration || "__________"}`,
    `Разтворител: ${diluent}`,
    `Подготвено: ${preparedAt}`,
    "Подготвено от: __________",
    "Проверено от: __________",
    "",
    "Подготовка:",
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
    <form class="calculator-form" data-form>
      <fieldset>
        <legend>Назначена доза</legend>
        ${numberWithUnit("requiredDose", "Доза", "125", ["g", "mg", "µg"], "mg")}
      </fieldset>
      <fieldset>
        <legend>Наличен разтвор</legend>
        ${numberWithUnit("availableAmount", "Количество", "250", ["g", "mg", "µg"], "mg")}
        ${numberWithUnit("availableVolume", "В обем", "5", ["L", "mL"], "mL")}
      </fieldset>
      ${highAlertToggle()}
      ${submitButton()}
    </form>
  `;
}

function renderDilutionForm() {
  return `
    <form class="calculator-form" data-form>
      <fieldset>
        <legend>Налична концентрация</legend>
        ${concentrationFields("available", "10", "1")}
      </fieldset>
      <fieldset>
        <legend>Желана концентрация</legend>
        ${concentrationFields("target", "2", "1")}
      </fieldset>
      <fieldset>
        <legend>Крайно количество</legend>
        ${numberWithUnit("finalVolume", "Краен обем", "20", ["L", "mL"], "mL")}
      </fieldset>
      ${diluentField()}
      ${highAlertToggle()}
      ${submitButton()}
    </form>
  `;
}

function renderReconstitutionForm() {
  return `
    <form class="calculator-form" data-form>
      <fieldset>
        <legend>Флакон</legend>
        ${numberWithUnit("vialAmount", "Количество лекарство във флакона", "1", ["g", "mg", "µg"], "g")}
      </fieldset>
      <fieldset>
        <legend>Разтваряне на праха</legend>
        ${numberWithUnit("diluentVolume", "Обем добавен разтворител", "10", ["L", "mL"], "mL")}
        ${numberWithUnit("finalVolume", "Краен обем след разтваряне", "10", ["L", "mL"], "mL")}
      </fieldset>
      <fieldset>
        <legend>Ако трябва конкретна доза</legend>
        ${numberWithUnit("requiredDose", "Доза, която трябва да се изтегли", "", ["g", "mg", "µg"], "mg", false)}
      </fieldset>
      ${diluentField()}
      ${highAlertToggle()}
      ${submitButton()}
    </form>
  `;
}

function renderInfusionForm() {
  return `
    <form class="calculator-form" data-form>
      <fieldset>
        <legend>Режим</legend>
        <div class="segmented" role="radiogroup" aria-label="Режим за инфузионна скорост">
          <input class="btn-check" type="radio" name="mode" id="mode-dose" value="doseRate" checked>
          <label class="btn btn-outline-primary" for="mode-dose">По доза</label>
          <input class="btn-check" type="radio" name="mode" id="mode-time" value="volumeTime">
          <label class="btn btn-outline-primary" for="mode-time">По време</label>
        </div>
      </fieldset>
      <div data-mode-panel="doseRate">
        <fieldset>
          <legend>Инфузия</legend>
          ${numberWithUnit("medicationAmount", "Количество лекарство", "500", ["g", "mg", "µg"], "mg")}
          ${numberWithUnit("finalVolume", "Краен обем", "250", ["L", "mL"], "mL")}
          ${numberWithUnit("prescribedRate", "Назначена скорост", "25", ["mg/h", "µg/h"], "mg/h")}
        </fieldset>
        ${highAlertToggle()}
      </div>
      <div data-mode-panel="volumeTime" hidden>
        <fieldset>
          <legend>Обем и време</legend>
          ${numberWithUnit("volume", "Обем", "500", ["L", "mL"], "mL")}
          ${numberWithUnit("time", "Време", "4", ["h", "min"], "h")}
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

function concentrationFields(prefix, amountValue, volumeValue) {
  return `
    ${numberWithUnit(`${prefix}Amount`, "Количество", amountValue, ["g", "mg", "µg"], "mg")}
    ${numberWithUnit(`${prefix}Volume`, "В обем", volumeValue, ["L", "mL"], "mL")}
  `;
}

function numberWithUnit(name, label, value, units, selectedUnit, required = true) {
  return `
    <div class="field-row">
      <label class="form-label" for="${name}">${label}</label>
      <div class="input-group input-group-lg">
        <input class="form-control" id="${name}" name="${name}" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]+([\\.,][0-9]+)?" value="${value}" ${required ? "required" : ""}>
        <select class="form-select unit-select" name="${name}Unit" aria-label="${label} единица">
          ${units.map((unit) => `<option value="${unit}" ${unit === selectedUnit ? "selected" : ""}>${unit}</option>`).join("")}
        </select>
      </div>
    </div>
  `;
}

function highAlertToggle() {
  return `
    <div class="form-check form-switch high-alert">
      <input class="form-check-input" type="checkbox" role="switch" name="highAlert" id="highAlert">
      <label class="form-check-label" for="highAlert">Високорисков медикамент</label>
    </div>
  `;
}

function diluentField() {
  return `
    <div class="field-row">
      <label class="form-label" for="diluent">Име на използвания разтворител</label>
      <input class="form-control form-control-lg" id="diluent" name="diluent" type="text" autocomplete="off" placeholder="попълва се от инструкция, аптека или протокол">
    </div>
  `;
}

function submitButton() {
  return `<button type="submit" class="btn btn-primary btn-lg w-100 calculate-button">Изчисли</button>`;
}

function renderNoticeBlock(notices) {
  return `
    <div class="result-block conversion-block">
      <h2>Преобразуване</h2>
      <div class="conversion-notice">Единиците са преобразувани за изчислението.</div>
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
