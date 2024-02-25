import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as SlackHook from 'winston-slack-webhook-transport';
import * as winstonMongoDB from 'winston-mongodb';

const mongoTransport = new winstonMongoDB.MongoDB({
  db: 'mongodb://localhost:27017/DB_INVOIKA_LOGGER',
  options: {
    useUnifiedTopology: true,
  },
  collection: 'logs',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
    }),
  ),
});
const fileLogTransport = new winston.transports.DailyRotateFile({
  filename: `logs/system-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});
const slackWebhookTransport = new SlackHook({
  webhookUrl: `${process.env.SLACK_WEBHOOK_URL}`,
  channel: '#logs',
  username: 'LoggerBot',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
    }),
  ),
});

const transports = [
  consoleTransport,
  mongoTransport,
  fileLogTransport,
  slackWebhookTransport,
];
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});
