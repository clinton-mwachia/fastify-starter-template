// entry file
const fastify = require("fastify")({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});
const mongoose = require("mongoose");
const LoggerMiddleware = require("./helpers/logger");
const fastifyMultipart = require("@fastify/multipart");
//const authenticateMiddleware = require("./helpers/auth");
const path = require("node:path");
const config = require("./configs/config");

/** start import routes */
const UserRoutes = require("./routes/user");
const TodoRoutes = require("./routes/todo");
/** end import routes */

/** start middlewares */
//fastify.addHook("preHandler", authenticateMiddleware);
fastify.addHook("preHandler", LoggerMiddleware);
/** end middlewares */

/** start routes */
fastify.register(fastifyMultipart, {
  attachFieldsToBody: "keyValues",
});
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "uploads"),
  prefix: "/uploads/",
});
fastify.register(require("@fastify/cors"), {
  origin: "*",
});
fastify.register(UserRoutes);
fastify.register(TodoRoutes);
/** end routes */

/** start constants */
const DB = config.mongo_url;
const PORT = config.port;
/** end constants */

/**
 * connect to the db
 */
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    fastify.log.info("DB SUCCESSFULLY CONNECTED!!!");
  })
  .catch((err) => fastify.log.error(err.message));

/**
 * Run the server!
 */
const start = async () => {
  try {
    fastify.listen({ port: PORT, host: "127.0.0.1" });
    fastify.log.info("Server started");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
