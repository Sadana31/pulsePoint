const hardEmergencyPhrases = [
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "unconscious",
  "severe bleeding",
  "heart attack",
  "stroke"
];

// ===============================
// SYMPTOM QUESTIONS + NOTES
// ===============================

const symptomQuestions = {

  "stomach pain": [
    { q: "How long have you had the stomach pain?" },
    { q: "Is the pain constant or does it come and go?" },
    { q: "Are you experiencing nausea or vomiting?", note: "patient experiencing nausea or vomiting" }
  ],

  "leg pain": [
    { q: "Did the leg pain start after an injury?", note: "leg pain began after injury" },
    { q: "Does walking make the pain worse?", note: "pain worsens with walking" },
    { q: "Is there swelling in the leg?", note: "leg swelling present" }
  ],

  cough: [
    { q: "How long have you had the cough?" },
    { q: "Is the cough dry or producing mucus?" },
    { q: "Do you have fever along with the cough?", note: "cough with fever" }
  ],

  cold: [
    { q: "Do you have a runny or blocked nose?" },
    { q: "Do you have a fever?", note: "cold with fever" },
    { q: "Are you experiencing body aches?" }
  ],

  headache: [
    { q: "How severe is the headache?" },
    { q: "Did it start suddenly or gradually?" },
    { q: "Do you feel nausea or sensitivity to light?", note: "headache with nausea or light sensitivity" }
  ],

  itchiness: [
    { q: "Where on the body are you experiencing itching?" },
    { q: "Do you notice rash or redness?", note: "itching with rash/redness" },
    { q: "Did this start after using a new product or food?" }
  ],

  tired: [
    { q: "How long have you been feeling unusually tired?" },
    { q: "Are you sleeping well at night?" },
    { q: "Do you feel dizzy or weak along with the fatigue?", note: "fatigue with dizziness or weakness" }
  ],

  nausea: [
    { q: "How long have you been feeling nauseous?" },
    { q: "Have you vomited recently?", note: "patient vomiting" },
    { q: "Did this start after eating something unusual?" }
  ],

  dizziness: [
    { q: "Does the dizziness happen when you stand up?", note: "dizziness when standing" },
    { q: "Do you feel like the room is spinning?", note: "possible vertigo symptoms" },
    { q: "Have you fainted or nearly fainted?", note: "patient nearly fainted" }
  ],

  diarrhea: [
    { q: "How long have you had diarrhea?" },
    { q: "Are you experiencing stomach cramps?", note: "diarrhea with cramps" },
    { q: "Do you have fever along with it?", note: "diarrhea with fever" }
  ],

  "food poisoning": [
    { q: "When did symptoms start after eating?" },
    { q: "Are you experiencing vomiting or diarrhea?", note: "food poisoning with vomiting/diarrhea" },
    { q: "Are you able to drink fluids without vomiting?" }
  ],

  "eyesight blurry": [
    { q: "Did the blurry vision start suddenly?", note: "sudden blurry vision" },
    { q: "Is it affecting one eye or both?" },
    { q: "Do you have headache along with it?" }
  ],

  "throat pain": [
    { q: "Is it painful to swallow?", note: "pain while swallowing" },
    { q: "Do you have fever along with the throat pain?", note: "throat pain with fever" },
    { q: "Do you have cough?" }
  ],

  "sore muscles": [
    { q: "Did the soreness start after exercise?", note: "muscle soreness after activity" },
    { q: "Is the soreness affecting multiple muscles?" },
    { q: "Does resting improve the pain?" }
  ],

  overeating: [
    { q: "Are you feeling stomach discomfort or bloating?", note: "bloating after overeating" },
    { q: "Did symptoms start immediately after eating?" },
    { q: "Are you experiencing nausea?" }
  ],

  "no appetite": [
    { q: "How long have you had reduced appetite?" },
    { q: "Have you noticed weight loss recently?", note: "reduced appetite with weight loss" },
    { q: "Are you experiencing nausea or stomach discomfort?" }
  ],

  "ear pain": [
    { q: "Is the pain in one ear or both?" },
    { q: "Do you have fever or hearing difficulty?", note: "ear pain with hearing issues" },
    { q: "Did the pain start after a cold?" }
  ],

  "red eye": [
    { q: "Is the redness in one eye or both?" },
    { q: "Do you feel itching or burning?", note: "red eye with irritation" },
    { q: "Is there discharge from the eye?", note: "eye discharge present" }
  ],

  "joint pain": [
    { q: "Which joint is affected?" },
    { q: "Did the pain start after physical activity?" },
    { q: "Is there swelling or stiffness?", note: "joint swelling or stiffness" }
  ]
};

// ===============================
// DETECT SYMPTOM
// ===============================

function detectSymptom(message) {
  const symptoms = Object.keys(symptomQuestions);
  for (const s of symptoms) {
    if (message.includes(s)) return s;
  }
  return null;
}

// ===============================
// GIBBERISH CHECK
// ===============================

function looksLikeGibberish(text) {

  if (text.length < 2) return true;

  const repeated = /(.)\1{3,}/;
  if (repeated.test(text)) return true;

  if (!/[aeiou]/.test(text) && text.length > 4) return true;

  return false;
}

// ===============================
// TRIAGE SUMMARY BUILDER
// ===============================

function buildTriageSummary(state) {

  const symptom = state.symptom || "unspecified symptom";
  const notes = state.triageNotes || [];

  if (notes.length === 0) {
    return `Chief Complaint: ${symptom}`;
  }

  return `Chief Complaint: ${symptom}\nAssociated Findings:\n• ${notes.join("\n• ")}`;
}

// ===============================
// MAIN BOT LOGIC
// ===============================

export function classifyMessage(rawMessage, previousState = null) {

  const message = rawMessage.toLowerCase().trim();

  if (["hi","hello","hey"].includes(message)) {
    return {
      botResponse: "Hello! Please describe your symptoms.",
      state: previousState
    };
  }

  if (["bye","goodbye","exit"].includes(message)) {
    return {
      botResponse: "Take care! Feel free to return if you need help.",
      final: true
    };
  }

  if (message.includes("anxiety")) {
    return {
      botResponse: "Mental health support may help. Redirecting you to psychiatric consultation.",
      navigate: "/psychatric"
    };
  }

  if (hardEmergencyPhrases.some(p => message.includes(p))) {
    return {
      botResponse: "🚨 Critical symptoms detected. Please seek emergency care immediately.",
      emergency: true,
      navigate: "/emergency"
    };
  }

  if (looksLikeGibberish(message)) {
    return {
      botResponse: "Please clearly describe your symptoms.",
      state: previousState
    };
  }

  let state = previousState || {};

  state.symptom = state.symptom || null;
  state.askedQuestions = state.askedQuestions || [];
  state.triageNotes = state.triageNotes || [];

  if (!state.symptom) {
    const detected = detectSymptom(message);

    if (detected) state.symptom = detected;
    else {
      return {
        botResponse: "Could you describe your symptoms in a bit more detail?",
        state
      };
    }
  }

  const questions = symptomQuestions[state.symptom];

  const next = questions.find(
    item => !state.askedQuestions.includes(item.q)
  );

  if (["yes","no"].includes(message) && state.askedQuestions.length) {

    const lastQ = state.askedQuestions[state.askedQuestions.length-1];
    const qObj = questions.find(q => q.q === lastQ);

    if (message === "yes" && qObj?.note) {
      state.triageNotes.push(qObj.note);
    }
  }

  if (next) {

    state.askedQuestions.push(next.q);

    return {
      botResponse: next.q,
      state
    };
  }

  return {
    botResponse:
      "Based on your responses, I recommend scheduling a consultation for further evaluation.",
    final: true,
    showBookAppointment: true,
    triageSummary: buildTriageSummary(state),
    symptom: state.symptom
  };
}