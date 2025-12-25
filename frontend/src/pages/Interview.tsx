import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerBox } from "@/components/interview/AnswerBox";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  SkipForward,
  Brain,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { getInterviewTypes, getIndustries } from "@/api/meta.api";
import { generateTTS } from "@/api/voice.api";
import { useQuery } from "@tanstack/react-query";

const defaultInterviewTypes = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "system-design", label: "System Design" },
  { value: "case-study", label: "Case Study" },
];

const defaultIndustries = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "consulting", label: "Consulting" },
  { value: "healthcare", label: "Healthcare" },
];

export default function Interview() {
  const { queries, mutations } = useInterviewSession();
  const { nextQuestionMutation, submitAnswerMutation, endSessionMutation } =
    mutations;

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewType, setInterviewType] = useState("");
  const [industry, setIndustry] = useState("");
  const [enableVoice, setEnableVoice] = useState(false);
  const [enableAIVoice, setEnableAIVoice] = useState(false);
  const [questions, setQuestions] = useState<
    Array<{
      category: string;
      difficulty: string;
      question: string;
      aiAudioUrl?: string;
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const { data: interviewTypesResp = defaultInterviewTypes } = useQuery({
    queryKey: ["meta", "interviewTypes"],
    queryFn: getInterviewTypes,
    staleTime: 1000 * 60 * 60,
  });

  const { data: industriesResp = defaultIndustries } = useQuery({
    queryKey: ["meta", "industries"],
    queryFn: getIndustries,
    staleTime: 1000 * 60 * 60,
  });

  // Generate AI voice response
  useEffect(() => {
    const generateAIVoice = async () => {
      if (
        enableAIVoice &&
        interviewStarted &&
        questions[currentQuestion] &&
        !questions[currentQuestion].aiAudioUrl
      ) {
        try {
          setIsGeneratingAudio(true);
          const audioResponse = await generateTTS(
            questions[currentQuestion].question
          );

          // Update question with audio URL
          setQuestions((prev) =>
            prev.map((q, idx) =>
              idx === currentQuestion
                ? { ...q, aiAudioUrl: audioResponse.audioUrl }
                : q
            )
          );
        } catch (err) {
          console.warn("Failed to generate AI voice:", err);
          setEnableAIVoice(false);
        } finally {
          setIsGeneratingAudio(false);
        }
      }
    };

    generateAIVoice();
  }, [currentQuestion, interviewStarted, enableAIVoice, questions]);

  const startInterview = async () => {
    if (!interviewType || !industry) {
      toast.error("Please select interview type and industry");
      return;
    }

    setIsLoadingQuestion(true);
    try {
      const typeForFetch =
        interviewType === "system-design" ? "technical" : interviewType;
      const firstQuestion = await nextQuestionMutation.mutateAsync({
        interviewType: typeForFetch,
        industry,
      });

      setQuestions([
        {
          category:
            interviewType.charAt(0).toUpperCase() + interviewType.slice(1),
          difficulty: "medium",
          question: firstQuestion.question || "No question received",
        },
      ]);
      setCurrentQuestion(0);
      setInterviewStarted(true);
    } catch (err) {
      toast.error("Failed to fetch question. Using fallback.");
      setQuestions([
        {
          category: "Behavioral",
          difficulty: "medium",
          question: "Tell me about a time you solved a difficult problem.",
        },
      ]);
      setInterviewStarted(true);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!answer.trim()) {
      toast.error("Please provide an answer before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitAnswerMutation.mutateAsync({
        answer,
        questionId: undefined,
        metadata: { interviewType, industry, voiceMode: enableVoice },
      });

      toast.success("Answer submitted!");

      if (response?.nextQuestion) {
        const newQuestion = {
          category:
            interviewType.charAt(0).toUpperCase() + interviewType.slice(1),
          difficulty: "medium",
          question: response.nextQuestion,
        };
        setQuestions((prev) => [...prev, newQuestion]);
        setCurrentQuestion((prev) => prev + 1);
      } else {
        if (currentQuestion < questions.length - 1) {
          setTimeout(() => setCurrentQuestion((prev) => prev + 1), 1200);
        } else {
          toast.success("Interview complete!");
          await endSessionMutation.mutateAsync({});
          setInterviewStarted(false);
          setQuestions([]);
          setCurrentQuestion(0);
        }
      }
    } catch (err) {
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      toast.info("No more questions to skip to.");
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = questions.length
    ? ((currentQuestion + 1) / questions.length) * 100
    : 0;

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Mock Interview</h1>

      {!interviewStarted && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Configure Your Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Interview Type
                </label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypesResp.map((t: any) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Industry
                </label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industriesResp.map((i: any) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Voice Settings */}
            <Card className="bg-secondary/30 border-0">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <span>Use Voice Input (STT)</span>
                  </Label>
                  <Switch
                    checked={enableVoice}
                    onCheckedChange={setEnableVoice}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <span>AI Recruiter Voice (TTS)</span>
                  </Label>
                  <Switch
                    checked={enableAIVoice}
                    onCheckedChange={setEnableAIVoice}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {enableVoice &&
                    "Your microphone will be recorded and transcribed to text."}
                  {enableAIVoice &&
                    enableVoice &&
                    " "}
                  {enableAIVoice &&
                    "Questions will be read aloud by an AI recruiter."}
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={startInterview}
              className="w-full"
              size="lg"
              disabled={isLoadingQuestion}
            >
              {isLoadingQuestion ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Interview
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {interviewStarted && currentQ && (
        <>
          <QuestionCard
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            category={currentQ.category || "General"}
            difficulty={currentQ.difficulty || "medium"}
            question={currentQ.question || "No question available"}
            className="mb-6"
          />

          {/* AI Voice Control */}
          {currentQ.aiAudioUrl && (
            <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <CardContent className="pt-6 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {isGeneratingAudio
                    ? "Generating AI voice..."
                    : "AI recruiter can read this"}
                </span>
                {enableAIVoice && !isGeneratingAudio && (
                  <Volume2 className="h-4 w-4 text-blue-600" />
                )}
              </CardContent>
            </Card>
          )}

          <AnswerBox
            onSubmit={handleSubmitAnswer}
            className="mb-6"
            disabled={isSubmitting}
            voiceMode={enableVoice}
            aiResponseAudio={enableAIVoice ? currentQ.aiAudioUrl : undefined}
            onTranscriptionComplete={(text) => {
              toast.success("Speech recognized: " + text.substring(0, 50) + "...");
            }}
          />

          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setInterviewStarted(false);
                setCurrentQuestion(0);
                setQuestions([]);
              }}
              disabled={isSubmitting}
            >
              End Interview
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={skipQuestion}
                disabled={isSubmitting}
              >
                Skip Question
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          <Progress value={Math.round(progress)} className="h-2" />
        </>
      )}
    </div>
  );
}
