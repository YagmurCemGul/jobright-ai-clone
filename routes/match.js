const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const natural = require('natural');
const { stopwords } = require('natural/lib/natural/util');

// @route   POST api/match/:jobId
// @desc    Match user's resume to a job and return a score
// @access  Private
router.post('/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.resumeText) {
      return res.status(400).json({ msg: 'Resume not found for this user' });
    }

    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    const jobText = job.description;
    const resumeText = user.resumeText;

    tfidf.addDocument(jobText);
    tfidf.addDocument(resumeText);

    const tokenizer = new natural.WordTokenizer();
    const resumeTokens = tokenizer.tokenize(resumeText.toLowerCase());
    const uniqueResumeTokens = [...new Set(resumeTokens)];

    let totalScore = 0;
    let termsFound = 0;
    const matchedKeywords = [];

    tfidf.listTerms(0 /* document index */).forEach(function (item) {
      if (stopwords.indexOf(item.term) === -1) {
        // give more score to terms with higher tf-idf
        totalScore += item.tfidf;
        if (uniqueResumeTokens.includes(item.term)) {
          termsFound += item.tfidf;
          matchedKeywords.push(item.term);
        }
      }
    });

    const finalScore = totalScore > 0 ? (termsFound / totalScore) * 100 : 0;

    res.json({
      score: finalScore.toFixed(2),
      matchedKeywords,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;