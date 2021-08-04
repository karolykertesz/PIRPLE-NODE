const { sendGetData, createShop, getCount } = require("../helpers/helpers");
const { readToken } = require("../helpers/tokens");
const shop = async (data, cb) => {
  if (!["post", "get"].includes(data.method.toLowerCase())) {
    return cb({
      statusCode: 405,
      error: "Wrong Method",
    });
  }
  const token =
    typeof data.headers.token === "string" && data.headers.token.length === 10
      ? data.headers.token
      : null;
  if (!token) {
    return cb({
      statusCode: 403,
      error: "Missing valid token",
    });
  }
  switch (data.method) {
    case "get":
      await readToken(token, cb, sendGetData);
      break;
    case "post":
      await createShop(token, cb, getCount, JSON.parse(data.payload));
      break;
    default:
      cb({
        statusCode: 400,
        error: "error reading data",
      });
  }
};

module.exports = shop;
