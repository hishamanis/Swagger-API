// server.js
// A simple Express server with Swagger UI integration
// by Hish Anis written on 2025-10-26
// This code, written in Typescript, sets up an Express server that serves Swagger UI documentation
// Start of server.js

//import necessary modules
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

//initialize express app
const app = express();
const port = 3000;

//setup swagger UI
// Parse JSON bodies
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//define a simple route
app.get('/',(req, res) => {
    res.send('Hello World!');

});
// File-based store for demo CRUD
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'items.json');
let items = [];
let nextId = 1;

function loadItems() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            items = JSON.parse(raw);
            nextId = items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
        } catch (e) {
            items = [];
            nextId = 1;
        }
    }
}

function saveItems() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

// Load items on server start
loadItems();

// Create (POST) - add a new item
app.post('/items', (req, res) => {
    const { name, description } = req.body || {};
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'name is required and must be a string' });
    }

    const item = { id: nextId++, name, description: description || '' };
    items.push(item);
    saveItems();
    res.status(201).json(item);
});

// Read all (GET)
app.get('/items', (req, res) => {
    res.json(items);
});

// Read one (GET /items/:id)
app.get('/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const item = items.find((i) => i.id === id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
});

// Update (PUT)
app.put('/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const item = items.find((i) => i.id === id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { name, description } = req.body || {};
    if (name !== undefined) {
        if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name must be a non-empty string' });
        item.name = name;
    }
    if (description !== undefined) item.description = description;

    saveItems();
    res.json(item);
});

// Delete (DELETE)
app.delete('/items/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });
    const [deleted] = items.splice(idx, 1);
    saveItems();
    res.json(deleted);
});
process.on('SIGINT', () => {
    saveItems();
    process.exit();
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


// End of server.js
