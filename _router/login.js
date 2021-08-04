const { readUserData } = require("../helpers/users");
const { createToken } = require("../helpers/tokens");
const login = async (data, cb) => {
  if (data.method.toLowerCase() !== "post")
    return cb({ statusCode: 401, error: "Wrong method!!" });
  const payload = await JSON.parse(data.payload);
  if (!payload.email || !payload.password) {
    return cb({
      statusCode: 403,
      error: "Missing creadentials",
    });
  }
  if (data.method.toLowerCase() !== "post") {
    return cb({
      statusCode: 405,
      error: "Wrong Method!!",
    });
  }

  try {
    const userData = await readUserData(
      payload.email,
      payload.password,
      cb,
      createToken
    );
  } catch (err) {
    console.log(err);
    cb({
      statusCode: 402,
      error: "Error progressing data!!",
    });
  }
};

module.exports = login;
