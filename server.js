const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

// Carregar variáveis de ambiente
dotenv.config();

// Definir chave JWT padrão se não estiver definida
const JWT_SECRET = process.env.JWT_SECRET || 'moxy_secret_key_2024';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Conexão com o MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moxy-agenda';
console.log('Tentando conectar ao MongoDB em:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelos
const User = require('./models/User');
const Task = require('./models/Task');
const Note = require('./models/Note');

// Middleware de autenticação
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('Token não fornecido');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Erro de autenticação:', error.message);
        res.status(401).json({ message: 'Por favor, faça login.' });
    }
};

// Rotas de autenticação
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Tentativa de registro:', req.body);
        const { username, email, password } = req.body;
        
        // Validação dos campos
        if (!username || !email || !password) {
            console.log('Campos obrigatórios faltando');
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('Usuário ou email já cadastrado:', email);
            return res.status(400).json({ message: 'Usuário ou email já cadastrado' });
        }

        // Criar novo usuário
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        console.log('Usuário registrado com sucesso:', email);

        // Gerar token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(201).json({ token });
    } catch (error) {
        console.error('Erro detalhado no registro:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Dados inválidos: ' + error.message });
        }
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('Tentativa de login:', req.body.email);
        const { email, password } = req.body;
        
        // Encontrar usuário
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Usuário não encontrado:', email);
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Verificar senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Senha incorreta para:', email);
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Gerar token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '7d'
        });

        console.log('Login bem sucedido:', email);
        res.json({ token });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});

// Rotas protegidas
app.get('/api/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id });
        res.json(tasks);
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ message: 'Erro ao buscar tarefas' });
    }
});

app.post('/api/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            user: req.user._id
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ message: 'Erro ao criar tarefa' });
    }
});

// Rota para atualizar uma tarefa
app.patch('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        
        // Atualizar apenas os campos fornecidos
        const updates = Object.keys(req.body);
        updates.forEach(update => {
            task[update] = req.body[update];
        });
        
        await task.save();
        res.json(task);
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(500).json({ message: 'Erro ao atualizar tarefa' });
    }
});

// Rota para deletar uma tarefa
app.delete('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        res.json({ message: 'Tarefa deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        res.status(500).json({ message: 'Erro ao deletar tarefa' });
    }
});

app.get('/api/notes', auth, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        res.json(notes);
    } catch (error) {
        console.error('Erro ao buscar notas:', error);
        res.status(500).json({ message: 'Erro ao buscar notas' });
    }
});

app.post('/api/notes', auth, async (req, res) => {
    try {
        const note = new Note({
            ...req.body,
            user: req.user._id
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ message: 'Erro ao criar nota' });
    }
});

// Rota para deletar uma anotação
app.delete('/api/notes/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ message: 'Anotação não encontrada' });
        }
        res.json({ message: 'Anotação deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar anotação:', error);
        res.status(500).json({ message: 'Erro ao deletar anotação' });
    }
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para servir o arquivo de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Rota para servir a agenda
app.get('/agenda', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'agenda.html'));
});

// Tratamento de erros 404 - página não encontrada
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 