# Тестване

Този проект третира формулите, преобразуванията и предпазните проверки като основен риск. UI тестовете са важни, но не трябва да заменят директните тестове на изчислителните модули.

## Нива

- Unit тестове: проверяват `src/calculators`, `src/units`, `src/safety`, `src/share` и `src/storage` без браузър.
- Golden regression тестове: фиксират очакваните резултати, инструкции, проверки на сметката и данни за етикет за основните сценарии.
- E2E тестове: проверяват реалното въвеждане през интерфейса в desktop и mobile Chromium.
- Accessibility тестове: използват axe за WCAG 2A/2AA сериозни и критични нарушения, плюс клавиатурна навигация за основни пътища.
- Offline тестове: проверяват, че PWA shell може да се зареди след първоначално отваряне без интернет.

## Команди

```bash
npm test
npm run build
npm run test:e2e
npm run test:all
```

Преди първото локално пускане на E2E тестовете инсталирайте Chromium за Playwright:

```bash
npx playwright install chromium
```

## Минимално очаквано покритие

- Четирите калкулатора трябва да имат директни unit/golden тестове за формула, основен резултат, инструкции и проверка на сметката.
- Преобразуванията `mg` към `µg`, `µg` към `mg`, `mL` към `L` и `L` към `mL` трябва да имат unit тестове.
- Нулеви, отрицателни, липсващи и невъзможни стойности трябва да връщат грешка към конкретното поле.
- Restore от QR, история и шаблон трябва да преизчислява локално и да показва предупреждение за повторна проверка.
- E2E тестовете трябва да проверяват както числения резултат, така и видимия текст на инструкцията.

## Какво Пази Всеки Test File

- `tests/units.test.js`: decimal parser, leading/trailing zero formatting, mass/volume/time conversions и conversion trace strings.
- `tests/calculators.test.js`: основни формули и warning behavior за calculator modules.
- `tests/calculation-guards.test.js`: невъзможни/подозрителни стойности, small volume warnings и high-alert warning.
- `tests/calculator-golden.test.js`: точен contract за основните сценарии, включително `primary`, `instructions`, `traces`, `finalLines` и `label`.
- `tests/regression-safety.test.js`: field-level error metadata, mixed-unit conversion regression и immutability на storage entries.
- `tests/share-link.test.js`: QR/hash encode/decode и allowlist behavior.
- `tests/calculation-store.test.js`: history limit, templates и localStorage behavior.
- `tests/views.test.js`: важни UI render fragments.
- `tests/pwa.test.js`: service worker asset extraction и cache behavior helpers.
- `tests/e2e/calculators.spec.js`: реални calculator workflows през UI.
- `tests/e2e/restore-and-offline.spec.js`: QR restore, history restore, template restore и offline reload.
- `tests/e2e/accessibility.spec.js`: automated accessibility checks и keyboard path.

## Кога Да Се Добавя Тест

- Формула или unit conversion: unit test плюс golden test.
- Текст на инструкция или label: golden test плюс E2E assertion, ако текстът е user-visible в основен workflow.
- Ново form поле: unit/golden, share allowlist test, restore E2E и history/template check.
- Safety warning: unit/regression test и поне един UI/E2E assertion, ако warning-ът е видим.
- PWA/service worker промяна: unit test за helper behavior и offline E2E.
- Accessibility промяна: E2E/axe test или explicit keyboard assertion.

## Flakiness Бележки

Playwright е конфигуриран с `workers: 1`, защото PWA/service-worker state и shared origin behavior могат да направят offline/restore тестовете нестабилни при паралелно изпълнение.

Accessibility helper-ът blur-ва активния елемент преди axe scan. Това стабилизира mobile Chromium tap-active rendering. Keyboard focus behavior се проверява отделно в същия spec и не трябва да се премахва.

## CI Очакване

PR към `main` трябва да мине:

- `npm ci`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Push към `main` прави същото преди production deploy.
