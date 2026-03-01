import React from "react";
import { useNavigate } from "react-router-dom";

export default function EmergencyGuidance() {
  const navigate = useNavigate();
  // Replace this with your actual phone number
  const myPhoneNumber = "+917305761031";

  const handleCall = () => {
    window.location.href = `tel:${myPhoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-12">
      <div className="mx-auto max-w-3xl text-center">
        {/* WORDS OF COMFORT */}
        <div className="mb-12 space-y-4">
          <div className="inline-block rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-600">
            You are not alone
          </div>
          <h1 className="text-5xl font-black tracking-tight text-black">
            Breathe. We're here.
          </h1>
          <p className="text-lg leading-relaxed text-slate-500">
            It's okay to feel overwhelmed right now. Take a deep breath. Help is
            just a second away, and we are going to get through this together.
          </p>
        </div>

        {/* THE CALL BUTTON */}
        <div className="relative group inline-block">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-red-500 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200 animate-pulse"></div>
          <a
            href={`tel:${myPhoneNumber}`}
            className="relative flex items-center gap-4 rounded-[2rem] bg-red-600 px-12 py-8 text-2xl font-black text-white shadow-2xl transition-all hover:bg-red-700 active:scale-95 no-underline"
          >
            <span className="text-3xl">📞</span>
            CALL FOR HELP NOW
          </a>
        </div>

        {/* GUIDANCE STEPS */}
        <div className="mt-16 grid gap-6 text-left">
          <div className="rounded-3xl border-2 border-slate-100 p-8 transition-all hover:border-red-100">
            <h3 className="text-lg font-bold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm text-red-600">
                1
              </span>
              Stay exactly where you are
            </h3>
            <p className="mt-3 text-slate-500">
              Avoid moving around. Sit or lie down in a comfortable position
              until help arrives.
            </p>
          </div>

          <div className="rounded-3xl border-2 border-slate-100 p-8 transition-all hover:border-red-100">
            <h3 className="text-lg font-bold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm text-red-600">
                2
              </span>
              Keep your phone nearby
            </h3>
            <p className="mt-3 text-slate-500">
              Ensure your ringer is on so you can hear incoming calls from
              emergency responders.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-12 text-sm font-bold text-slate-400 hover:text-[#009999] transition-colors"
        >
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );
}
