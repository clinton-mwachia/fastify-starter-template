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
//const authenticateMiddleware = require("./helpers/auth");
const cluster = require("node:cluster");
const { cpus } = require("node:os");

const numCPUs = cpus().length;

/** start import routes */
const UserRoutes = require("./routes/user");
const TodoRoutes = require("./routes/todo");
/** end import routes */

/** start middlewares */
//fastify.addHook("preHandler", authenticateMiddleware);
fastify.addHook("preHandler", LoggerMiddleware);
/** end middlewares */

/** start routes */
fastify.register(UserRoutes);
fastify.register(TodoRoutes);
/** end routes */

/** start constants */
const DB = process.env.DB;
const PORT = process.env.PORT;
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

if (cluster.isPrimary) {
  fastify.log.info(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    fastify.log.info(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  start();

  fastify.log.info(`Worker ${process.pid} started`);
}
