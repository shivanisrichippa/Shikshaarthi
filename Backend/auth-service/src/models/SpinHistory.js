// auth-service/src/models/SpinHistory.js
const mongoose = require('mongoose');

const spinHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    prizeId: { // e.g., 'cash25', 'discount15'
        type: String,
        required: true,
    },
    prizeValue: { // e.g., '₹25 PhonePe Gift Card'
        type: String,
        required: true,
    },
    spunAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    collection: 'spin_history'
});

module.exports = mongoose.model('SpinHistory', spinHistorySchema);