const winston = require("winston");

// Define log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]  ${message}`;
  })
);

// Create a logger with console and file transports
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "./logs/app.log" }),
  ],
});

const LoggerMiddleware = (request, reply, done) => {
  const { method, url, id, ip } = request;

  logger.info(
    `Received Request: ipAddress: ${ip} Method: ${method} URL: ${url} Req_id: ${id} Status: ${
      reply.statusCode
    } responseTime: ${reply.getResponseTime()}ms`
  );
  done();
};

module.exports = LoggerMiddleware;
