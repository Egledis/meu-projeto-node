const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para processar JSON e servir ficheiros estáticos (HTML, CSS, JS, imagens)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão e criação da Base de Dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso.');
    }
});

// Criar tabela de tarefas se não existir
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data TEXT NOT NULL,
    estado TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error('Erro ao criar tabela:', err.message);
    }
});

// Rota GET: Obter todas as tarefas
app.get('/api/tasks', (req, res) => {
    const query = `SELECT * FROM tasks ORDER BY data DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Rota POST: Criar uma nova tarefa
app.post('/api/tasks', (req, res) => {
    const { titulo, descricao, data, estado } = req.body;
    const query = `INSERT INTO tasks (titulo, descricao, data, estado) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [titulo, descricao, data, estado], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, titulo, descricao, data, estado });
    });
});

// Rota DELETE: Apagar uma tarefa por ID
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM tasks WHERE id = ?`;

    db.run(query, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deletedID: id });
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
