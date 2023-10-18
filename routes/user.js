/***
 * user routes
 */
const User = require("../models/user");
const bcrypt = require("bcrypt");

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
}

module.exports = UserRoutes;
