/***
 * user routes
 */
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

  /** start delete a user by id */
  fastify.delete("/user/:id", async (request, reply) => {
    if (!mongoose.isObjectIdOrHexString(request.params.id)) {
      reply.status(400).send({ message: "invalid user id" });
    }
    try {
      const userDel = await User.findByIdAndDelete(request.params.id);
      if (!userDel) {
        reply.send({ message: "User already deleted" });
      } else {
        reply.send({ message: "User deleted" });
      }
    } catch (err) {
      reply
        .status(500)
        .send({ message: `Error deleting user ${request.params.id}`, err });
    }
  });
  /** end delete a user by id */

  /** start update user by id */
  fastify.put("/user/:id", async (request, reply) => {
    if (!mongoose.isObjectIdOrHexString(request.params.id)) {
      reply.status(400).send({ message: "invalid user id" });
    }
    try {
      const user = await User.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
          new: true,
        }
      );
      if (!user) {
        reply.send({ message: "User not found!" });
      } else {
        reply.send({ message: "User updated!!!" });
      }
    } catch (err) {
      reply
        .status(500)
        .send({ message: `Error updating user ${request.params.id}`, err });
    }
  });
  /** end update user by id */

  /** start user login */
  fastify.post("/user/login", async (request, reply) => {
    try {
      const user = await User.findOne({ username: request.body.username });
      const secret = process.env.SECRET;

      if (!user) {
        return reply.status(404).send({ message: "user not found" });
      } else {
        if (user && bcrypt.compareSync(request.body.password, user.password)) {
          const token = jwt.sign({ userid: user.id }, secret, {
            expiresIn: "1h",
          });
          return reply.send({
            token: token,
            userId: user._id,
            message: "Login successful",
          });
        } else {
          return reply
            .status(400)
            .send({ message: "password/username is incorrect" });
        }
      }
    } catch (error) {
      return reply.status(500).send({ message: error });
    }
  });
  /** end user login */

  /** start change password */
  fastify.put("/user/changepwd/:id", async (request, reply) => {
    if (!mongoose.isObjectIdOrHexString(request.params.id)) {
      reply.status(400).send({ message: "invalid user id" });
    }
    try {
      const userFind = await User.findById(request.params.id);

      if (!userFind) {
        reply.status(404).send({ message: "User not found" });
      }
      if (bcrypt.compareSync(request.body.oldPassword, userFind.password)) {
        const user = await User.findByIdAndUpdate(
          request.params.id,
          { password: bcrypt.hashSync(request.body.password, 10) },
          {
            new: true,
          }
        );
        if (!user) {
          return reply
            .status(400)
            .send({ message: "password cannot be updated" });
        } else {
          return reply
            .status(200)
            .send({ success: true, message: "Password changed" });
        }
      } else {
        return reply.status(500).send({ message: "wrong old password" });
      }
    } catch (error) {
      return reply.status(400).send({ message: error.message });
    }
  });
  /** end change password */

  /** start reset password */
  fastify.put("/user/:id/pwd-reset", async (request, reply) => {
    if (!mongoose.isObjectIdOrHexString(request.params.id)) {
      reply.status(400).send({ message: "invalid user id" });
    }
    try {
      const user = await User.findByIdAndUpdate(
        request.params.id,
        { password: bcrypt.hashSync(request.body.password, 10) },
        {
          new: true,
        }
      );
      if (!user) {
        return reply.status(400).send({ message: "User not found" });
      } else {
        return reply
          .status(200)
          .send({ success: true, message: "Password Reset Successful" });
      }
    } catch (error) {
      return reply.status(400).send({ message: error.message });
    }
  });
  /** end reset password */
}

module.exports = UserRoutes;
