const Counter = require('../models/Counter');
const User = require('../models/User');
const WebSocket = require('ws');
const mongoose = require('mongoose');

// Import your database accessor function (adjust path as needed)
const { getDb } = require('../shared/libs/database/mongo-connector'); // Adjust path to your db connection file

class CounterController {
  constructor() {
    this.clients = new Set();
    this.updateInterval = null;
    console.log('CounterController initialized.');
  }

  // Initialize WebSocket server
  initializeWebSocket(server) {
    if (this.wss) {
      console.warn('WebSocket server already initialized for counters.');
      return;
    }

    this.wss = new WebSocket.Server({
      server,
      path: '/ws/counters'
    });

    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection for counters established.');
      this.clients.add(ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);

          switch (data.type) {
            case 'GET_COUNTERS':
              console.log('Received GET_COUNTERS request via WebSocket.');
              await this.handleGetCounters(ws);
              break;
            case 'REFRESH_COUNTERS':
              console.log('Received REFRESH_COUNTERS request via WebSocket.');
              await this.refreshAndBroadcastCounters();
              break;
            default:
              console.warn('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing or handling WebSocket message:', error);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format.' }));
          }
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection for counters closed.');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error on counters:', error);
        this.clients.delete(ws);
      });

      // Send initial counter values immediately to the new client
      this.handleGetCounters(ws);
    });

    // Start periodic counter updates (every 30 seconds)
    this.startPeriodicUpdates();
  }

  // Start periodic counter updates
  startPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      console.log('Attempting periodic counter refresh...');
      await this.refreshAndBroadcastCounters();
    }, 30000);
    console.log('Periodic counter updates started.');
  }

  // Stop periodic updates
  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Periodic counter updates stopped.');
    }
  }

  // Get actual counts from database using direct DB access
  async getActualCounts() {
    try {
      // Get the database using our accessor function
      const db = getDb();
      
      // Check if the database is available
      if (!db) {
        console.error('Database not initialized yet');
        return { happyCustomers: 0, happyUsers: 0, serviceProviders: 0 };
      }

      // Check if mongoose connection is ready as additional verification
      if (mongoose.connection.readyState !== 1) {
        console.error('Mongoose connection not ready. Connection state:', mongoose.connection.readyState);
        return { happyCustomers: 0, happyUsers: 0, serviceProviders: 0 };
      }

      try {
        // Check if users collection exists
        const collections = await db.listCollections({ name: 'users' }).toArray();
        
        if (collections.length === 0) {
          console.log('Users collection does not exist yet');
          return { happyCustomers: 0, happyUsers: 0, serviceProviders: 0 };
        }

        // Direct MongoDB queries instead of Mongoose models
        const usersCollection = db.collection('users');
        
        // Count total users
        const totalUsers = await usersCollection.countDocuments();
        
        // Count happy customers: Users with 'active' subscriptionStatus
        const happyCustomers = await usersCollection.countDocuments({
          subscriptionStatus: 'active'
        });
        
        // Count service providers: Users with role 'provider'
        const serviceProviders = await usersCollection.countDocuments({
          role: 'provider'
        });

        console.log('Actual counts from database fetched:', {
          happyCustomers,
          totalUsers,
          serviceProviders
        });

        return {
          happyCustomers: happyCustomers || 0,
          happyUsers: totalUsers || 0,
          serviceProviders: serviceProviders || 0
        };

      } catch (dbError) {
        console.error('Direct DB count error:', dbError);
        
        // Fallback to mongoose models if direct query fails
        try {
          const totalUsers = await User.countDocuments();
          const happyCustomers = await User.countDocuments({
            subscriptionStatus: 'active'
          });
          const serviceProviders = await User.countDocuments({
            role: 'provider'
          });

          return {
            happyCustomers: happyCustomers || 0,
            happyUsers: totalUsers || 0,
            serviceProviders: serviceProviders || 0
          };
        } catch (fallbackError) {
          console.error('Fallback count error:', fallbackError);
          return { happyCustomers: 0, happyUsers: 0, serviceProviders: 0 };
        }
      }

    } catch (error) {
      console.error('Error getting actual counts from database:', error.message);
      return { happyCustomers: 0, happyUsers: 0, serviceProviders: 0 };
    }
  }

  // Update or create counter document using direct DB access
  async updateCounterDocument(actualCounts) {
    try {
      const db = getDb();
      
      if (!db) {
        console.error('Database not initialized for counter update');
        return null;
      }

      try {
        // Check if counters collection exists
        const collections = await db.listCollections({ name: 'counters' }).toArray();
        
        const countersCollection = db.collection('counters');
        const now = new Date();
        
        // Use direct MongoDB findOneAndUpdate
        const result = await countersCollection.findOneAndUpdate(
          { id: 'main' },
          {
            $set: {
              happyCustomers: actualCounts.happyCustomers,
              happyUsers: actualCounts.happyUsers,
              serviceProviders: actualCounts.serviceProviders,
              lastUpdated: now
            }
          },
          { 
            upsert: true, 
            returnDocument: 'after' // MongoDB native driver uses 'returnDocument' instead of 'new'
          }
        );

        return result.value || {
          id: 'main',
          happyCustomers: actualCounts.happyCustomers,
          happyUsers: actualCounts.happyUsers,
          serviceProviders: actualCounts.serviceProviders,
          lastUpdated: now
        };

      } catch (dbError) {
        console.error('Direct DB counter update error:', dbError);
        
        // Fallback to mongoose model
        try {
          const counters = await Counter.findOneAndUpdate(
            { id: 'main' },
            {
              $set: {
                happyCustomers: actualCounts.happyCustomers,
                happyUsers: actualCounts.happyUsers,
                serviceProviders: actualCounts.serviceProviders,
                lastUpdated: new Date()
              }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          return counters;
        } catch (fallbackError) {
          console.error('Fallback counter update error:', fallbackError);
          return null;
        }
      }

    } catch (error) {
      console.error('Error updating counter document:', error);
      return null;
    }
  }

  async incrementCounterAPI(req, res) {
    try {
      await this.refreshAndBroadcastCounters();
      res.json({
        success: true,
        message: 'Counters refreshed from database'
      });
    } catch (error) {
      console.error('Error refreshing counters:', error);
      res.status(500).json({ error: 'Failed to refresh counters' });
    }
  }

  // Refresh counters and broadcast to all clients
  async refreshAndBroadcastCounters() {
    try {
      const actualCounts = await this.getActualCounts();
      const counters = await this.updateCounterDocument(actualCounts);

      if (counters) {
        this.broadcastUpdate(counters);
        console.log('Counters refreshed and broadcasted:', {
          happyCustomers: counters.happyCustomers,
          happyUsers: counters.happyUsers,
          serviceProviders: counters.serviceProviders,
          lastUpdated: counters.lastUpdated
        });
      } else {
        // If counter update failed, still broadcast the actual counts
        this.broadcastUpdate({
          happyCustomers: actualCounts.happyCustomers,
          happyUsers: actualCounts.happyUsers,
          serviceProviders: actualCounts.serviceProviders,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error refreshing and broadcasting counters:', error);
    }
  }

  // Handle initial GET_COUNTERS request from a new WebSocket client
  async handleGetCounters(ws) {
    try {
      const actualCounts = await this.getActualCounts();
      const counters = await this.updateCounterDocument(actualCounts);

      const responseData = counters || {
        happyCustomers: actualCounts.happyCustomers,
        happyUsers: actualCounts.happyUsers,
        serviceProviders: actualCounts.serviceProviders,
        lastUpdated: new Date()
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'COUNTER_UPDATE',
          counters: {
            happyCustomers: responseData.happyCustomers,
            happyUsers: responseData.happyUsers,
            serviceProviders: responseData.serviceProviders
          },
          lastUpdated: responseData.lastUpdated
        }));
        console.log('Initial counters sent to new WebSocket client.');
      }
    } catch (error) {
      console.error('Error handling GET_COUNTERS for WebSocket client:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'COUNTER_UPDATE',
          counters: { happyCustomers: 0, happyUsers: 0, serviceProviders: 0 },
          error: 'Failed to load counters'
        }));
      }
    }
  }

  // Broadcast counter update to all clients
  broadcastUpdate(counters) {
    const updateMessage = JSON.stringify({
      type: 'COUNTER_UPDATE',
      counters: {
        happyCustomers: counters.happyCustomers,
        happyUsers: counters.happyUsers,
        serviceProviders: counters.serviceProviders
      },
      lastUpdated: counters.lastUpdated
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(updateMessage);
      }
    });
  }

  // Method to trigger immediate refresh
  async triggerCounterRefresh() {
    console.log('Manual trigger for counter refresh initiated.');
    await this.refreshAndBroadcastCounters();
  }

  // REST API handler for /api/counters
  async getCounters(req, res) {
    try {
      const actualCounts = await this.getActualCounts();
      res.json({
        ...actualCounts,
        lastUpdated: new Date()
      });
      console.log('Counters served via REST API.');
    } catch (error) {
      console.error('Error getting counters via REST API:', error);
      res.status(500).json({ error: 'Failed to get counters' });
    }
  }

  // Force refresh endpoint
  async forceRefresh(req, res) {
    try {
      await this.refreshAndBroadcastCounters();
      res.json({ success: true, message: 'Counters refreshed successfully' });
    } catch (error) {
      console.error('Error forcing refresh via REST API:', error);
      res.status(500).json({ error: 'Failed to refresh counters' });
    }
  }

  // Cleanup method
  cleanup() {
    this.stopPeriodicUpdates();
    if (this.wss) {
      this.wss.close(() => {
        console.log('WebSocket server for counters closed.');
        this.clients.clear();
      });
    }
    console.log('CounterController cleaned up.');
  }
}

module.exports = new CounterController();