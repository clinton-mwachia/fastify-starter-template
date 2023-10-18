/***
 * user routes
 */
const User = require("../models/user");

async function UserRoutes(fastify) {
  /** start get users */
  fastify.get("/", async (request, reply) => {
    reply.send("users");
  });
  /** start get users */
}

module.exports = UserRoutes;
