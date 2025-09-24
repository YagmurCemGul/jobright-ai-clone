// This file remains a CommonJS module.
// We will use dynamic import() to load the ESM-only retext packages.

const extractSkills = async (text) => {
  if (!text) return [];

  try {
    // Dynamically import the necessary ESM modules
    const { unified } = await import('unified');
    const retextEnglish = (await import('retext-english')).default;
    const retextPos = (await import('retext-pos')).default;
    const retextKeywords = (await import('retext-keywords')).default;
    const { toString } = await import('nlcst-to-string');

    const file = await unified()
      .use(retextEnglish)
      .use(retextPos) // Part-of-speech tagging
      .use(retextKeywords, { maximum: 20 }) // Limit the number of keywords to get more relevant ones
      .process(text);

    // Extract both keywords (single words) and keyphrases (multi-word)
    const keywords = file.data.keywords?.map(keyword => toString(keyword.matches[0].node)) || [];
    const keyphrases = file.data.keyphrases?.map(phrase => {
      return phrase.matches[0].nodes.map(node => toString(node)).join('');
    }) || [];

    const potentialSkills = new Set([...keywords, ...keyphrases]);

    // Filter out generic words that are often picked up but are not skills
    const commonWords = new Set([
        'introduction', 'experience', 'work', 'project', 'application', 'development',
        'management', 'team', 'company', 'system', 'data', 'solution', 'role', 'responsibilities',
        'university', 'education', 'degree', 'inc', 'ltd', 'llc'
    ]);

    const filteredSkills = [...potentialSkills].filter(skill => {
        const lowerSkill = skill.toLowerCase();
        return lowerSkill.length > 1 && !commonWords.has(lowerSkill) && isNaN(lowerSkill);
    });

    return filteredSkills;

  } catch (error) {
    console.error("Error during skill extraction:", error);
    // Fallback in case of unexpected errors with the NLP pipeline
    return [];
  }
};

module.exports = { extractSkills };