const { createLogger, transports, format } = require('winston');
require('winston-daily-rotate-file');
const fsObj = require('fs');

const localSystemLogger = (logFolder) => {
  const env = process.env.NODE_ENV || 'dev';
  const logDir = 'log';

  if (!fsObj.existsSync(logDir)) {
    fsObj.mkdirSync(logDir);
  }
  if (!fsObj.existsSync(logFolder)) {
    fsObj.mkdirSync(logFolder);
  }

  const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/${logFolder}/%DATE%-results.log`,
    datePattern: 'YYYY-MM-DD',
  });

  return createLogger({
    level: env === 'dev' ? 'verbose' : 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    transports: [
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
          )
        ),
      }),
      dailyRotateFileTransport,
    ],
  });
};

const errorLog = {};
errorLog.saveErrorInLocalSystem = (logFolder, err) => {
  localSystemLogger(logFolder).info(err);
};

module.exports = errorLog;
