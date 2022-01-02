const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//ap1
app.get("/todos/", async (req, res) => {
  const { search_q = "", priority, category, status } = req.query;
  let q;
  if (
    priority !== undefined &&
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    res.status(400);
    res.send("Invalid Todo Priority");
  } else if (
    status !== undefined &&
    status !== "TO DO" &&
    status !== "IN PROGRESS" &&
    status !== "DONE"
  ) {
    res.status(400);
    res.send("Invalid Todo Status");
  } else if (
    category !== undefined &&
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    res.status(400);
    res.send("Invalid Todo Category");
  } else {
    console.log("Hi");
    if (
      category !== undefined &&
      status !== undefined &&
      priority !== undefined
    ) {
      q = `SELECT * FROM todo WHERE category="${category}" and status ="${status}" and priority ="${priority}" and todo ="${search_q}";`;
    } else if (category !== undefined && status !== undefined) {
      q = `SELECT
              *
            FROM 
             todo 
            WHERE 
             category LIKE "%${category}%" 
                AND 
             status LIKE "%${status}%" ;`;
    } else if (category !== undefined && priority !== undefined) {
      q = `SELECT * FROM todo WHERE category="${category}" and  priority ="${priority}" ;`;
    } else if (status !== undefined && priority !== undefined) {
      q = `SELECT * FROM todo WHERE  status ="${status}" and priority ="${priority}" ;`;
    } else if (category !== undefined) {
      q = `SELECT * FROM todo WHERE  category="${category}";`;
    } else if (status !== undefined) {
      q = `SELECT * FROM todo WHERE status ="${status}" ;`;
    } else if (priority !== undefined) {
      q = `SELECT * FROM todo WHERE  priority ="${priority}" ;`;
    } else {
      q = `SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
    }
    const arr = await db.all(q);
    res.send(arr);
  }
});

module.exports = app;
