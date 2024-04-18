const readlineSync = require('readline-sync');

main();

function main() {
  const burgers = [];
  while (true) {
    if (burgers.length > 0) {
      console.log();
      console.log('Бургеры:');
      console.log(burgers.map(renderBurger).join('\n'));
    }
    console.log();
    readlineSync.question('Нажмите любую клавишу, чтобы сделать бургер…');

    const burger = makeBurger();

    if (burger) burgers.push(burger);
  }
}

function makeBurger() {
  const burger = [];

  while (true) {
    console.log();
    console.log(renderBurger(burger));

    const ingridient = readlineSync.question(
      'Введите название нового ингридиента или оставьте пустым, чтобы закончить\n> '
    );

    if (ingridient) {
      burger.push(ingridient);
    } else {
      break;
    }
  }

  return burger.length === 0 ? undefined : burger;
}

function renderBurger(burger) {
  return `[${burger.join(' | ')}]`;
}
