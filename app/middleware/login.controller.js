const axios = require("axios");

exports.post_Login = async (req, res) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
  };

  const options = {
    headers: {
      accept: "/",
      partnerid: "trungvuong",
      Authorization: "Basic Og==",
      "Content-Type": "application/json",
    },
  };

  const url =
    "https://medpro-api-v2-testing.medpro.com.vn/v1/userAccount/login";
  var x = await axios.post(url, data, options);
  // console.log("x :>> ", x.data);
  res.send(x.data);
};

exports.check_token_login = async (req, res, next) => {
  const options = {
    headers: {
      accept: "/",
      partnerid: "trungvuong",
      Authorization: `Bearer ${req.headers.token}`,
    },
  };
  try {
    const url =
      "https://medpro-api-v2-testing.medpro.com.vn/v1/userAccount/can-bo-yte/info";
    var x = await axios.get(url, options);
    console.log("x.data", x.data.userId);
    res.locals.userId = x.data.userId;
    return next();
  } catch (error) {
    console.log("x.data", error);
    res.status(401).json({ message: "No author user" });
  }
};
