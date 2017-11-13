"use strict";

const expect = require('expect.js');
const sandbox = require('sandboxed-module');

const ACCESS_KEY = 'ACCESS_KEY';
const SECRET_KEY = 'SECRET_KEY';
const REGION = 'REGION';
const LOG_GROUP = 'LOG_GROUP';
const LOG_STREAM = 'LOG_STREAM';
const DATA = 'DATA';
const LOGGING_EVENT = 'LOGGING_EVENT';
const TIMEZONE_OFFSET = 'TIMEZONE_OFFSET';
const CUSTOM_LAYOUT_TYPE = 'CUSTOM_LAYOUT_TYPE';
const CUSTOM_LAYOUT = {
    type: CUSTOM_LAYOUT_TYPE
};

describe('log4js-cloudwatch-appender', function () {

    let config, group, stream, data, appender, layout, type, loggingEvent, timezoneOffset;

    function basicLayout(_loggingEvent, _timezoneOffset) {
        loggingEvent = _loggingEvent;
        timezoneOffset = _timezoneOffset;
        return DATA;
    }

    const fakeLogger = {
        log: function (_stream, _data) {
            stream = _stream;
            data = _data;
        }
    };

    const fakeLawgs = {
        config: function (_config) {
            config = _config;
        },
        getOrCreate: function (_group) {
            group = _group;
            return fakeLogger;
        }
    };

    function layoutFn(_type, _layout) {
        layout = _layout;
        type = _type;
        return basicLayout;
    }

    const layouts = {
        basicLayout: basicLayout,
        layout: layoutFn
    };

    before(function (done) {

        delete require.cache['../lib/index.js'];
        delete require.cache['lawgs'];
        appender = sandbox.require('../lib/index.js', {
            requires: {
                'lawgs': fakeLawgs
            },
            globals: {}
        });
        done();
    });

    it('should configure lawgs properly', function (done) {
        appender.configure({
            accessKeyId: ACCESS_KEY,
            secretAccessKey: SECRET_KEY,
            region: REGION,
            logGroup: LOG_GROUP
        }, layouts);
        expect(config.aws.accessKeyId).to.be(ACCESS_KEY);
        expect(config.aws.secretAccessKey).to.be(SECRET_KEY);
        expect(config.aws.region).to.be(REGION);
        expect(group).to.be(LOG_GROUP);
        done();
    });

    it('should log properly no custom layout', function (done) {
        const logger = appender.configure({
            logStream: LOG_STREAM,
            timezoneOffset: TIMEZONE_OFFSET
        }, layouts);
        logger(LOGGING_EVENT);
        expect(layout).to.be(undefined);
        expect(type).to.be(undefined);
        expect(stream).to.be(LOG_STREAM);
        expect(data).to.be(DATA);
        expect(loggingEvent).to.be(LOGGING_EVENT);
        expect(timezoneOffset).to.be(TIMEZONE_OFFSET);
        done();
    });

    it('should log properly custom layout', function (done) {
        const logger = appender.configure({
            logStream: LOG_STREAM,
            timezoneOffset: TIMEZONE_OFFSET,
            layout: CUSTOM_LAYOUT
        }, layouts);
        logger(LOGGING_EVENT);
        expect(layout).to.be(CUSTOM_LAYOUT);
        expect(type).to.be(CUSTOM_LAYOUT_TYPE);
        expect(stream).to.be(LOG_STREAM);
        expect(data).to.be(DATA);
        expect(loggingEvent).to.be(LOGGING_EVENT);
        expect(timezoneOffset).to.be(TIMEZONE_OFFSET);
        done();
    });

});