const express = require("express");
const app = express();
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const extractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;

const MYSECRETJWTKEY = "my-secret-key"; 

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

const optionsForJwtValidation = {
  jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: MYSECRETJWTKEY,
};

passport.use(
  new JwtStrategy(optionsForJwtValidation, function (payload, done) {
    console.log(payload);
    done(null, payload);
  })
);

app.post("/signup", (req, res) => {
 const { userHandle, password } = req.body;

  // Validate input
  if (
    !userHandle ||
    !password ||
    userHandle.length < 6 ||
    password.length < 6
  ) {
    return res.status(400).json({
      message: "Invalid request body",
    });
  }

  // Simulate successful registration
  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", (req, res) => {
 const { userHandle, password, ...extraFields } = req.body;

  const mockUser = {
    userHandle: "DukeNukem",
    password: "123456",
  };
  // Reject if there are additional fields
  if (Object.keys(extraFields).length > 0) {
    return res.status(400).json({
      message: "Bad Request. Unexpected additional fields in the request body.",
    });
  }

  // Validate input
  if (
    !userHandle ||
    !password ||
    typeof userHandle !== "string" ||
    typeof password !== "string" ||
    userHandle.length < 6 ||
    password.length < 6
  ) {
    return res.status(400).json({
      message: "Bad Request",
    });
  }
  if (userHandle !== mockUser.userHandle || password !== mockUser.password) {
    return res.status(401).json({
      message: "Unauthorized, incorrect username or password",
    });
  }
  const token = jwt.sign({ userHandle }, MYSECRETJWTKEY);
  res.status(200).json({
    jsonWebToken: token,
  });
});
//Post a high score for a specific level (Protected with JWT authentication)
const highScores = [];

app.post("/high-scores", passport.authenticate("jwt", { session: false }), (req, res) => {
const { level, userHandle, score, timestamp, ...extraFields } = req.body;

// Reject additional fields
if (Object.keys(extraFields).length > 0) {
  return res.status(400).json({
    message: "Bad Request. Unexpected additional fields in the request body.",
  });
}

// Validate required fields
if (
  typeof level !== "string" ||
  typeof userHandle !== "string" ||
  typeof score !== "number" ||
  typeof timestamp !== "string"
) {
  return res.status(400).json({
    message:
      "Bad Request. Fields 'level', 'userHandle', 'score', and 'timestamp' are required with correct data types.",
  });
}

// Further validation of timestamp format (ISO 8601)
const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
if (!timestampRegex.test(timestamp)) {
  return res.status(400).json({
    message: "Bad Request. The 'timestamp' field must be in ISO 8601 format.",
  });
}

  // Simulate successful high score submission
  highScores.push({ level, userHandle, score, timestamp });
  res.status(201).json({ message: "High score submitted successfully" });

});
//Get high scores with pagination support. High scores should be ordered from biggest to smallest.If no page param is provided then first 20 high scores will be returned.

app.get("/high-scores", (req, res) => {
 const { level, page } = req.query;

 // Validate `level` query parameter
 if (!level || typeof level !== "string") {
   return res.status(400).json({
     message:
       "Bad Request. 'level' query parameter is required and must be a string.",
   });
 }

 // Validate `page` query parameter (optional)
 const pageNumber = page ? parseInt(page, 10) : 1;
 if (page && (isNaN(pageNumber) || pageNumber < 1)) {
   return res.status(400).json({
     message: "Bad Request. 'page' must be a positive integer.",
   });
 }

 // Filter high scores by level
 const filteredScores = highScores.filter((score) => score.level === level);

 // Sort scores in descending order (biggest to smallest)
 const sortedScores = filteredScores.sort((a, b) => b.score - a.score);

 // Paginate results (20 scores per page)
 const pageSize = 20;
 const startIndex = (pageNumber - 1) * pageSize;
 const paginatedScores = sortedScores.slice(startIndex, startIndex + pageSize);

 res.status(200).json(paginatedScores);
});
//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
