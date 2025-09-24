const SKILL_CATEGORIES = {
  'Frontend Frameworks & Libraries': ['React', 'Angular', 'Vue.js', 'jQuery', 'Svelte', 'Ember.js'],
  'Backend Frameworks & Libraries': ['Node.js', 'Express.js', 'Django', 'Flask', 'Ruby on Rails', 'Spring', 'ASP.NET'],
  'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Swift', 'Kotlin', 'PHP', 'TypeScript'],
  'Databases & Caching': ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Firebase', 'Redis', 'Cassandra'],
  'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Ansible'],
  'Mobile Development': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS'],
  'Data Science & AI': ['Machine Learning', 'Data Science', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy'],
  'Software & Tools': ['Git', 'Jira', 'Confluence', 'Figma', 'Sketch', 'Adobe XD'],
  'Methodologies': ['Agile', 'Scrum', 'Kanban', 'Waterfall']
};

// Create a reverse map for quick category lookup: { 'react': 'Frontend Frameworks & Libraries', ... }
const skillToCategoryMap = new Map();
for (const category in SKILL_CATEGORIES) {
  for (const skill of SKILL_CATEGORIES[category]) {
    skillToCategoryMap.set(skill.toLowerCase(), category);
  }
}

/**
 * Groups a flat list of skill objects by their category.
 * @param {Array<Object>} skills - User's skills, e.g., [{ name: 'React', level: 'İleri' }, ...].
 * @returns {Object} - An object where keys are categories and values are arrays of skill objects.
 */
const groupSkillsByCategory = (skills) => {
  if (!skills || skills.length === 0) {
    return {};
  }

  const grouped = skills.reduce((acc, skill) => {
    const category = skillToCategoryMap.get(skill.name.toLowerCase()) || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  // Sort categories alphabetically, but keep 'Other' at the end.
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  const sortedGrouped = {};
  for (const category of sortedCategories) {
    sortedGrouped[category] = grouped[category];
  }

  return sortedGrouped;
};

/**
 * Finds the category for a single skill.
 * @param {String} skillName - The name of the skill.
 * @returns {String} - The category name or 'Other'.
 */
const getCategoryForSkill = (skillName) => {
  return skillToCategoryMap.get(skillName.toLowerCase()) || 'Other';
};

module.exports = {
  groupSkillsByCategory,
  getCategoryForSkill,
  SKILL_CATEGORIES
};