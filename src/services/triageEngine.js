const hardEmergencyPhrases = [
  "chest pain", 
  "shortness of breath", 
  "difficulty breathing",
  "unconscious", 
  "severe bleeding", 
  "heart attack", 
  "stroke"
];

// Quick Prompts
const specificQueries = {
  "check if my symptoms need urgent care": 
    "I can help with that. Please describe your symptoms. I'll check for red flags like severe pain, high fever, or breathing issues to see if you need ER care or a standard clinic visit.",
  
  "how should i prepare for my appointment?": 
    "To prepare: 1. Write down a timeline of symptoms. 2. List current medications. 3. Prepare your questions for the doctor.",
  
  "what can i do for pain relief today?": 
    "For mild pain, try rest, ice/heat packs, or OTC medication (if safe for you). If pain is sharp, sudden, or worsening, please describe it."
};

const followUpQuestions = {
  cardiology: [
    "Are you experiencing shortness of breath?",
    "Does the pain spread to your arm or jaw?"
  ],
  orthopedics: [
    "Did this start after an injury?",
    "Does movement make it worse?"
  ],
  general: [
    "How long have you been experiencing this?",
    "Is the symptom getting worse?"
  ]
};

const categoryMap = {
  cardiology: ["heart", "chest", "blood pressure"],
  orthopedics: ["back", "leg", "joint", "bone", "pain"],
  general: ["fever", "vomiting", "infection", "headache"]
};

function detectCategory(message) {
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return category;
    }
  }
  return "general";
}

export function classifyMessage(rawMessage, previousState = null) {
  const message = rawMessage.toLowerCase().trim();

  // ===============================
  // 1️⃣ STRICT EMERGENCY CHECK FIRST
  // ===============================

  // If user types SEVERE directly
  if (message === "severe") {
    return {
      botResponse: "🚨 Severe symptoms detected. Redirecting you to emergency care immediately.",
      emergency: true,
      navigate: "/emergency"
    };
  }

  // Hard emergency phrases
  if (hardEmergencyPhrases.some(p => message.includes(p))) {
    return {
      botResponse: "🚨 Critical symptoms detected. Please seek emergency medical care immediately.",
      emergency: true,
      navigate: "/emergency"
    };
  }

// ===============================
// GIBBERISH CHECK (Improved)
// ===============================

const validShortWords = ["hi", "ok", "no", "yes"];

const isOnlyLetters = /^[a-zA-Z]+$/.test(message);
const hasNoSpaces = !message.includes(" ");
const tooRandom = message.length > 4 && isOnlyLetters && hasNoSpaces;

if (
  message.length < 2 ||
  validShortWords.includes(message) === false &&
  tooRandom
) {
  return {
    botResponse:
      "I'm sorry, I didn’t understand that. Please clearly describe your symptoms so I can assist you.",
    state: previousState
  };
}
  // ===============================
  // 3️⃣ SOCIAL RESPONSES
  // ===============================

  if (["thanks", "thank you"].includes(message)) {
    return {
      botResponse: "You're welcome! I'm here if you need anything else.",
      state: previousState
    };
  }

  if (message === "help me") {
    return {
      botResponse: "I’m here to help. What symptoms are you experiencing?",
      state: previousState
    };
  }

  // ===============================
  // 4️⃣ QUICK PROMPTS
  // ===============================

  if (specificQueries[message]) {
    return {
      botResponse: specificQueries[message],
      state: previousState
    };
  }

  // ===============================
  // 5️⃣ NORMAL TRIAGE FLOW
  // ===============================

  let state = previousState || {
    symptoms: [],
    askedQuestions: []
  };

  if (!["yes", "no"].includes(message)) {
  state.symptoms.push(message);
}

  const category = detectCategory(state.symptoms.join(" "));
  const questions = followUpQuestions[category];

  const nextQuestion = questions.find(
    q => !state.askedQuestions.includes(q)
  );

  if (nextQuestion) {
    state.askedQuestions.push(nextQuestion);
    return {
      botResponse: nextQuestion,
      state
    };
  }

  return {
    botResponse:
      "Based on your responses, I recommend scheduling a consultation for further evaluation.",
    final: true
  };
}