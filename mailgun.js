const https = require("https");
const config = require("./config");
const querystring = require("querystring");
const { deleteCoupon } = require("./helpers/helpers");
const sandmailGun = async (mailTemp, orders, cb) => {
  // Email templete for sending mail
  const tempString = `
  <h1>Dear ${orders.userName}</h1>
  <h3>Your Recipe from Node Pizza INC.</h3>
    <p>The type of pizza You ordered: ${mailTemp["Pizza types you order"]}</p>
    <p>Total amount paid: $${mailTemp["Total amount paid"]}</p>
    <p>Total Kinds of pizza You ordered: ${mailTemp["Total Kinds of pizza You ordered"]}</p>
    <p>Total Kinds of pizza You ordered: ${mailTemp["Total Kinds of pizza You ordered"]}</p>
    <p>Total number of pizza you ordered: ${mailTemp["Total number of pizza you ordered"]}</p>
    <p>Your order will be delivered to ${orders.address}</p>
    `;

  // creates request payload for Mailgun credemtials
  const payload = {
    from: config.mailgun.from,
    to: orders.userEmail,
    subject: "Email confirmation",
    bcc: config.mailgun.from,
    text: tempString,
  };
  const stringPayload = querystring.stringify(payload);
  const requestDetails = {
    protocol: "https:",
    hostname: "api.mailgun.net",
    method: "post",
    path: "/v3/sandboxd722f10d4a4e4b78ab1c233763456e8b.mailgun.org",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(stringPayload),
      Authorization:
        "Basic " +
        Buffer.from("api:" + config.mailgun.apikey, "utf8").toString("base64"),
    },
  };
  // Sending email via mailgun
  const sendMail = async () => {
    try {
      const req = https.request(requestDetails, (res) => {
        res.setEncoding("utf8");
        res.on("data", (data) => {
          console.log("preparing");
        });

        res.on("end", async function () {
          const status = res.statusCode;
          if (status === 200 || status === 201) {
            // deletes the existing order
            await deleteCoupon(orders.id, cb);
            cb({
              statusCode: 200,
              message: mailTemp,
            });
          } else {
            cb({
              statusCode: status,
              error: "Error sending email",
            });
          }
        });
      });
      // capturing the error object
      req.on("error", (err) => {
        console.log(err);
      });
      req.write(stringPayload);
      req.end();
    } catch (err) {
      console.log(err);
      cb({
        statusCode: 500,
        error: "Error while sending your email",
      });
    }
  };
  await sendMail();
};

module.exports = sandmailGun;
