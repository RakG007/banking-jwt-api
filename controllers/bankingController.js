const User = require('../models/User');

// Get Balance (You already have this, but keep it!)
exports.getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// NEW: Transfer Money Logic
exports.transferMoney = async (req, res) => {
    try {
        const { recipientAccountNumber, amount } = req.body;
        
        // 1. Find the sender (from the JWT token)
        const sender = await User.findById(req.user.id);
        
        // 2. Validation
        if (sender.balance < amount) {
            return res.status(400).json({ message: "Insufficient funds" });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        // 3. Find the recipient by their Account Number
        const recipient = await User.findOne({ accountNumber: recipientAccountNumber });
        if (!recipient) {
            return res.status(404).json({ message: "Recipient account not found" });
        }

        // 4. Update Balances
        sender.balance -= amount;
        recipient.balance += amount;

        // 5. Save both to Database
        await sender.save();
        await recipient.save();

        res.json({ 
            message: "Transfer successful!", 
            newBalance: sender.balance 
        });
    } catch (err) {
        res.status(500).json({ message: "Transfer failed", error: err.message });
    }
};