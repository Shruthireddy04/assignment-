const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
var format = require("date-fns/format");
var isValid = require("date-fns/isValid");
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
function todoObj(i) {
  return {
    id: i.id,
    todo: i.todo,
    priority: i.priority,
    status: i.status,
    category: i.category,
    dueDate: i.due_date,
  };
}
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
    // console.log("Hi");
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
      q = `SELECT * FROM todo WHERE status="${status}";`;
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
    res.send(arr.map((i) => todoObj(i)));
  }
});
//api2
app.get("/todos/:todoId/", async (req, res) => {
  let { todoId } = req.params;
  let q = `SELECT * FROM todo WHERE id ="${todoId}"`;
  let arr = await db.get(q);
  res.send(todoObj(arr));
});
//api3

app.get("/agenda/", async (req, res) => {
  let { date } = req.query;

  if (isValid(date) === false) {
    res.status(400);
    res.send("Invalid Due Date");
  } else {
    let r = format(date, "yyyy-MM-dd");

    let q = `SELECT * FROM todo WHERE due_date="${r}"`;
    const arr = await db.all(q);
    res.send(arr.map((i) => todoObj(i)));
  }
});

app.post("/todos/", async (req, res) => {
  const { id, todo, category, priority, status, dueDate } = req.body;
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
  } else if (isValid(dueDate) === false) {
    res.status(400);
    res.send("Invalid Due Date");
  } else {
    let r = format(dueDate, "yyyy-MM-dd");
    q = `INSERT INTO todo (id,todo,category,priority,status,due_date) VALUES ("${id}","${todo}",'${category}','${priority}','${status}','${r}');`;
    await db.run(q);
    res.send("Todo Successfully Added");
  }
});
app.put("/todos/:todoId/", async (req, res) => {
  let { todoId } = req.params;
  let q = `SELECT * FROM todo WHERE id="${todoId}";`;
  let arr = await db.get(q);
  let { todo, category, priority, status, dueDate } = req.body;
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
  } else if (isValid(dueDate) === false) {
    res.status(400);
    res.send("Invalid Due Date");
  } else {
    if (todo !== undefined) {
      let qe = `UPDATE todo SET todo="${todo}" WHERE id="${todoId}";`;
      await db.run(qe);
      res.send("Todo Updated");
    } else if (status !== undefined) {
      let qe = `UPDATE todo SET status="${status}" WHERE id="${todoId}";`;
      await db.run(qe);
      res.send("Status Updated");
    } else if (priority !== undefined) {
      let qe = `UPDATE todo SET priority="${priority}" WHERE id="${todoId}";`;
      await db.run(qe);
      res.send("Priority Updated");
    } else if (category !== undefined) {
      let qe = `UPDATE todo SET category="${category}" WHERE id="${todoId}";`;
      await db.run(qe);
      res.send("Category Updated");
    } else {
      let qe = `UPDATE todo SET due_date="${dueDate}" WHERE id="${todoId}";`;
      await db.run(qe);
      res.send("Due Date Updated");
    }
  }
});

app.delete("/todos/:todoId/", async (req, res) => {
  let { todoId } = req.params;
  let q = `DELETE FROM todo WHERE id='${todoId}'`;
  await db.run(q);
  res.send("Todo Deleted");
});
module.exports = app;
