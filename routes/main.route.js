const express = require("express");
const main = express();

const user = require("./user.route");
const post = require("./post.route");
const friend = require("./friend.route");

main.use("/api/v1/user", user);
main.use("/api/v1/post", post);
main.use("/api/v1/friend", friend);

module.exports = main;