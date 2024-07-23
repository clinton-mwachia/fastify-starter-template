const config = {
  port: process.env.PORT || 4050,
  mongo_url: process.env.DB,
  jwt_secret: process.env.SECRET || "mysecret",
};

module.exports = config;
