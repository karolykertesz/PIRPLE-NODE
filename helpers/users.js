const fs = require("fs");
const path = require("path");
const { createHash, checkpassword } = require("../utils/passwordhash");
const { createrandom } = require("../utils/createrandom");
const basePath = path.join(__dirname, "../users/usersData.json");
const tokenpath = path.join(__dirname, "../tokens/");
const { addAndChange } = require("./helpers");
const validate = require("../utils/emailvalidator");

// function reads and validates excisting user data
const readUserData = async (email, password, cb, fn) => {
  fs.readFile(basePath, { encoding: "utf8", flag: "r" }, async (err, data) => {
    if (!err && data) {
      if (Array.isArray(JSON.parse(data))) {
        const jsArray = JSON.parse(data);
        const appUser = jsArray.find((user) => user.email === email);
        if (appUser) {
          const userInfo = {
            ...appUser,
            password,
          };
          await checkpassword(userInfo, cb, fn);
        } else {
          return cb({
            statusCode: 404,
            error: "Wrong User Name Or passaword",
          });
        }
      }
    } else {
      return cb({
        statusCode: 404,
        error: "No user Created,Yet",
      });
    }
  });
};

const getUserInfo = (cb, token) => {
  console.log(cb);
  fs.readFile(basePath, { encoding: "utf8", flag: "r" }, (err, data) => {
    if (!err && data) {
      const jsonData = JSON.parse(data);
      const user = jsonData.find((use) => use.id === token);
      if (user) {
        const userObj = {
          email: user.email,
          address: user.address,
          name: user.name,
        };
        return cb({ statusCode: 200, message: userObj });
      } else {
        return cb({
          statusCode: 400,
          error: "No user with this id",
        });
      }
    } else {
      return cb({
        statusCode: 400,
        error: "Error reading data!!",
      });
    }
  });
};

// function creates a user the stores it to userarray with their email address, password hash ,salt id,and username
const createUser = async (email, name, password, address, cb) => {
  if (!email || !password) {
    return cb({
      statusCode: 400,
      error: "Missing Email or password",
    });
  }
  if (password.length < 6) {
    return cb({
      statusCode: 400,
      error: "Password too ,short",
    });
  }

  const isEmail = await validate(email);
  if (!isEmail) {
    return cb({
      statusCode: 403,
      error: "Wrong email characters",
    });
  }
  fs.readFile(basePath, async (err, data) => {
    if (err) {
      return cb({ statusCode: 400, error: "File wan't created" });
    }
    if (!err && JSON.parse(data).length === 0) {
      const hashed = await createHash(password);
      if (hashed.error) {
        return cb({ statusCode: hashed.statusCode, error: hashed.error });
      }

      const { salt, hash } = await hashed;
      const id = await createrandom();
      fs.writeFile(
        basePath,
        JSON.stringify([{ name, email, address, hash, salt, id }]),
        (err) => {
          if (!err) {
            return cb({ statusCode: 201, message: "User Created" });
          } else {
            return cb({
              statusCode: 400,
              error: "Error with the File creation",
            });
          }
        }
      );
    } else if (
      !err &&
      JSON.parse(data).length > 0 &&
      Array.isArray(JSON.parse(data))
    ) {
      const jsonData = JSON.parse(data);
      const userInfo = jsonData.find((user) => user.email === email);
      if (userInfo) {
        cb({
          statusCode: 403,
          error: "User Already exist with the same email",
        });
        return;
      } else {
        const hashed = await createHash(password);
        if (hashed.error) {
          return cb({ statusCode: hashed.statusCode, error: hashed.error });
        }
        const id = createrandom();
        const { salt, hash } = await hashed;
        await jsonData.push({ name, email, address, salt, hash, id });
        fs.writeFile(basePath, JSON.stringify(jsonData), (err) => {
          if (!err) {
            return cb({ statusCode: 201, message: "User Created" });
          } else {
            return cb({ statusCode: 400, error: "File wan't created" });
          }
        });
      }
    } else {
      console.log(err);
    }
  });
};

// function deletes user and excisting usertoken
const deleteuser = async (id, cb, fn) => {
  return new Promise((resolve, reject) => {
    fs.readFile(basePath, (err, data) => {
      if (!err && data) {
        const jsonObj = JSON.parse(data);
        console.log(jsonObj);
        resolve(jsonObj);
      } else {
        reject();
        return cb({ statusCode: 400, error: "Error reading data" });
      }
    });
  })
    .then((dt) => {
      const updatedObj = dt.filter((user) => user.id !== id);
      fs.writeFile(basePath, JSON.stringify(updatedObj), (err) => {
        if (!err) {
          return fn(id, cb);
        }
        if (err) {
          cb({ statusCode: 400, error: "Error writting file" });
        }
      });
    })
    .then(() => {
      console.log("done");
    })
    .catch((err) => console.log(err));
};

// function updates the excisting userinfo with the given parameters
const updateUser = async (userObj, token, cb) => {
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
        return new Promise((resolve, reject) => {
          fs.readFile(
            basePath,
            { encoding: "utf8", flag: "r" },
            (err, userdata) => {
              if (!err && data) {
                resolve(JSON.parse(userdata));
              } else {
                reject(
                  cb({
                    statusCode: 400,
                    error: "Error reading file",
                  })
                );
              }
            }
          );
        }).then(async (data) => {
          if (userObj.password) {
            const { salt, hash } = await createHash();
            await delete userObj.password;
            await addAndChange(data, token, userObj, cb, salt, hash);
          } else {
            await addAndChange(data, token, userObj, cb);
          }
        });
      } else {
        return cb({
          statusCode: 403,
          error: "Invalid or expired token",
        });
      }
    }
  });
};
module.exports = {
  createUser,
  updateUser,
  deleteuser,
  readUserData,
  getUserInfo,
};
