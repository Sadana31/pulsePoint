import React, { useState } from "react";
import { Link } from "react-router-dom";

const DISEASE_DATA = {
  "Fungal Infection": [
    "Itching",
    "Skin Rash",
    "Nodal Skin Eruptions",
    "Dischromic Patches",
  ],
  Allergy: ["Continuous Sneezing", "Shivering", "Chills", "Watering From Eyes"],
  GERD: ["Stomach Pain", "Cough", "Chest Pain", "Acidity", "Ulcers On Tongue"],
  Diabetes: [
    "Increased Appetite",
    "Polyuria",
    "Fatigue",
    "Weight Loss",
    "Restlessness",
  ],
  Hypertension: [
    "Loss Of Balance",
    "Lack Of Concentration",
    "Headache",
    "Chest Pain",
    "Dizziness",
  ],
  Migraine: [
    "Acidity",
    "Indigestion",
    "Headache",
    "Blurred Vision",
    "Excessive Hunger",
  ],
  Malaria: ["Muscle Pain", "Chills", "Vomiting", "High Fever", "Sweating"],
  Chickenpox: ["Malaise", "Red Spots", "Itching", "Skin Rash", "Fatigue"],
  Dengue: [
    "Headache",
    "Nausea",
    "Loss Of Appetite",
    "Pain Behind Eyes",
    "Back Pain",
  ],
  Typhoid: ["Chills", "Fatigue", "High Fever", "Vomiting", "Headache"],
  "Heart Attack": ["Chest Pain", "Vomiting", "Breathlessness", "Sweating"],
  Pneumonia: [
    "Chest Pain",
    "Fast Heart Rate",
    "Rusty Sputum",
    "Chills",
    "Fatigue",
  ],
  "Common Cold": [
    "Phlegm",
    "Throat Irritation",
    "Loss Of Smell",
    "Chest Pain",
    "Congestion",
  ],
  Arthritis: [
    "Muscle Weakness",
    "Stiff Neck",
    "Swelling Joints",
    "Painful Walking",
  ],
  Acne: ["Skin Rash", "Pus Filled Pimples", "Blackheads", "Scurring"],
  "Urinary Tract Infection": [
    "Bladder Discomfort",
    "Burning Micturition",
    "Foul Smell",
  ],
  Psoriasis: [
    "Skin Rash",
    "Joint Pain",
    "Skin Peeling",
    "Silver Dusting",
    "Dents in Nails",
  ],
};

export default function CommonSymptoms() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDiseases = Object.keys(DISEASE_DATA).filter((disease) =>
    disease.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-black px-20">
      {" "}
      {/* Reduced top padding from py-12 to py-6 */}
      <div className="">
        {" "}
        {/* Max width increased to fit 3 columns better */}
        {/* HEADER */}
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#009999] mb-2">
            PulsePoint Library
          </p>
          <h1 className="text-5xl font-black tracking-tight text-black mb-3">
            Conditions & Symptoms
          </h1>
          {/* THE DESCRIPTIVE LINE IS BACK */}
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            Search our clinical database to understand common symptoms
            associated with various conditions based on the PulsePoint
            SymbiPredict dataset.
          </p>
        </header>
        {/* SEARCH BAR */}
        <div className="mb-10">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search diseases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-[#009999] focus:outline-none transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
          </div>
        </div>
        {/* DISEASE GRID - NOW 3 IN A ROW */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDiseases.map((disease) => (
            <div
              key={disease}
              className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-[#009999]/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-[#009999]/10 flex items-center justify-center text-lg text-[#009999]">
                    📋
                  </div>
                  <h3 className="text-xl font-bold text-black">{disease}</h3>
                </div>

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Signature Symptoms
                </p>

                <div className="flex flex-wrap gap-2">
                  {DISEASE_DATA[disease].map((symptom, idx) => (
                    <span
                      key={idx}
                      className="text-[12px] font-semibold bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-100"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-50">
                <Link
                  to="/chat"
                  className="text-sm font-bold text-[#009999] hover:underline"
                >
                  Start AI Consultation →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
