const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
// function uses node.js crypto modul creates a hash ,and salt encripted strings;
const createHash = async (password) => {
  try {
    const salt = await crypto.randomBytes(16).toString("hex");
    const hash = await crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return await { hash, salt };
  } catch (err) {
    return {
      error: "Could not create Hash",
      statusCode: 400,
    };
  }
};
// function validate the user password agens the existing hash and salt string
const checkpassword = async (info, cb, fn) => {
  const { email, password } = info;
  fs.readFile(
    path.join(__dirname, "/../users/usersData.json"),
    async (err, data) => {
      if (!err && Array.isArray(JSON.parse(data))) {
        const jsonData = JSON.parse(data);
        const userInfo = jsonData.find((user) => user.email === email);
        if (userInfo) {
          const { salt, hash } = await userInfo;
          const _hash = await crypto
            .pbkdf2Sync(password, salt, 1000, 64, "sha512")
            .toString(`hex`);
          if (_hash == hash) {
            return fn(info, cb);
          } else {
            return cb({
              statusCode: 404,
              error: "Wrong Password",
            });
          }
        }
      }
    }
  );
};

module.exports = {
  createHash,
  checkpassword,
};
