const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userInfos = users.find((user) => user.username === username);

  if (!userInfos) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = userInfos;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const userInfos = {
    id: uuidv4(),
    username,
    name,
    todos: [],
  };

  users.push(userInfos);

  return response.status(201).json(userInfos);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodoInfos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodoInfos);

  return response.status(201).json(newTodoInfos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const userTodoToUpdate = user.todos.find((todo) => todo.id === id);

  if (!userTodoToUpdate) {
    return response.status(404).json({ error: "Not found!" });
  }

  userTodoToUpdate.title = title;
  userTodoToUpdate.deadline = deadline;

  return response.status(201).send(userTodoToUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodoToUpdate = user.todos.find((todo) => todo.id === id);

  if (!userTodoToUpdate) {
    return response.status(404).json({ error: "Not found!" });
  }

  userTodoToUpdate.done = true;

  return response.status(201).send(userTodoToUpdate);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodoToDelete = user.todos.find((todo) => todo.id === id);

  if (!userTodoToDelete) {
    return response.status(404).json({ error: "Not found!" });
  }

  user.todos.splice(userTodoToDelete, 1);

  return response.status(204).send();
});

module.exports = app;
