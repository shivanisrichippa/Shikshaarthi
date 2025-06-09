const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose'); // Import mongoose to use its helpers
const CoinTransactionModule = require('../models/CoinTransaction.model');
const logger = require('../config/logger');

const getUserCoinBalanceAndHistory = async (req, res) => {
  // ***** THE FIX IS HERE *****
  // Changed from req.user.id to req.user.userId to match the JWT middleware payload.
  const userId = req.user.userId;
  const { page = 1, limit = 10 } = req.query;
  
  // Add a check for userId to be safe.
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`Invalid or missing userId in token for coin balance request.`);
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid user session." });
  }

  const CoinTransaction = CoinTransactionModule.getModel();
  if (!CoinTransaction) {
    logger.error("CoinTransaction model is not available in getUserCoinBalanceAndHistory.");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Service temporarily unavailable." });
  }

  try {
    const balancePromise = CoinTransaction.getCurrentBalance(userId);

    const query = { userId: new mongoose.Types.ObjectId(userId) }; // Ensure it's an ObjectId
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { transactionDate: -1 },
    };

    const transactionsPromise = CoinTransaction.find(query)
        .sort(options.sort)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .lean();
    
    const totalDocsPromise = CoinTransaction.countDocuments(query);

    // Run promises in parallel for better performance
    const [balance, transactions, totalDocs] = await Promise.all([
        balancePromise,
        transactionsPromise,
        totalDocsPromise
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Coin balance and history fetched successfully.',
      data: {
        currentBalance: balance,
        history: transactions,
      },
      pagination: {
            totalDocs,
            limit: options.limit,
            page: options.page,
            totalPages: Math.ceil(totalDocs / options.limit),
            hasNextPage: options.page * options.limit < totalDocs,
            hasPrevPage: options.page > 1
      }
    });
  } catch (error) {
    logger.error(`Error fetching user coin balance and history for user ${userId}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch coin details.' });
  }
};

module.exports = {
  getUserCoinBalanceAndHistory,
};