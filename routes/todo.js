const Todo = require("../models/todo");
const mongoose = require("mongoose");
const User = require("../models/user");
const path = require("node:path");
const fs = require("node:fs");

async function TodoRoutes(fastify) {
  /** start insert a single todo */
  fastify.post("/todo/register", async (request, reply) => {
    try {
      // 1. Initialize collections for text fields and file details
      const body = {};
      const imgUrls = [];

      // 2. Safely parse incoming multipart forms (files + text fields) sequentially
      const parts = request.parts();
      for await (const part of parts) {
        if (part.file) {
          // It's a file! Stream it directly to your disk folder
          const savePath = path.join(__dirname, "../uploads", part.filename);
          await part.toBuffer(); // Alternately, stream write or save to disk:

          // To stream directly to disk without loading entirely into memory:
          const writeStream = fs.createWriteStream(savePath);
          await new Promise((resolve, reject) => {
            part.file.pipe(writeStream);
            part.file.on("end", resolve);
            part.file.on("error", reject);
          });

          imgUrls.push(part.filename);
        } else {
          // It's a regular text field! (e.g., user, title, due)
          body[part.fieldname] = part.value;
        }
      }

      const { user: userId, title } = body;

      // 3. Match old validation logic
      if (!userId || !title) {
        return reply.status(400).send({ message: "The fields are required" });
      }

      const userExists = await User.findById(userId);
      if (!userExists) {
        return reply.status(404).send({ message: "User not found" });
      }

      // 4. Save to the database
      const todo = new Todo(body);
      todo.files = imgUrls;
      await todo.save();

      return reply.send({ message: "Todo Added!" });
    } catch (err) {
      return reply
        .status(500)
        .send({ message: "Error inserting todo " + err.message });
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
        hasMore: pageNumber < totalPages,
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
    if (!mongoose.isValidObjectId(request.params.id)) {
      return reply.status(400).send({ message: "Invalid todo id" });
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
      const todo = await Todo.findById(request.params.id);

      if (!todo) {
        return reply.status(404).send({ message: "Todo not found" });
      }

      if (todo.files && todo.files.length > 0) {
        const filePathsToDelete = todo.files
          .filter((filename) => filename !== null && filename !== undefined)
          .map((filename) => path.join(__dirname, "../uploads", filename))
          .filter((filePath) => fs.existsSync(filePath));

        filePathsToDelete.forEach((filePath) => {
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
        { new: true },
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
      return reply.send({ TotalTodos: todocount || 0 });
    } catch (error) {
      return reply.status(500).send({ message: error.message });
    }
  });
  /** end count all todos */

  /** start count todos by priority */
  fastify.get("/todos/count/priority", async (request, reply) => {
    try {
      const todocount = await Todo.countDocuments({
        priority: request.query.priority,
      });
      return reply.send({ TotalTodos: todocount || 0 });
    } catch (error) {
      return reply.status(500).send({ message: error.message });
    }
  });
  /** end count todos by priority*/
}

module.exports = TodoRoutes;
