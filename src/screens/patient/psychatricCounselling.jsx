import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- UPDATED MODAL COMPONENT ---
const ResourceModal = ({ isOpen, onClose, resource }) => {
  if (!isOpen || !resource) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-12 pb-16">
          <header className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#009999] mb-2">Guided Exercise</p>
              <h3 className="text-4xl font-black text-black tracking-tighter">{resource.title}</h3>
            </div>
            <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl hover:bg-slate-200 transition-colors">✕</button>
          </header>

          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Objective</p>
              <p className="text-lg font-bold text-slate-700 leading-relaxed">{resource.objective}</p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Clinical Steps</p>
              {resource.steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="h-6 w-6 rounded-lg bg-[#009999] flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-1">{i + 1}</span>
                  <p className="text-lg font-medium text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function SerenityEngine() {
  // State Management - Verified scopes
  const [mood, setMood] = useState(null);
  const [survey, setSurvey] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(null);

  // Define data within component scope to fix ReferenceError
  const surveyQuestions = [
    { id: "q1", label: "How often have you felt unable to control important things in your life?" },
    { id: "q2", label: "How often have you felt confident about your ability to handle personal problems?" },
    { id: "q3", label: "How often have you felt that things were going your way?" },
    { id: "q4", label: "How often have you found that you could not cope with all the things you had to do?" },
    { id: "q5", label: "How often have you been able to control irritations in your life?" },
  ];

  const moods = [
    { label: "Great", emoji: "😊" },
    { label: "Good", emoji: "🙂" },
    { label: "Okay", emoji: "😐" },
    { label: "Down", emoji: "😔" },
    { label: "Stressed", emoji: "😫" },
  ];

  const RESOURCES = [
    {
      title: "Box Breathing",
      objective: "Regulate the nervous system and lower cortisol levels.",
      steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold empty for 4 seconds"]
    },
    {
      title: "Sleep Hygiene",
      objective: "Reset the circadian rhythm for deeper restorative sleep.",
      steps: ["Dim lights 1 hour before bed", "No digital screens in the final hour", "Maintain room temp at 18°C", "Write down thoughts to clear mind"]
    },
    {
      title: "Meditation Basics",
      objective: "Develop non-judgmental awareness of the present moment.",
      steps: ["Sit in a comfortable, upright position", "Focus on the sensation of breath", "Acknowledge drifting thoughts", "Gently return focus to breathing"]
    }
  ];

  // Calculation logic - remains functional
  const calculateResilience = () => {
    const values = Object.values(survey);
    if (values.includes(0)) {
      alert("Please answer all questions before analyzing.");
      return;
    }

    const totalScore = values.reduce((a, b) => a + b, 0);
    let level = "";
    let advice = "";

    if (totalScore <= 10) {
      level = "Critical";
      advice = "Your stress levels are high. Speak with our counseling team.";
    } else if (totalScore <= 18) {
      level = "Moderate";
      advice = "You're under strain. Try guided breathing or resources below.";
    } else {
      level = "High Resilience";
      advice = "Strong emotional control! Maintain your wellness routines.";
    }

    setResult({ score: totalScore, level, advice });
  };

  return (
    <div className="h-full w-full px-20 bg-slate-50 overflow-y-visible custom-scrollbar space-y-12">
      
      {/* 1. MENTAL HEALTH ASSESSMENT */}
      <section className="bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 shadow-sm">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-[#009999] mb-2">Clinical Assessment</p>
            <h2 className="text-5xl font-black text-black tracking-tighter leading-none">Wellness Check</h2>
          </div>
          {result && (
            <button 
              onClick={() => {setResult(null); setSurvey({q1:0,q2:0,q3:0,q4:0,q5:0})}} 
              className="text-[10px] font-black uppercase tracking-widest text-[#009999] hover:underline"
            >
              Retake
            </button>
          )}
        </header>

        {!result ? (
          <div className="space-y-10">
            {surveyQuestions.map((q) => (
              <div key={q.id} className="pb-8 border-b-2 border-slate-50 last:border-0">
                <p className="text-2xl font-bold text-slate-700 mb-8">{q.label}</p>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSurvey({ ...survey, [q.id]: num })}
                      className={`h-16 w-16 rounded-2xl font-black text-xl transition-all ${
                        survey[q.id] === num 
                          ? "bg-[#009999] text-white" 
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={calculateResilience} className="w-full py-7 bg-black text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em]">Analyze Profile</button>
          </div>
        ) : (
          <div className="py-12 text-center animate-in fade-in zoom-in">
             <h3 className="text-8xl font-black text-black">{result.score}/25</h3>
             <h4 className="text-5xl font-black mb-6 text-[#009999]">{result.level}</h4>
             <p className="text-2xl font-bold text-slate-500 max-w-3xl mx-auto">{result.advice}</p>
          </div>
        )}
      </section>

      {/* 2. MOOD TRACKER */}
      <section className="bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 shadow-sm">
        <header className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-[#009999] mb-2">Daily Emotional Log</p>
          <h2 className="text-5xl font-black text-black tracking-tighter">Mood Tracker</h2>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-8">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setMood(m.label)}
              className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 ${
                mood === m.label ? "border-[#009999] bg-[#009999]/5 shadow-inner" : "border-slate-50 hover:border-slate-200"
              }`}
            >
              <span className="text-6xl">{m.emoji}</span>
              <span className={`text-xs font-black uppercase tracking-widest ${mood === m.label ? "text-[#009999]" : "text-slate-400"}`}>{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-10">
        <section className="bg-[#009999] rounded-[3.5rem] p-12 text-white shadow-2xl relative flex flex-col justify-center min-h-[350px]">
          <h3 className="text-5xl font-black mb-8 tracking-tighter">Book Counselling</h3>
          <button
  onClick={() => navigate("/appointment")}
  className="w-full py-6 bg-white text-[#009999] rounded-2xl text-[10px] font-black uppercase tracking-widest"
>
  Schedule
</button>
        </section>

        <section className="bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 shadow-sm flex flex-col justify-center">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 text-center">Wellness Resources</h2>
          <div className="space-y-4">
            {RESOURCES.map((res) => (
              <button 
                key={res.title} 
                onClick={() => setSelectedResource(res)}
                className="w-full p-8 rounded-3xl border-2 border-slate-50 bg-slate-50/50 hover:bg-white hover:border-[#009999]/20 flex items-center justify-between"
              >
                <span className="text-xl font-bold text-slate-700">{res.title}</span>
                <span className="text-slate-300">→</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL - Simplified practice intent */}
      <ResourceModal 
        isOpen={!!selectedResource} 
        onClose={() => setSelectedResource(null)} 
        resource={selectedResource} 
      />
    </div>
  );
}