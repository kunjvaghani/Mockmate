"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Dynamic import to avoid SSR issues
let SpeechRecognitionModule: typeof import("react-speech-recognition") | null = null;

export function useSpeechInput() {
    const [transcript, setTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(true);
    const recognitionRef = useRef<ReturnType<typeof import("react-speech-recognition")["default"]["getRecognition"]> | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        import("react-speech-recognition").then((mod) => {
            SpeechRecognitionModule = mod;
            setSupported(mod.default.browserSupportsSpeechRecognition());
            setLoaded(true);
        });
    }, []);

    const startListening = useCallback(async () => {
        if (!SpeechRecognitionModule) return;
        setTranscript("");
        try {
            await SpeechRecognitionModule.default.startListening({
                continuous: true,
                language: "en-US",
            });
            setListening(true);
        } catch (e) {
            console.error("Failed to start listening:", e);
        }
    }, []);

    const stopListening = useCallback(async () => {
        if (!SpeechRecognitionModule) return;
        try {
            await SpeechRecognitionModule.default.stopListening();
            setListening(false);
        } catch (e) {
            console.error("Failed to stop listening:", e);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        if (!SpeechRecognitionModule) return;
        SpeechRecognitionModule.default.abortListening();
        setTranscript("");
        setListening(false);
    }, []);

    // Poll transcript from the module
    useEffect(() => {
        if (!loaded || !SpeechRecognitionModule) return;
        const interval = setInterval(() => {
            const recognition = SpeechRecognitionModule?.default;
            if (recognition) {
                // We'll use a workaround - get the transcript via the component approach
            }
        }, 100);
        return () => clearInterval(interval);
    }, [loaded]);

    return {
        transcript,
        setTranscript,
        listening,
        startListening,
        stopListening,
        resetTranscript,
        supported,
        loaded,
    };
}

// Simple hook using the Web Speech API directly (more reliable for our use case)
export function useWebSpeechInput() {
    const [transcript, setTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setSupported(true);
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "en-US";

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    let finalTranscript = "";
                    for (let i = 0; i < event.results.length; i++) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(finalTranscript);
                };

                recognition.onend = () => {
                    setListening(false);
                };

                recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    console.error("Speech recognition error:", event.error);
                    setListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !listening) {
            setTranscript("");
            try {
                recognitionRef.current.start();
                setListening(true);
            } catch (e) {
                console.error("Failed to start recognition:", e);
            }
        }
    }, [listening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && listening) {
            recognitionRef.current.stop();
            setListening(false);
        }
    }, [listening]);

    const resetTranscript = useCallback(() => {
        setTranscript("");
        if (recognitionRef.current && listening) {
            recognitionRef.current.stop();
            setListening(false);
        }
    }, [listening]);

    return {
        transcript,
        setTranscript,
        listening,
        startListening,
        stopListening,
        resetTranscript,
        supported,
    };
}
