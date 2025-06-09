// scripts/addRoleToExistingUsers.js (example script)
const connectToMongo = require('../mongo-connector'); // Adjust path
const User = require('../auth-service/src/models/User'); // Adjust path

async function addRole() {
  await connectToMongo();
  try {
    const result = await User.updateMany(
      { role: { $exists: false } }, // Find users without a 'role' field
      { $set: { role: 'user' } }   // Set their role to 'user'
    );
    console.log(`Updated ${result.nModified} users with default role 'user'.`);
  } catch (error) {
    console.error('Error adding default role:', error);
  } finally {
    mongoose.connection.close();
  }
}
addRole();