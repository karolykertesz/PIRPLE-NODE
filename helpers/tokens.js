const fs = require("fs");
const path = require("path");
const tokenpath = path.join(__dirname, "../tokens/");
// function creates a valid valid token,stores it token folder ,as ${user.id}.json the token valid for 2 hours
const createToken = async (info, cb) => {
  const tokenObj = JSON.stringify({
    id: info.id,
    expires: Date.now() + 1000 * 60 * 120,
  });
  return fs.writeFile(
    `${tokenpath}${info.id}.json`,
    tokenObj,

    (err) => {
      if (err) {
        return cb({
          statusCode: 400,
          error: "error writting to File",
        });
      }
      return cb({
        statusCode: 201,
        message: `Your user token ${info.id}`,
      });
    }
  );
};
// function reads and validates tokens
const readToken = (token, cb, fn, ...args) => {
  fs.readFile(`${tokenpath}${token}.json`, (err, data) => {
    if (err) {
      return cb({
        statusCode: 403,
        error: "Invalid or expired token",
      });
    }
    if (!err && data) {
      const jsonObj = JSON.parse(data);
      if (jsonObj.id === token && jsonObj.expires > Date.now()) {
        return fn(cb, ...args);
      } else {
        return cb({
          statusCode: 403,
          error: "Invalid or expired token",
        });
      }
    }
  });
};
// When user logs out or deletes himself/herself the function deletes tokenfile from the disc
const deleteToken = async (token, cb) => {
  try {
    await fs.unlink(`${tokenpath}${token}.json`, (err) => {
      if (err) {
        console.log(err);
        return cb({
          statusCode: 400,
          error: "No token exist",
        });
      }
      cb({
        statusCode: 200,
        message: "User Logged Out!!!",
      });
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  createToken,
  readToken,
  deleteToken,
};
