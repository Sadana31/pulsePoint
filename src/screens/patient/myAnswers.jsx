import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase";

const MyAnswers = () => {
  const [replies, setReplies] = useState([]);
  const [selectedReply, setSelectedReply] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // 🔥 Fetch patient document
        const patientSnap = await getDocs(
          query(collection(db, "patients"), where("email", "==", user.email)),
        );

        if (patientSnap.empty) {
          setLoading(false);
          return;
        }

        const patientData = patientSnap.docs[0].data();
        const patientID = patientData.patientID;

        // 🔥 Fetch answers for this patient
        const answersSnap = await getDocs(
          query(
            collection(db, "answers"),
            where("patientID", "==", patientID),
            orderBy("createdAt", "desc"),
          ),
        );

        const list = answersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReplies(list);
        if (list.length > 0) setSelectedReply(list[0]);
      } catch (error) {
        console.error("Error fetching replies:", error);
      }

      setLoading(false);
    };

    fetchReplies();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <p className="text-xl font-black text-[#009999] animate-pulse uppercase tracking-widest">
          Retrieving Medical Records...
        </p>
      </div>
    );
  }

  return (
    <div className="px-20 w-full bg-slate-50 flex flex-col">
      <header className="mb-10 shrink-0">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-[#009999] mb-2">
          Patient Communication
        </p>
        <h1 className="text-6xl font-black text-black tracking-tighter">
          Medical Inbox
        </h1>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* --- LEFT: LIST OF REPLIES --- */}
        <div className="w-[400px] flex flex-col gap-4 overflow-y-auto pr-2">
          {replies.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReply(r)}
              className={`w-full text-left p-8 rounded-[2.5rem] border-2 transition-all ${
                selectedReply?.id === r.id
                  ? "bg-white border-[#009999] shadow-md"
                  : "bg-white border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {r.createdAt?.toDate
                    ? r.createdAt.toDate().toLocaleDateString()
                    : "Recent"}
                </span>
                <div
                  className={`h-2 w-2 rounded-full bg-[#009999] ${
                    selectedReply?.id === r.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              <h3 className="text-xl font-black text-black mb-2 line-clamp-1">
                {r.queryTitle}
              </h3>

              <p className="text-sm text-slate-500 font-medium line-clamp-2">
                Re: {r.queryMessage}
              </p>
            </button>
          ))}

          {replies.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <span className="text-6xl mb-4">📩</span>
              <p className="font-black uppercase tracking-widest text-xs">
                No replies yet
              </p>
            </div>
          )}
        </div>

        {/* --- RIGHT: FULL RESPONSE VIEW --- */}
        <div className="flex-1 bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 shadow-sm relative overflow-hidden flex flex-col">
          {selectedReply ? (
            <>
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[20rem] pointer-events-none">
                🩺
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto pr-4">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black text-black mb-2">
                      {selectedReply.queryTitle}
                    </h2>
                    <p className="text-lg font-bold text-slate-400">
                      Your Inquiry: "{selectedReply.queryMessage}"
                    </p>
                  </div>

                  <div className="bg-[#009999]/10 px-6 py-3 rounded-2xl">
                    <p className="text-[10px] font-black text-[#009999] uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <p className="text-sm font-black text-[#009999] uppercase">
                      Clinical Response Received
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[3rem] p-10 border-2 border-slate-100 mb-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-[#009999] flex items-center justify-center text-2xl">
                      👨‍⚕️
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Doctor
                      </p>
                      <p className="text-2xl font-black text-black">
                        {selectedReply.doctorName}
                      </p>
                      <p className="text-sm font-bold text-slate-400">
                        ID: {selectedReply.doctorID}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 border">
                    <p className="text-2xl font-bold text-[#009999] leading-relaxed">
                      "{selectedReply.answerText}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
                  End of clinical transcript
                </p>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-9xl mb-8 opacity-5">💉</div>
              <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.3em]">
                Select a reply to view
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAnswers;
