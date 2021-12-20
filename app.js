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

//get all students
app.get("/students", async (req, res) => {
  try {
    let data = await Student.find();
    res.send(data);
  } catch (err) {
    res.status(404);
    res.send({ message: "Error has occured." });
  }
});

// get student by id
app.get("/students/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.send(data);
    } else {
      res.status(404);
      res.send({ message: "No data" });
    }
  } catch {
    res.send("Error has occured.");
  }
});

//post student
app.post("/students", (req, res) => {
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
      res.send({ message: "Successfully saved." });
    })
    .catch(() => {
      res.status(404);
    });
});

//update student
app.put("/students/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true, overwrite: true }
    );
    res.send("Successfully updated.");
  } catch {
    res.send("Error has occured when updating.");
  }
});

class newData {
  constructor() {}
  setProperties(key, value) {
    if (key !== "merit" && key !== "other") {
      this[key] = value;
    } else {
      this[`scholarship.${key}`] = value;
    }
  }
}

app.patch("/students/:id", async (req, res) => {
  let { id } = req.params;
  let newObject = new newData();
  for (let property in req.body) {
    newObject.setProperties(property, req.body[property]);
  }
  try {
    let d = await Student.findOneAndUpdate({ id }, newObject, {
      new: true,
      runValidators: true,
    });
    res.send("Successfully updated.");
  } catch {
    res.send("Error has occured when updating.");
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

app.delete("/students/delete", (req, res) => {
  Student.deleteMany({})
    .then((msg) => {
      console.log(msg);
      res.send("Delete all data success.");
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
