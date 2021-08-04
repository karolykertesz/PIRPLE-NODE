const { readToken } = require("../helpers/tokens");
const { readOrders } = require("../handlers");
// Creating payment from payment api endpoint
const payment = async (dataObj, cb) => {
  const payload = await JSON.parse(dataObj.payload);
  if (dataObj.method.toLowerCase() !== "post") {
    return cb({
      statusCode: 400,
      error: "Wrong Method",
    });
  }
  const token = dataObj.headers.token ? dataObj.headers.token : null;
  const coupon = payload.coupon ? payload.coupon : null;
  if (!token || !coupon) {
    return cb({
      statusCode: 403,
      error: "Missing valid coupon or token",
    });
  }
  await readToken(token, cb, readOrders, coupon);
  // first validates the valid token if token valid readOrders function executes
};
module.exports = payment;
