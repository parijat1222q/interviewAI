const pdf = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

class ResumeService {
  /**
   * Parse PDF to text
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @returns {Promise<string>} Extracted text
   */
  async parsePdfToText(pdfBuffer) {
    try {
      const data = await pdf(pdfBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF parsing error:', error.message);
      throw new Error('Failed to parse PDF: Invalid or corrupted file');
    }
  }

  /**
   * Analyze resume text with OpenAI
   * @param {string} resumeText - Resume content
   * @param {string} jobDescription - Job description
   * @returns {Promise<Object>} ATS analysis
   */
  async analyzeResumeATS(resumeText, jobDescription) {
    try {
      const prompt = `
        Resume: ${resumeText}
        Job Description: ${jobDescription}
        
        Analyze ATS compatibility:
        1. Calculate match score 0-100 based on keyword overlap
        2. Extract missing but critical keywords (max 10)
        3. Provide 3-5 specific improvement suggestions
        4. Identify strengths (3-5 key matches)
        
        Return JSON:
        {
          "score": 75,
          "missingKeywords": ["React Hooks", "AWS", "CI/CD"],
          "suggestions": ["Add AWS experience", "Mention CI/CD tools"],
          "strengths": ["Strong React skills", "Backend experience"]
        }
      `.trim();

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content);
      
      // Validate structure
      return {
        score: result.score || 0,
        missingKeywords: result.missingKeywords || [],
        suggestions: result.suggestions || [],
        strengths: result.strengths || []
      };

    } catch (error) {
      console.error('Resume analysis error:', error.message);
      throw new Error('Failed to analyze resume');
    }
  }

  /**
   * Clean up uploaded file
   * @param {string} filePath - Path to delete
   */
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('File cleanup warning:', error.message);
    }
  }
}

module.exports = new ResumeService();