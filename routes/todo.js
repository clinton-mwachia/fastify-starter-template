/** todos routers
 *
 */
const Todo = require("../models/todo");
const User = require("../models/user");

async function TodoRoutes(fastify) {
  /** start insert a single todo */
  fastify.post("/todo/register", async (request, reply) => {
    try {
      const user = await User.findById(request.body.user);

      if (!user) {
        reply.status(404).send({ message: "User not found" });
      } else {
        const todo = new Todo(request.body);
        await todo.save();

        reply.send({ message: "User Account Created" });
      }
    } catch (err) {
      reply.status(500).send({ message: "Error inserting todo", err });
    }
  });
  /** end insert a single todo */
}

module.exports = TodoRoutes;
