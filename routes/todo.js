/**
 * todos routers
 */
const Todo = require("../models/todo");
const mongoose = require("mongoose");
const User = require("../models/user");
const multer = require("fastify-multer");
const path = require("node:path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

async function TodoRoutes(fastify) {
  fastify.register(upload.contentParser);
  /** start insert a single todo */
  fastify.post(
    "/todo/register",
    { preHandler: upload.array("files", 12) },
    async (request, reply) => {
      try {
        const user = await User.findById(request.body.user);

        if (!user) {
          reply.status(404).send({ message: "User not found" });
        } else {
          /*
          THIS APPROACH WORKS WHEN UPLOADING FROM A FRONTEND (REACT)
          let obj = {
            user: request.body.user,
            title: request.body.title,
            priority: request.body.priority,
          };
          let imgUrls = [];
          if (request.files) {
            for (const file of request.files) {
              const { originalname } = file;
              imgUrls.push(originalname);
            }
          }

          obj.files = imgUrls;

           const todo = new Todo(obj);
          */
          const imgUrls = [];
          const imgs = request.files;
          imgs &&
            imgs.map((img) => {
              imgUrls.push(img.name);
            });
          const todo = new Todo(request.body);
          todo.files = imgUrls;
          await todo.save();

          reply.send({ message: "Todo Added!" });
        }
      } catch (err) {
        reply.status(500).send({ message: "Error inserting todo", err });
      }
    }
  );
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

  /** start get todos by userid */
  fastify.get("/todos/user", async (request, reply) => {
    try {
      const todos = await Todo.find({ user: request.query.user })
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "username role phone" });
      reply.send(todos);
    } catch (error) {
      reply.status(500).send({ message: "Error getting todos", error });
    }
  });
  /** end get todos by userid */

  /** start get todos by priority */
  fastify.get("/todos/priority", async (request, reply) => {
    try {
      const todos = await Todo.find({ priority: request.query.priority })
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "username role phone" });
      reply.send(todos);
    } catch (error) {
      reply.status(500).send({ message: "Error getting todos", error });
    }
  });
  /** end get todos by priority */

  /** start delete a todo by id */
  fastify.delete("/todo/:id", async (request, reply) => {
    try {
      const todoDel = await Todo.findByIdAndDelete(request.params.id);
      if (!todoDel) {
        reply.send({ message: "todo already deleted" });
      } else {
        reply.send({ message: "todo deleted" });
      }
    } catch (err) {
      reply
        .status(500)
        .send({ message: `Error deleting todo ${request.params.id}`, err });
    }
  });
  /** end delete a todo by id */

  /** start update todo by id */
  fastify.put("/todo/:id", async (request, reply) => {
    try {
      const todo = await Todo.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
          new: true,
        }
      );
      if (!todo) {
        reply.send({ message: "todo not found!" });
      } else {
        reply.send({ message: "todo updated!!!" });
      }
    } catch (err) {
      reply
        .status(500)
        .send({ message: `Error updating todo ${request.params.id}`, err });
    }
  });
  /** end update todo by id */

  /** start count all todos */
  fastify.get("/todos/count", async (request, reply) => {
    try {
      const todocount = await Todo.countDocuments();
      if (!todocount) {
        return reply.send({ TotalTodos: 0 });
      } else {
        return reply.send({ TotalTodos: todocount });
      }
    } catch (error) {
      return reply.status(500).send({ message: error });
    }
  });
  /** end count all todos */

  /** start count todos by priority */
  // http://localhost:4050/todos/count/priority?priority=low
  fastify.get("/todos/count/priority", async (request, reply) => {
    try {
      const todocount = await Todo.find({
        priority: request.query.priority,
      }).countDocuments();
      if (!todocount) {
        return reply.send({ TotalTodos: 0 });
      } else {
        return reply.send({ TotalTodos: todocount });
      }
    } catch (error) {
      return reply.status(500).send({ message: error });
    }
  });
  /** end count todos by priority*/

  /** start aggregate todos */
  // TODOD
  /** end aggregate todos */
}

module.exports = TodoRoutes;
