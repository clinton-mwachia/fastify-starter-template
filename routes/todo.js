/**
 * todos routers
 */
const Todo = require("../models/todo");
const mongoose = require("mongoose");
const User = require("../models/user");
const multer = require("fastify-multer");
const path = require("node:path");
const fs = require("node:fs");

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
      const { user, title, due } = request.body;

      if (!user || !title) {
        reply.send({ message: "The fields are required" });
      }
      try {
        const user = await User.findById(request.body.user);

        if (!user) {
          reply.status(404).send({ message: "User not found" });
        } else {
          let imgUrls = [];
          if (request.files) {
            for (const file of request.files) {
              const { originalname } = file;
              imgUrls.push(originalname);
            }
          }

          const todo = new Todo(request.body);
          todo.files = imgUrls;
          await todo.save();

          reply.send({ message: "Todo Added!" });
        }
      } catch (err) {
        reply
          .status(500)
          .send({ message: "Error inserting todo " + err.message });
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
      reply
        .status(500)
        .send({ message: "Error getting todos " + error.message });
    }
  });
  /** end get all todos */

  /** start get todos with server side pagination */
  fastify.get("/todos/pagination", async (request, reply) => {
    const { page, limit } = request.query;
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    try {
      const totalTodos = await Todo.countDocuments();
      const totalPages = Math.ceil(totalTodos / pageSize);

      const todos = await Todo.find()
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate({ path: "user", select: "username role phone" });

      reply.send({
        totalPages: totalPages,
        data: todos,
        hasMore: page < totalPages,
      });
    } catch (error) {
      reply
        .status(500)
        .send({ message: "Error getting todos " + error.message });
    }
  });

  /** end get todos with server side pagination */

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
      reply
        .status(500)
        .send({ message: "Error getting todo " + error.message });
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
      reply
        .status(500)
        .send({ message: "Error getting todos " + error.message });
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
      reply
        .status(500)
        .send({ message: "Error getting todos " + error.message });
    }
  });
  /** end get todos by priority */

  /** start delete a todo by id */
  fastify.delete("/todo/:id", async (request, reply) => {
    try {
      // Find todo by ID
      const todo = await Todo.findById(request.params.id);

      if (!todo) {
        return reply.status(404).send({ message: "Todo not found" });
      }

      if (todo.files !== null) {
        // Delete the associated files in the "uploads" folder
        const filePathsToDelete = todo.files
          .filter((filename) => filename !== null && filename !== undefined)
          .map((filename) => path.join(__dirname, "../uploads", filename))
          .filter((filePath) => fs.existsSync(filePath)); // skip files that do not exist

        filePathsToDelete.forEach((filePath) => {
          // Use fs.unlink to delete the file
          fs.unlinkSync(filePath);
        });
      }

      const todoDel = await Todo.findByIdAndDelete(request.params.id);
      if (!todoDel) {
        reply.send({ message: "todo already deleted" });
      } else {
        reply.send({ message: "todo deleted" });
      }
    } catch (err) {
      reply.status(500).send({
        message: `Error deleting todo ${request.params.id} ` + err.message,
      });
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
      reply.status(500).send({
        message: `Error updating todo ${request.params.id} ` + err.message,
      });
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
      return reply.status(500).send({ message: error.message });
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
      return reply.status(500).send({ message: error.message });
    }
  });
  /** end count todos by priority*/

  /** start aggregate todos */
  // TODOD
  /** end aggregate todos */
}

module.exports = TodoRoutes;
