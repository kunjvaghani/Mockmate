export function speakText(
    text: string,
    onEnd?: () => void
): SpeechSynthesisUtterance | null {
    if (typeof window === "undefined" || !window.speechSynthesis) {
        onEnd?.();
        return null;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
        (v) => v.name.includes("Google UK English Male")
    );
    const fallbackVoice = voices.find(
        (v) => v.lang.startsWith("en") && v.localService
    );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    } else if (fallbackVoice) {
        utterance.voice = fallbackVoice;
    }

    if (onEnd) {
        utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
}

export function stopSpeaking(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}
