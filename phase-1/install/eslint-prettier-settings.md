# Настройка ESLint и Prettier в VS Code

## Что это?

**ESLint** — это инструмент для анализа кода на JavaScript и TypeScript, который помогает
находить и устранять ошибки, а также соблюдать согласованность в коде. Он позволяет
задавать правила, например, требовать использования `const` вместо `let`, указывать
необходимость или запрет использования точек с запятой и т. д. ESLint — это ваш личный
"инспектор" кода, который указывает на ошибки и несоответствия стилю.

Пример:  
Если в коде написано:

```javascript
let x = 5;
console.log(x);
```

ESLint может подсказать, что лучше использовать `const` вместо `let` и добавить точку с
запятой:

```javascript
const x = 5;
console.log(x);
```

---

**Prettier** — это инструмент для автоматического форматирования кода. В отличие от
ESLint, Prettier не ищет логические ошибки, а просто делает код читаемым и однородным. Он
автоматически добавляет отступы, точки с запятой, кавычки, форматирует длинные строки и т.
д.

Пример:  
До применения Prettier:

```javascript
const fetchData = async () => {
  return await fetch('https://api.example.com/data');
};
```

После применения Prettier:

```javascript
const fetchData = async () => {
  return await fetch('https://api.example.com/data');
};
```

---

## Как работают разработчики?

1. **Пишут код**: Разработчики сосредотачиваются на логике и функциональности, не
   отвлекаясь на детали форматирования.
2. **VS Code подсказывает ошибки**: ESLint выделяет проблемные участки (например,
   подсвечивает их красным или желтым цветом).
3. **Автоисправление на лету**: При сохранении файла через `Ctrl+S` (или `Cmd+S` на macOS)
   Prettier автоматически приводит код к стандартам форматирования, а ESLint исправляет
   мелкие ошибки.

### Пример работы в команде:

- Один разработчик использует пробелы для отступов, другой — табы.
- Prettier автоматически приводит всё к единому стилю, чтобы избежать конфликтов в git.

---

## Как включить форматирование и линтинг по сохранению?

### 1. Установите расширения

- **ESLint**: Зайдите в раздел Extensions (`Ctrl+Shift+X` или `Cmd+Shift+X`) и найдите
  расширение ESLint. Установите его.
- **Prettier**: Найдите и установите расширение Prettier - Code Formatter.

### 2. Настройте `settings.json`

1. Откройте настройки пользователя в VS Code:

   - Нажмите `Ctrl+Shift+P` (или `Cmd+Shift+P` на macOS).
   - Выберите пункт `Preferences: Open User Settings (JSON)` (можно ввести в поиске
     `user settings`)

2. Добавьте или обновите следующие настройки:

```jsonc
{
  // Автосохранение через 1 секунду бездействия
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,

  // Включаем автоформатирование на сохранение
  "editor.formatOnSave": true,

  // Указываем Prettier как инструмент форматирования по умолчанию
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // Линтинг и автофикс с помощью ESLint
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // Указываем рабочие директории для ESLint (для монорепозиториев)
  "eslint.workingDirectories": [
    { "directory": "./client", "changeProcessCWD": true },
    { "directory": "./server", "changeProcessCWD": true }
  ],

  // Отключаем встроенное форматирование HTML, чтобы Prettier работал корректно
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Дополнительные советы

В новом проекте выполняйте инициализацию через команду

```sh
npm init @elbrus/config@latest
```

---

Теперь ваш проект будет поддерживать единый стиль и меньше ошибок, а вы сможете
сосредоточиться на разработке функциональности!