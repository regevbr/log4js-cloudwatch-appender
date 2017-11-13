[![Build Status](https://travis-ci.org/regevbr/log4js-cloudwatch-appender.svg?branch=master)](https://travis-ci.org/regevbr/log4js-cloudwatch-appender)
[![Coverage Status](https://coveralls.io/repos/github/regevbr/log4js-cloudwatch-appender/badge.svg)](https://coveralls.io/github/regevbr/log4js-cloudwatch-appender)
[![bitHound Overall Score](https://www.bithound.io/github/regevbr/log4js-cloudwatch-appender/badges/score.svg)](https://www.bithound.io/github/regevbr/log4js-cloudwatch-appender)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/log4js-cloudwatch-appender/badge.svg)](https://snyk.io/test/github/regevbr/log4js-cloudwatch-appender)
[![dependencies Status](https://david-dm.org/regevbr/log4js-cloudwatch-appender/status.svg)](https://david-dm.org/regevbr/log4js-cloudwatch-appender)
[![devDependencies Status](https://david-dm.org/regevbr/log4js-cloudwatch-appender/dev-status.svg)](https://david-dm.org/regevbr/log4js-cloudwatch-appender?type=dev)
[![npm](https://img.shields.io/npm/dt/log4js-cloudwatch-appender.svg)](https://github.com/regevbr/log4js-cloudwatch-appender)
[![HitCount](http://hits.dwyl.io/regevbr/log4js-cloudwatch-appender.svg)](http://hits.dwyl.io/regevbr/log4js-cloudwatch-appender)


[![https://nodei.co/npm/log4js-cloudwatch-appender.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/log4js-cloudwatch-appender.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/log4js-cloudwatch-appender)



# busywait.js
Simple Async busy wait module for Node.JS

## Installation

This module is installed via npm:

```
npm install --save busywait
```

## Usage

Running:
```js
const busywait = require('../lib/index').sync;

const waitUntil = Date.now() + 2500;

function syncCheck(iteration) {
    console.log('running iteration', iteration);
    return Date.now() > waitUntil;
}

busywait(syncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (result) {
        console.log('finished after', result.iterations, 'iterations', 'with' +
            ' result', result.result);
    });
```
or:
```js
const busywait = require('../lib/index').async;

const waitUntil = Date.now() + 2500;

function asyncCheck(iteration) {
    return new Promise(function (resolve, reject) {
        console.log('running iteration', iteration);
        if (Date.now() > waitUntil) {
            return resolve(true);
        } else {
            return reject();
        }
    });
}

busywait(asyncCheck, {
    sleepTime: 500,
    maxChecks: 20
})
    .then(function (result) {
        console.log('finished after', result.iterations, 'iterations', 'with' +
            ' result', result.result);
    });
```
Will result in:
```
running iteration 1
running iteration 2
running iteration 3
running iteration 4
running iteration 5
running iteration 6
finished after 6 iterations with result true
```

## Methods

### sync(syncCheckFn, options): Promise

The `syncCheckFn` first argument is the function to run on each iteration.
`syncCheckFn` must be a function with a boolean return value.
The current iteration number will be passed as first argument to every call of `syncCheckFn`. 

#### Options

##### mandatory

- `sleepTime` - Time in ms to wait between checks  
- `maxChecks` - The max number of checks to perform before failing 

##### optional

- `waitFirst` - Should we wait the `sleepTime` before performing the first check (default: false)  
- `failMsg` - Custom error message to reject the promise with

#### Return value

Return value is a promise.
- The promise will be resolved if the `syncCheckFn` returned true within a
legal number of checks.
- The promise will be rejected if the `syncCheckFn` rejected `maxChecks`
times.

Promise resolved value:
- `iterations` - The number of iterations it took to finish
- `result` - Constant `true`

### async(asyncCheckFn, options): Promise

The `asyncCheckFn` first argument is the function to run on each iteration.
`syncCheckFn` must be a function with a promise return value.
The current iteration number will be passed as first argument to every call of `asyncCheckFn`. 

#### Options

##### mandatory

- `sleepTime` - Time in ms to wait between checks  
- `maxChecks` - The max number of checks to perform before failing 

##### optional

- `waitFirst` - Should we wait the `sleepTime` before performing the first check (default: false)  
- `failMsg` - Custom error message to reject the promise with

#### Return value

Return value is a promise.
- The promise will be resolved if the `asyncCheckFn` was resolved within a
legal number of checks.
- The promise will be rejected if the `asyncCheckFn` rejected `maxChecks` times.

Promise resolved value:
- `iterations` - The number of iterations it took to finish
- `result` - The resolved value of `asyncCheckFn`
