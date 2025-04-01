const winston = require('winston');
const { format, transports } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} [${info.label || 'Unlabeled'}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console()
  ]
});

module.exports = logger; 