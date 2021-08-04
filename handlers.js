const https = require("https");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const orderspath = path.join(__dirname, "./orders/");
const config = require("./config");
const { deleteCoupon } = require("./helpers/helpers");
const sandmailGun = require("./mailgun");

// Creates stripe payment

const createStripe = async (strObj, cb) => {
  const { mailGun, orders } = strObj;
  const faker = {
    source: "tok_visa",
    description: `Total amount $${orders.total} was charged to ${orders.userEmail}`,
  };
  const payload = {
    amount: orders.total * 100,
    currency: "EUR",
    description: faker.description,
    source: faker.source,
    receipt_email: orders.userEmail,
  };

  const payloadString = await querystring.stringify(payload);
  const requestDetails = {
    protocol: "https:",
    receipt_email: orders.userEmail,
    host: "api.stripe.com",
    method: "POST",
    source: "tok_visa",
    path: "/v1/charges",
    auth: config.stripe.user,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(payloadString),
    },
  };
  const create = async () => {
    try {
      const req = https.request(requestDetails, function (res) {
        if (res.statusCode === 200 || res.statusCode === 201) {
          sandmailGun(mailGun, orders, cb);
        }
      });
      req.on("error", function (e) {
        console.log(e);
        cb({
          statusCode: 400,
          message: "Error sanding message",
        });
      });
      req.write(payloadString);
      req.end();
    } catch (err) {
      cb({
        statusCode: 400,
        error: "Error creatin payment",
      });
    }
  };
  await create();
};

module.exports = {
  createStripe,
};
// function reads the order details from existing json file
const readOrders = (cb, coupon) => {
  fs.readFile(orderspath + coupon + ".json", async (err, data) => {
    if (!err && data) {
      const parsedObj = await JSON.parse(data);
      return createStripe(parsedObj, cb);
    } else {
      console.log(err);
      return cb({
        statusCode: 500,
        error: "Error with reading data",
      });
    }
  });
};

module.exports = {
  readOrders,
};
