const Todo = require("../models/todo");
const mongoose = require("mongoose");
const User = require("../models/user");
const path = require("node:path");
const fs = require("node:fs");
const { pipeline } = require("stream/promises");

async function TodoRoutes(fastify) {
  fastify.post("/todo/register", async (request, reply) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      console.log("Upload Directory:", uploadDir);
      console.log("Request Body:", request.body);

      const body = {};
      const uploadedFiles = [];

      for (const [key, field] of Object.entries(request.body || {})) {
        // Handle arrays of files
        if (Array.isArray(field)) {
          for (const item of field) {
            if (!item || !item.file) continue;

            const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${path.basename(item.filename)}`;

            const filepath = path.join(uploadDir, filename);

            await pipeline(item.file, fs.createWriteStream(filepath));

            uploadedFiles.push(filename);
          }
        }

        // Handle single file
        else if (field && field.file) {
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${path.basename(field.filename)}`;

          const filepath = path.join(uploadDir, filename);

          await pipeline(field.file, fs.createWriteStream(filepath));

          uploadedFiles.push(filename);
        }

        // Handle normal text fields
        else if (
          field &&
          typeof field === "object" &&
          Object.prototype.hasOwnProperty.call(field, "value")
        ) {
          body[key] = field.value;
        }

        // Handle primitive values
        else {
          body[key] = field;
        }
      }

      // Validation
      const { user: userId, title } = body;

      if (!userId || !title) {
        return reply.status(400).send({
          success: false,
          message: "User and title are required.",
        });
      }

      // Check user exists
      const userExists = await User.findById(userId);

      if (!userExists) {
        return reply.status(404).send({
          success: false,
          message: "User not found.",
        });
      }

      // Save Todo
      const todo = new Todo({
        ...body,
        files: uploadedFiles,
      });

      await todo.save();

      return reply.status(201).send({
        success: true,
        message: "Todo added successfully.",
        todo,
      });
    } catch (error) {
      console.error(error);

      return reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });

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
