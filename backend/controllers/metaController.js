/**
 * Simple metadata endpoints for frontend taxonomy.
 * Provides interview types and industries used by the UI.
 */

exports.getInterviewTypes = (req, res) => {
  const types = [
    { value: "behavioral", label: "Behavioral" },
    { value: "technical", label: "Technical" },
    { value: "system-design", label: "System Design" },
    { value: "case-study", label: "Case Study" },
    { value: "hr", label: "HR" }
  ];
  return res.json(types);
};

exports.getIndustries = (req, res) => {
  const industries = [
    { value: "tech", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "consulting", label: "Consulting" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" }
  ];
  return res.json(industries);
};