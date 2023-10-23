/** todos routers
 *
 */
const Todo = require("../models/todo");
const mongoose = require("mongoose");
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

        reply.send({ message: "Todo Added!" });
      }
    } catch (err) {
      reply.status(500).send({ message: "Error inserting todo", err });
    }
  });
  /** end insert a single todo */

  /** start get all todos */
  fastify.get("/todos", async (request, reply) => {
    try {
      const todos = await Todo.find()
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "username role phone" });
      reply.send(todos);
    } catch (error) {
      reply.status(500).send({ message: "Error getting todos", error });
    }
  });
  /** end get all todos */

  /** start get todo by id */
  fastify.get("/todo/:id", async (request, reply) => {
    // validate todo id
    if (!mongoose.isValidObjectId(request.params.id)) {
      reply.status(400).send({ message: "Invalid todo id" });
    }
    try {
      const todo = await Todo.findById(request.params.id)
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "username role phone" });
      if (!todo) {
        reply.status(404).send({ message: "todo not found" });
      } else {
        reply.send(todo);
      }
    } catch (error) {
      reply.status(500).send({ message: "Error getting todo", error });
    }
  });
  /** end get todo by id */
}

module.exports = TodoRoutes;
