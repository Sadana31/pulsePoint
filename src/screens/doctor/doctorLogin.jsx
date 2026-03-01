import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function DoctorLogin() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Checking the 'doctors' collection instead of 'patients'
      const docRef = doc(db, "doctors", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        navigate("/answer", { replace: true });
      } else {
        // Redirect to a specialized doctor onboarding or unauthorized page
        navigate("/doctorProfile", { replace: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <header className="mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#006666] text-3xl text-white shadow-lg shadow-[#006666]/20 mb-6">
              👨‍⚕️
            </div>
            <h1 className="text-4xl font-black text-black tracking-tight">
              Provider Portal
            </h1>
            <p className="text-lg font-bold text-slate-400 mt-2">
              Secure Physician Authentication
            </p>
          </header>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-6 rounded-2xl border-2 border-slate-200 bg-white py-5 text-lg font-bold text-black hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-6 w-6"
            />
            Sign in as Practitioner
          </button>

          <p className="mt-8 text-sm text-slate-400 text-center">
            Authorized medical personnel only. Access is monitored.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — DARKENED CLINICAL PANEL */}
      <div className="hidden lg:flex w-[60%] bg-[#006666] p-16 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 text-[30rem] font-black text-white pointer-events-none">
          🏥
        </div>

        <div className="max-w-xl relative z-10 text-white">
          <p className="text-sm font-black uppercase tracking-[0.4em] mb-6 opacity-70">
            Professional Suite
          </p>
          <h2 className="text-6xl font-black tracking-tight leading-tight mb-8">
            PulsePoint Pro: Advanced Patient Oversight.
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2">Centralized EHR</h4>
                <p className="text-lg text-white/70 leading-relaxed font-medium">
                  Unified access to patient history, lab results, and AI-triage
                  summaries.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2">Practice Efficiency</h4>
                <p className="text-lg text-white/70 leading-relaxed font-medium">
                  Optimized scheduling workflows and instant emergency alert for
                  high-risk cases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
