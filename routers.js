const login = require("./_router/login");
const logout = require("./_router/logout");
const shop = require("./_router/shop");
const user = require("./_router/user");
const pay = require("./_router/payment");

const pageNotFound = (data, cb) => {
  cb({
    statusCode: 404,
    error: "Page Not Found",
  });
};
// router for handeling request
const routers = {
  users: user,
  page404: pageNotFound,
  login: login,
  logout: logout,
  shop: shop,
  pay: pay,
};

module.exports = routers;
