const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);  // protects ALL routes below

// 1. GET /api/banking/balance
router.get('/balance', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken');
        res.json({ accountNumber: user.accountNumber, balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: "Error fetching balance" });
    }
});

// 2. POST /api/banking/deposit
router.post('/deposit', async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount <= 0) return res.status(400).json({ message: "Amount must be positive" });

        const user = await User.findByIdAndUpdate(
            req.user.id, { $inc: { balance: amount } }, { new: true }
        );
        res.json({ message: `Deposited Rs.${amount}`, newBalance: user.balance });
    } catch (err) {
        res.status(500).json({ message: "Deposit failed" });
    }
});

// 3. POST /api/banking/withdraw
router.post('/withdraw', async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user.id);
        
        if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
        
        user.balance -= amount;
        await user.save({ validateBeforeSave: false });
        
        res.json({ message: `Withdrew Rs.${amount}`, newBalance: user.balance });
    } catch (err) {
        res.status(500).json({ message: "Withdrawal failed" });
    }
});

// 4. NEW: POST /api/banking/transfer (Experiment 2.2.3 Logic)
router.post('/transfer', async (req, res) => {
    try {
        const { recipientAccountNumber, amount } = req.body;
        
        // Find the person sending the money (You)
        const sender = await User.findById(req.user.id);
        
        // Validation Checks
        if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid transfer amount" });
        if (sender.balance < amount) return res.status(400).json({ message: "Insufficient balance for transfer" });

        // Find the person receiving the money
        const recipient = await User.findOne({ accountNumber: recipientAccountNumber });
        if (!recipient) return res.status(404).json({ message: "Recipient account not found" });

        // Move the money (State Management)
        sender.balance -= amount;
        recipient.balance += amount;

        // Save both changes to MongoDB
        await sender.save({ validateBeforeSave: false });
        await recipient.save({ validateBeforeSave: false });

        res.json({ 
            message: `Transfer of Rs.${amount} to ${recipientAccountNumber} successful!`,
            yourNewBalance: sender.balance 
        });

    } catch (err) {
        res.status(500).json({ message: "Transfer process failed", error: err.message });
    }
});

module.exports = router;