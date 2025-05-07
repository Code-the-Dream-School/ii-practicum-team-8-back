require("dotenv").config();
const { PORT = 8000 } = process.env;
const app = require("./app");
const connectDB = require("./db/connect");

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://team8-backend.onrender.com"
    : "http://localhost:8000";

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
      console.log(`Swagger API docs available at ${baseUrl}/api-docs/`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
