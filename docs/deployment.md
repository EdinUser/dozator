# Деплой

`Дозатор` се build-ва като статичен сайт и се качва към production target чрез GitHub Actions.

Този документ умишлено не съдържа реални hostnames, IP адреси, SSH портове, server users, filesystem paths, ownership стойности или domain имена. Те се пазят като GitHub repository secrets и в server/control-panel конфигурацията.

## CI/CD Поведение

Workflow файл:

```text
.github/workflows/ci-deploy.yml
```

Събития:

- `pull_request` към `main`: пуска tests, build и E2E.
- `push` към `main`: пуска tests, build, E2E и production deploy.
- `workflow_dispatch`: ръчно пускане на workflow.

Deploy job се изпълнява само при:

```text
github.event_name == 'push' && github.ref == 'refs/heads/main'
```

## Runtime

Сайтът е статичен. Няма Node server в production. Production web server трябва да сервира файловете от build output директорията, която workflow-ът получава чрез secret.

## GitHub Secrets

Очаквани repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_PORT`
- `VPS_WEB_ROOT`
- `VPS_WEB_OWNER`

Secrets не са автоматично видими между различни GitHub repositories. Ако се създаде нов repo или fork, трябва да се добавят там отделно.

## Какво Качва Deploy

CI build-ва:

```bash
npm run build
```

После качва съдържанието на `dist/` към production web root. Данни от потребителя не се качват, защото history/templates/theme са само в browser `localStorage`.

## DNS/Control Panel Бележки

Domain, DNS и hosting control-panel стойностите не трябва да се записват в repo. При default hosting page след deploy проверете private hosting configuration: domain binding, document root, DNS target и vhost/IP binding.

## Проверка След Deploy

Минимална smoke проверка:

- началният екран показва `Какво подготвяте?`;
- отваря се поне един калкулатор;
- `Доза от готов разтвор` с `125 mg`, `250 mg`, `5 mL` дава `2.5 mL`;
- refresh работи;
- след първоначално зареждане PWA може да отвори shell offline.

## PWA Cache

Service worker cache name е вързан към версията в `public/service-worker.js`. При release промяна синхронизирайте версията с `package.json`, `src/app-version.js` и `CHANGELOG.md`.
