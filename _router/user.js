const {
  createUser,
  deleteuser,
  updateUser,
  getUserInfo,
} = require("../helpers/users");
const { readToken, deleteToken } = require("../helpers/tokens");
const user = async (data, cb) => {
  const strimmed = async (email, name = "", password, address = "") => {
    return {
      email: email.trim().toLowerCase(),
      name: name.trim().toLowerCase(),
      password: password.trim().toLowerCase(),
      address: address.trim().toLowerCase(),
    };
  };
  const payload = await JSON.parse(data.payload);
  const token = data.headers.token ? data.headers.token : null;
  switch (data.method.toLowerCase()) {
    case "post":
      if (
        !payload.name ||
        !payload.email ||
        !payload.password ||
        !payload.address
      ) {
        return cb({
          statusCode: 400,
          error: "Missing Credentials",
        });
      }
      const { email, name, password, address } = await strimmed(
        payload.email,
        payload.name,
        payload.password,
        payload.address
      );
      await createUser(email, name, password, address, cb);
      break;
    case "delete":
      if (!data.queryObj.id || !token)
        return cb({ statusCode: 403, error: "Missing credentials" });
      const id = data.queryObj.id;
      await deleteuser(id, cb, deleteToken);
      break;
    case "put":
      if (!token) {
        return cb({ statusCode: 403, error: "Missing Token" });
      }

      const userObj = { ...payload };
      if (!userObj.email && !userObj.password && !userObj.name) {
        return cb({ statusCode: 400, error: "Nothing to update" });
      }
      await updateUser(userObj, token, cb);
      break;
    case "get":
      if (!token) {
        return cb({
          statusCode: 403,
          error: "Missing valid token",
        });
      }
      await readToken(token, cb, getUserInfo, token);
      break;
    default:
      return cb({
        statusCode: 405,
        error: "Wrong Method",
      });
  }
};

module.exports = user;
