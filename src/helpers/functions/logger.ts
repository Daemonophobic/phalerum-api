const { createLogger, format, transports } = require("winston");

const { combine, timestamp, label, printf } = format;

require("winston-daily-rotate-file");

const transport = new transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d"
});

const errorTransport = new transports.DailyRotateFile({
  level: 'error',
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logFormat = printf(({ level, message, label, timestamp }: 
    {level: any, message: any, label: any, timestamp: any}) => JSON.stringify({"timestamp": `${timestamp}`, "label":
   `[${label}]`, "level": `${level}`, "message": `${message}`}));

const logger = createLogger({
  defaultMeta: { service: "phalerum-server" },
  format: combine(
    label({label: "phalerum-server"}),
    timestamp(),
    logFormat
  ),
  transports: [
    transport,
    errorTransport,
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({
    format: format.simple(),
  }));
}

export default logger;