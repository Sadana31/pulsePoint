import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "patients", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/profile", { replace: true });
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#009999] text-3xl text-white shadow-lg shadow-[#009999]/20 mb-6">
              🩺
            </div>
            <h1 className="text-4xl font-black text-black tracking-tight">
              Access Portal
            </h1>
            <p className="text-lg font-bold text-slate-400 mt-2">
              Continue securely with Google
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
            Continue with Google
          </button>
        </div>
      </div>

      {/* RIGHT SIDE — UNTOUCHED ELITE PANEL */}
      <div className="hidden lg:flex w-[60%] bg-[#009999] p-16 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 text-[30rem] font-black text-white pointer-events-none">
          🩺
        </div>

        <div className="max-w-xl relative z-10 text-white">
          <p className="text-sm font-black uppercase tracking-[0.4em] mb-6 opacity-70">
            Clinical Intelligence
          </p>
          <h2 className="text-6xl font-black tracking-tight leading-tight mb-8">
            PulsePoint: Your Digital Front Door to Health.
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2">AI-Driven Triage</h4>
                <p className="text-lg text-white/70 leading-relaxed font-medium">
                  Real-time symptom analysis based on the SymbiPredict clinical
                  dataset.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                📅
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2">Instant Scheduling</h4>
                <p className="text-lg text-white/70 leading-relaxed font-medium">
                  Direct integration with provider calendars for seamless
                  booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
