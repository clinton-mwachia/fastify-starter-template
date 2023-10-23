/** todos routers
 *
 */
async function TodoRoutes(fastify) {
  fastify.get("/todo", async (request, reply) => {
    reply.send({ message: "test" });
  });
}

module.exports = TodoRoutes;
