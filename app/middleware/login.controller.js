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

  res.send(x.data);
};

exports.check_token_login = async (req, res, next) => {
  const options = {
    headers: {
      accept: "/",
      Authorization: `${req.headers.authorization}`,
    },
  };
  try {
    const url = "https://medpro-api-v2-testing.medpro.com.vn/user/info";
    var x = await axios.get(url, options);
    res.locals.userId = x.data.userMongoId;
    return next();
  } catch (error) {
    res.status(401).send({ statusCode: 401, message: "No author user" });
  }
};
