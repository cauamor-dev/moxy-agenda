const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Obter todas as tarefas do usuário
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId }).sort({ date: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar tarefas' });
    }
});

// Criar nova tarefa
router.post('/', auth, async (req, res) => {
    try {
        const { text, date, priority } = req.body;
        const task = new Task({
            user: req.userId,
            text,
            date: new Date(date),
            priority
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar tarefa' });
    }
});

// Atualizar tarefa
router.patch('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.userId });
        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(update => {
            task[update] = updates[update];
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar tarefa' });
    }
});

// Deletar tarefa
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        res.json({ message: 'Tarefa deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar tarefa' });
    }
});

module.exports = router; 