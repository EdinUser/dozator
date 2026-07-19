# Дозатор

Мобилен, статичен калкулатор за лекарствени изчисления за обучени медицински специалисти.

Дозатор проверява аритметиката, но не замества лекарско назначение, инструкция на производителя, аптека или болничен протокол. Приложението не препоръчва лекарство, доза, разтворител, съвместимост, стабилност или срок на годност.

## Технологии

- Bootstrap 5
- Vanilla JavaScript
- Vite
- Изцяло в браузъра, без запис на данни на сървър

## Език и единици

Интерфейсът е на български. Мерните единици се изписват със стандартни Latin/SI означения: `g`, `mg`, `µg`, `L`, `mL`, `min`, `h`, `mg/mL`, `µg/mL`, `units/mL`.

## Функции

- Доза от готов разтвор
- Разреждане до концентрация
- Разтваряне на флакон
- Инфузионна скорост
- Проверка на изчислението
- Видимо преобразуване на единици при смесване на `mg`, `µg`, `L`, `mL`, `min`, `h`
- Предупреждения за невъзможни или съмнителни стойности
- Печатен и копируем етикет с подготовка
- Ръчна светла/тъмна тема, запазена в браузъра
- Меню за бърза смяна на калкулатора
- Автоматично свиване на въведените данни след успешно изчисление
- Числови полета с мобилна десетична клавиатура и поддръжка на `0.5` и `0,5`
- QR код за споделяне на текущото изчисление чрез URL hash
- История на последните 10 успешни изчисления за всеки тип калкулатор
- Шаблони с име по желание, групирани по тип калкулатор
- Бутон `История` във всеки калкулатор за бърз достъп до историята само за този тип
- Кратка страница `Как са проверени изчисленията`
- Installable PWA с offline работа след първоначално зареждане
- Видима версия на приложението и `CHANGELOG.md`

## Важни ограничения

- Калкулаторът не е drug reference и не е prescribing assistant.
- Няма backend и няма сървърно съхранение на потребителски данни.
- QR/share payload не трябва да съдържа patient identifiers или свободни медицински бележки.
- Production deployment стойности не се документират публично в repo.

## Локална разработка

```bash
npm install
npx playwright install chromium
npm run dev
```

## Проверки

```bash
npm test
npm run build
npm run test:e2e
npm run test:all
```

Подробно: [docs/testing.md](docs/testing.md).

## CI/CD

Приложението се build-ва до статична директория `dist/`.

- pull request към `main`: инсталира dependencies, пуска unit/regression тестове, build и E2E тестове;
- push към `main`: пуска същите проверки и след това production deploy през GitHub Actions.

Конкретните production target стойности се пазят в GitHub repository secrets и не се документират публично в README.

Подробно: [docs/deployment.md](docs/deployment.md).

## Технически документи

- [docs/project-context.md](docs/project-context.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/development.md](docs/development.md)
- [docs/testing.md](docs/testing.md)
- [docs/privacy-security.md](docs/privacy-security.md)
- [docs/clinical-validation.md](docs/clinical-validation.md)
- [docs/deployment.md](docs/deployment.md)
