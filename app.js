'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3006;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const operators = {
  '+': 1,
  '-': 1,
  '/': 2,
  '*': 2
};

function isNumber(str) {
  const pattern = /^\d+$/;
  return pattern.test(str); // returns a boolean
}

function createResultString(string) {
  const queue = [];
  const stack = [];

  let buffer = ''; // если число, то без буффера никак :(
  const arrayOfOperators = Object.keys(operators); // получаем + - / *

  for (let symbol of string) { // по символу перебираем строку
    if (isNumber(symbol)) { // если цифра, то в буфер
      buffer += symbol;
    } else if (arrayOfOperators.includes(symbol)) { // если не цифра, то может оператор
      if (buffer !== '') { queue.push(+buffer); buffer = ''; } // толкаем в очередь наше число
      if (stack.length > 0) { // не пуст ли стэк?
        if (operators[symbol] <= stack[stack.length - 1].priority) { // если приоритет текущего оператора меньше либо равен верхнему
          queue.push((stack.pop()).type); // выталкиваем из стека в очередь верхний элемент
        }
      }
      stack.push({ type: symbol, priority: operators[symbol] }); // толкаем в стэк объект, т.к. нужно хранить приоритет
    } else {
      return { error: 'Неопознанный символ :(' };
    }
  }
  if (buffer !== '') { queue.push(+buffer); }
  while (stack.length !== 0) {
    queue.push((stack.pop()).type);
  }
  return queue;
}

const operations = {
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => x / y
};

let calculate = (expr) => {
  let stack = [];
  const operationsKeys = Object.keys(operations);
  expr.forEach((token) => {
    if (operationsKeys.includes(token)) {
      let [y, x] = [stack.pop(), stack.pop()];
      stack.push(operations[token](x, y));
    } else {
      stack.push(parseFloat(token));
    }
  });

  return stack.pop();
};

app.post('/calculate', (req, res) => {
  const { test: string } = req.body;

  const resultString = createResultString(string);
  if (!!resultString && !!resultString.error) res.status(400).json({ err: resultString.error });

  const answer = calculate(resultString);
  return res.status(200).json({ result: answer });
});

app.listen(PORT, () => {
  console.log(`Start listen http://localhost:${PORT}`);
});
