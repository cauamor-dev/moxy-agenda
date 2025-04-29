const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// Obter todas as anotações do usuário
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar anotações' });
    }
});

// Criar nova anotação
router.post('/', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const note = new Note({
            user: req.userId,
            text
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar anotação' });
    }
});

// Deletar anotação
router.delete('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!note) {
            return res.status(404).json({ message: 'Anotação não encontrada' });
        }
        res.json({ message: 'Anotação deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar anotação' });
    }
});

module.exports = router; 