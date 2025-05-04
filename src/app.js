require("dotenv").config();
require("express-async-errors");
// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();
const favicon = require("express-favicon");
const logger = require("morgan");

// swagger
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const swaggerDocument = JSON.parse(
  fs.readFileSync("./src/docs/t8-swagger.json", "utf8")
);

// const connectDB = require("./db/connect");
const authUser = require("./middleware/authentication");

//routers
const authRouter = require("./routes/auth");
const mainRouter = require("./routes/mainRouter.js");
const bookingRouter = require("./routes/booking");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  })
);
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));

// routes
app.use("/api/v1", mainRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/bookings", authUser, bookingRouter);

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
