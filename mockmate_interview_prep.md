# MockMate: Complete Project Deep-Dive & IDFC First Bank Interview Prep

---

## PART 1: FULL PROJECT UNDERSTANDING

---

### 1.1 What MockMate Does (One-Liner)

**MockMate is a full-stack AI-powered interview simulation platform** where users configure a target role, undergo a multi-turn voice/text interview with Google Gemini, and receive detailed analytics feedback with radar charts across 5 competency dimensions.

---

### 1.2 Tech Stack (Exact Versions from `package.json`)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.6 | App Router, SSR, API Routes |
| **UI** | React | 19.2.3 | Component-based UI |
| **Language** | TypeScript | ^5 | Type safety |
| **ORM** | Prisma | 6.19.2 | MongoDB data access |
| **Database** | MongoDB | — | Document persistence |
| **AI** | Google Gemini API | @google/generative-ai 0.24.1 | Question generation + feedback |
| **Auth** | Clerk | @clerk/nextjs 6.38.3 | Auth, user management |
| **Charts** | Recharts | 3.7.0 | Radar + RadialBar charts |
| **Voice (STT)** | Web Speech API | Browser-native | Speech-to-text |
| **Voice (TTS)** | SpeechSynthesis API | Browser-native | Text-to-speech |
| **Webcam** | react-webcam | 7.2.0 | Live video feed |
| **Animations** | Framer Motion | 12.34.3 | UI animations |
| **Styling** | Tailwind CSS v4 | ^4 | Utility-first CSS |
| **UI Components** | shadcn/ui + Radix UI | 1.4.3 | Accessible components |
| **Icons** | Lucide React | 0.575.0 | Icon library |

---

### 1.3 Database Schema (Prisma + MongoDB)

```
┌───────────────────────┐       ┌────────────────────────┐
│    MockInterview       │       │      UserAnswer         │
├───────────────────────┤       ├────────────────────────┤
│ id        (ObjectId)  │──┐    │ id        (ObjectId)    │
│ userId    (String)    │  │    │ mockInterviewId (ObjId) │
│ jobRole   (String)    │  └───▶│ question   (String)     │
│ jobDesc   (String)    │       │ userAnswer (String?)    │
│ jobExperience (String)│       │ aiFeedback (String?)    │
│ createdAt (DateTime)  │       │ aiRating   (Int?)       │
│ feedbackJson (String?)│       │ createdAt  (DateTime)   │
│ ended     (Boolean)   │       └────────────────────────┘
│ messages  (relation)  │
└───────────────────────┘
```

- **MockInterview**: One-per-session. Stores job context, links to all Q&A messages, and caches the final AI feedback JSON.
- **UserAnswer**: Each row = one question-answer exchange. Stores the AI's question, the user's answer, per-question AI feedback, and rating (1–10).
- **Relation**: `UserAnswer.mockInterviewId → MockInterview.id` (1-to-many)
- **MongoDB ObjectId**: Used as primary keys via `@map("_id") @db.ObjectId`

---

### 1.4 Complete Application Flow

```
User lands on / (Landing Page)
        │
        ▼
  Sign In/Up via Clerk (/sign-in, /sign-up)
        │
        ▼
  Dashboard (/dashboard)
   ├── View past interviews (cards with scores)
   └── Start New Interview → /dashboard/new
                │
                ▼
     Fill form: jobRole, jobDesc, jobExperience
                │
     POST /api/interview/create
                │
                ▼
     Interview Room (/interview/[id])
        │
        ├── 1. "Start Interview" → POST /api/generate-question
        │      └── Gemini generates Q1 → TTS speaks it → Mic auto-starts
        │
        ├── 2. User answers (voice or text) → Submit
        │      └── POST /api/generate-question with userAnswer
        │           └── Saves answer, Gemini generates next Q
        │           └── Repeats for 5 questions
        │
        ├── 3. After 5 exchanges, Gemini returns [INTERVIEW_COMPLETE]
        │      └── POST /api/interview/[id]/end → marks `ended: true`
        │
        └── Redirects to Feedback Page (/interview/[id]/feedback)
                │
                ▼
     POST /api/generate-feedback
        ├── Builds transcript from all UserAnswer records
        ├── Sends to Gemini with structured JSON prompt
        ├── Parses JSON response (with fallback parsing)
        ├── Updates each UserAnswer with per-question feedback & rating
        ├── Caches feedbackJson on MockInterview
        └── Returns structured feedback with:
              ├── overallScore (1-10)
              ├── overallSummary
              ├── strengths[] (3 items)
              ├── areasForImprovement[] (3 items)
              ├── radarScores (5 dimensions: 0-100 each)
              └── questionFeedback[] (per-question breakdown)
```

---

### 1.5 API Routes Summary

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/interview/create` | POST | Create new interview session | ✅ Clerk |
| `/api/interview/list` | GET | List user's interviews (dashboard) | ✅ Clerk |
| `/api/interview/[id]` | GET | Fetch interview with messages | ✅ Clerk |
| `/api/interview/[id]/end` | POST | Mark interview as ended | ✅ Clerk |
| `/api/generate-question` | POST | Generate next AI question | ✅ Clerk |
| `/api/generate-feedback` | POST | Generate comprehensive feedback | ✅ Clerk |

---

### 1.6 Key Architecture Decisions

1. **Prisma Singleton Pattern**: Global singleton prevents connection pool exhaustion during Next.js hot-reloading (`lib/prisma.ts`)
2. **Chat History Reconstruction**: Full message history is rebuilt from DB for every Gemini call to maintain multi-turn context
3. **System Prompt Injection**: System prompt is injected as the first message in chat history (user role) with a pre-seeded model acknowledgment
4. **Feedback Caching**: Once generated, `feedbackJson` is stored on `MockInterview` — subsequent visits skip regeneration
5. **Robust JSON Parsing**: Feedback API has 3-level fallback parsing: (1) regex for markdown code blocks, (2) `JSON.parse` direct, (3) substring extraction between first `{` and last `}`
6. **Prompt Injection Defense**: Job description is truncated to 5000 chars in the create API
7. **TTS Voice Selection**: Prefers "Google UK English Male", falls back to any local English voice
8. **Dual Speech Input**: Both `react-speech-recognition` wrapper AND native Web Speech API direct implementation (`useWebSpeechInput`) — the native one is actually used in production

---

### 1.7 Gemini API Integration Details

**Two distinct Gemini functions**:

1. **`generateNextQuestion()`** — Multi-turn chat mode
   - `temperature: 0.7` (creative for diverse questions)
   - `maxOutputTokens: 300` (concise questions)
   - Uses `model.startChat()` with full history
   - Sends user answer via `chat.sendMessage()`

2. **`generateFeedback()`** — Single-shot generation
   - `temperature: 0.3` (deterministic for structured JSON)
   - `maxOutputTokens: 8192` (large for comprehensive feedback)
   - Uses `responseMimeType: "application/json"` for structured output
   - Uses `model.generateContent()` (not chat)

---

### 1.8 The 5 Radar Dimensions

1. **Technical Accuracy** — Correctness of technical concepts
2. **Communication** — Clarity and structure of answers
3. **Problem Solving** — Analytical thinking approach
4. **Experience Depth** — Real-world project references
5. **Confidence** — Conviction and delivery

---

### 1.9 Component Architecture

```
app/
├── layout.tsx                    # Root: ClerkProvider, Inter font
├── page.tsx                      # Landing page
├── (auth)/
│   ├── sign-in/[[...sign-in]]/  # Clerk sign-in
│   └── sign-up/[[...sign-up]]/  # Clerk sign-up
├── (main)/
│   ├── layout.tsx               # Navbar + Footer wrapper
│   ├── dashboard/
│   │   ├── page.tsx             # Interview history + new card
│   │   └── new/page.tsx         # Create interview form
│   └── interview/
│       └── [interviewId]/
│           ├── page.tsx         # Live interview room
│           └── feedback/page.tsx # Results + analytics
└── api/
    ├── interview/
    │   ├── create/route.ts
    │   ├── list/route.ts
    │   └── [interviewId]/
    │       ├── route.ts         # GET interview details
    │       └── end/route.ts     # POST end interview
    ├── generate-question/route.ts
    └── generate-feedback/route.ts

components/
├── Navbar.tsx                   # Responsive nav with Clerk auth
├── Footer.tsx
├── interview/
│   ├── MicButton.tsx            # Animated mic with pulse ring
│   ├── QuestionDisplay.tsx      # AI question with progress dots
│   ├── SoundWaveAnimation.tsx   # Audio visualizer
│   └── WebcamView.tsx           # react-webcam with LIVE indicator
├── feedback/
│   ├── RadarChartComponent.tsx  # Recharts RadarChart (5 dims)
│   ├── ScoreCircle.tsx          # Recharts RadialBarChart
│   └── QuestionAccordion.tsx    # shadcn Accordion per-Q feedback
└── ui/ (shadcn components)

lib/
├── gemini.ts                    # Gemini API client
├── prisma.ts                    # Prisma singleton
├── prompts.ts                   # System + feedback prompt builders
├── tts.ts                       # SpeechSynthesis wrapper
└── utils.ts                     # cn() utility

hooks/
└── useSpeechInput.ts            # Both wrapper + native Web Speech API hooks
```

---

## PART 2: INTERVIEW QUESTIONS & ANSWERS FOR IDFC FIRST BANK

> All answers are grounded in the actual codebase examined above. Nothing is hallucinated.

---

### CATEGORY A: FULL-STACK ARCHITECTURE & NEXT.JS (Resume Bullet 1)

---

**Q1: Walk me through the architecture of MockMate. How did you design the system?**

**A:** MockMate follows a **full-stack monolithic architecture** using Next.js App Router. The frontend uses React 19 with client components for interactive pages (interview room, dashboard) and server components for layouts. The backend is implemented as **Next.js Route Handlers** (API routes) under `app/api/`, which serve as a RESTful API layer. Data persistence uses **Prisma ORM connected to MongoDB Atlas**. Authentication is handled by **Clerk** with middleware-level route protection. The AI layer integrates **Google Gemini API** with two distinct modes — multi-turn chat for question generation and single-shot for structured JSON feedback. Voice interaction uses browser-native **Web Speech API** for both STT and TTS, keeping the architecture zero-cost for voice features.

---

**Q2: Why did you choose Next.js over a separate React + Express backend?**

**A:** Several reasons:
1. **Colocation**: API routes and pages live in the same repo — faster development velocity.
2. **Edge middleware**: Clerk auth middleware runs at the edge before requests hit API routes, providing secure authentication without separate middleware setup.
3. **App Router**: Nested layouts (`(main)/layout.tsx` wraps dashboard/interview pages with Navbar/Footer), route groups (auth vs. main), and dynamic routes (`[interviewId]`) simplify routing.
4. **SSR/SSG flexibility**: Landing page can be server-rendered for SEO while interview room is fully client-side (`"use client"`).
5. **For a banking context**: This reduces infrastructure overhead — one deployment target instead of managing separate frontend and backend services, reducing attack surface.

---

**Q3: How does data flow when a user answers a question during an interview?**

**A:** When a user submits an answer:
1. The React component calls `handleSubmitAnswer()` which collects the answer from either voice transcript (`useWebSpeechInput` hook) or text input state.
2. A `POST /api/generate-question` request fires with `{interviewId, userAnswer}`.
3. The API route: (a) authenticates via `auth()` from Clerk, (b) fetches the interview with all messages from MongoDB via Prisma, (c) reconstructs the full chat history as Gemini-compatible message objects, (d) calls `generateNextQuestion()` which uses `model.startChat()` with the history and sends the user answer via `chat.sendMessage()`.
4. The API then **saves the user's answer** by updating the last `UserAnswer` record that had `userAnswer: null`, and **creates a new `UserAnswer` record** with the AI's next question.
5. The response returns `{question, isComplete, questionNumber}`.
6. The frontend speaks the question via `speakText()` using `SpeechSynthesisUtterance`, and when TTS completes (`onend` callback), it auto-starts the mic for the next answer.

---

**Q4: How did you handle authentication and authorization?**

**A:** I used **Clerk** for authentication. At the middleware level (`middleware.ts`), I define public routes (`/`, `/sign-in`, `/sign-up`, `/api/webhook`) using `createRouteMatcher`. For all other routes, `auth.protect()` is called — unauthenticated users are redirected. At the API level, every route handler calls `const { userId } = await auth()` and returns 401 if null. For **authorization**, I verify ownership: after fetching an interview from the DB, I check `interview.userId !== userId` and return 403 (Forbidden) if it doesn't match. This prevents user A from accessing user B's interview data — critical for a banking environment where data isolation is paramount.

---

**Q5: Explain the Prisma singleton pattern you used. Why is it needed?**

**A:** In `lib/prisma.ts`, I use:
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```
During development, Next.js hot-reloads modules frequently. Each reload would create a new `PrismaClient` instance, opening new MongoDB connection pools. This quickly exhausts the connection limit (MongoDB Atlas free tier allows ~500). By storing the client on `globalThis`, it survives hot-reloads. In production, modules are loaded once, so it's a single instance naturally. This pattern is **Prisma's official recommendation** for Next.js.

---

**Q6: How does the multi-turn conversation context work with Gemini?**

**A:** Every time the user answers, the API route:
1. Fetches **ALL** previous `UserAnswer` records for that interview, ordered by `createdAt: "asc"`.
2. Reconstructs chat history by mapping each record into `{role: "model", parts: [{text: question}]}` and `{role: "user", parts: [{text: userAnswer}]}` pairs.
3. Passes this as the `history` parameter to `model.startChat()`.
4. The system prompt is injected as the **first message pair**: a user message with the prompt, followed by a pre-seeded model acknowledgment: *"Understood. I am ready to conduct the mock interview..."*
5. The new user answer is sent via `chat.sendMessage(userAnswer)`.

This ensures Gemini has the **full conversation context** for every question — it can reference earlier answers, ask follow-ups, and adjust difficulty. The system prompt instructs: *"If the answer is vague, ask ONE targeted follow-up."*

---

**Q7: How did you structure the prompt engineering for the AI?**

**A:** I have two distinct prompts in `lib/prompts.ts`:

**System Prompt (`buildSystemPrompt`)**: Injects `jobRole`, `experience`, and `jobDesc` into a structured rule set:
- "Ask exactly ONE question per turn"
- "Start with warm-up, then increase difficulty"
- "If vague, ask ONE targeted follow-up"
- "Do NOT reveal answers"
- "Cover 5 areas: Core Concepts, System Design, Problem Solving, Past Experience, Cultural Fit"
- "After 5 exchanges, respond ONLY with [INTERVIEW_COMPLETE]"

**Feedback Prompt (`buildFeedbackPrompt`)**: Takes the full transcript and requests a specific JSON schema with `overallScore`, `radarScores` (5 dimensions, 0-100), `strengths`, `areasForImprovement`, and per-question `questionFeedback` with `idealAnswer`, `rating`, and `feedback`. The feedback generation uses `responseMimeType: "application/json"` and `temperature: 0.3` for deterministic structured output.

---

**Q8: If the Gemini API returns malformed JSON, how does your system handle it?**

**A:** The `generate-feedback` API route has a **3-level fallback parsing strategy**:
1. **Level 1**: Regex extraction from markdown code blocks — `rawFeedback.match(/```(?:json)?\s*([\s\S]*?)```/)` handles cases where Gemini wraps JSON in markdown.
2. **Level 2**: Direct `JSON.parse(rawFeedback.trim())` if no code blocks found.
3. **Level 3**: Substring extraction between the first `{` and last `}` — `rawFeedback.substring(jsonStart, jsonEnd + 1)`.

If all three fail, it returns a 500 error with `"Failed to parse AI feedback"`. Additionally, Gemini is configured with `responseMimeType: "application/json"` which instructs the model to output valid JSON directly, making Level 1 and 3 rarely needed but present as safety nets.

---

**Q9: How does the interview completion detection work?**

**A:** The system prompt tells Gemini: *"After 5 exchanges, respond ONLY with: [INTERVIEW_COMPLETE]"*. In the `generate-question` API route, after receiving the AI response:
```typescript
const isComplete = aiResponse.includes(INTERVIEW_COMPLETE_TOKEN);
const cleanedQuestion = aiResponse.replace(INTERVIEW_COMPLETE_TOKEN, "").trim();
```
If `isComplete` is true:
- No new `UserAnswer` record is created
- The frontend receives `{isComplete: true}`
- The React component redirects to `/interview/[id]/feedback`

The user can also manually end the interview early via the "End Interview" button, which calls `POST /api/interview/[id]/end` to set `ended: true`.

---

**Q10: Explain the route group pattern in your Next.js app.**

**A:** I use Next.js route groups (parenthesized folders):
- **`(auth)/`**: Contains `/sign-in` and `/sign-up`. These pages don't use the `Navbar/Footer` layout.
- **`(main)/`**: Contains `/dashboard` and `/interview/*`. Has its own `layout.tsx` that wraps children with `<Navbar />` and `<Footer />`.

The parentheses tell Next.js: *"This is a layout grouping, not a URL segment."* So `(main)/dashboard/page.tsx` maps to `/dashboard`, not `/(main)/dashboard`. This lets me apply different layouts to different page groups without affecting URLs — the auth pages get a clean, minimal UI while dashboard pages get full navigation.

---

### CATEGORY B: WEB SPEECH API (Resume Bullet 2)

---

**Q11: Why did you use the browser-native Web Speech API instead of cloud services like Google Cloud Speech-to-Text?**

**A:** Three key reasons:
1. **Zero per-user cost**: Cloud STT services charge per minute of audio (Google Cloud Speech: ~$0.006/15 seconds). With MockMate, each interview has ~5-10 minutes of speech. At scale, this adds up significantly. Web Speech API is completely free.
2. **No backend audio pipeline**: Cloud STT requires recording audio on the client, uploading it to a server, sending it to the cloud API, and returning the transcript. Web Speech API does everything client-side — the browser handles the entire recognition pipeline.
3. **Real-time streaming**: The Web Speech API provides `interimResults` — the user sees their words appearing in real-time as they speak, giving immediate visual feedback. Cloud solutions typically process in batches.

The trade-off is browser compatibility (mainly Chrome/Edge), but for a demo/practice tool, this is acceptable. I document this clearly as a browser requirement.

---

**Q12: Walk me through your Web Speech API implementation in detail.**

**A:** I implemented two approaches in `hooks/useSpeechInput.ts`:

**1. `useWebSpeechInput()` (native — actually used in production)**:
- On mount, checks `window.SpeechRecognition || window.webkitSpeechRecognition`
- Creates a `SpeechRecognition` instance with `continuous: true`, `interimResults: true`, `lang: "en-US"`
- `onresult` handler concatenates all result transcripts into state
- `onend` and `onerror` handlers reset the listening state
- Instance is stored in a `useRef` to persist across renders
- `startListening()` clears transcript and calls `recognition.start()`
- `stopListening()` calls `recognition.stop()`

**2. `useSpeechInput()` (wrapper — not used in production)**:
- Uses `react-speech-recognition` library with dynamic import to avoid SSR issues
- Loads the module lazily via `import("react-speech-recognition")` in a `useEffect`

The native implementation is preferred because it's more reliable and doesn't require a third-party library.

---

**Q13: How does the TTS (Text-to-Speech) implementation work?**

**A:** In `lib/tts.ts`:
1. **Voice Selection**: First tries to find "Google UK English Male" voice, then falls back to any local English voice (`v.lang.startsWith("en") && v.localService`).
2. **Utterance Configuration**: `rate: 0.95` (slightly slower for clarity), `pitch: 1.0`, `volume: 1.0`.
3. **Lifecycle**: Before speaking a new question, `window.speechSynthesis.cancel()` stops any ongoing speech. The `onend` callback notifies the interview page that the AI finished speaking.
4. **Integration Flow**: When a new question arrives → `speakText(question, () => { setIsSpeaking(false); startListening(); })`. The mic auto-starts only after TTS finishes, preventing the microphone from picking up the AI's own voice.

---

**Q14: How do you handle the case where a user's browser doesn't support speech recognition?**

**A:** In the interview room component:
```typescript
const { supported: speechSupported } = useWebSpeechInput();

useEffect(() => {
    if (!speechSupported) {
        setUseTextInput(true);
    }
}, [speechSupported]);
```
If `window.SpeechRecognition` and `window.webkitSpeechRecognition` are both undefined, `supported` is set to `false`, and the UI automatically switches to a text input mode with a `<Textarea>` component. The user can also manually toggle between voice and text input using the keyboard/mic icon in the top bar.

---

**Q15: What's the TypeScript challenge with Web Speech API, and how did you solve it?**

**A:** The Web Speech API isn't part of the standard TypeScript DOM lib typings. I created a `types/speech.d.ts` declaration file that defines interfaces for:
- `SpeechRecognition` (with `continuous`, `interimResults`, `lang`, `start()`, `stop()`, `abort()`)
- `SpeechRecognitionEvent` (with `results` and `resultIndex`)
- `SpeechRecognitionResultList`, `SpeechRecognitionResult`, `SpeechRecognitionAlternative`
- `SpeechRecognitionErrorEvent`
- Augmented `Window` interface with both `SpeechRecognition` and `webkitSpeechRecognition`

This provides full type safety without installing any additional packages.

---

### CATEGORY C: ANALYTICS DASHBOARD & RECHARTS (Resume Bullet 3)

---

**Q16: Describe the analytics dashboard and the 5 competency dimensions.**

**A:** The feedback page displays:
1. **ScoreCircle** — A Recharts `RadialBarChart` showing the overall score (1-10, displayed as percentage). Color-coded: green (≥80%), indigo (≥60%), amber (≥40%), red (<40%). Uses `cornerRadius: 10` for smooth bar ends and a 1500ms animation.

2. **RadarChartComponent** — A Recharts `RadarChart` with `PolarGrid`, `PolarAngleAxis`, and `PolarRadiusAxis` showing 5 dimensions:
   - Technical Accuracy (0-100)
   - Communication (0-100)
   - Problem Solving (0-100)
   - Experience Depth (0-100)
   - Confidence (0-100)
   
   Uses indigo color (`#4f46e5`), 20% fill opacity, and 1200ms animation.

3. **Strengths & Improvements** — Two card panels showing 3 strengths and 3 areas for improvement.

4. **QuestionAccordion** — An expandable accordion (shadcn/Radix) for each question showing:
   - The question with a color-coded rating badge (green ≥8, blue ≥6, amber ≥4, red <4)
   - User's answer
   - Ideal answer (from AI)
   - Specific feedback

---

**Q17: How is the feedback data persisted for session replay?**

**A:** Feedback persistence happens at two levels:
1. **Per-question level**: The `generate-feedback` API iterates over `feedbackJson.questionFeedback` and updates each `UserAnswer` record with `aiFeedback` (text feedback) and `aiRating` (1-10 score):
   ```typescript
   await prisma.userAnswer.update({
       where: { id: message.id },
       data: { aiFeedback: qFeedback.feedback, aiRating: qFeedback.rating }
   });
   ```
2. **Session level**: The complete feedback JSON (including `radarScores`, `strengths`, etc.) is stored as a stringified JSON in `MockInterview.feedbackJson`:
   ```typescript
   await prisma.mockInterview.update({
       where: { id: interviewId },
       data: { feedbackJson: JSON.stringify(feedbackJson) }
   });
   ```

On subsequent visits to the feedback page, the API checks `if (interview.feedbackJson)` and returns the cached feedback immediately — no redundant Gemini API call.

---

**Q18: How does longitudinal progress tracking work?**

**A:** The dashboard (`/dashboard`) fetches all interviews via `GET /api/interview/list`, which returns `{id, jobRole, jobExperience, createdAt, ended, feedbackJson}` ordered by `createdAt: desc`. For each interview card, the `getFeedbackScore()` function parses the cached `feedbackJson` to extract `overallScore` and displays it as a color-coded badge. Users can see their scores across multiple sessions — if they practiced 5 times for "Full Stack Developer", they can track improvement over time. The data is all persisted in MongoDB, so it's available indefinitely.

---

**Q19: Why did you choose Recharts over other charting libraries?**

**A:** Recharts was ideal because:
1. **React-native**: It's built on React components, not D3 imperative code — fits naturally into the React component model.
2. **Responsive**: `<ResponsiveContainer>` handles resizing automatically.
3. **RadarChart support**: Many libraries don't support radar charts well. Recharts has first-class `RadarChart` with `PolarGrid`, `PolarAngleAxis`, and `PolarRadiusAxis`.
4. **RadialBarChart**: Used for the circular score gauge — most libraries require custom SVG for this.
5. **Animation**: Built-in `animationBegin` and `animationDuration` props for smooth data reveals.
6. **Bundle size**: Recharts is tree-shakeable — I import only the components I need.

---

### CATEGORY D: DATABASE & DATA MODELING (Prisma + MongoDB)

---

**Q20: Why MongoDB instead of PostgreSQL for this project?**

**A:** MongoDB was chosen because:
1. **Document model fits the data**: Interview feedback is a complex nested JSON structure (scores, arrays of strengths, per-question feedback). Storing it as a single `feedbackJson` string in a document DB is natural. In Postgres, you'd need either a JSONB column (losing some type safety) or multiple normalized tables.
2. **Schema flexibility**: During development, the feedback schema evolved frequently. MongoDB + Prisma allowed schema changes without migrations.
3. **Prisma support**: Prisma provides a consistent API regardless of the underlying database, so switching to Postgres later would require minimal code changes.

For a **banking application context at IDFC First Bank**, I would strongly consider PostgreSQL for ACID compliance, but for a demo/practice tool, MongoDB's flexibility accelerated development.

---

**Q21: How do you prevent prompt injection through the job description field?**

**A:** In the interview creation API:
```typescript
jobDesc: jobDesc.trim().slice(0, 5000)
```
The job description is truncated to 5000 characters. This limits the attack surface for prompt injection — a malicious user can't send an extremely long input that might overwhelm the system prompt's instructions. Additionally, the system prompt is structured with explicit rules that Gemini follows, and it's injected as the first message in the chat history, establishing strong context.

For a production banking application, I would add:
- Input sanitization (strip special characters/control sequences)
- Content moderation before sending to LLM
- Rate limiting on API routes
- Output filtering to detect if AI deviated from expected behavior

---

**Q22: How does the data model support session replay?**

**A:** Every exchange in an interview is stored as an individual `UserAnswer` record with:
- `question` — The AI's question
- `userAnswer` — The user's response
- `aiFeedback` — Post-interview AI feedback for this specific Q&A
- `aiRating` — Numerical rating (1-10)
- `createdAt` — Timestamp for ordering

When a user revisits a completed interview's feedback page, the system fetches all messages via `prisma.mockInterview.findUnique({ include: { messages: { orderBy: { createdAt: "asc" } } } })`. The `QuestionAccordion` component renders each Q&A pair with the user's answer, ideal answer, and specific feedback — providing complete **session replay** without re-running the AI.

---

### CATEGORY E: SYSTEM DESIGN & SCALABILITY

---

**Q23: How would you scale MockMate for 10,000 concurrent users at IDFC First Bank?**

**A:** Several changes needed:

1. **Database**: Migrate from MongoDB Atlas shared tier to a dedicated cluster or PostgreSQL with connection pooling (PgBouncer). Add read replicas for the dashboard's list queries.
2. **AI API**: Implement queue-based processing (Bull/Redis) for Gemini calls to handle rate limits. Add response caching for common job roles/descriptions.
3. **Deployment**: Deploy on Vercel with serverless functions or containerized on ECS/EKS. Use CDN for static assets.
4. **Rate limiting**: Add per-user rate limiting on API routes (e.g., max 5 interviews per hour).
5. **Caching**: Redis cache for dashboard data, interview listings, and previously generated feedback.
6. **WebSocket**: Replace polling-based question generation with WebSocket for real-time AI response streaming.

---

**Q24: What are the security considerations for this application?**

**A:** Current measures:
- **Authentication**: Clerk handles password hashing, JWT, session management, MFA.
- **Authorization**: Every API route verifies `userId` ownership of the requested resource.
- **Middleware**: Edge middleware blocks unauthenticated access to protected routes.
- **Input validation**: Job description truncation (5000 chars), required field checks.

For banking-grade security (IDFC First Bank context):
- Add CSRF protection on form submissions
- Implement IP-based rate limiting
- Add audit logging for all data access
- Encrypt PII at rest in MongoDB (field-level encryption)
- Add Content Security Policy headers
- SOC 2 compliance for infrastructure
- Data residency compliance (India for IDFC)

---

**Q25: If this were deployed at IDFC First Bank for employee interview prep, what changes would you make?**

**A:** 
1. **SSO Integration**: Replace Clerk with IDFC's corporate SSO (SAML/OIDC) — Clerk supports SAML Enterprise SSO.
2. **Data Privacy**: Store all data in India-region MongoDB Atlas or a self-hosted instance for RBI data localization compliance.
3. **Role-Based Access**: Add admin roles for HR to view aggregate analytics across candidates.
4. **Custom Question Banks**: Pre-configured interview templates for specific IDFC roles (Relationship Manager, Credit Analyst, etc.).
5. **Reporting**: Export functionality for interview results, integration with HRMS systems.
6. **Audit Trail**: Log every API call, interview session, and data access for compliance.

---

### CATEGORY F: REACT & FRONTEND PATTERNS

---

**Q26: Explain the state management approach in the interview room page.**

**A:** The interview room uses **React's built-in state hooks** — no external state management library:
- `currentQuestion` — The current AI question being displayed
- `questionNumber` — Progress counter (1-5)
- `isSpeaking` — Whether TTS is active (disables mic)
- `isThinking` — Whether waiting for Gemini response (shows typing animation)
- `isComplete` — Whether interview is done
- `webcamEnabled` — Toggle for camera
- `useTextInput` — Toggle between voice/text input
- `textInput` — Text area content
- `transcript` — Voice recognition transcript (from custom hook)
- `listening` — Whether mic is active (from custom hook)

This is sufficient because state is localized to one page. For a larger app at IDFC with cross-page state (user preferences, global notifications), I'd consider Zustand or React Context.

---

**Q27: How does the voice-text toggle work?**

**A:** The top bar has a toggle button that switches between `<Mic>` and `<Keyboard>` icons:
```typescript
<Button onClick={() => setUseTextInput(!useTextInput)}>
    {useTextInput ? <Mic /> : <Keyboard />}
</Button>
```
When `useTextInput` is true, the input area renders a `<Textarea>` with a "Submit Answer" button. When false, it renders the `<MicButton>` component with voice transcript preview. The speech hook's `transcript` state persists across toggles since it's managed by `useWebSpeechInput()` in the parent.

If the browser doesn't support speech recognition, `useTextInput` is automatically set to `true` via a `useEffect`.

---

**Q28: How does the MicButton animation work?**

**A:** When `listening` is true, two pulsing rings animate using Tailwind's `animate-ping`:
```jsx
<span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
<span className="absolute -inset-2 rounded-full border-2 border-red-300 animate-ping opacity-50"
      style={{ animationDelay: "0.5s" }} />
```
The second ring is larger (`-inset-2`) with 50% opacity and a 0.5s delay, creating a layered pulsing effect. The button itself scales up (`scale-110`) and changes to red (`bg-red-500`) with a stop icon (`<Square>`) replacing the mic icon.

---

**Q29: How did you implement the progress indicator for questions?**

**A:** In `QuestionDisplay.tsx`, a row of dots shows progress:
```jsx
{Array.from({ length: totalQuestions }).map((_, i) => (
    <div key={i}
        className={`h-1.5 w-6 rounded-full transition-colors
            ${i < questionNumber ? "bg-indigo-600" : "bg-slate-200"}`}
    />
))}
```
Plus a text label: "Question {questionNumber} of {totalQuestions}". The top bar also shows a badge: "Question {questionNumber} / 5". This gives dual visual feedback — progress dots and explicit numbering.

---

### CATEGORY G: BEHAVIORAL & DECISION-MAKING

---

**Q30: What was the most challenging part of building MockMate?**

**A:** The **multi-turn conversation consistency** with Gemini was the hardest. Challenges included:
1. **Context window management**: Every question requires the full history. As conversations grow, token usage increases. I needed to keep questions concise (`maxOutputTokens: 300`).
2. **Completion detection**: Gemini doesn't always output `[INTERVIEW_COMPLETE]` exactly after 5 questions. I had to make the detection flexible with `includes()` rather than exact matching.
3. **JSON parsing reliability**: Gemini's structured output sometimes included extra text or markdown formatting. Building the 3-level fallback parser required iterative testing with various edge cases.
4. **Voice UX timing**: Coordinating TTS completion → mic activation → user speech → submission without overlaps required careful state management with the `onend` callback chain.

---

**Q31: If you had to rebuild this project, what would you do differently?**

**A:** 
1. **Streaming responses**: Use Gemini's streaming API to show questions word-by-word instead of waiting for the full response.
2. **WebSocket for real-time**: Replace the REST polling with WebSocket for lower latency.
3. **Server Actions**: Use Next.js Server Actions instead of API routes for simpler data mutations.
4. **Better error recovery**: Add retry logic with exponential backoff for Gemini API failures.
5. **Testing**: Add integration tests with Playwright for the interview flow and Jest tests for the API routes.
6. **Persistent voice recognition**: The Web Speech API stops after silence periods. I'd implement auto-restart logic.

---

**Q32: How would you test this application?**

**A:**
1. **Unit tests**: Jest for utility functions (`buildSystemPrompt`, `buildFeedbackPrompt`, JSON parsing logic).
2. **API tests**: Supertest or Next.js test utilities for each API route — mock Prisma and Gemini to test auth checks, input validation, error handling.
3. **Component tests**: React Testing Library for `RadarChartComponent`, `QuestionAccordion`, `MicButton` — verify rendering with different props.
4. **E2E tests**: Playwright for the full flow: sign in → create interview → answer 5 questions → verify feedback page.
5. **Mock the AI**: For E2E, mock the Gemini API to return deterministic responses and always complete after 5 questions.

---

### CATEGORY H: SPECIFIC TECHNICAL DEEP-DIVES

---

**Q33: Explain how `useCallback` is used in the interview room and why.**

**A:** `useCallback` is used for `generateQuestion` and `handleSubmitAnswer`:
```typescript
const generateQuestion = useCallback(async (userAnswer?: string) => {
    // ... API call logic
}, [interviewId, router, useTextInput, speechSupported, startListening]);
```
Without `useCallback`, this function would be recreated on every render, causing unnecessary re-renders of child components that receive it as a prop and breaking the `useEffect` dependency arrays. The dependency array includes values that, when changed, should recreate the function (e.g., if `useTextInput` changes, the function needs the new value to decide whether to auto-start the mic).

---

**Q34: What's the `flatMap` pattern used in chat history reconstruction?**

**A:** In the question generation API:
```typescript
const chatHistory = interview.messages.flatMap((msg) => {
    const parts = [];
    parts.push({ role: "model", parts: [{ text: msg.question }] });
    if (msg.userAnswer) {
        parts.push({ role: "user", parts: [{ text: msg.userAnswer }] });
    }
    return parts;
});
```
Each `UserAnswer` record contains both a question and an answer. `flatMap` is used instead of `map` because each input record produces **one or two** output objects (model question + optional user answer). Regular `map` would produce an array of arrays; `flatMap` flattens it into a single array of messages — exactly what Gemini's chat history expects.

---

**Q35: How is the feedback page's loading state managed?**

**A:** Two separate states:
- `loading` — Initial page load state (true by default)
- `generating` — Whether AI feedback generation is in progress

Both must be false to show the results. The `generateFeedback()` function is called in a `useEffect` on mount. If `feedbackJson` already exists in the DB (cached), the API returns it immediately without calling Gemini — the "loading" state is very short. If it's a first visit, Gemini generates feedback (several seconds), and a spinner with "Analyzing Your Performance..." is shown.

If an error occurs, an error state with a "Try Again" button is shown, calling `generateFeedback()` again.

---

**Q36: How does the Clerk middleware work with the Next.js matcher?**

**A:** The `middleware.ts` uses a complex regex matcher:
```typescript
matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
]
```
This tells Next.js: "Run the middleware on all routes EXCEPT static files (_next, images, fonts, etc.) and always on API routes." The `clerkMiddleware` then checks if the route is public (defined by `isPublicRoute`). If not, `auth.protect()` forces authentication. This is a **performance optimization** — static asset requests skip the auth check entirely.

---

### CATEGORY I: BANKING/IDFC-SPECIFIC QUESTIONS

---

**Q37: How would you handle PII (Personally Identifiable Information) in this application for a banking context?**

**A:** Currently, MockMate stores `userId` from Clerk (an opaque ID, not PII directly). But for IDFC:
1. **Encryption at rest**: Enable MongoDB field-level encryption for any PII fields.
2. **Data minimization**: Only store what's necessary — don't store full names, email, etc. in the interview DB. Let Clerk handle identity.
3. **Retention policy**: Auto-delete interview data after a configurable period.
4. **Access logging**: Log every database query with the requesting userId for audit.
5. **GDPR/Indian Data Protection**: Implement data export and deletion endpoints.

---

**Q38: How does this project demonstrate your ability to work with APIs — relevant for banking integrations?**

**A:** MockMate integrates **three external APIs/services**:
1. **Google Gemini API** — RESTful, handles auth via API key, structured request/response, error handling with fallbacks.
2. **Clerk API** — OAuth/JWT-based auth, webhook support, middleware integration.
3. **MongoDB Atlas** — Connection string auth, managed via Prisma ORM.

These patterns directly transfer to banking integrations: payment gateway APIs (Razorpay, NEFT/RTGS), KYC verification APIs, credit bureau APIs, and core banking system APIs. The skills — API key management, error handling, request validation, response parsing, retry logic — are the same.

---

**Q39: How do you handle concurrent requests in your API routes?**

**A:** Next.js API routes are **stateless and serverless** by default — each request gets its own execution context. Prisma's connection pooling handles concurrent DB connections. However, there's a potential **race condition** in the question generation flow: if a user rapidly clicks "Submit" twice, two requests could try to update the same `UserAnswer` record simultaneously.

To prevent this:
- The frontend disables the submit button while `isThinking` is true
- The `generateQuestion` function sets `isThinking(true)` immediately
- In a banking context, I would add optimistic locking or database-level constraints

---

**Q40: What's your understanding of the role of TypeScript in maintaining code quality for a banking application?**

**A:** In MockMate, TypeScript provides:
1. **Interface definitions**: `Feedback`, `Interview`, `QuestionFeedback`, `RadarScores` — every data shape is explicitly typed.
2. **Compile-time safety**: Prisma generates TypeScript types from the schema — you can't accidentally query a non-existent field.
3. **API contracts**: Request/response types ensure frontend and backend agree on data shapes.
4. **Custom type declarations**: `speech.d.ts` adds types for browser APIs that TypeScript doesn't know about.

For banking: TypeScript prevents entire classes of runtime errors — passing wrong types to financial calculations, missing required fields in API requests, accessing undefined properties. At IDFC, with hundreds of developers, TypeScript acts as living documentation and a safety net.

---

### CATEGORY J: MISCELLANEOUS TECHNICAL QUESTIONS

---

**Q41: What is `"use client"` and why is it on almost every component?**

**A:** In Next.js App Router, components are **server components by default** — they render on the server and send HTML to the client. `"use client"` marks a component as a **client component** — it's hydrated with JavaScript on the browser.

My components use `"use client"` because they need browser APIs (Web Speech, SpeechSynthesis, Webcam), React hooks (`useState`, `useEffect`), event handlers, and Clerk's client-side components (`UserButton`, `useUser`). Server components can't use any of these.

The `layout.tsx` files (root and main) are server components — they just render static structure.

---

**Q42: How does the webcam component handle permissions and errors?**

**A:** `WebcamView.tsx` uses `react-webcam` with an `onUserMediaError` callback:
```typescript
<Webcam
    audio={false}
    mirrored
    onUserMediaError={() => setHasError(true)}
    videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
/>
```
If the user denies camera permission or the camera is unavailable, `hasError` becomes true and the component renders a fallback UI with a `<CameraOff>` icon and "Camera off" message. The camera toggle button in the top bar allows users to enable/disable the webcam independently.

---

**Q43: Explain the radial bar chart implementation for the score display.**

**A:** `ScoreCircle.tsx` uses Recharts `RadialBarChart`:
- Converts score (1-10) to percentage: `Math.round((score / 10) * 100)`
- Color-codes: green (≥80%), indigo (≥60%), amber (≥40%), red (<40%)
- `startAngle: 90, endAngle: -270` creates a full-circle starting from the top
- `innerRadius: "75%", outerRadius: "100%"` creates a ring (not filled circle)
- `cornerRadius: 10` rounds the bar ends
- Background fill (`#f1f5f9`) shows the remaining unfilled portion
- Center text overlay shows percentage and "Overall Score" using absolute positioning

---

**Q44: What design patterns are used in this codebase?**

**A:**
1. **Singleton** — Prisma client (`lib/prisma.ts`)
2. **Builder** — Prompt construction (`buildSystemPrompt`, `buildFeedbackPrompt`)
3. **Strategy** — Dual input modes (voice vs. text) selected at runtime
4. **Observer** — Speech recognition events (`onresult`, `onend`, `onerror`)
5. **Facade** — `speakText()` simplifies the SpeechSynthesis API
6. **Repository** — API routes act as data access layer between UI and Prisma
7. **Compound Component** — shadcn Accordion with AccordionItem, AccordionTrigger, AccordionContent

---

**Q45: How is the application styled? What's the design system?**

**A:** 
- **Tailwind CSS v4** with PostCSS plugin
- **Color palette**: Indigo-purple gradient as primary, slate for neutrals
- **Components**: shadcn/ui (built on Radix UI primitives) for accessible, unstyled base components
- **Icons**: Lucide React for consistent iconography
- **Typography**: Google Fonts Inter via `next/font`
- **Layout**: Responsive grid (`grid sm:grid-cols-2 lg:grid-cols-3`)
- **Effects**: Glassmorphism (backdrop-blur), shadows (shadow-lg shadow-indigo-200), gradients, smooth transitions

---

### CATEGORY K: TRICKY/STRESS QUESTIONS

---

**Q46: The feedback API makes sequential database updates in a loop. Isn't that inefficient?**

**A:** Yes, you're right — the loop:
```typescript
for (let i = 0; i < feedbackJson.questionFeedback.length; i++) {
    await prisma.userAnswer.update({ where: { id: message.id }, data: { ... } });
}
```
This makes 5 sequential DB calls. For optimization:
1. **Use `prisma.$transaction()`**: Batch all 5 updates in a single transaction.
2. **Use `updateMany()` with a WHERE clause**: If the data structure allows.
3. **Use `Promise.all()`**: Run all 5 updates concurrently (though MongoDB handles concurrent writes well).

For a banking application with strict performance requirements, I'd definitely use transactions. For this demo with 5 questions, the latency is negligible (~50ms total).

---

**Q47: You mentioned "eliminating dependency on paid cloud voice services." Can you quantify the cost savings?**

**A:** Let's calculate:
- **Google Cloud Speech-to-Text**: $0.006 per 15 seconds = $0.024/minute
- **Average interview**: ~10 minutes of user speech = $0.24 per interview
- **1000 users, 3 interviews each**: $0.24 × 3000 = **$720/month**
- **Google Cloud TTS**: $4 per 1M characters. Average question ~200 chars × 5 = 1000 chars × 3000 interviews = 3M chars = **$12/month**
- **Total cloud voice cost**: ~**$732/month** for 3000 interviews

With Web Speech API: **$0/month**. The entire voice pipeline runs in the browser at no cost. The trade-off is browser compatibility (Chrome/Edge only for full support), which is acceptable for an internal tool.

---

**Q48: What's the latency profile of the interview flow? Where are the bottlenecks?**

**A:**
1. **User submits answer** → Network request to API route: ~50ms
2. **API reads from MongoDB** (interview + messages): ~30ms
3. **Gemini API call** (question generation): **1-3 seconds** ← main bottleneck
4. **MongoDB write** (save answer + new question): ~20ms
5. **Response to client** + React state update: ~10ms
6. **TTS speaks question**: Variable (5-15 seconds depending on question length)

**Total perceived latency**: 1-3 seconds between answer submission and hearing the next question. The Gemini API is the bottleneck. For improvement: Gemini streaming would let TTS start speaking the first words while the rest is still generating.

---

**Q49: How do you handle the edge case where the user refreshes the page mid-interview?**

**A:** The interview room has a `useEffect` that runs on mount:
```typescript
useEffect(() => {
    async function loadInterview() {
        const res = await fetch(`/api/interview/${interviewId}`);
        const data = await res.json();
        const messages = data.interview.messages;
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            setCurrentQuestion(lastMsg.question);
            setQuestionNumber(messages.length);
            setInterviewStarted(true);
        }
    }
    loadInterview();
}, [interviewId]);
```
Since all Q&A is persisted in MongoDB, refreshing simply reloads the last question. The interview resumes from where the user left off. If the last `UserAnswer` has no `userAnswer`, the user can answer the previously displayed question. This is possible because state is in the database, not just in React state.

---

**Q50: Why does the feedback generation use `temperature: 0.3` while question generation uses `temperature: 0.7`?**

**A:** 
- **Question generation (0.7)**: Higher temperature introduces more creativity and variety. Each interview should feel different — you don't want the AI asking the same 5 questions every time. The randomness ensures diverse questions across different sessions.
- **Feedback generation (0.3)**: Lower temperature produces more deterministic, consistent output. Feedback should be factual and reliable — if a user gave a weak answer, the AI should consistently rate it low. High temperature might produce inconsistent ratings. Additionally, structured JSON output requires precision — high temperature increases the risk of malformed JSON.

This is a deliberate design choice: **creative for generation, deterministic for evaluation**.

---

### CATEGORY L: HR / SOFT SKILL QUESTIONS ABOUT THE PROJECT

---

**Q51: What did you learn from building this project?**

**A:** Key learnings:
1. **LLM prompt engineering matters enormously** — Small changes in the system prompt dramatically affect question quality and conversation coherence.
2. **Browser APIs are more powerful than expected** — Web Speech API provides production-quality STT/TTS without any cloud dependency.
3. **Caching AI responses is critical** — Without caching `feedbackJson`, every feedback page visit would cost ~5 seconds and Gemini API tokens.
4. **TypeScript + Prisma is a powerful combination** — Prisma generates types from the schema, giving end-to-end type safety from DB to UI.
5. **Progressive enhancement** — Building voice-first with text fallback taught me to design for graceful degradation.

---

**Q52: How does this project demonstrate skills relevant to IDFC First Bank's tech stack?**

**A:**
| MockMate Skill | IDFC Relevance |
|---------------|----------------|
| Next.js API routes | RESTful service development for banking APIs |
| Prisma + MongoDB | ORM patterns transferable to PostgreSQL/Oracle (IDFC's likely DB) |
| Clerk auth middleware | Enterprise SSO/OAuth integration |
| TypeScript strict typing | Financial calculation safety, API contract enforcement |
| Real-time voice processing | Customer-facing IVR/voice banking features |
| AI integration | Chatbot/virtual assistant for customer service |
| Analytics dashboard | Management reporting, compliance dashboards |
| Error handling + fallbacks | Critical for banking — every transaction must be handled |

---

**Q53: If an interviewer asks "Why should we hire you for the Full Stack Developer role at IDFC First Bank?" — how does MockMate support your answer?**

**A:** MockMate demonstrates:
1. **End-to-end ownership**: I built frontend (React, Recharts, Web Speech), backend (Next.js API routes, Prisma), database design (MongoDB schema), AI integration (Gemini prompts), and auth (Clerk) — all in a single project.
2. **Production thinking**: Caching, error handling, fallback parsing, auth middleware, input validation — not just getting it to work, but making it robust.
3. **Cost-conscious engineering**: Using browser-native APIs instead of paid services shows I think about operational cost — critical for banking where margins matter.
4. **Modern tech stack**: Next.js App Router, TypeScript, React 19, Prisma — I'm current with industry standards.
5. **AI integration experience**: Understanding LLM APIs, prompt engineering, structured output parsing — skills increasingly needed as banks adopt AI.
