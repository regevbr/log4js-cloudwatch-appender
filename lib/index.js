'use strict';

const lawgs = require('lawgs');

function awsAppender(accessKeyId, secretAccessKey, region, logGroup, logStream, layout, timezoneOffset, lawgsConfig) {
    lawgs.config({
        aws: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: region
        }
    });
    const logger = lawgs.getOrCreate(logGroup);
    if (lawgsConfig) {
        logger.config(lawgsConfig);
    }
    return function (loggingEvent) {
        logger.log(logStream, layout(loggingEvent, timezoneOffset));
    };
}

function configure(config, layouts) {
    let layout = layouts.basicLayout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }

    return awsAppender(
        config.accessKeyId,
        config.secretAccessKey,
        config.region,
        config.logGroup,
        config.logStream,
        layout,
        config.timezoneOffset,
        config.lawgsConfig
    );
}

module.exports.configure = configure;
