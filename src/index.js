const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const user = users.find(user => user.username === username);
    if (!user) return response.status(400).json({ error: "User not found!" });
    request.user = user;
    return next();
}

function checksExistsUserTodo(request, response, next) {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);
    if (!todo) return response.status(400).json({ error: "Todo not found!" });
    request.todo = todo;
    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;
    const user = {
        id: uuidv4(),
        name,
        username,
        todos: []
    }
    const isUserExists = users.some(u => u.username === username);
    if (isUserExists) return response.status(400).send();
    users.push(user);

    return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;

    user.todos.push({
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    });

    return response.status(201).json(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
    const { todo } = request;
    const { title, deadline } = request.body;

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
    const { todo } = request;
    todo.done = true;
    return response.send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todoIndex = user.todos.findIndex(todo => todo.id === id);
    if (todoIndex >= 0) {
        user.todos.splice(todoIndex, 1);
    } else {
        return response.status(400).json({ error: "Todo not found!" });
    }
    return response.send();
});

module.exports = app;