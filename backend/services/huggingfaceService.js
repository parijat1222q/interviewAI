const axios = require('axios');

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

/**
 * Analyze sentiment using Hugging Face zero-shot-classification
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} Sentiment scores and label
 */
exports.analyzeSentiment = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      return {
        positive: 0.33,
        neutral: 0.33,
        negative: 0.34,
        label: 'NEUTRAL'
      };
    }

    const response = await axios.post(
      `${HF_API_URL}/facebook/bart-large-mnli`,
      {
        inputs: text,
        parameters: {
          candidate_labels: ['positive', 'neutral', 'negative']
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Transform HF response to our format
    const scores = response.data.scores;
    const labels = response.data.labels;

    const result = {
      positive: scores[labels.indexOf('positive')] || 0,
      neutral: scores[labels.indexOf('neutral')] || 0,
      negative: scores[labels.indexOf('negative')] || 0,
      label: response.data.labels[0].toUpperCase()
    };

    return result;
  } catch (error) {
    console.error('Hugging Face sentiment error:', error.message);
    // Fallback: return neutral scores if API fails
    return {
      positive: 0.33,
      neutral: 0.34,
      negative: 0.33,
      label: 'NEUTRAL'
    };
  }
};

/**
 * Analyze communication tone and metrics
 * @param {string} text - Answer text
 * @returns {Object} Tone analysis results
 */
exports.analyzeTone = (text) => {
  if (!text) return null;

  const words = text.trim().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate metrics
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / wordCount || 0;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

  // Determine pace (words per sentence)
  const wordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  let pace = 'normal';
  if (wordsPerSentence > 20) pace = 'fast';
  if (wordsPerSentence < 8) pace = 'slow';

  // Score professionalism based on average word length and complexity
  const professionalism = Math.min(10, Math.round((avgWordLength / 6) * 10));

  // Estimate enthusiasm (exclamation marks, confident words)
  const enthusiasmWords = ['excited', 'passionate', 'love', 'amazing', 'fantastic', 'excellent'];
  const enthusiasmCount = enthusiasmWords.filter(word => 
    text.toLowerCase().includes(word)
  ).length;
  const enthusiasm = Math.min(10, enthusiasmCount * 2);

  // Clarity based on unique word ratio and sentence length consistency
  const uniqueWordRatio = uniqueWords / wordCount;
  const clarity = Math.round(uniqueWordRatio * 10);

  return {
    professionalism,
    enthusiasm,
    clarity,
    pace,
    wordCount,
    sentenceCount,
    averageWordLength: Math.round(avgWordLength * 10) / 10,
    uniqueWords,
    confidence: Math.min(1, wordCount / 200) // Confidence based on answer length
  };
};

/**
 * Extract technical terms from answer
 * @param {string} text - Answer text
 * @param {string} role - User role
 * @returns {Array<string>} Identified technical terms
 */
exports.extractTechnicalTerms = (text, role = 'backend') => {
  const technicalTermsByRole = {
    frontend: ['React', 'Vue', 'Angular', 'CSS', 'JavaScript', 'HTML', 'DOM', 'REST API', 'GraphQL', 'Webpack', 'Babel', 'Redux', 'Hooks', 'TypeScript', 'Next.js'],
    backend: ['Node.js', 'Express', 'Django', 'FastAPI', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'REST', 'GraphQL', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Redis', 'Cache'],
    data: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'Hadoop', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Visualization', 'Statistical Analysis'],
    devops: ['Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Linux', 'Bash', 'Git', 'Monitoring', 'Logging'],
    product: ['Product Strategy', 'Roadmap', 'User Research', 'Analytics', 'A/B Testing', 'KPI', 'OKR', 'Metrics', 'User Experience', 'Market Analysis']
  };

  const terms = technicalTermsByRole[role] || technicalTermsByRole.backend;
  const foundTerms = terms.filter(term => 
    new RegExp(`\\b${term}\\b`, 'i').test(text)
  );

  return foundTerms;
};