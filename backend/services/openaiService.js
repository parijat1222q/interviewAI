const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * Generate interview question and evaluation
 * @param {string} role - User's job role
 * @param {string|null} previousAnswer - Previous answer to tailor next question
 * @returns {Promise<Object>} { question, evaluation }
 */
exports.generateInterviewRound = async (role, previousAnswer = null) => {
  try {
    const prompt = `
You are a senior technical interviewer conducting a realistic job interview.

Role: ${role}
${previousAnswer ? `Previous answer: "${previousAnswer}"` : 'This is the first question.'}

Tasks:
1. Ask ONE specific, challenging technical question relevant to ${role} engineers
2. If previous answer exists, ask a follow-up or deeper question
3. Evaluate on 5 dimensions:
   - accuracy (0-10): technical correctness
   - clarity (0-10): communication quality
   - missing_concepts: array of specific topics not mentioned
   - sentiment (positive/neutral/negative): tone analysis
   - confidence_score (0-10): based on specificity and depth

Return ONLY a valid JSON object:
{
  "question": "Your question here",
  "evaluation": {
    "accuracy": 0,
    "clarity": 0,
    "missing_concepts": [],
    "sentiment": "neutral",
    "confidence_score": 0
  }
}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" } // Forces JSON output
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Validate response structure
    if (!result.question || !result.evaluation) {
      throw new Error('Invalid AI response structure');
    }

    return result;
  } catch (error) {
    console.error('OpenAI Service Error:', error.message);
    throw new Error('Failed to generate interview question');
  }
};

/**
 * Analyze resume against job description
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @returns {Promise<Object>} { score, missing_keywords }
 */
exports.analyzeResumeATS = async (resumeText, jobDescription) => {
  try {
    const prompt = `
Resume: ${resumeText}
Job Description: ${jobDescription}

Analyze ATS compatibility:
1. Score 0-100 based on keyword match
2. List missing but critical keywords
3. Suggest improvements

Return JSON: { "score": 75, "missing_keywords": ["React", "TypeScript"], "suggestions": ["Add AWS experience"] }
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    throw new Error('Failed to analyze resume');
  }
};