const fs = require("fs");
const path = require("path");
const products = require("../products/products");
const { createrandom } = require("../utils/createrandom");
const basePath = path.join(__dirname, "../users/usersData.json");
const orderspath = path.join(__dirname, "../orders/");
const { readToken } = require("./tokens");
const sendGetData = (cb) => {
  cb({
    statusCode: 200,
    message: products,
  });
};
const addAndChange = async (
  data,
  token,
  userObj,
  cb,
  salt = null,
  hash = null
) => {
  try {
    let userItem = await data.find((i) => i.id === token);
    let updatedData = await data.filter((user) => user.id !== token);
    updatedData =
      salt == null
        ? [...updatedData, { ...userItem, ...userObj }]
        : [...updatedData, { ...userItem, salt, hash, ...userObj }];
    return fs.writeFile(basePath, JSON.stringify(updatedData), (err) => {
      if (err) {
        console.log(err);
      }
      cb({ statusCode: 201, message: "User Updated" });
    });
  } catch (err) {
    console.log(err);
  }
};
const createShop = (token, cb, fn, dt) => {
  fs.readFile(basePath, async (err, data) => {
    if (!err && data) {
      const jsonData = JSON.parse(data);
      const user = jsonData.find((u) => u.id === token);
      await readToken(token, cb, fn, dt, user);
    } else {
      return cb({
        statusCode: 400,
        error: "Erro Reading data",
      });
    }
  });
};
// function gets the total pieces of pizza,calculates the total amount and creates an email templete and stores the data as json object to orders folder
const getCount = async (cb, data, user) => {
  const dataArray = [];
  for (key in data) {
    let num = +key;
    const item = await products.find((it) => it.id === num);
    console.log(item);
    dataArray.push({
      name: item.name,
      total: item.price * data[key],
      qua: data[key],
    });
  }
  let names = [];
  let total = [];
  let totalQua = [];
  dataArray.map((i) => names.push(i.name));
  dataArray.map((i) => total.push(i.total));
  dataArray.map((i) => totalQua.push(i.qua));
  total = total.reduce((a, v) => a + v);
  names = names.join(",");
  totalQua = totalQua.reduce((a, v) => a + v);
  const type = dataArray.length;
  const orderId = await createrandom();

  const emailTemp = {
    "Pizza types you order": names,
    "Total amount paid": total,
    "Total Kinds of pizza You ordered": type,
    "Total number of pizza you ordered": totalQua,
  };
  const orderTemp = {
    id: orderId,
    total,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
  };

  await createCoupon(emailTemp, orderTemp, cb);
};
// after the user paid for the order the function destroys the order json file
const deleteCoupon = (coupon, cb) => {
  return fs.unlink(orderspath + coupon + ".json", (err) => {
    if (err) {
      return cb({
        statusCode: 400,
        error: "Error deleting file",
      });
    }
  });
};
// function creates a coupon with this coupon the the user can pay for the order
const createCoupon = async (emailTemp, orderTemp, cb) => {
  const obj = {
    mailGun: emailTemp,
    orders: orderTemp,
  };
  const jsonObj = await JSON.stringify(obj);
  return fs.writeFile(orderspath + orderTemp.id + ".json", jsonObj, (err) => {
    if (err) {
      cb({
        statusCode: 400,
        error: "Error Writting file",
      });
    }
    cb({
      statusCode: 200,
      message: {
        "Your coupon for payment": orderTemp.id,
      },
    });
  });
};

module.exports = {
  addAndChange,
  sendGetData,
  createShop,
  getCount,
  deleteCoupon,
};
