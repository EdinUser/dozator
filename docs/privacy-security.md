# Privacy и Security

`Дозатор` е browser-only приложение, но repo-то все пак трябва да пази ясни граници за лични данни и deployment информация.

## Потребителски Данни

Приложението не трябва да събира или изпраща лични данни.

Забранено е QR/share/history/templates да съдържат:

- име на пациент;
- ЕГН;
- диагноза;
- болничен номер;
- свободни медицински бележки;
- друга patient-identifying информация.

Разрешени са само whitelisted полета, нужни за преизчисляване на конкретния калкулатор. Числовото тегло в `kg` е разрешено само като изчислително поле за инфузионна скорост по kg; не добавяйте име, ЕГН или други идентификатори към него. Allowlist-ът е в `src/share/share-link.js`.

## Local Storage

В `localStorage` се пазят:

- safety acknowledgement;
- theme preference;
- история;
- шаблони.

Тези данни остават в браузъра на устройството. Няма server persistence, audit log или account system.

## QR/URL Hash

QR кодът съдържа URL hash с form values. Hash payload се използва само за restore и локално преизчисление.

Правила:

- не добавяйте free-text medical notes към share payload;
- не записвайте стар изчислен резултат като authoritative data;
- при restore винаги преизчислявайте;
- винаги показвайте warning за предишно изчисление.

## Deployment Secrets

Не commit-вайте в repo:

- real hostnames или IP адреси;
- SSH портове;
- server usernames;
- filesystem paths;
- ownership/group стойности;
- domain или DNS control-panel детайли;
- private ключове или части от ключове.

Production deployment стойностите трябва да са в GitHub repository secrets или private operational notes извън repo.

## GitHub Actions

Workflow-ът може да показва имената на secrets, но не и реалните стойности. Ако deployment target се промени, обновете repository secrets и `docs/deployment.md` само на ниво процес, без конкретните стойности.

## Медицинска Безопасност

Security границите не заменят clinical validation. Формули, терминология и warnings трябва да бъдат прегледани от квалифициран медицински специалист преди реална употреба.
