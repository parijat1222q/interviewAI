const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * Generate interview question based on mode and role
 * @param {string} role - User's job role
 * @param {string} mode - Interview mode: 'technical', 'hr', 'behavioral'
 * @param {Array} sessionHistory - Array of previous Q&A objects
 * @returns {Promise<Object>} { question, evaluation }
 */
exports.generateInterviewRound = async (role, mode = 'technical', sessionHistory = []) => {
  try {
    // Mode-specific prompts
    const modePrompts = {
      technical: `You are a senior technical interviewer. Ask a challenging technical question that tests deep knowledge of concepts and problem-solving skills.`,
      hr: `You are an HR interviewer. Ask a behavioral or soft-skills question that reveals communication, teamwork, and professional judgment.`,
      behavioral: `You are a behavioral specialist. Ask a situational question (STAR format) about real experiences, challenges overcome, and learnings.`
    };

    const modeDescription = {
      technical: 'technical depth and problem-solving ability',
      hr: 'communication, leadership, and cultural fit',
      behavioral: 'real-world experience and interpersonal skills'
    };

    // Format history for context
    const historyContext = sessionHistory.map((h, i) =>
      `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`
    ).join('\n\n');

    const prompt = `
You are a senior interviewer conducting a ${mode} interview.

Role: ${role}
Interview Mode: ${mode}

Previous Conversation History:
${historyContext || 'No previous questions yet.'}

${modePrompts[mode] || modePrompts.technical}

Tasks:
1. Analyze the candidate's previous answers (if any) to identify weak spots or interesting points to probe further.
2. Ask ONE specific, challenging ${mode} question relevant to ${role} professionals.
3. If the previous answer was vague, ask a follow-up to clarify.
4. If the previous answer was good, move to a related advanced topic.

Evaluate on 5 dimensions (for the *previous* answer if this is a follow-up, otherwise just provide nulls or placeholders as this function is mainly for generating the NEXT question, but we keep the structure for consistency):
   - accuracy (0-10)
   - clarity (0-10)
   - missing_concepts
   - sentiment
   - confidence_score (0-10)

Focus on assessing: ${modeDescription[mode]}

Example JSON structure:
{
  "question": "Tell me about a time when...",
  "evaluation": {
    "accuracy": 0,
    "clarity": 0,
    "missing_concepts": [],
    "sentiment": "neutral",
    "confidence_score": 0
  }
}

Return ONLY a valid JSON object.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Validate response structure
    if (!result.question) {
      throw new Error('Invalid AI response structure');
    }

    return result;
  } catch (error) {
    console.error('OpenAI Service Error:', error.message);
    throw new Error('Failed to generate interview question');
  }
};

/**
 * Evaluate a candidate's answer (NEW FUNCTION)
 * @param {string} role - User's job role
 * @param {string} question - The interview question asked
 * @param {string} answer - The candidate's answer
 * @param {string} mode - Interview mode for context
 * @returns {Promise<Object>} Evaluation object with scores
 */
exports.evaluateAnswer = async (role, question, answer, mode = 'technical') => {
  try {
    const modeGuidance = {
      technical: 'Focus on technical correctness, architecture thinking, and problem-solving approach',
      hr: 'Focus on communication clarity, professional judgment, and cultural alignment',
      behavioral: 'Focus on STAR framework usage, learnings gained, and impact demonstrated'
    };

    const prompt = `
You are a senior ${mode} interview evaluator.

Role: ${role}
Question: "${question}"
Candidate's Answer: "${answer}"
Mode: ${mode}

${modeGuidance[mode]}

Evaluate this answer on these dimensions:
1. accuracy (0-10): ${mode === 'technical' ? 'technical correctness' : 'relevance and authenticity'}
2. clarity (0-10): Communication quality and structure
3. missing_concepts: Specific topics/concepts that SHOULD have been mentioned but weren't (string array, max 5)
4. sentiment (positive/neutral/negative): Tone and attitude
5. confidence_score (0-10): Based on ${mode === 'technical' ? 'specificity and depth' : 'conviction and self-awareness'}

Return ONLY a valid JSON object:
{
  "accuracy": 8,
  "clarity": 7,
  "missing_concepts": ["concept1", "concept2"],
  "sentiment": "neutral",
  "confidence_score": 6
}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3,
      max_tokens: 250,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Validate numeric ranges
    if (result.accuracy < 0 || result.accuracy > 10) result.accuracy = 5;
    if (result.clarity < 0 || result.clarity > 10) result.clarity = 5;
    if (result.confidence_score < 0 || result.confidence_score > 10) result.confidence_score = 5;
    if (!Array.isArray(result.missing_concepts)) result.missing_concepts = [];

    return result;
  } catch (error) {
    console.error('Answer Evaluation Error:', error.message);
    throw new Error('Failed to evaluate answer');
  }
};

/**
 * Analyze resume against job description
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @returns {Promise<Object>} { score, missing_keywords, suggestions, strengths }
 */
exports.analyzeResumeATS = async (resumeText, jobDescription) => {
  try {
    const prompt = `
Resume: ${resumeText}
Job Description: ${jobDescription}

Analyze ATS compatibility:
1. Score 0-100 based on keyword match and relevance
2. List missing but critical keywords (max 10)
3. Provide 3-5 specific, actionable improvement suggestions
4. Identify 3-5 key strengths

Return JSON:
{
  "score": 75,
  "missingKeywords": ["React", "TypeScript"],
  "suggestions": ["Add AWS experience section", "Quantify achievements"],
  "strengths": ["Strong technical background", "Leadership experience"]
}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      score: result.score || 0,
      missingKeywords: result.missingKeywords || [],
      suggestions: result.suggestions || [],
      strengths: result.strengths || []
    };
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    throw new Error('Failed to analyze resume');
  }
};