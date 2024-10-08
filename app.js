require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const { errorMiddleware } = require("./middleware/errorHandler");

const app = express();

const corsOptions = {
  origin: "https://inkverse-nu.vercel.app/",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const user = require('./Routes/User');
const blog = require("./Routes/Blog");

app.use(user);
app.use(blog);

app.use(errorMiddleware)
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("DB Connected!");
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });