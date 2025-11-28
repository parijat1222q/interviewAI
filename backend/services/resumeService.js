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
        You are an expert ATS (Applicant Tracking System) scanner and Resume Coach.

        Resume Text:
        "${resumeText}"

        Job Description:
        "${jobDescription}"
        
        Analyze the resume against the job description with strict ATS criteria:
        1. **Match Score (0-100)**: Calculate based on keyword overlap, experience relevance, and skills match. Be strict.
        2. **Missing Keywords**: Identify critical hard skills, tools, and technologies present in the JD but missing from the resume.
        3. **Formatting Issues**: Check for things that might confuse an ATS (though you are reading text, infer structure issues if possible, e.g., missing sections).
        4. **Improvement Suggestions**: Provide 3-5 actionable, high-impact changes.
        5. **Strengths**: What makes this candidate a good fit?
        
        Return ONLY a valid JSON object:
        {
          "score": 75,
          "missingKeywords": ["React Hooks", "AWS Lambda", "CI/CD"],
          "suggestions": [
            "Add a 'Technical Skills' section with the missing keywords.",
            "Quantify your impact in the 'Experience' section (e.g., 'Improved performance by 20%').",
            "Tailor your summary to mention specific experience with Node.js."
          ],
          "strengths": ["Strong React skills", "Relevant backend experience", "Clear education section"]
        }
      `.trim();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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