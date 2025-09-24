const Job = require('../models/Job');
const User = require('../models/User');

/**
 * Calculates a matching score between a user's skills and a job's required skills.
 * @param {Array<Object>} userSkills - The user's skills, e.g., [{ name: 'React', level: 'İleri' }, ...].
 * @param {Array<String>} jobSkills - The job's required skills, e.g., ['React', 'Node.js', ...].
 * @returns {Object} - An object containing the score and the matched skills.
 */
const { getCategoryForSkill } = require('./skillCategoryService');

const calculateMatch = (userSkills, jobSkills) => {
  if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) {
    return { score: 0, matchedSkills: [], matchedCategories: new Set() };
  }

  const userSkillNames = new Set(userSkills.map(skill => skill.name.toLowerCase()));
  const jobSkillNames = jobSkills.map(skill => skill.toLowerCase());

  const matchedSkills = jobSkillNames.filter(jobSkill => userSkillNames.has(jobSkill));

  // A simple scoring mechanism: (number of matched skills / number of required skills) * 100
  let score = (matchedSkills.length / jobSkillNames.length) * 100;

  // --- Category Bonus Calculation ---
  const matchedCategories = new Set();
  matchedSkills.forEach(skillName => {
    // Find the original skill object to get the original casing for getCategoryForSkill
    const originalJobSkill = jobSkills.find(s => s.toLowerCase() === skillName);
    if (originalJobSkill) {
      const category = getCategoryForSkill(originalJobSkill);
      if (category !== 'Other') {
        matchedCategories.add(category);
      }
    }
  });

  // Add a bonus for each unique category matched (e.g., 5% bonus per category)
  const categoryBonus = matchedCategories.size * 5;
  score += categoryBonus;

  // Cap the score at 100
  const finalScore = Math.min(Math.round(score), 100);

  // Return the original case for matched skills for display purposes
  const originalCaseMatchedSkills = jobSkills.filter(skill =>
    matchedSkills.includes(skill.toLowerCase())
  );

  return { score: finalScore, matchedSkills: originalCaseMatchedSkills, matchedCategories };
};

/**
 * Finds and ranks jobs for a user based on skill matching.
 * @param {String} userId - The ID of the user.
 * @returns {Array<Object>} - A sorted list of jobs with an added `matchDetails` property.
 */
const findMatchedJobs = async (userId) => {
  const user = await User.findById(userId).select('skills');
  if (!user) {
    throw new Error('User not found');
  }

  const allJobs = await Job.find();

  const jobsWithScores = allJobs.map(job => {
    const matchDetails = calculateMatch(user.skills, job.skills);
    return {
      ...job.toObject(), // Convert Mongoose document to a plain object
      matchDetails,
    };
  });

  // Filter out jobs with a score of 0 and sort by score in descending order
  const sortedJobs = jobsWithScores
    .filter(job => job.matchDetails.score > 0)
    .sort((a, b) => b.matchDetails.score - a.matchDetails.score);

  return sortedJobs;
};

module.exports = { findMatchedJobs, calculateMatch };