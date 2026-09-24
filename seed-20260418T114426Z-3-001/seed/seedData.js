// ============================================================
// Neuro Sync AI — MongoDB Seed Script
// Run: node seedData.js
// ============================================================

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Neuro Sync AI';

// ─── Helpers ────────────────────────────────────────────────
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── User IDs ────────────────────────────────────────────────
const USER_IDS = {
  lovi: new ObjectId(),
  priya: new ObjectId(),
  arjun: new ObjectId(),
  meera: new ObjectId(),
  rahul: new ObjectId(),
  anjali: new ObjectId(),
  dev: new ObjectId(),
  sara: new ObjectId(),
};

// ============================================================
// 1. USERS
// ============================================================
const buildUsers = async () => {
  const hash = await bcrypt.hash('Test@1234', 12);
  return [
    {
      _id: USER_IDS.lovi,
      name: 'Lovi Sharma',
      email: 'lovi@example.com',
      password: hash,
      dob: new Date('2002-06-15'),
      gender: 'male',
      language: 'en',
      state: 'Rajasthan',
      city: 'Jaipur',
      role: 'patient',
      profileComplete: true,
      consentGiven: true,
      consentDate: daysAgo(90),
      createdAt: daysAgo(90),
      lastLogin: daysAgo(0),
      streak: 12,
      totalSessions: 18,
      notificationsEnabled: true,
    },
    {
      _id: USER_IDS.priya,
      name: 'Priya Verma',
      email: 'priya@example.com',
      password: hash,
      dob: new Date('1998-03-22'),
      gender: 'female',
      language: 'hi',
      state: 'Maharashtra',
      city: 'Pune',
      role: 'patient',
      profileComplete: true,
      consentGiven: true,
      consentDate: daysAgo(60),
      createdAt: daysAgo(60),
      lastLogin: daysAgo(1),
      streak: 5,
      totalSessions: 10,
      notificationsEnabled: true,
    },
    {
      _id: USER_IDS.arjun,
      name: 'Arjun Mehta',
      email: 'arjun@example.com',
      password: hash,
      dob: new Date('1995-11-10'),
      gender: 'male',
      language: 'en',
      state: 'Karnataka',
      city: 'Bengaluru',
      role: 'patient',
      profileComplete: true,
      consentGiven: true,
      consentDate: daysAgo(120),
      createdAt: daysAgo(120),
      lastLogin: daysAgo(2),
      streak: 0,
      totalSessions: 24,
      notificationsEnabled: false,
    },
    {
      _id: USER_IDS.meera,
      name: 'Meera Nair',
      email: 'meera@example.com',
      password: hash,
      dob: new Date('2000-07-04'),
      gender: 'female',
      language: 'ta',
      state: 'Tamil Nadu',
      city: 'Chennai',
      role: 'patient',
      profileComplete: true,
      consentGiven: true,
      consentDate: daysAgo(45),
      createdAt: daysAgo(45),
      lastLogin: daysAgo(0),
      streak: 8,
      totalSessions: 9,
      notificationsEnabled: true,
    },
    {
      _id: USER_IDS.rahul,
      name: 'Rahul Gupta',
      email: 'rahul@example.com',
      password: hash,
      dob: new Date('1993-01-30'),
      gender: 'male',
      language: 'en',
      state: 'Delhi',
      city: 'New Delhi',
      role: 'patient',
      profileComplete: false,
      consentGiven: true,
      consentDate: daysAgo(30),
      createdAt: daysAgo(30),
      lastLogin: daysAgo(5),
      streak: 0,
      totalSessions: 4,
      notificationsEnabled: true,
    },
    {
      _id: USER_IDS.anjali,
      name: 'Anjali Singh',
      email: 'anjali@example.com',
      password: hash,
      dob: new Date('2001-09-17'),
      gender: 'female',
      language: 'hi',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      role: 'patient',
      profileComplete: true,
      consentGiven: true,
      consentDate: daysAgo(75),
      createdAt: daysAgo(75),
      lastLogin: daysAgo(3),
      streak: 3,
      totalSessions: 14,
      notificationsEnabled: true,
    },
    {
      _id: USER_IDS.dev,
      name: 'Dev Patel',
      email: 'dev@example.com',
      password: hash,
      dob: new Date('1997-05-08'),
      gender: 'male',
      language: 'en',
      state: 'Gujarat',
      city: 'Ahmedabad',
      role: 'patient',
      profileComplete: true,
      consentGiven: true,
      consentDate: daysAgo(100),
      createdAt: daysAgo(100),
      lastLogin: daysAgo(1),
      streak: 20,
      totalSessions: 30,
      notificationsEnabled: true,
    },
    {
      _id: USER_IDS.sara,
      name: 'Sara Khan',
      email: 'sara@example.com',
      password: hash,
      dob: new Date('1999-12-25'),
      gender: 'female',
      language: 'ar',
      state: 'West Bengal',
      city: 'Kolkata',
      role: 'patient',
      profileComplete: true,
      consentGiven: true,
      consentDate: daysAgo(50),
      createdAt: daysAgo(50),
      lastLogin: daysAgo(0),
      streak: 6,
      totalSessions: 11,
      notificationsEnabled: false,
    },
  ];
};

// ============================================================
// 2. SCREENING SESSIONS — PHQ-9 & GAD-7
// Generates a realistic declining/improving trend for Lovi
// and varied data for other users
// ============================================================

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things',
  'Moving or speaking so slowly that other people could have noticed',
  'Thoughts that you would be better off dead or of hurting yourself',
];

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen',
];

const phqSeverity = (score) => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
};

const gadSeverity = (score) => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
};

const phqRecommendation = (score) => {
  if (score <= 4) return 'No action needed. Continue self-care practices.';
  if (score <= 9) return 'Watchful waiting. Consider self-help resources and WHO wellness guides.';
  if (score <= 14) return 'Consult a general practitioner or counselor. Consider structured therapy.';
  if (score <= 19) return 'Active treatment recommended. Please contact iCall (9152987821) or a licensed therapist.';
  return 'Immediate professional consultation strongly advised. Crisis helpline: Vandrevala Foundation 1860-2662-345.';
};

// Lovi's PHQ-9 journey: starts moderate-severe, improves over 6 months
const loviPHQScores = [22, 20, 18, 16, 13, 11, 9, 8, 7, 6, 7, 5, 6, 5, 4, 5, 4, 3];
const loviGADScores = [18, 17, 15, 14, 12, 11, 10, 9, 8, 8, 7, 6, 6, 5, 5, 4, 4, 3];

const buildScreeningSessions = () => {
  const sessions = [];

  // ── Lovi: 18 PHQ-9 + 18 GAD-7 sessions (recovery arc) ──
  loviPHQScores.forEach((totalScore, i) => {
    const questionScores = distributeScore(totalScore, 9);
    sessions.push({
      _id: new ObjectId(),
      userId: USER_IDS.lovi,
      type: 'PHQ9',
      responses: PHQ9_QUESTIONS.map((q, qi) => ({
        questionId: `phq_${qi + 1}`,
        questionText: q,
        score: questionScores[qi],
      })),
      totalScore,
      severity: phqSeverity(totalScore),
      recommendation: phqRecommendation(totalScore),
      completedAt: daysAgo(90 - i * 5),
      language: 'en',
      aiAnalysis: generateAIAnalysis('PHQ9', totalScore),
    });
  });

  loviGADScores.forEach((totalScore, i) => {
    const questionScores = distributeScore(totalScore, 7);
    sessions.push({
      _id: new ObjectId(),
      userId: USER_IDS.lovi,
      type: 'GAD7',
      responses: GAD7_QUESTIONS.map((q, qi) => ({
        questionId: `gad_${qi + 1}`,
        questionText: q,
        score: questionScores[qi],
      })),
      totalScore,
      severity: gadSeverity(totalScore),
      recommendation: phqRecommendation(totalScore),
      completedAt: daysAgo(88 - i * 5),
      language: 'en',
      aiAnalysis: generateAIAnalysis('GAD7', totalScore),
    });
  });

  // ── Other users ──
  const otherUsers = [
    { id: USER_IDS.priya, phqTrend: [14, 12, 10, 9, 8, 7, 6, 5, 4, 5], gadTrend: [12, 10, 9, 8, 7, 6, 5, 4, 5, 4] },
    { id: USER_IDS.arjun, phqTrend: [8, 7, 9, 8, 7, 6, 8, 7, 6, 5], gadTrend: [7, 6, 8, 7, 6, 5, 7, 5, 4, 4] },
    { id: USER_IDS.meera, phqTrend: [19, 17, 15, 12, 10, 8, 6, 5], gadTrend: [16, 14, 12, 10, 8, 6, 5, 4] },
    { id: USER_IDS.rahul, phqTrend: [11, 10, 9, 8], gadTrend: [9, 8, 7, 6] },
    { id: USER_IDS.anjali, phqTrend: [16, 14, 12, 10, 8, 6, 5, 4, 4, 3, 3, 3, 4, 3], gadTrend: [13, 12, 10, 8, 7, 5, 4, 3, 3, 3, 4, 3, 3, 3] },
    { id: USER_IDS.dev, phqTrend: [6, 5, 6, 5, 4, 5, 4, 4, 3, 3, 4, 3, 3, 2, 3, 2, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1], gadTrend: [5, 5, 4, 4, 3, 4, 3, 3, 2, 2, 3, 2, 2, 1, 2, 1, 1, 1, 1, 1] },
    { id: USER_IDS.sara, phqTrend: [13, 11, 10, 9, 8, 7, 6, 5, 5, 4, 4], gadTrend: [11, 9, 8, 7, 6, 5, 4, 4, 3, 3, 4] },
  ];

  otherUsers.forEach(({ id, phqTrend, gadTrend }) => {
    phqTrend.forEach((totalScore, i) => {
      sessions.push({
        _id: new ObjectId(),
        userId: id,
        type: 'PHQ9',
        responses: PHQ9_QUESTIONS.map((q, qi) => ({
          questionId: `phq_${qi + 1}`,
          questionText: q,
          score: distributeScore(totalScore, 9)[qi],
        })),
        totalScore,
        severity: phqSeverity(totalScore),
        recommendation: phqRecommendation(totalScore),
        completedAt: daysAgo(phqTrend.length * 7 - i * 7),
        language: 'en',
        aiAnalysis: generateAIAnalysis('PHQ9', totalScore),
      });
    });

    gadTrend.forEach((totalScore, i) => {
      sessions.push({
        _id: new ObjectId(),
        userId: id,
        type: 'GAD7',
        responses: GAD7_QUESTIONS.map((q, qi) => ({
          questionId: `gad_${qi + 1}`,
          questionText: q,
          score: distributeScore(totalScore, 7)[qi],
        })),
        totalScore,
        severity: gadSeverity(totalScore),
        recommendation: phqRecommendation(totalScore),
        completedAt: daysAgo(gadTrend.length * 7 - i * 7 + 2),
        language: 'en',
        aiAnalysis: generateAIAnalysis('GAD7', totalScore),
      });
    });
  });

  return sessions;
};

// Distribute a total score across N questions (0–3 each)
function distributeScore(total, count) {
  const scores = new Array(count).fill(0);
  let remaining = Math.min(total, count * 3);
  for (let i = 0; i < count && remaining > 0; i++) {
    const val = Math.min(3, remaining, randomBetween(0, 3));
    scores[i] = val;
    remaining -= val;
  }
  // distribute leftover
  let idx = 0;
  while (remaining > 0) {
    if (scores[idx] < 3) { scores[idx]++; remaining--; }
    idx = (idx + 1) % count;
  }
  return scores;
}

function generateAIAnalysis(type, score) {
  const analyses = {
    PHQ9: {
      low: 'Responses indicate minimal depressive symptoms. Protective factors such as stable sleep and engagement in daily activities are evident. Continue current wellness routines.',
      mild: 'Mild depressive indicators observed — particularly around fatigue and concentration. Psychoeducation and behavioural activation exercises are recommended.',
      moderate: 'Moderate depression markers detected. Patterns suggest anhedonia and persistent low mood. Structured therapy (CBT) and professional consultation are advised.',
      high: 'Significant depressive symptom burden identified. Risk indicators include hopelessness and functional impairment. Immediate professional evaluation is strongly recommended.',
    },
    GAD7: {
      low: 'Minimal anxiety indicators. Responses suggest adequate coping mechanisms and low generalised worry burden.',
      mild: 'Mild anxiety patterns observed — restlessness and intermittent worry noted. Mindfulness-based practices and breathing techniques are suggested.',
      moderate: 'Moderate anxiety with worry generalisation detected. Daily functioning appears impacted. Cognitive restructuring exercises and professional consultation recommended.',
      high: 'Elevated anxiety with multiple somatic and cognitive indicators. Immediate professional support through iCall or a licensed therapist is strongly advised.',
    },
  };

  const level = score <= 4 ? 'low' : score <= 9 ? 'mild' : score <= 14 ? 'moderate' : 'high';
  return analyses[type][level];
}

// ============================================================
// 3. GAME SESSIONS
// ============================================================
const buildGameSessions = () => {
  const games = ['decision_room', 'social_compass', 'mirror_journal'];
  const sessions = [];

  const gameData = [
    { userId: USER_IDS.lovi, count: 12 },
    { userId: USER_IDS.priya, count: 6 },
    { userId: USER_IDS.arjun, count: 9 },
    { userId: USER_IDS.meera, count: 5 },
    { userId: USER_IDS.dev, count: 15 },
    { userId: USER_IDS.anjali, count: 8 },
    { userId: USER_IDS.sara, count: 7 },
  ];

  gameData.forEach(({ userId, count }) => {
    for (let i = 0; i < count; i++) {
      const game = pick(games);
      const risk = pick(['low', 'low', 'moderate', 'moderate', 'high']);
      sessions.push({
        _id: new ObjectId(),
        userId,
        gameType: game,
        userInput: generateGameInput(game),
        riskIndicators: generateRiskIndicators(risk),
        severity: risk,
        aiNotes: generateGameNote(risk),
        completedAt: daysAgo(randomBetween(0, 90)),
        durationSeconds: randomBetween(120, 480),
        emotionalDimensions: {
          hopelessness: randomBetween(risk === 'high' ? 5 : 0, risk === 'high' ? 9 : 4),
          anxiety: randomBetween(risk === 'high' ? 4 : 0, risk === 'high' ? 9 : 5),
          socialWithdrawal: randomBetween(risk === 'high' ? 3 : 0, risk === 'high' ? 8 : 4),
          catastrophizing: randomBetween(risk === 'high' ? 4 : 0, risk === 'high' ? 9 : 3),
          selfEsteem: randomBetween(risk === 'low' ? 6 : 1, 10),
        },
      });
    }
  });

  return sessions;
};

function generateGameInput(game) {
  const inputs = {
    decision_room: ['I would avoid the meeting and send an email instead.', 'I always mess up in these situations.', 'I tried to stay calm and present my ideas.'],
    social_compass: ['I left the party early, I felt overwhelmed.', 'I enjoyed talking to a few people.', 'I sat in the corner and didn\'t speak much.'],
    mirror_journal: ['Today was exhausting. I couldn\'t focus on anything.', 'I managed to complete my tasks but felt empty.', 'I had a decent day, went for a walk.'],
  };
  return pick(inputs[game] || inputs.mirror_journal);
}

function generateRiskIndicators(risk) {
  const all = ['avoidance', 'catastrophizing', 'hopelessness', 'isolation', 'negative self-talk', 'rumination', 'sleep issues', 'fatigue'];
  const count = risk === 'high' ? 4 : risk === 'moderate' ? 2 : 1;
  return all.sort(() => 0.5 - Math.random()).slice(0, count);
}

function generateGameNote(risk) {
  const notes = {
    low: 'User responses reflect balanced coping strategies. No significant risk indicators detected.',
    moderate: 'Some avoidance and mild negative cognitions observed. Self-monitoring exercises recommended.',
    high: 'Multiple risk indicators present including hopelessness and social withdrawal. Professional consultation advised.',
  };
  return notes[risk];
}

// ============================================================
// 4. CHAT SESSIONS
// ============================================================
const buildChatSessions = () => {
  const sessions = [];

  const chatUsers = [USER_IDS.lovi, USER_IDS.priya, USER_IDS.arjun, USER_IDS.meera, USER_IDS.dev, USER_IDS.anjali, USER_IDS.sara];

  const sampleConversations = [
    [
      { role: 'user', content: 'I have been feeling really low lately and cannot find motivation to do anything.' },
      { role: 'assistant', content: 'I hear you, and I\'m glad you reached out. Feeling low and unmotivated can be really draining. Can you tell me a bit more — has this been going on for a few days or longer?' },
      { role: 'user', content: 'It has been about 3 weeks now. I just feel empty.' },
      { role: 'assistant', content: 'Three weeks of feeling empty is significant, and it\'s important to acknowledge that. You\'re not alone — many people experience this. Based on what you\'re sharing, it might be helpful to do a quick PHQ-9 screening. Would you like to try that?' },
      { role: 'user', content: 'Yes, I think that would help.' },
      { role: 'assistant', content: 'Great. I\'ll guide you through it. Remember, there are no right or wrong answers — just be honest with yourself. Let\'s begin when you\'re ready.' },
    ],
    [
      { role: 'user', content: 'I keep worrying about everything even small things.' },
      { role: 'assistant', content: 'Constant worry, even about small things, can be exhausting. That kind of pattern is something we can explore together. How long has this been happening?' },
      { role: 'user', content: 'Months maybe. My mind never stops.' },
      { role: 'assistant', content: 'A mind that never stops — that sounds genuinely tiring. What helps even a little, if anything?' },
      { role: 'user', content: 'Music sometimes. And talking to you helps too.' },
      { role: 'assistant', content: 'I\'m glad talking helps. Music is actually a well-documented mood regulator. I\'d also gently suggest a GAD-7 screening to understand your anxiety patterns better. Want to give it a try?' },
    ],
    [
      { role: 'user', content: 'I am okay today actually. Just checking in.' },
      { role: 'assistant', content: 'That\'s wonderful to hear! Checking in even on good days is a great habit. How did you sleep last night?' },
      { role: 'user', content: 'Pretty well, 7 hours.' },
      { role: 'assistant', content: 'Seven hours is solid. Good sleep is one of the strongest foundations for mental wellbeing. Anything specific that made today feel okay?' },
      { role: 'user', content: 'I went for a walk in the morning.' },
      { role: 'assistant', content: 'A morning walk — that\'s a powerful micro-habit. WHO guidelines highlight physical activity as one of the top protective factors for mental health. Keep it up!' },
    ],
  ];

  chatUsers.forEach((userId, i) => {
    const numSessions = randomBetween(2, 5);
    for (let s = 0; s < numSessions; s++) {
      const conv = pick(sampleConversations);
      const riskLevel = pick(['none', 'none', 'low', 'moderate', 'high']);
      sessions.push({
        _id: new ObjectId(),
        userId,
        messages: conv.map((m, mi) => ({
          ...m,
          timestamp: new Date(Date.now() - (conv.length - mi) * 60000 - randomBetween(0, 86400000 * 30)),
        })),
        sessionStart: daysAgo(randomBetween(0, 80)),
        lastActive: daysAgo(randomBetween(0, 5)),
        riskLevel,
        crisisTriggered: riskLevel === 'high' && Math.random() > 0.7,
        language: 'en',
        messageCount: conv.length,
      });
    }
  });

  return sessions;
};

// ============================================================
// 5. VOICE NOTES
// ============================================================
const buildVoiceNotes = () => {
  const tones = ['hopeful', 'distressed', 'flat', 'agitated', 'calm', 'tearful', 'neutral'];
  const notes = [];

  const voiceUsers = [
    { userId: USER_IDS.lovi, count: 8 },
    { userId: USER_IDS.priya, count: 4 },
    { userId: USER_IDS.meera, count: 6 },
    { userId: USER_IDS.dev, count: 10 },
    { userId: USER_IDS.anjali, count: 5 },
    { userId: USER_IDS.sara, count: 4 },
  ];

  voiceUsers.forEach(({ userId, count }) => {
    for (let i = 0; i < count; i++) {
      const tone = pick(tones);
      notes.push({
        _id: new ObjectId(),
        userId,
        gridfsFileId: new ObjectId(), // placeholder
        transcript: generateTranscript(tone),
        emotionalTone: tone,
        riskFlags: tone === 'distressed' || tone === 'tearful'
          ? ['low mood', 'fatigue']
          : tone === 'agitated'
            ? ['irritability', 'restlessness']
            : [],
        aiNotes: generateVoiceAINote(tone),
        recordedAt: daysAgo(randomBetween(0, 70)),
        durationSeconds: randomBetween(30, 180),
        confidenceScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
      });
    }
  });

  return notes;
};

function generateTranscript(tone) {
  const transcripts = {
    hopeful: "I'm starting to feel a bit better. I went outside today and it genuinely helped. I think I'm making progress.",
    distressed: "I don't know how much more I can take. Everything feels too heavy. I didn't sleep again last night and I just feel so tired of feeling this way.",
    flat: "Today was like any other day. I did what I needed to do. Nothing really happened. I don't know what else to say.",
    agitated: "I'm so frustrated. Everything is annoying me today. I couldn't concentrate at all and I snapped at my friend for no reason.",
    calm: "I meditated for the first time this week. It wasn't perfect but I felt quieter afterwards. I want to keep trying.",
    tearful: "I started crying in the middle of the day and I don't even know why. I just felt this wave come over me. I'm okay now I think.",
    neutral: "I woke up, had breakfast, went to work. Came home. Had dinner. Watched something. Now I'm recording this. That's about it.",
  };
  return transcripts[tone] || transcripts.neutral;
}

function generateVoiceAINote(tone) {
  const notes = {
    hopeful: 'Positive affect and forward-looking language detected. Behavioural activation evident. Low risk profile.',
    distressed: 'Distress markers detected — fatigue language, sleep disruption references. Moderate-high risk. Professional check-in recommended.',
    flat: 'Flat affect and minimal emotional range observed. Possible anhedonia indicator. Monitor trend.',
    agitated: 'Irritability and frustration language prominent. Possible anxiety or stress spike. Relaxation techniques suggested.',
    calm: 'Calm baseline tone. Positive coping behaviour (meditation) noted. Continue current approach.',
    tearful: 'Tearfulness noted with unclear trigger — possibly emotional dysregulation. Gentle professional consultation recommended.',
    neutral: 'Neutral affective state. No significant risk indicators. Routine check-in profile.',
  };
  return notes[tone] || notes.neutral;
}

// ============================================================
// 6. MONTHLY ANALYTICS (for admin/dashboard bar chart)
// ============================================================
const buildMonthlyAnalytics = () => {
  const months = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'];
  return months.map((month, i) => ({
    _id: new ObjectId(),
    month,
    totalUsers: 80 + i * 15,
    newRegistrations: 12 + i * 3,
    screeningsCompleted: 45 + i * 10,
    chatSessions: 30 + i * 8,
    voiceNotes: 15 + i * 5,
    highRiskFlags: 8 + i * 2,
    avgPHQ9Score: parseFloat((12 - i * 0.8).toFixed(1)),
    avgGAD7Score: parseFloat((10 - i * 0.7).toFixed(1)),
    languages: {
      en: 40 + i * 5,
      hi: 20 + i * 4,
      ta: 8 + i * 2,
      te: 5 + i,
      bn: 4 + i,
      ar: 3 + i,
    },
    generatedAt: daysAgo(30 - i * 5),
  }));
};

// ============================================================
// 7. RESOURCES (WHO-based articles/links)
// ============================================================
const buildResources = () => [
  {
    _id: new ObjectId(),
    title: 'Understanding Depression — WHO Fact Sheet',
    category: 'depression',
    language: 'en',
    url: 'https://www.who.int/news-room/fact-sheets/detail/depression',
    summary: 'Depression is a leading cause of disability worldwide. WHO provides evidence-based guidance on symptoms, causes, and treatment.',
    tags: ['who', 'depression', 'awareness'],
    featured: true,
  },
  {
    _id: new ObjectId(),
    title: 'Anxiety Disorders — WHO Overview',
    category: 'anxiety',
    language: 'en',
    url: 'https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders',
    summary: 'Anxiety disorders are the most prevalent mental health conditions globally. This WHO resource covers types, symptoms, and management.',
    tags: ['who', 'anxiety', 'gad'],
    featured: true,
  },
  {
    _id: new ObjectId(),
    title: 'Mental Health — Strengthening Our Response (WHO)',
    category: 'general',
    language: 'en',
    url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
    summary: 'Key WHO statistics and recommendations for global mental health policy and public awareness.',
    tags: ['who', 'policy', 'statistics'],
    featured: false,
  },
  {
    _id: new ObjectId(),
    title: 'iCall — Tata Institute of Social Sciences',
    category: 'helpline',
    language: 'en',
    url: 'https://icallhelpline.org',
    summary: 'Free, professional counselling helpline for India. Call 9152987821. Available Mon–Sat, 8am–10pm.',
    tags: ['india', 'helpline', 'counselling'],
    featured: true,
  },
  {
    _id: new ObjectId(),
    title: 'NIMHANS — National Institute of Mental Health',
    category: 'professional',
    language: 'en',
    url: 'https://nimhans.ac.in',
    summary: 'India\'s apex mental health institution. Provides resources, research, and referral guidance.',
    tags: ['india', 'nimhans', 'professional'],
    featured: false,
  },
  {
    _id: new ObjectId(),
    title: 'WHO mhGAP Intervention Guide',
    category: 'clinical',
    language: 'en',
    url: 'https://www.who.int/publications/i/item/9789241548069',
    summary: 'Evidence-based WHO guide for managing mental health conditions in non-specialist settings.',
    tags: ['who', 'clinical', 'mhgap'],
    featured: false,
  },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('Neuro Sync AI');

    // Drop existing collections
    const colsToDrop = ['users', 'screeningsessions', 'gamesessions', 'chatsessions', 'voicenotes', 'monthlyanalytics', 'resources'];
    for (const col of colsToDrop) {
      try { await db.collection(col).drop(); } catch (_) { }
    }
    console.log('🗑️  Cleared existing collections');

    // Build data
    const users = await buildUsers();
    const screenings = buildScreeningSessions();
    const gameSessions = buildGameSessions();
    const chatSessions = buildChatSessions();
    const voiceNotes = buildVoiceNotes();
    const monthlyStats = buildMonthlyAnalytics();
    const resources = buildResources();

    // Insert
    await db.collection('users').insertMany(users);
    console.log(`👤 Inserted ${users.length} users`);

    await db.collection('screeningsessions').insertMany(screenings);
    console.log(`📋 Inserted ${screenings.length} screening sessions`);

    await db.collection('gamesessions').insertMany(gameSessions);
    console.log(`🎮 Inserted ${gameSessions.length} game sessions`);

    await db.collection('chatsessions').insertMany(chatSessions);
    console.log(`💬 Inserted ${chatSessions.length} chat sessions`);

    await db.collection('voicenotes').insertMany(voiceNotes);
    console.log(`🎙️  Inserted ${voiceNotes.length} voice notes`);

    await db.collection('monthlyanalytics').insertMany(monthlyStats);
    console.log(`📊 Inserted ${monthlyStats.length} monthly analytics records`);

    await db.collection('resources').insertMany(resources);
    console.log(`📚 Inserted ${resources.length} resources`);

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('screeningsessions').createIndex({ userId: 1, completedAt: -1 });
    await db.collection('gamesessions').createIndex({ userId: 1, completedAt: -1 });
    await db.collection('chatsessions').createIndex({ userId: 1, lastActive: -1 });
    await db.collection('voicenotes').createIndex({ userId: 1, recordedAt: -1 });
    console.log('📑 Indexes created');

    console.log('\n🌿 Neuro Sync AI seed complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('Test Credentials (all passwords: Test@1234)');
    console.log('─────────────────────────────────────────');
    users.forEach(u => console.log(`  ${u.email.padEnd(28)} | ${u.name}`));
    console.log('─────────────────────────────────────────\n');
    console.log('Chart data summary:');
    console.log(`  PHQ-9 sessions: ${screenings.filter(s => s.type === 'PHQ9').length}`);
    console.log(`  GAD-7 sessions: ${screenings.filter(s => s.type === 'GAD7').length}`);
    console.log(`  Lovi trend: ${loviPHQScores.join(' → ')} (PHQ-9)`);
    console.log(`  Lovi trend: ${loviGADScores.join(' → ')} (GAD-7)\n`);

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await client.close();
  }
}

seed();