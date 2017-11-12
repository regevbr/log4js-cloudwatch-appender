'use strict';

const lawgs = require('lawgs');

function awsAppender(accessKeyId, secretAccessKey, region, logGroup, logStream, layout, timezoneOffset) {
    lawgs.config({
        aws: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: region
        }
    });
    const logger = lawgs.getOrCreate(logGroup);
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
        config.timezoneOffset
    );
}

module.exports.configure = configure;
