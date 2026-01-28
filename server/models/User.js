const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        // Password is required only if authProvider is 'local'
        required: function () { return this.authProvider === 'local'; }
    },
    role: {
        type: String,
        enum: ['public', 'admin'],
        default: 'public'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reportIds: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('User', UserSchema);
