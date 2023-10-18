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
require("dotenv").config();

/** start import routes */
const UserRoutes = require("./routes/user");
/** end import routes */

/** start middlewares */
fastify.addHook("preHandler", LoggerMiddleware);
/** end middlewares */

/** start routes */
fastify.register(UserRoutes);
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
    fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
