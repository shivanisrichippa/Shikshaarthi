//auth-service/src/services/college-validation.service.js

module.exports = {
  validateCollegeWithAPI: async (collegeName, district) => {
    return collegesData.some(c => 
      c.college.toLowerCase() === collegeName.toLowerCase() &&
      c.district.toLowerCase() === district.toLowerCase()
    );
  }
};