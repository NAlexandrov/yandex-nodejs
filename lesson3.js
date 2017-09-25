'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const httpGet = promisify(require('request'));
const co = require('co');

const readFile = promisify(fs.readFile);
const configFilePath = path.join(__dirname, 'config.json');

/*
Промисы
*/

readFile(configFilePath)
  .then(buffer => JSON.parse(buffer.toString()))
  .then(config => config.url)
  .then(url => httpGet(url))
  .then(response => response.statusCode)
  .then(value => console.log(`promise ${value}`))
  .catch(err => console.error(err));

/*
Генераторы
*/

function* getStatusCode() {
  const buffer = yield readFile(configFilePath);
  const config = JSON.parse(buffer.toString());
  const response = yield httpGet(config.url);
  return response.statusCode;
}

co(getStatusCode())
  .then(value => console.log(`co ${value}`))
  .catch(err => console.error(err.toString()));

/*
async / await
*/

(async () => {
  try {
    const buffer = await readFile(configFilePath);
    const config = JSON.parse(buffer.toString());
    const response = await httpGet(config.url);
    console.log(`await ${response.statusCode}`);
  } catch (err) {
    console.error(err);
  }
})();

/*
Дополнительные задания
*/

const arr = [1, 2, 3, 'one', 'two', 'three'];

/**
 * Выводит в консоль значение с задержкой в 1 секунду
 * @param {*} value 
 */
function displayValue(value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(value);
      resolve();
    }, 1000);
  });
}

arr.reduce((promise, value) => promise.then(() => displayValue(value)), Promise.resolve());


/**
 * Дополнительное задание №2 - Реализовать аналог co
 * @param {*} iter 
 * @param {*} state 
 */
function go(iter, state) {
  if (!state) {
    return go(iter, iter.next());
  }

  let value = state.value;

  function next(v) {
    if (!state.done) {
      return go(iter, iter.next(v));
    }

    return v;
  }

  if (!(value instanceof Promise)) {
    value = Promise.resolve(value);
  }

  return value.then(v => next(v));
}

go(getStatusCode())
  .then(value => console.log(`go ${value}`))
  .catch(err => console.error(err.toString()));
