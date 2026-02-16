import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VideoAnalysis } from "../components/VideoInterview/VideoAnalysis";
import { ChatBox } from "../components/Interview/ChatBox";
import { HintLevelButtons, HintLevel } from "../components/HintLevelButtons";
import { LogicFeedback } from "../components/Interview/LogicFeedback";
import { SpeechFeedback } from "../components/Interview/SpeechFeedback";
import { Sparkles, Lightbulb } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";

export const InterviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFile, jobDescription } = location.state || {}; // Retrieve passed state

  // Speaking state management
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintTopic, setHintTopic] = useState<string | null>(null);
  const [availableHintLevel, setAvailableHintLevel] = useState<string | null>(
    "small",
  );

  // Real-time feedback state
  const [logicFeedback, setLogicFeedback] = useState<{
    issue_type: string;
    feedback: string;
    severity: "info" | "warning" | "error";
  } | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<{
    wpm: number;
    pace: string;
    filler_count: number;
    confidence_level: string;
    long_silence: boolean;
    feedback: string;
  } | null>(null);

  // Callbacks
  const handleAISpeakingChange = useCallback((speaking: boolean) => {
    setIsAISpeaking(speaking);
  }, []);

  const handleUserSpeakingChange = useCallback((speaking: boolean) => {
    setIsUserSpeaking(speaking);
  }, []);

  // Handle hint requests
  const handleHintRequest = async (level: HintLevel, prompt: string) => {
    setHintLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.getHint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, level }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentHint(data.hint || "Focus on your relevant experience.");
        if (data.available_level !== undefined)
          setAvailableHintLevel(data.available_level);
        if (data.topic) setHintTopic(data.topic);
      } else {
        const fallbackHints = {
          small: "Focus on the key skills mentioned in your resume.",
          medium: "Structure your answer: Situation, Task, Action, Result.",
          full: "Provide specific examples from your experience that match the job requirements.",
        };
        setCurrentHint(fallbackHints[level]);
      }
      setTimeout(() => setCurrentHint(null), 45000);
    } catch (error) {
      console.error("Hint request error:", error);
      setCurrentHint("Consider your relevant experience for this question.");
    } finally {
      setHintLoading(false);
    }
  };

  const handleLogicFeedback = useCallback(
    (feedback: { issue_type: string; feedback: string; severity: string }) => {
      setLogicFeedback(feedback as any);
      setTimeout(() => setLogicFeedback(null), 15000);
    },
    [],
  );

  const handleSpeechFeedback = useCallback(
    (feedback: {
      wpm: number;
      pace: string;
      filler_count: number;
      confidence_level: string;
      long_silence: boolean;
      feedback: string;
    }) => {
      setSpeechFeedback(feedback);
      setTimeout(() => setSpeechFeedback(null), 10000);
    },
    [],
  );

  const handleEndInterview = async () => {
    try {
      await fetch(API_ENDPOINTS.stopCamera, {
        method: "POST",
      });

      if (user) {
        // Save session to DB
        await fetch(`${API_ENDPOINTS.analytics}/../session/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });
      }
    } catch (error) {
      console.error("Error ending interview:", error);
    }
    navigate("/analytics");
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 md:p-6 overflow-hidden relative">
      <div className="max-w-[1920px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: Context & Inputs */}
        <div className="lg:col-span-3 h-full min-h-0 flex flex-col gap-4 bg-card/30 border border-border/50 rounded-2xl p-4 overflow-y-auto backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-hirebyte-mint" />
              Interview Setup
            </h3>
            <p className="text-xs text-muted-foreground">
              Resume & Job Analysis
            </p>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl text-sm border border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
              Resume
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold">
                PDF
              </div>
              <span className="truncate flex-1">
                {selectedFile?.name || "resume.pdf"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl text-sm border border-border/50 flex-1 overflow-hidden flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
              Job Description
            </span>
            <p className="text-muted-foreground text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap flex-1">
              {jobDescription || "No description provided."}
            </p>
          </div>

          {/* Hints Section */}
          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-yellow-400" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                AI Hints
              </span>
            </div>
            <HintLevelButtons
              onRequestHint={handleHintRequest}
              isLoading={hintLoading}
              availableLevel={availableHintLevel}
              topic={hintTopic}
            />
          </div>
        </div>

        {/* Center Panel: Video Stream */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col">
          <VideoAnalysis
            isAISpeaking={isAISpeaking}
            isUserSpeaking={isUserSpeaking}
            currentHint={currentHint}
          />
        </div>

        {/* Right Panel: Chat + Real-time Feedback */}
        <div className="lg:col-span-3 h-full min-h-0 flex flex-col gap-2">
          <LogicFeedback
            feedback={logicFeedback}
            onDismiss={() => setLogicFeedback(null)}
          />
          <SpeechFeedback
            feedback={speechFeedback}
            onDismiss={() => setSpeechFeedback(null)}
          />
          <ChatBox
            onEnd={handleEndInterview}
            onAISpeakingChange={handleAISpeakingChange}
            onUserSpeakingChange={handleUserSpeakingChange}
            onLogicFeedback={handleLogicFeedback}
            onSpeechFeedback={handleSpeechFeedback}
          />
        </div>
      </div>
    </div>
  );
};
