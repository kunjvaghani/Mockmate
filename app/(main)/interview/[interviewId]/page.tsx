"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WebcamView from "@/components/interview/WebcamView";
import MicButton from "@/components/interview/MicButton";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import SoundWaveAnimation from "@/components/interview/SoundWaveAnimation";
import { speakText, stopSpeaking } from "@/lib/tts";
import { useWebSpeechInput } from "@/hooks/useSpeechInput";
import {
    LogOut,
    Send,
    Loader2,
    Video,
    VideoOff,
    Keyboard,
    Mic,
    Clock,
} from "lucide-react";

const TOTAL_QUESTIONS = 5;

function formatTimer(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function InterviewRoomPage() {
    const params = useParams();
    const router = useRouter();
    const interviewId = params.interviewId as string;

    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [webcamEnabled, setWebcamEnabled] = useState(true);
    const [useTextInput, setUseTextInput] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        transcript,
        setTranscript,
        listening,
        startListening,
        stopListening,
        supported: speechSupported,
    } = useWebSpeechInput();

    // Load interview data
    useEffect(() => {
        async function loadInterview() {
            try {
                const res = await fetch(`/api/interview/${interviewId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.interview.ended) {
                        router.push(`/interview/${interviewId}/feedback`);
                        return;
                    }
                    if (typeof data.interview.duration === "number") {
                        setElapsedSeconds(data.interview.duration);
                    }
                    const messages = data.interview.messages || [];
                    if (messages.length > 0) {
                        // Resume interview
                        const lastMsg = messages[messages.length - 1];
                        setCurrentQuestion(lastMsg.question);
                        setQuestionNumber(messages.length);
                        setInterviewStarted(true);
                    }
                }
            } catch (err) {
                console.error("Failed to load interview:", err);
            } finally {
                setLoading(false);
            }
        }
        loadInterview();
    }, [interviewId, router]);

    // Live interview timer
    useEffect(() => {
        if (!interviewStarted || isComplete) return;
        const timer = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [interviewStarted, isComplete]);

    // Auto-enable text input if speech not supported
    useEffect(() => {
        if (!speechSupported) {
            setUseTextInput(true);
        }
    }, [speechSupported]);

    const generateQuestion = useCallback(
        async (userAnswer?: string) => {
            setIsThinking(true);
            setError(null);

            try {
                const res = await fetch("/api/generate-question", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        interviewId,
                        userAnswer: userAnswer || null,
                    }),
                });

                if (!res.ok) throw new Error("Failed to generate question");

                const data = await res.json();

                if (data.isComplete) {
                    setIsComplete(true);
                    setCurrentQuestion(null);
                    try {
                        await fetch(`/api/interview/${interviewId}/end`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ duration: elapsedSeconds }),
                        });
                    } catch (e) {
                        console.error("Failed to end interview:", e);
                    }
                    router.push(`/interview/${interviewId}/feedback`);
                    return;
                }

                setCurrentQuestion(data.question);
                setQuestionNumber(data.questionNumber);
                setIsThinking(false);

                // Speak the question
                if (data.question) {
                    setIsSpeaking(true);
                    speakText(data.question, () => {
                        setIsSpeaking(false);
                        // Auto-start mic after AI finishes speaking
                        if (!useTextInput && speechSupported) {
                            startListening();
                        }
                    });
                }
            } catch (err) {
                console.error("Error generating question:", err);
                setError("Failed to generate question. Please try again.");
                setIsThinking(false);
            }
        },
        [interviewId, router, useTextInput, speechSupported, startListening, elapsedSeconds]
    );

    const handleStartInterview = async () => {
        setInterviewStarted(true);
        await generateQuestion();
    };

    const handleSubmitAnswer = async () => {
        const answer = useTextInput ? textInput : transcript;
        if (!answer.trim()) return;

        // Stop listening if active
        if (listening) {
            stopListening();
        }

        // Clear inputs
        setTranscript("");
        setTextInput("");

        // Generate next question with the answer
        await generateQuestion(answer);
    };

    const handleEndInterview = async () => {
        stopSpeaking();
        if (listening) stopListening();
        try {
            await fetch(`/api/interview/${interviewId}/end`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ duration: elapsedSeconds }),
            });
        } catch (err) {
            console.error("Failed to end interview:", err);
        }
        router.push(`/interview/${interviewId}/feedback`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-medium">Loading interview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-semibold text-slate-800">
                            Mock Interview
                        </h1>
                        {interviewStarted && (
                            <>
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                                    Question {questionNumber} / {TOTAL_QUESTIONS}
                                </span>
                                <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                                    <Clock className="h-3 w-3 text-slate-500" />
                                    {formatTimer(elapsedSeconds)}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setWebcamEnabled(!webcamEnabled)}
                            className="text-slate-500"
                        >
                            {webcamEnabled ? (
                                <Video className="h-4 w-4" />
                            ) : (
                                <VideoOff className="h-4 w-4" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUseTextInput(!useTextInput)}
                            className="text-slate-500"
                        >
                            {useTextInput ? (
                                <Mic className="h-4 w-4" />
                            ) : (
                                <Keyboard className="h-4 w-4" />
                            )}
                        </Button>

                        {interviewStarted && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleEndInterview}
                                className="rounded-full"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                End Interview
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {!interviewStarted ? (
                    /* Pre-Interview Screen */
                    <div className="max-w-lg mx-auto text-center py-16">
                        <div className="mb-8">
                            <WebcamView enabled={webcamEnabled} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">
                            Ready to Begin?
                        </h2>
                        <p className="text-slate-500 mb-8">
                            Make sure your camera and microphone are working. The AI will ask
                            you {TOTAL_QUESTIONS} questions adapted to your role.
                        </p>
                        <Button
                            onClick={handleStartInterview}
                            size="lg"
                            className="h-14 px-10 text-base rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200 animate-pulse-glow"
                        >
                            Start Interview
                        </Button>
                    </div>
                ) : (
                    /* Interview in Progress */
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left: AI Side */}
                        <div className="space-y-6">
                            <Card className="rounded-2xl border-0 shadow-lg shadow-indigo-100/50 overflow-hidden">
                                <CardContent className="p-8">
                                    {/* Sound wave */}
                                    <div className="flex items-center justify-center mb-6">
                                        <SoundWaveAnimation isActive={isSpeaking} />
                                    </div>

                                    {/* Question Display */}
                                    <QuestionDisplay
                                        question={currentQuestion}
                                        questionNumber={questionNumber}
                                        totalQuestions={TOTAL_QUESTIONS}
                                        isThinking={isThinking}
                                    />
                                </CardContent>
                            </Card>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Right: User Side */}
                        <div className="space-y-6">
                            {/* Webcam */}
                            <WebcamView enabled={webcamEnabled} />

                            {/* Mic / Text Input */}
                            <Card className="rounded-2xl border-0 shadow-lg shadow-slate-100">
                                <CardContent className="p-6">
                                    {useTextInput ? (
                                        /* Text Input Mode */
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Type your answer here..."
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                className="min-h-[120px] rounded-xl resize-none text-base"
                                                disabled={isSpeaking || isThinking}
                                            />
                                            <Button
                                                onClick={handleSubmitAnswer}
                                                disabled={
                                                    !textInput.trim() || isSpeaking || isThinking
                                                }
                                                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Submit Answer
                                            </Button>
                                        </div>
                                    ) : (
                                        /* Voice Input Mode */
                                        <div className="flex flex-col items-center space-y-4">
                                            <MicButton
                                                listening={listening}
                                                onStart={startListening}
                                                onStop={stopListening}
                                                disabled={isSpeaking || isThinking}
                                            />

                                            {/* Transcript preview */}
                                            {transcript && (
                                                <div className="w-full">
                                                    <p className="text-xs text-slate-400 mb-1.5">
                                                        Your answer:
                                                    </p>
                                                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 max-h-32 overflow-y-auto">
                                                        {transcript}
                                                    </div>
                                                </div>
                                            )}

                                            {transcript && !listening && (
                                                <Button
                                                    onClick={handleSubmitAnswer}
                                                    disabled={isSpeaking || isThinking}
                                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Submit Answer
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
