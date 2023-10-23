const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET = process.env.SECRET;

const authenticateMiddleware = async (request, reply) => {
  const { url } = request.raw;

  // Exclude the login and register routes from authentication
  if (url === "/user/login" || url === "/user/register") {
    return;
  }
  const token = request.headers.authorization || "";
  const clean_token = token.replace("Bearer ", "");

  if (!clean_token) {
    reply.status(401).send({ message: "you have not logged in!!" });
    return;
  }

  try {
    const decodedToken = jwt.verify(clean_token, SECRET);

    if (decodedToken.exp < Date.now() / 1000) {
      reply.status(401).send({ message: "token has expired" });
    } else {
      request.userid = decodedToken.userid;
    }
  } catch (error) {
    reply.status(401).send({ message: "Authentication failed", error });
    return;
  }
};

module.exports = authenticateMiddleware;
