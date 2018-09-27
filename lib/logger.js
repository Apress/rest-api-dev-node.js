const config = require("config");

let _ENV = process.env.NODE_ENV || config.get('env');

const { createLogger, format, addColors, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const myCustomLevels = {
  levels: {
    error: 0, 
    warn: 1, 
    info: 2, 
    debug: 3, 
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'violet'
  }
};

const logger = createLogger({
  format: combine(
    colorize(),
    label({ label: _ENV }),
    timestamp(),
    myFormat
  ),
  levels: myCustomLevels.levels,
  transports: [new transports.Console()]
});

addColors(myCustomLevels)

module.exports = logger;