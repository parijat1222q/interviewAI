const LearningHub = require('../models/LearningHub');
const InterviewSession = require('../models/InterviewSession');

// Sample topics by role and difficulty
const LEARNING_TOPICS = {
  frontend: {
    beginner: [
      { id: 'html-css', name: 'HTML & CSS Fundamentals', category: 'Frontend Basics' },
      { id: 'js-basics', name: 'JavaScript Basics', category: 'JavaScript' },
      { id: 'dom', name: 'DOM Manipulation', category: 'JavaScript' }
    ],
    intermediate: [
      { id: 'react-intro', name: 'React Introduction', category: 'React' },
      { id: 'state-mgmt', name: 'State Management', category: 'React' },
      { id: 'async-js', name: 'Async JavaScript', category: 'JavaScript' }
    ],
    advanced: [
      { id: 'next-js', name: 'Next.js & SSR', category: 'Advanced' },
      { id: 'perf-opt', name: 'Performance Optimization', category: 'Advanced' },
      { id: 'web-security', name: 'Web Security', category: 'Security' }
    ]
  },
  backend: {
    beginner: [
      { id: 'rest-api', name: 'REST API Design', category: 'Backend Basics' },
      { id: 'db-basics', name: 'Database Fundamentals', category: 'Databases' },
      { id: 'node-js', name: 'Node.js Basics', category: 'Node.js' }
    ],
    intermediate: [
      { id: 'auth', name: 'Authentication & Authorization', category: 'Security' },
      { id: 'scaling', name: 'Scalability Patterns', category: 'Architecture' },
      { id: 'sql-adv', name: 'Advanced SQL', category: 'Databases' }
    ],
    advanced: [
      { id: 'microservices', name: 'Microservices Architecture', category: 'Architecture' },
      { id: 'caching', name: 'Caching Strategies', category: 'Performance' },
      { id: 'distributed', name: 'Distributed Systems', category: 'Advanced' }
    ]
  }
};

const RESOURCE_LINKS = {
  'html-css': [
    { title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', resourceType: 'documentation' },
    { title: 'CSS Tricks', url: 'https://css-tricks.com', resourceType: 'article' }
  ],
  'react-intro': [
    { title: 'React Official Docs', url: 'https://react.dev', resourceType: 'documentation' },
    { title: 'React Tutorial', url: 'https://youtube.com/watch?v=SqcY0GlETPk', resourceType: 'video' }
  ],
  'rest-api': [
    { title: 'REST API Best Practices', url: 'https://restfulapi.net', resourceType: 'article' },
    { title: 'Building RESTful APIs', url: 'https://www.coursera.org', resourceType: 'course' }
  ]
};

/**
 * Get or create learning hub for user
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Learning hub entry
 */
exports.getOrCreateLearningHub = async (userId, role) => {
  try {
    let hub = await LearningHub.findOne({ userId });

    if (!hub) {
      const topics = this.generateRecommendedTopics(role);
      hub = await LearningHub.create({
        userId,
        role,
        topics: topics.map(t => ({
          ...t,
          resources: RESOURCE_LINKS[t.topicId] || []
        })),
        recommendedTopics: topics.map(t => t.topicId)
      });
    }

    return hub;
  } catch (error) {
    console.error('Learning hub creation error:', error.message);
    throw error;
  }
};

/**
 * Generate recommended topics based on role and skill gaps
 * @param {string} role - User role
 * @returns {Array} Recommended topics
 */
generateRecommendedTopics = (role) => {
  const roleDifficulty = {
    frontend: ['beginner', 'intermediate', 'advanced'],
    backend: ['beginner', 'intermediate', 'advanced'],
    data: ['beginner', 'intermediate', 'advanced'],
    devops: ['beginner', 'intermediate', 'advanced'],
    product: ['beginner', 'intermediate', 'advanced']
  };

  const topics = [];
  const difficulties = roleDifficulty[role] || roleDifficulty.backend;

  difficulties.forEach(difficulty => {
    if (LEARNING_TOPICS[role]?.[difficulty]) {
      topics.push(...LEARNING_TOPICS[role][difficulty]);
    }
  });

  return topics;
};

/**
 * Mark topic as completed
 * @param {string} userId - User ID
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>} Updated hub
 */
exports.completeTopicLearning = async (userId, topicId) => {
  try {
    const hub = await LearningHub.findOne({ userId });

    if (!hub) throw new Error('Learning hub not found');

    const topic = hub.topics.find(t => t.topicId === topicId);
    if (topic) {
      topic.status = 'completed';
      topic.completedAt = new Date();
    }

    await hub.save();
    return hub;
  } catch (error) {
    console.error('Complete topic error:', error.message);
    throw error;
  }
};

/**
 * Update learning recommendations based on skill gaps
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated recommendations
 */
exports.updateRecommendationsBasedOnSkillGaps = async (userId) => {
  try {
    const hub = await LearningHub.findOne({ userId });
    if (!hub) throw new Error('Learning hub not found');

    // Get latest interview session to find weak areas
    const latestSession = await InterviewSession.findOne({
      userId,
      completed: true
    }).sort({ completedAt: -1 });

    if (!latestSession) return hub;

    // Find most common missing concepts
    const missingConcepts = {};
    latestSession.questions.forEach(q => {
      if (q.evaluation?.missing_concepts) {
        q.evaluation.missing_concepts.forEach(concept => {
          missingConcepts[concept] = (missingConcepts[concept] || 0) + 1;
        });
      }
    });

    // Update recommended topics based on gaps
    const recommendedTopics = Object.keys(missingConcepts)
      .sort((a, b) => missingConcepts[b] - missingConcepts[a])
      .slice(0, 5);

    hub.recommendedTopics = recommendedTopics;
    await hub.save();

    return hub;
  } catch (error) {
    console.error('Update recommendations error:', error.message);
    throw error;
  }
};

/**
 * Get daily challenge
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Daily challenge
 */
exports.getDailyChallenge = async (userId) => {
  try {
    const hub = await LearningHub.findOne({ userId });
    if (!hub) throw new Error('Learning hub not found');

    const today = new Date().toDateString();
    const challengeDate = hub.dailyChallenge?.date?.toDateString();

    // Generate new challenge if not already generated today
    if (challengeDate !== today) {
      const challenge = {
        date: new Date(),
        question: 'Explain the concept of ' + this.getRandomConcept(hub.role),
        completed: false,
        score: null
      };

      hub.dailyChallenge = challenge;
      await hub.save();
    }

    return hub.dailyChallenge;
  } catch (error) {
    console.error('Daily challenge error:', error.message);
    throw error;
  }
};

/**
 * Random concept generator
 */
getRandomConcept = (role) => {
  const concepts = {
    backend: ['database indexing', 'caching strategies', 'API design', 'microservices'],
    frontend: ['React hooks', 'CSS Grid', 'event delegation', 'state management'],
    data: ['feature engineering', 'model evaluation', 'cross-validation', 'regularization'],
    devops: ['containerization', 'CI/CD pipelines', 'infrastructure as code', 'monitoring']
  };

  const roleConcepts = concepts[role] || concepts.backend;
  return roleConcepts[Math.floor(Math.random() * roleConcepts.length)];
};