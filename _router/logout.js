const fs = require("fs");
const path = require("path");
const { deleteToken } = require("../helpers/tokens");
const logout = async (data, cb) => {
  if (data.method.toLowerCase() !== "delete") {
    return cb({
      statusCode: 400,
      error: "wrong method",
    });
  }
  const token =
    data.headers.token && typeof data.headers.token === "string"
      ? data.headers.token
      : null;
  if (!token) {
    return cb({ statusCode: 401, error: "No user Token  or expired Token" });
  }

  try {
    await deleteToken(token, cb);
  } catch (err) {
    console.log(err);
  }
};

module.exports = logout;
