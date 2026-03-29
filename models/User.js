const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true },
    password:      { type: String, required: true, minlength: 6 },
    accountNumber: { type: String, unique: true },
    balance:       { type: Number, default: 0 },
    refreshToken:  { type: String }
}, { timestamps: true });

// Auto-hash password and generate account number before save
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (!this.accountNumber) {
        this.accountNumber = 'ACC' + Date.now();
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);