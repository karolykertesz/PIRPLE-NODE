const http = require("http");
const https = require("https");
const url = require("url");
const path = require("path");
const querystring = require("querystring");
const stringDecoder = require("string_decoder").StringDecoder;
const routers = require("./routers");
const parser = require("./utils/parser");
const fs = require("fs");
const config = require("./config");

// creates an http server
const httpServer = http.createServer((req, res) => {
  commonServer(req, res);
});
// creates an https server
const httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "./data/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./data/cert.pem")),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  commonServer(req, res);
});

// server for https and http
const commonServer = async (req, res) => {
  const urlObj = url.parse(req.url, true);
  const strimmedPath = urlObj.pathname.replace(/^\/+|\/+$/g, "");
  console.log(strimmedPath);
  const method = req.method.toLowerCase();

  const queryObj = urlObj.query;

  const heders = req.headers;

  let buffer = [];
  req
    .on("error", (err) => {
      console.log(err);
    })
    .on("data", (chunk) => {
      buffer.push(chunk);
    })
    .on("end", async () => {
      buffer = Buffer.concat(buffer).toString();
      // Check the router for a matching path for a handler. If not found, use the page404  instead.
      const routeHandler =
        typeof routers[strimmedPath] !== "undefined"
          ? routers[strimmedPath]
          : routers.page404;
      const data = {
        trimedpath: strimmedPath,
        method: method,
        queryObj: queryObj,
        headers: heders,
        payload: await parser(buffer),
      };

      await routeHandler(data, (dataObj) => {
        const strigify = (str) => {
          return JSON.stringify(str);
        };
        const stringData =
          dataObj.statusCode < 305
            ? strigify(dataObj.message)
            : strigify(dataObj.error);

        res.setHeader("Content-Type", "application/json");
        res.writeHead(dataObj.statusCode);
        res.end(stringData);
      });
    });
};

const startServer = () => {
  httpServer.listen(5000, () => {
    console.log("listening");
  });
  httpsServer.listen(config.httpsport, () => console.log("listening on https"));
};
startServer();
