[![Build Status](https://travis-ci.org/regevbr/log4js-cloudwatch-appender.svg?branch=master)](https://travis-ci.org/regevbr/log4js-cloudwatch-appender)
[![Coverage Status](https://coveralls.io/repos/github/regevbr/log4js-cloudwatch-appender/badge.svg?branch=master)](https://coveralls.io/github/regevbr/log4js-cloudwatch-appender?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/regevbr/log4js-cloudwatch-appender/badges/score.svg)](https://www.bithound.io/github/regevbr/log4js-cloudwatch-appender)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/log4js-cloudwatch-appender/badge.svg)](https://snyk.io/test/github/regevbr/log4js-cloudwatch-appender)
[![dependencies Status](https://david-dm.org/regevbr/log4js-cloudwatch-appender/status.svg)](https://david-dm.org/regevbr/log4js-cloudwatch-appender)
[![devDependencies Status](https://david-dm.org/regevbr/log4js-cloudwatch-appender/dev-status.svg)](https://david-dm.org/regevbr/log4js-cloudwatch-appender?type=dev)
[![npm](https://img.shields.io/npm/dt/log4js-cloudwatch-appender.svg)](https://github.com/regevbr/log4js-cloudwatch-appender)
[![HitCount](http://hits.dwyl.io/regevbr/log4js-cloudwatch-appender.svg)](http://hits.dwyl.io/regevbr/log4js-cloudwatch-appender)


[![https://nodei.co/npm/log4js-cloudwatch-appender.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/log4js-cloudwatch-appender.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/log4js-cloudwatch-appender)

# log4js-cloudwatch-appender
Simple appender for log4js to submit logs to AWS cloudwatch based on the [lawgs](https://github.com/mentum/lawgs) module.

## Installation

This module is installed via npm:

```
npm install --save log4js-cloudwatch-appender
```

## Usage

Add aws appender to the log4js config file:
```js
const config = {
    appenders: {
        aws: {
              type: "log4js-cloudwatch-appender",
              accessKeyId: '<accessKeyId>',
              secretAccessKey: '<secretAccessKey>',
              region: 'eu-central-1',
              logGroup: 'prod',
              logStream: 'apps',
              layout: '<custom layout object>'
            }
    },
    categories: {
        default: {appenders: ['aws'], level: 'info'}
    }
}
```

This will cause logs to be sent to AWS CloudWatch with the specified group and stream.

## Configuration


If you are using roles, you will need the following roles:
- logs:DescribeLogGroups
- logs:DescribeLogStreams
- logs:CreateLogGroup
- logs:CreateLogStream
- logs:PutLogEvents

### mandatory

- `region` - The CloudWatch region 
- `logGroup` - The log group to send the metrics to
- `logStream` - The log stream of the group to send the metrics to

### optional

- `accessKeyId` - Optional if credentials are set in `~/.aws/credentials`
- `secretAccessKey` - Optional if credentials are set in `~/.aws/credentials`
- `layout` - Custom layout. See [suggested layout](#suggested-json-layout)

## Suggested json layout

Logs are easier to query whn they are formatted as json. 
Following is a suggested json layout to set for this appender. 
The logging style should be:

```js
const uuid = require('node-uuid');
const corr = uuid.v4();
const logger = logFactory.getLogger('category');

logger.info(corr, 'methodName()','part1','part2');
```

Which will output:
```json
{
  "timestamp": "2017-06-10T11:55:38.251Z",
  "corr": "2e2c99aa-7eee-4fd2-ae36-cd9dc9533816",
  "app": "<appName>",
  "host": "<ip>",
  "pid": 24532,
  "level": "INFO",
  "category": "category",
  "method": "methodName()",
  "message": "part1 part2"
}
```

The layout:

```js
const util = require('util');
const _ = require('underscore');

let processName = path.basename(process.argv[1]);
processName = processName.substring(0, processName.length - 3);

const publicIp = require('public-ip').v4;
let ip = '';
publicIp()
  .then(function (_ip) {
    ip = _ip;
  })
  .catch(function (e) {
    console.log(e);
    ip = 'unknown';
  });

const jsonLayout = {
  "type": "pattern",
  "pattern": '{"timestamp": "%d{yyyy-MM-ddThh:mm:ss.SSSZ}", "app": "' + processName + '", "ip": "%x{my_ip}", "host": "%h", "pid": %z, "level": "%p", "category": "%c"%x{corr}%x{method}, "message": "%x{message}"}',
  "tokens": {
    "my_ip": function () {
      return ip;
    },
   "corr": function (logEvent) {
      logEvent.__data__ = _.map(logEvent.data, _.clone);
      if (logEvent.__data__) {
        let corr = logEvent.__data__[0];
        if (Array.isArray(corr) && corr.length === 2) {
          corr = corr[0];
          if (typeof corr === 'string' && corr.length === 36 && corr.split("-").length === 5) {
            logEvent.__data__[0] = logEvent.__data__[0][1];
            return ', "corr": "' + corr + '"';
          }
        }
        if (logEvent.__data__.length > 1 && corr && typeof corr === 'string' && corr.length === 36 && corr.split("-").length === 5) {
          logEvent.__data__.shift();
          return ', "corr": "' + corr + '"';
        }
      }
      return '';
    },
    "method": function (logEvent) {
      if (logEvent.__data__) {
        const method = logEvent.__data__[0];
        if (logEvent.__data__.length > 1 && method && typeof method === 'string' && method.indexOf("()", method.length - 2) !== -1) {
          logEvent.__data__.shift();
          return ', "method": "' + method + '"';
        }
      }
      return '';
    },
    "message": function (logEvent) {
      if (logEvent.__data__) {
        let data = logEvent.__data__;
        data = util.format.apply(util, wrapErrorsWithInspect(data));
        data = escapedStringify(data);
        logEvent.__data__ = undefined;
        return data;
      }
      return '';
    }
  }
};

function wrapErrorsWithInspect(items) {
  return items.map(function (item) {
    if ((item instanceof Error) && item.stack) {
      return {
        inspect: function () {
          return util.format(item) + '\n' + item.stack;
        }
      };
    } else {
      return item;
    }
  });
}

function escapedStringify(json) {
  return json
    .replace(/[\\]/g, '\\\\')
    .replace(/[\"]/g, '\\\"')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t');
}
```

## Contributing

Please make all pull requests to the `master` branch and ensure tests pass
locally.
