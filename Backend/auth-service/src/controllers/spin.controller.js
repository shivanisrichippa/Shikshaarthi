// auth-service/src/controllers/spin.controller.js

const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const SpinHistory = require('../models/SpinHistory');
const logger = require('../config/logger');
const axios = require('axios');
const config = require('../config');

// This should match the config in your frontend
const spinWheelPrizes = [
    { id: "cash25", prizeValue: "₹25 PhonePe Gift Card", probabilityWeight: 1, type: 'cash', amount: 25 },
    { id: "discount15", prizeValue: "15% Off Shikshaarthi Subscription", probabilityWeight: 2, type: 'discount' },
    { id: "discount10", prizeValue: "10% Off Shikshaarthi Subscription", probabilityWeight: 3, type: 'discount' },
    { id: "cash15", prizeValue: "₹15 PhonePe Gift Card", probabilityWeight: 2, type: 'cash', amount: 15 },
    { id: "cash10", prizeValue: "₹10 PhonePe Gift Card", probabilityWeight: 5, type: 'cash', amount: 10 },
    { id: "cash5", prizeValue: "₹5 PhonePe Gift Card", probabilityWeight: 7, type: 'cash', amount: 5 },
];

const totalProbWeight = spinWheelPrizes.reduce((sum, p) => sum + p.probabilityWeight, 0);

const determinePrize = () => {
    const randomRoll = Math.random() * totalProbWeight;
    let cumulativeWeight = 0;
    for (const prize of spinWheelPrizes) {
        cumulativeWeight += prize.probabilityWeight;
        if (randomRoll <= cumulativeWeight) {
            return prize;
        }
    }
    return spinWheelPrizes[spinWheelPrizes.length - 1]; // Fallback
};


exports.getSpins = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('availableSpins');
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        }
        res.status(StatusCodes.OK).json({
            success: true,
            availableSpins: user.availableSpins,
        });
    } catch (error) {
        logger.error(`Error fetching spins for user ${req.user.userId}:`, error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};

exports.consumeSpin = async (req, res) => {
    const userId = req.user.userId;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error('User not found.');
        }

        if (user.availableSpins <= 0) {
            throw new Error('No available spins.');
        }

        // Decrement spin count
        user.availableSpins -= 1;

        // Determine the prize
        const wonPrize = determinePrize();

        // If the prize is cash, add it to user's coins
        if (wonPrize.type === 'cash' && wonPrize.amount > 0) {
            // The user.updateCoins method already saves the user and logs the update
            await user.updateCoins(wonPrize.amount, `Spin Wheel Prize: ${wonPrize.prizeValue}`);
        }
        
        // Log the spin
        const spinRecord = new SpinHistory({
            userId,
            prizeId: wonPrize.id,
            prizeValue: wonPrize.prizeValue,
        });
        
        await spinRecord.save({ session });
        await user.save({ session }); // We still save the user here for the spin decrement
        
        await session.commitTransaction();

        // --- FIX START: Asynchronously notify admin with a robust URL ---
        try {
            // Added a fallback for the service URL to prevent 'Invalid URL' errors.
            const rewardsServiceUrl = config.REWARDS_SERVICE_URL || 'http://localhost:3002';
            
            await axios.post(`${rewardsServiceUrl}/internal/notify-spin-win`, {
                userId,
                userFullName: user.fullName,
                userEmail: user.email,
                prizeValue: wonPrize.prizeValue,
            }, {
                headers: { 'x-internal-api-key': config.INTERNAL_API_KEY }
            });
            logger.info(`Successfully sent spin win notification for user ${userId}`);
        } catch (axiosError) {
            // This detailed log will help debug any future communication issues.
            logger.error(`NON-CRITICAL: Failed to send spin win notification. Error: ${axiosError.message}`, {
                url: `${config.REWARDS_SERVICE_URL}/internal/notify-spin-win`, // Log the URL it tried to use
                response: axiosError.response?.data
            });
        }
        // --- FIX END ---

        res.status(StatusCodes.OK).json({
            success: true,
            wonPrize,
            availableSpins: user.availableSpins,
            newCoinBalance: user.coins,
        });

    } catch (error) {
        await session.abortTransaction();
        logger.error(`Error consuming spin for user ${userId}: ${error.message}`, { stack: error.stack });
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};


exports.getSpinHistory = async (req, res) => {
    try {
        const spinHistory = await SpinHistory.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to the last 50 spins

        res.status(StatusCodes.OK).json({
            success: true,
            spinHistory,
        });
    } catch (error) {
        logger.error(`Error fetching spin history for user ${req.user.userId}:`, error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};