/***
 * user routes
 */
const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

async function UserRoutes(fastify) {
  /** start register users */
  fastify.post("/user/register", async (request, reply) => {
    try {
      const user = new User(request.body);
      user.password = bcrypt.hashSync(request.body.password, 10);

      await user.save();

      reply.send({ message: "User Account Created!" });
    } catch (error) {
      reply.status(500).send({ message: "Error creating user account", error });
    }
  });
  /** start register users */

  /** start get all users */
  fastify.get("/users", async (request, reply) => {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      reply.send(users);
    } catch (error) {
      reply.status(500).send({ message: "Error getting users", error });
    }
  });
  /** end get all users */

  /** start get user by id */
  fastify.get("/user/:id", async (request, reply) => {
    if (!mongoose.isObjectIdOrHexString(request.params.id)) {
      reply.status(400).send({ message: "invalid user id" });
    }
    try {
      const user = await User.findById(request.params.id);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
      } else {
        reply.send(user);
      }
    } catch (error) {
      reply.status(500).send({ message: "Error getting user by ID", error });
    }
  });
  /** end get user by userid */
}

module.exports = UserRoutes;
