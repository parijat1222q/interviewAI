import api from './client';

/**
 * Analyze resume from text
 * @param {string} resumeText - Resume content
 * @param {string} jobDesc - Job description
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeResume = async (resumeText, jobDesc) => {
  const response = await api.post('/resume/check', { resumeText, jobDesc });
  return response.data;
};

/**
 * Upload and analyze PDF resume
 * @param {File} pdfFile - PDF file object
 * @param {string} jobDescription - Job description
 * @returns {Promise<Object>} Analysis results
 */
export const uploadPdfResume = async (pdfFile, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', pdfFile);
  formData.append('jobDescription', jobDescription);

  const response = await api.post('/resume/analyze-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

  return response.data;
};