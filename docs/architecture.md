# Архитектура

`Дозатор` е статично Vite приложение с Vanilla JavaScript и Bootstrap 5. Няма backend и няма сървърно съхранение на данни. Всички изчисления, история, шаблони, тема и QR restore се обработват локално в браузъра.

## Основни принципи

- Калкулаторите са чисти функции без DOM, Bootstrap, QR, localStorage или network зависимости.
- Unit conversion и форматирането са централизирани в `src/units/units.js`.
- Safety правилата са отделени в `src/safety/warnings.js`.
- UI текстовете са в `src/i18n/bg.js`, за да могат да се преглеждат и редактират отделно.
- `src/main.js` оркестрира приложението: избран калкулатор, submit, collapse/restore, модали, история, шаблони и QR.
- `src/ui/views.js` връща HTML string templates за екраните и модалите.
- PWA логиката е разделена между `src/pwa/register-service-worker.js` и `public/service-worker.js`.

## Поток на изчисление

1. Потребителят избира калкулатор от началния екран или менюто.
2. `renderCalculatorScreen()` рендерира формата според избрания тип.
3. Submit handler в `src/main.js` чете `FormData`, добавя `highAlert`, и извиква съответната функция от `src/calculators/`.
4. Калкулаторът валидира входа, преобразува единици до базови вътрешни единици и връща result object.
5. `renderResultPanel()` показва основния резултат, инструкцията, проверката на сметката, преобразуванията и предупрежденията.
6. При успешен резултат въведените данни се свиват в summary, а пълната форма може да се отвори с `Промени`.
7. Успешното изчисление се записва в history в `localStorage`.

## Вътрешни единици

- Масата се свежда до `mg`.
- Обемът се свежда до `mL`.
- Времето за infusion volume/time се свежда до часове.
- Концентрациите за текущите калкулатори се изчисляват като `mg/mL`.

Поддържаните входни единици са ограничени нарочно. Не добавяйте лабораторни, household или prescribing единици без отделно UX и clinical validation решение.

## Result Object Contract

Всеки калкулатор връща `ok: false` с общи и field-level грешки или `ok: true` с пълен result object.

При успех UI очаква:

- `primary`: основният резултат, например `2.5 mL`.
- `instructions`: стъпки за подготовка.
- `finalLines`: кратко обобщение на крайното състояние.
- `notices`: приложени unit conversions.
- `traces`: проверка на сметката.
- `warnings`: safety предупреждения.
- `label`: данни за етикет и recipe.

Този contract е защитен от `tests/calculator-golden.test.js` и E2E тестовете. Промени по него трябва да са съзнателни и документирани.

## Restore, History, Templates

- History и templates са само в `localStorage`.
- History пази последните 10 успешни изчисления за всеки тип калкулатор.
- Templates пазят пълния form JSON и име по желание.
- Restore винаги преизчислява през calculator функцията. Не се доверява на записан стар резултат.
- Restore от QR/history/templates показва предупреждение за повторна проверка спрямо текущото назначение и опаковка.

## Hash Navigation

- Екраните имат директни hash маршрути: `#dose`, `#dilution`, `#reconstitution`, `#infusion` и `#validation`.
- Reload на тези URL-и трябва да оставя потребителя на същия екран.
- `#calc=` е запазен само за QR/share restore payload и не трябва да се използва за обикновена навигация.

## QR Sharing

QR кодът е URL с hash payload. Няма server round-trip. `src/share/share-link.js` има allowlist по тип калкулатор и отхвърля свободни/непознати полета при decode.

При добавяне на ново поле към калкулатор:

- добавете го в allowlist само ако не е лична/клинична бележка;
- добавете restore тест;
- проверете label output и history/template summary.

## PWA/Offline

Service worker-ът кешира app shell файловете и Vite hashed assets. Навигациите са network-first с fallback към кеширан `/`. Static assets са cache-first.

При промяна на offline поведението пуснете:

```bash
npm run test:all
```

E2E тестът `installed app shell reloads while offline after first load` пази основния offline contract.

## Известни ограничения

- Няма медицинска база данни.
- Няма автоматичен избор на разтворител.
- Няма стабилност/expiry изчисления.
- Няма patient-specific dose recommendation logic; теглото се използва само като числов множител при инфузионни назначения по kg.
- Няма server audit trail.
- Терминологията и формулите чакат външна проверка от медицински персонал.
