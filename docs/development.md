# Разработка

Този документ описва ежедневния workflow за промени по `Дозатор`.

## Локална среда

Изисквания:

- Node.js 24
- npm
- Chromium за Playwright

Инсталация:

```bash
npm install
npx playwright install chromium
```

Стартиране:

```bash
npm run dev
```

За достъп от локалната мрежа:

```bash
npm run dev -- --host 0.0.0.0
```

Vite ще покаже локален и network URL.

## Branch Workflow

- `main` е защитен.
- Работете в feature/docs/test branch.
- PR/MR към `main` се приема само от собственика на проекта.
- Няма изискване за отделен reviewer, защото проектът се разработва от един човек, но CI трябва да мине.

Пример:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b docs/project-technical-context
```

## Как Да Се Правят Промени

- За формула: започнете от `src/calculators/`, после unit/golden тестове, после UI/E2E ако текстът или workflow се променя.
- За нова единица: започнете от `src/units/units.js`, после conversion traces и tests.
- За нов текст: редактирайте `src/i18n/bg.js`; не разпръсквайте текстове из modules.
- За ново поле във форма: проверете `src/ui/views.js`, `src/main.js`, `src/share/share-link.js`, summaries, history/templates, label и tests.
- За restore behavior: проверете QR, history и templates едновременно.
- За PWA: проверете `public/service-worker.js`, `src/pwa/register-service-worker.js`, manifest, icons и offline E2E.

## Coding Rules

- Vanilla JS modules only.
- Без backend, database или API calls за MVP.
- Без AI-generated medical instructions.
- Без неофициална drug database.
- Без автоматични medical recommendations.
- Използвайте `parseDecimal` за вход от формите.
- Поддържайте `0.5`, не `.5`; избягвайте ненужни trailing zeros.
- Поддържайте mobile numeric keyboard чрез подходящи input атрибути.
- Поддържайте touch targets поне 44x44 px.

## UI Правила

- Първият екран остава директен избор на калкулатор.
- Не добавяйте landing/marketing страница преди калкулаторите.
- Резултатът трябва да включва число, инструкция, проверка на сметката, conversions и warnings.
- След успешен submit формата се свива; потребителят може да я отвори с `Промени`.
- Restore от предишно изчисление трябва ясно да предупреждава потребителя.

## Версиониране

При release промяна синхронизирайте:

- `package.json`
- `src/app-version.js`
- `public/service-worker.js`
- `public/manifest.webmanifest` ако version/name metadata се промени
- `CHANGELOG.md`

Service worker cache name използва версията. Ако версията не се промени, стар кеш може да остане активен при вече инсталирани PWA клиенти.

## Преди PR

```bash
npm run test:all
git diff --check
```

Проверете и документацията:

- formula/safety промяна: `docs/clinical-validation.md`
- testing промяна: `docs/testing.md`
- architecture промяна: `docs/architecture.md`
- deploy промяна: `docs/deployment.md`
- agent-facing правила: `AGENTS.md`
