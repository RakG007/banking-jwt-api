const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);  // protects ALL routes below

// GET /api/banking/balance
router.get('/balance', async (req, res) => {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json({ accountNumber: user.accountNumber, balance: user.balance });
});

// POST /api/banking/deposit
router.post('/deposit', async (req, res) => {
    const { amount } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user.id, { $inc: { balance: amount } }, { new: true }
    );
    res.json({ message: `Deposited Rs.${amount}`, newBalance: user.balance });
});

// POST /api/banking/withdraw
router.post('/withdraw', async (req, res) => {
    const { amount } = req.body; // Added missing destructing from lab manual
    const user = await User.findById(req.user.id);
    
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    
    user.balance -= amount;
    await user.save({ validateBeforeSave: false });
    
    res.json({ message: `Withdrew Rs.${amount}`, newBalance: user.balance });
});

module.exports = router;