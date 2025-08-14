# Гайд по работе с Git

## Содержание

- [Введение](#введение)
- [Установка Git](#установка-git)
- [Основные концепции Git](#основные-концепции-git)
- [Инициализация и клонирование репозитория](#инициализация-и-клонирование-репозитория)
- [Основные команды для работы с файлами](#основные-команды-для-работы-с-файлами)
- [Работа с ветками (branches)](#работа-с-ветками-branches)
- [Слияние изменений: merge vs rebase](#слияние-изменений-merge-vs-rebase)
- [Просмотр истории и логов](#просмотр-истории-и-логов)
- [Отмена изменений: revert, reset, checkout](#отмена-изменений-revert-reset-checkout)
- [Продвинутые команды](#продвинутые-команды)
- [Работа с удаленными репозиториями](#работа-с-удаленными-репозиториями)
- [Командная разработка: лучшие практики](#командная-разработка-лучшие-практики)
- [Общие проблемы и их решения](#общие-проблемы-и-их-решения)
- [**Сценарий командной разработки с Git**](#сценарий-командной-разработки-с-git-добавление-фичи-аутентификации-в-веб-приложении)
- [Дополнительные ресурсы](#дополнительные-ресурсы)

## Введение

Git — это распределенная система контроля версий, разработанная Линусом Торвальдсом для управления кодом Linux. Она позволяет отслеживать изменения в файлах, работать в команде, создавать ветки для экспериментов и сливать изменения без потери данных. Git популярен благодаря скорости, надежности и поддержке нелинейной разработки.

Этот гайд основан на официальной документации Git и GitHub (https://docs.github.com/ru), а также на лучших практиках сообщества. Мы охватим все основные команды с примерами, кейсами использования и акцентом на командную работу.

**Предполагаемые знания:** Базовые навыки командной строки (bash или аналог).

## Установка Git

Перед работой установите Git:

- **Windows:** Скачайте с https://git-scm.com/download/win и следуйте инструкциям.
- **macOS:** Установите через Homebrew: `brew install git`.
- **Linux:** Используйте менеджер пакетов, например, `sudo apt install git` (Debian/Ubuntu) или `sudo yum install git` (CentOS).

Проверьте установку: `git --version`.

Настройте имя и email (глобально):
```
git config --global user.name "Ваше Имя"
git config --global user.email "your.email@example.com"
```

## Основные концепции Git

- **Репозиторий (repo):** Директория с файлами под контролем Git.
- **Коммит (commit):** Снимок изменений с сообщением.
- **Ветка (branch):** Независимая линия разработки.
- **HEAD:** Указатель на текущий коммит/ветку.
- **Staging area (index):** Промежуточная область для подготовки коммита.
- **Удаленный репозиторий (remote):** Репозиторий на сервере (например, GitHub).

Git работает локально, но синхронизируется с удаленными репозиториями.

## Инициализация и клонирование репозитория

- **Инициализация локального репозитория:**
  ```
  git init
  ```
  Пример: Создает .git в текущей директории. Используйте для нового проекта.

- **Клонирование существующего репозитория:**
  ```
  git clone https://github.com/user/repo.git
  ```
  Пример: `git clone https://github.com/example/project.git` — копирует репозиторий локально.

Кейс: Если проект уже существует на GitHub, клонируйте его для начала работы.

## Основные команды для работы с файлами

- **Просмотр статуса:**
  ```
  git status
  ```
  Показывает измененные файлы, staged и unstaged.

- **Добавление файлов в staging:**
  ```
  git add file.txt
  git add .  # Все файлы
  ```
  Пример: После редактирования файла `echo "Hello" > file.txt; git add file.txt`.

- **Создание коммита:**
  ```
  git commit -m "Сообщение коммита"
  ```
  Пример: `git commit -m "Добавлен новый файл"`. Используйте осмысленные сообщения.

- **Добавление и коммит в одном шаге:**
  ```
  git commit -am "Сообщение"
  ```
  Только для отслеживаемых файлов.

Кейс: Регулярно коммитьте маленькие изменения для легкого отката.

## Работа с ветками (branches)

- **Создание ветки:**
  ```
  git branch new-feature
  ```

- **Переключение на ветку:**
  ```
  git checkout new-feature
  ```
  Или комбинировано: `git checkout -b new-feature`.

- **Список веток:**
  ```
  git branch
  git branch -a  # Все, включая удаленные
  ```

- **Удаление ветки:**
  ```
  git branch -d old-branch
  git branch -D old-branch  # Принудительно
  ```

Пример: Создайте ветку для новой фичи: `git checkout -b feature/login`.

Кейс: Используйте ветки для изоляции изменений — main для стабильного кода, feature/* для новых фич.

## Слияние изменений: merge vs rebase

- **Merge (слияние):**
  ```
  git checkout main
  git merge feature-branch
  ```
  Создает merge-коммит, сохраняя историю веток.

- **Rebase (перебазирование):**
  ```
  git checkout feature-branch
  git rebase main
  ```
  Перемещает коммиты ветки на вершину main, создавая линейную историю.

**Когда использовать merge:**
- В командной разработке для сохранения контекста (кто когда внес изменения).
- Когда ветка публичная и shared (избегайте перезаписи истории).
- Кейс: Интеграция долгосрочной ветки (release) в main — merge сохранит историю конфликтов.

**Когда использовать rebase:**
- Для чистой линейной истории (легче читать лог).
- Перед merge в main для "подтягивания" изменений.
- Кейс: Локальная feature-ветка — rebase на main перед PR, чтобы избежать ненужных merge-коммитов. Но не ребейзьте shared ветки!

**Конфликты:** В обоих случаях Git отметит конфликты. Отредактируйте файлы, добавьте `git add`, завершите `git merge --continue` или `git rebase --continue`.

Пример merge: Разработка в parallel, слияние сохраняет ветвление.

Пример rebase: Локальные изменения, rebase для "очистки" перед push.

## Просмотр истории и логов

- **Просмотр логов:**
  ```
  git log
  git log --oneline --graph --decorate  # Кратко с графом
  git log --author="Name"  # По автору
  ```

- **Просмотр изменений в коммите:**
  ```
  git show commit-hash
  ```

- **Сравнение:**
  ```
  git diff HEAD~1  # С предыдущим коммитом
  git diff branch1..branch2
  ```

Кейс: Используйте для ревью изменений перед merge.

## Отмена изменений: revert, reset, checkout

- **Revert (откат коммита):**
  ```
  git revert commit-hash
  ```
  Создает новый коммит, отменяющий изменения. Безопасно для shared истории.

- **Reset (сброс):**
  ```
  git reset --hard commit-hash  # Жесткий сброс (теряет изменения)
  git reset --soft commit-hash  # Мягкий (сохраняет в staging)
  ```
  Перемещает HEAD. Не используйте на pushed коммитах!

- **Checkout (выборка):**
  ```
  git checkout commit-hash file.txt  # Восстановить файл
  ```

Кейс revert: Откат багов в production без потери истории.

Кейс reset: Очистка локальных ошибок перед push.

## Продвинутые команды

- **Cherry-pick (выборочный перенос):**
  ```
  git cherry-pick commit-hash
  ```
  Кейс: Перенос фикса из одной ветки в другую без полного merge.

- **Stash (отложить изменения):**
  ```
  git stash
  git stash apply
  git stash list
  ```
  Кейс: Временное сохранение для переключения веток.

- **Bisect (поиск бага):**
  ```
  git bisect start
  git bisect bad
  git bisect good commit-hash
  ```
  Кейс: Бинарный поиск коммита, введшего баг.

- **Reflog (журнал ссылок):**
  ```
  git reflog
  ```
  Для восстановления потерянных коммитов.

- **Submodules (подмодули):**
  ```
  git submodule add https://github.com/user/repo.git path
  ```
  Кейс: Включение внешних репозиториев.

- **Tags (теги):**
  ```
  git tag v1.0
  git push origin v1.0
  ```
  Для версионирования релизов.

## Работа с удаленными репозиториями

- **Добавление remote:**
  ```
  git remote add origin https://github.com/user/repo.git
  ```

- **Push (отправка):**
  ```
  git push origin main
  git push -u origin main  # Установить upstream
  ```

- **Pull (получение):**
  ```
  git pull origin main
  ```
  Эквивалент fetch + merge.

- **Fetch (загрузка без merge):**
  ```
  git fetch origin
  ```

- **Удаление remote ветки:**
  ```
  git push origin --delete branch
  ```

Кейс: Всегда pull перед push для избежания конфликтов.

## Командная разработка: лучшие практики

В командной разработке используйте GitHub/GitLab для хостинга. Основные workflows: Git Flow, GitHub Flow.

**Последовательность действий в команде:**

1. **Клонируйте репозиторий:** `git clone repo-url`.
2. **Создайте feature-ветку:** `git checkout -b feature/new-task`.
3. **Работайте локально:** Изменяйте, add, commit часто.
4. **Pull изменения из main:** `git pull origin main` (или rebase: `git fetch; git rebase origin/main`).
5. **Push ветку:** `git push origin feature/new-task`.
6. **Создайте Pull Request (PR) на GitHub:** Опишите изменения, добавьте ревьюеров.
7. **Ревью и фиксы:** Обсудите, внесите изменения, push в ту же ветку.
8. **Merge PR:** После аппрува, merge в main (или squash для чистоты).
9. **Удалите ветку:** Локально и remote.
10. **Deploy:** Если нужно, из main.

**Лучшие практики:**

- **Используйте branch naming conventions:** feature/..., bugfix/..., hotfix/....
- **Commit messages:** Conventional Commits (feat: , fix: , chore: ) для семантического версионирования.
- **Pull Requests:** Обязательны для ревью. Установите branch protection на main (требовать PR, аппрувы).
- **Rebase vs Merge в команде:** Rebase для локальных веток перед PR; merge для интеграции в main (сохраняет историю).
- **Избегайте конфликтов:** Часто pull/rebase. Разрешайте конфликты вручную.
- **CI/CD:** Интегрируйте с GitHub Actions для тестов перед merge.
- **Fork workflow:** Для open-source — fork, изменения в fork, PR в upstream.
- **Git Flow:** main (production), develop (integration), feature/*, release/*, hotfix/*. Merge release в main и develop.
- **GitHub Flow:** Простой: main, feature-ветки, PR в main.
- **Безопасность:** Не коммитьте секреты (используйте .gitignore, GitHub Secrets).
- **Коллаборация:** Используйте issues для задач, mentions в комментариях.

Кейс командной разработки: Команда из 5 человек работает над веб-приложением. Каждый создает feature-ветку от main, push, PR. Ревьюер проверяет код, тесты. После merge — deploy из main.

## Общие проблемы и их решения

- **Конфликты merge:** Откройте файлы, удалите <<<<, ====, >>>> маркеры, add и continue.
- **Потерянные коммиты:** `git reflog` для поиска, `git reset --hard HEAD@{n}`.
- **Push rejected (non-fast-forward):** `git pull` сначала.
- **Большой репозиторий:** Используйте git gc, или Git LFS для больших файлов.
- **Ошибочный коммит:** `git commit --amend` для последнего, или rebase -i для интерактивной правки.

---

# Сценарий командной разработки с Git: Добавление фичи аутентификации в веб-приложении

Этот сценарий симулирует реальный процесс командной разработки на примере небольшого веб-приложения (например, на Node.js). Команда состоит из 4 человек:  
- **Olga** — тимлид, отвечает за общую интеграцию и main-ветку.  
- **Bob** — разработчик, работает над backend-частью (логика сервера).  
- **Oleg** — разработчик, работает над frontend-частью (UI).  
- **Max** — разработчик, работает над базой данных и интеграцией.  

Проект хранится на GitHub. Мы используем GitHub Flow: main-ветка для стабильного кода, feature-ветки для задач, Pull Requests (PR) для ревью и merge. Сценарий включает типичные шаги, ошибки, конфликты и их разрешение. Для простоты опишем действия в нарративной форме с командами Git.

## Шаг 1: Инициализация проекта (Olga)
Olga создает репозиторий на GitHub (https://github.com/team/project-app) и инициализирует локально. Она добавляет базовую структуру: app.js (основной файл), package.json и README.md.

- Olga:  
  ```
  git clone https://github.com/team/project-app.git
  cd project-app
  echo "console.log('Hello World');" > app.js
  npm init -y  # Инициализация Node.js проекта
  git add .
  git commit -m "Initial commit: базовая структура проекта"
  git push origin main
  ```

Теперь репозиторий готов. Olga уведомляет команду в Slack: "Репо готово, клонируйте и начинайте с feature-веток для задачи #1: Аутентификация пользователя."

## Шаг 2: Клонирование и распределение задач (Все)
Каждый член команды клонирует репозиторий и создает свою feature-ветку на основе main.

- Bob (backend: API для логина):  
  ```
  git clone https://github.com/team/project-app.git
  cd project-app
  git checkout -b feature/backend-login
  ```

- Oleg (frontend: Форма логина):  
  ```
  git clone https://github.com/team/project-app.git
  cd project-app
  git checkout -b feature/frontend-login-form
  ```

- Max (DB: Интеграция с MongoDB для хранения пользователей):  
  ```
  git clone https://github.com/team/project-app.git
  cd project-app
  git checkout -b feature/db-user-storage
  ```

Olga берет на себя интеграцию и создает ветку для общей конфигурации:  
```
git checkout -b feature/config-auth
```

## Шаг 3: Локальная разработка (Все)
Каждый работает в своей ветке, коммитя изменения часто.

- Bob добавляет endpoint для логина в app.js:  
  Изменяет app.js, добавляя код для Express.js (предполагаем, что установлен).  
  ```
  npm install express
  # Редактирует app.js: добавляет app.post('/login', ...)
  git add app.js package.json
  git commit -m "feat: добавлен API endpoint для логина"
  git add .  # Добавляет новые файлы, если есть
  git commit -m "chore: обновлены зависимости"
  ```

- Oleg создает HTML/JS для формы в index.html (добавляет новый файл):  
  ```
  echo "<form id='login-form'>...</form>" > index.html
  git add index.html
  git commit -m "feat: добавлена форма логина на frontend"
  ```

- Max добавляет код для MongoDB в db.js (новый файл) и подключает в app.js:  
  ```
  npm install mongoose
  # Создает db.js с схемой User
  # В app.js добавляет require('./db.js')
  git add db.js app.js package.json
  git commit -m "feat: интеграция с MongoDB для хранения пользователей"
  ```

- Olga добавляет конфиг для JWT в config.js (новый файл) и ссылается на него в app.js:  
  ```
  echo "module.exports = { secret: 'key' };" > config.js
  # В app.js добавляет require('./config.js')
  git add config.js app.js
  git commit -m "feat: добавлена конфигурация для аутентификации"
  ```

Здесь начинается потенциал для конфликтов: Bob, Max и Olga все редактируют app.js независимо.

## Шаг 4: Push веток и создание Pull Requests (Все)
После локальной работы каждый push'ит ветку и создает PR на GitHub.

- Bob:  
  ```
  git push origin feature/backend-login
  ```  
  На GitHub: Создает PR "Feature: Backend Login" из feature/backend-login в main. Описание: "Добавлен /login endpoint. Требует ревью."

- Oleg:  
  ```
  git push origin feature/frontend-login-form
  ```  
  PR: "Feature: Frontend Login Form" — "Добавлена форма, без стилей пока."

- Max:  
  ```
  git push origin feature/db-user-storage
  ```  
  PR: "Feature: DB User Storage" — "Интеграция MongoDB."

- Olga:  
  ```
  git push origin feature/config-auth
  ```  
  PR: "Feature: Auth Config" — "Базовая конфигурация JWT."

Команда обсуждает в Slack: Olga назначает ревьюеров (Bob ревьюит Max'а, Oleg — Bob'а и т.д.).

## Шаг 5: Ревью и первые merge (Olga как тимлид)
Olga ревьюит PR Oleg (простой, без конфликтов) и merge'ит его в main через GitHub (squash merge для чистоты истории).  

- Olga локально обновляет main:  
  ```
  git checkout main
  git pull origin main
  ```

Теперь main имеет index.html от Oleg.

Далее Olga merge'ит свой PR (feature/config-auth) в main. Нет конфликтов, так как app.js только её изменения.

## Шаг 6: Появление конфликтов при merge (Bob и Max)
Bob и Max пытаются merge'ить свои PR, но GitHub показывает конфликты, потому что оба редактировали app.js (Bob добавил endpoint, Max — require db, а Olga уже добавила require config).

- Bob пробует merge своего PR на GitHub, но видит предупреждение о конфликтах. Он решает разрешить локально:  
  ```
  git checkout main
  git pull origin main  # Обновляет main с merge от Olga и Oleg
  git checkout feature/backend-login
  git rebase main  # Rebase своей ветки на актуальный main (лучшая практика перед PR)
  ```  
  Во время rebase возникает конфликт в app.js (строки с require конфликтуют с изменениями Olga).  
  Bob открывает app.js, видит:  
  ```
  <<<<<<< HEAD
  require('./config.js');  // От Olga
  =======
  // Его код endpoint
  >>>>>>> feature/backend-login
  ```  
  Bob разрешает: Объединяет require'ы, сохраняет endpoint.  
  ```
  git add app.js
  git rebase --continue
  git push origin feature/backend-login --force-with-lease  # Force push после rebase (осторожно!)
  ```  
  Обновляет PR на GitHub — теперь без конфликтов. Olga ревьюит и merge'ит.

- Max аналогично:  
  ```
  git checkout feature/db-user-storage
  git fetch origin
  git rebase origin/main
  ```  
  Конфликт в app.js: Его require('./db.js') конфликтует с уже merged изменениями от Olga и Bob (несколько require'ов в одном месте).  
  Max разрешает, добавляя свой require после других.  
  ```
  git add app.js
  git rebase --continue
  git push origin feature/db-user-storage --force-with-lease
  ```  
  PR обновлен. В ревью Bob замечает, что Max забыл обновить package.json для mongoose. Max фиксит:  
  ```
  git add package.json
  git commit --amend --no-edit  # Amend последнего коммита
  git push origin feature/db-user-storage --force-with-lease
  ```  
  После аппрува Olga merge'ит PR Max'а.

## Шаг 7: Финальная интеграция и тестирование (Все)
После всех merge'ов команда тестирует на main.

- Olga:  
  ```
  git checkout main
  git pull origin main
  npm install
  node app.js  # Тестирует
  ```  
  Обнаруживает баг: Frontend форма не интегрируется с backend (Oleg не добавил JS для отправки на /login).  

Olga создает issue на GitHub: "Bug: Интеграция frontend-backend". Назначает Oleg.

- Oleg фиксит в новой ветке:  
  ```
  git checkout -b bugfix/login-integration
  # Добавляет JS в index.html для fetch('/login')
  git add index.html
  git commit -m "fix: интеграция формы с API"
  git push origin bugfix/login-integration
  ```  
  Создает PR, Bob ревьюит (предлагает добавить error handling), Oleg фиксит и push'ит в ветку. Merge.

## Шаг 8: Завершение и cleanup (Все)
После успешного тестирования:

- Удаление веток:  
  Каждый:  
  ```
  git branch -d feature/my-branch  # Локально
  git push origin --delete feature/my-branch  # Remote
  ```

- Olga теггирует релиз:  
  ```
  git tag v1.0-auth
  git push origin v1.0-auth
  ```

## Итог сценария
Этот процесс отражает реальность: Разделение задач по веткам минимизирует конфликты, но они неизбежны при работе с общими файлами (как app.js). Rebase перед PR помогает держать историю чистой, PR обеспечивают ревью. Ошибки (забытые зависимости) фиксятся в ветке. В команде важно общение (Slack, issues) и правила (branch protection на GitHub: требовать минимум 1 аппрув перед merge). Если проект растет, добавьте CI (GitHub Actions) для авто-тестов перед merge.

---

## Дополнительные ресурсы

- Официальная документация Git: https://git-scm.com/docs
- GitHub Docs на русском: https://docs.github.com/ru
- Книга Pro Git: https://git-scm.com/book/ru/v2
- Интерактивные туториалы: https://learngitbranching.js.org/?locale=ru_RU
