const { expressjwt: jwt } = require("express-jwt");

const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "userTokenData",
  getToken: getTokenFromHeaders,
});

/* const getUser = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "userTokenData",
  getToken: getTokenFromHeaders,
  credentialsRequired: false,
}); */

// Function used to extract the JWT token from the request's "Authorization" Headers
function getTokenFromHeaders(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    const token = req.headers.authorization.split(" ")[1];
    return token;
  }
  return null;
}

module.exports = { isAuthenticated };
