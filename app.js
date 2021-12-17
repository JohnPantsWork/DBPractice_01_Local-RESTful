const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const methodOverride = require("method-override");

//middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //if connect success
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    //if connect failure
    console.log("Connect Failed.");
    console.log(err);
  });

app.get("/students", async (req, res) => {
  try {
    let data = await Student.find();
    res.render("students.ejs", { data });
  } catch (err) {
    res.send("Error has occured.");
    console.log(err);
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

app.post("/students/insert", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student is accepted.");
      res.render("accept.ejs");
    })
    .catch((err) => {
      console.log("Student is rejected.");
      console.log(err);
      res.render("reject.ejs");
    });
});

app.get("/students/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("studentPage.ejs", { data });
    } else {
      res.send("No this student ID , try again.");
    }
  } catch (err) {
    res.send("Error has occured.");
    console.log(err);
  }
});

app.get("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data });
    } else {
      res.send("No this student ID , try again.");
    }
  } catch (err) {
    res.send("Error has occured.");
    console.log(err);
  }
});

app.put("/students/edit/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch (err) {
    res.render("reject.ejs");
    console.log(err);
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((msg) => {
      console.log(msg);
      res.send("Delete success.");
    })
    .catch((err) => {
      console.log("Delete Failed.");
      console.log(err);
    });
});

app.get("/*", (req, res) => {
  res.send("Page not found.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
