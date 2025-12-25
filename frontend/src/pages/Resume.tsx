import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ATSScoreCard } from "@/components/resume/ATSScoreCard";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useResume } from "@/hooks/useResume";

export default function Resume() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const { mutations } = useResume();
  const { analyzeMutation } = mutations;

  const analyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error(
        "Please paste both your resume text and a job description"
      );
      return;
    }

    try {
      const res = await analyzeMutation.mutateAsync({
        resumeText,
        jobDesc: jobDescription,
      });

      const mapped = {
        score: res.analysis.score,
        matchedKeywords: res.analysis.matchedKeywords,
        missingKeywords: res.analysis.missingKeywords,
        suggestions: res.analysis.suggestions,
      };
      setAnalysis(mapped);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error("Failed to analyze resume");
    }
  };

  const handleFileUpload = () => {
    toast.info(
      "PDF upload: paste resume text above for analysis via backend text endpoint."
    );
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Resume ATS Analyzer
        </h1>
        <p className="mt-2 text-muted-foreground">
          Check how well your resume matches job requirements and get
          improvement suggestions
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paste Resume Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume here..."
                rows={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                rows={6}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={analyze}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={() => handleFileUpload()}
                  />
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {analysis ? (
            <ATSScoreCard
              score={analysis.score}
              matchedKeywords={analysis.matchedKeywords}
              missingKeywords={analysis.missingKeywords}
              suggestions={analysis.suggestions}
            />
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  No Analysis Yet
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Paste your resume text and job description to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
