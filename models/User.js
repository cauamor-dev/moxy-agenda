const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Nome de usuário é obrigatório'],
        trim: true,
        minlength: [3, 'Nome de usuário deve ter pelo menos 3 caracteres'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    }
}, {
    timestamps: true
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        try {
            user.password = await bcrypt.hash(user.password, 8);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 