export function buildSystemPrompt(
    jobRole: string,
    experience: string,
    jobDesc: string
): string {
    return `You are an expert senior technical interviewer conducting a mock interview.
The candidate is applying for: ${jobRole}
Years of experience claimed: ${experience}
Job Description context: ${jobDesc}

YOUR RULES:
1. Ask exactly ONE question per turn.
2. Start with a warm-up, then increase difficulty.
3. If the answer is vague, ask ONE targeted follow-up.
4. Do NOT reveal answers. Probe deeper instead.
5. Cover: Core Concepts, System Design, Problem Solving, Past Experience, Cultural Fit.
6. Keep questions relevant to the job description.
7. Be professional, concise, and encouraging.
8. After 5 exchanges, respond ONLY with: [INTERVIEW_COMPLETE]`;
}

export function buildFeedbackPrompt(
    jobRole: string,
    experience: string,
    transcript: { question: string; userAnswer: string }[]
): string {
    const transcriptText = transcript
        .map(
            (t, i) =>
                `Q${i + 1}: ${t.question}\nCandidate Answer: ${t.userAnswer || "(No answer provided)"}`
        )
        .join("\n\n");

    return `You are an expert interview evaluator. Analyze the following mock interview transcript.

Job Role: ${jobRole}
Experience Level: ${experience} years

TRANSCRIPT:
${transcriptText}

Evaluate the candidate and respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <number 1-10>,
  "overallSummary": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "radarScores": {
    "technicalAccuracy": <number 0-100>,
    "communication": <number 0-100>,
    "problemSolving": <number 0-100>,
    "experienceDepth": <number 0-100>,
    "confidence": <number 0-100>
  },
  "questionFeedback": [
    {
      "question": "<the question>",
      "userAnswer": "<what they said>",
      "idealAnswer": "<what a strong answer looks like>",
      "rating": <number 1-10>,
      "feedback": "<specific feedback>"
    }
  ]
}`;
}
