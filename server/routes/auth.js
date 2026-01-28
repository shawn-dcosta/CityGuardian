const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
            name,
            email,
            password,
            role: role || 'public',
            authProvider: 'local'
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (user.authProvider === 'google') {
            return res.status(400).json({ msg: 'Please sign in with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Google Login
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        // If no client ID yet, we might want to skip verification or warn. 
        // For now assuming the verifying component handles the case or this fails.
        // If testing without real verification ID, we might need a bypass mechanism or assume valid token data is sent

        // Real verification:
        // const ticket = await client.verifyIdToken({
        //     idToken: token,
        //     audience: process.env.GOOGLE_CLIENT_ID
        // });
        // const { name, email, sub: googleId } = ticket.getPayload();

        // TEMPORARY SIMPLIFIED VERIFICATION (Since we don't have Client ID yet, assumes frontend sends decoded info OR just trust token if decoding locally)
        // To make it robust without client ID, we will assume we get user info in body for now OR just decode
        // Ideally we verify. Let's decode for now since we said we will use placeholder.

        // For now, let's assume the frontend sends { credential, decoded: { name, email, sub } } logic or backend verifies. 
        // Standard flow: Backend verifies credential string.

        // Let's implement decoding manually if needed or fail. 
        // Actually, asking user for Client ID is best practice.
        // I will write the code assuming verification will work when Client ID is set.

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { name, email, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (user) {
            // Update googleId if not present (migration case)
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google'; // or hybrid
                await user.save();
            }
        } else {
            user = new User({
                name,
                email,
                authProvider: 'google',
                role: 'public', // Default role
                googleId
            });
            await user.save();
        }

        const jwtPayload = { user: { id: user.id, role: user.role } };
        jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });

    } catch (err) {
        console.error('Google Auth Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Get User (Me)
router.get('/me', async (req, res) => {
    // We need auth middleware but for now just basic check
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
});

module.exports = router;
