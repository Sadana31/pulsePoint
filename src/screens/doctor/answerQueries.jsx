import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const DoctorAnswering = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState("");
  const [doctorID, setDoctorID] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const docSnap = await getDocs(
        query(collection(db, "doctors"), where("email", "==", user.email)),
      );
      if (!docSnap.empty) {
        const doctorData = docSnap.docs[0].data();
        setDoctorID(doctorData.doctorID);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!doctorID) return;
    const fetchQueries = async () => {
      const snapshot = await getDocs(
        query(
          collection(db, "queries"),
          where("doctorID", "==", doctorID),
          where("status", "==", "open"),
        ),
      );
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQueries(list);
    };
    fetchQueries();
  }, [doctorID]);

  const sendAnswer = async () => {
    if (!answer.trim() || !selectedQuery) return;

    try {
      // Create Answer Document
      await addDoc(collection(db, "answers"), {
        patientName: selectedQuery.patientName,
        patientID: selectedQuery.patientID,
        patientEmail: selectedQuery.patientEmail,

        doctorName: selectedQuery.doctorName,
        doctorID: selectedQuery.doctorID,

        queryTitle: selectedQuery.title,
        queryMessage: selectedQuery.message,

        answerText: answer,
        answerType: "doctor",
        createdAt: serverTimestamp(),
      });

      //  Update Query Status
      await updateDoc(doc(db, "queries", selectedQuery.id), {
        status: "replied",
      });

      toast.success("Response transmitted successfully.");

      setAnswer("");
      setSelectedQuery(null);
      setQueries((prev) => prev.filter((q) => q.id !== selectedQuery.id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full w-full p-10 bg-slate-50 overflow-y-auto">
      <header className="mb-12">
        <p className="text-sm font-black uppercase tracking-[0.5em] text-[#006666] mb-3">
          Management Suite
        </p>
        <h1 className="text-5xl font-black text-black tracking-tighter">
          Clinical Inbox
        </h1>
      </header>

      {/* --- QUERY TABLE --- */}
      <div className="bg-white rounded-[3.5rem] border-2 border-slate-100 shadow-sm overflow-hidden mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b-2 border-slate-100">
              <th className="p-10 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Patient Identity
              </th>
              <th className="p-10 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Consultation Title
              </th>
              <th className="p-10 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Priority Level
              </th>
              <th className="p-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50">
            {queries.map((q) => (
              <tr
                key={q.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="p-10">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-[#006666]/10 flex items-center justify-center font-black text-[#006666] text-lg">
                      {q.patientName?.charAt(0)}
                    </div>
                    <span className="text-xl font-black text-black">
                      {q.patientName}
                    </span>
                  </div>
                </td>
                <td className="p-10 text-xl text-slate-600 font-bold">
                  {q.title}
                </td>
                <td className="p-10">
                  <span
                    className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      q.severity > 7
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-orange-50 text-orange-600 border border-orange-100"
                    }`}
                  >
                    Level {q.severity} Severity
                  </span>
                </td>
                <td className="p-10 text-right">
                  <button
                    onClick={() => setSelectedQuery(q)}
                    className="bg-white border-2 border-slate-200 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:border-[#006666] hover:text-[#006666] transition-all active:scale-95 shadow-sm"
                  >
                    Answer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {queries.length === 0 && (
          <div className="p-32 text-center">
            <div className="text-6xl mb-6 opacity-20">📂</div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">
              Inbox Cleared • No Pending Consultations
            </p>
          </div>
        )}
      </div>

      {/* --- RESPONSE SECTION --- */}
      {selectedQuery && (
        <div className="grid grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Detailed Inquiry Card */}
          <section className="col-span-4 rounded-[3.5rem] bg-white border-2 border-slate-100 p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-[15rem] font-black pointer-events-none text-[#006666]">
              💬
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#006666] mb-8">
              Patient Inquiry
            </h2>
            <h3 className="text-4xl font-black text-black mb-6 tracking-tight leading-tight">
              {selectedQuery.title}
            </h3>
            <p className="text-2xl text-slate-500 font-medium leading-relaxed mb-10">
              {selectedQuery.message}
            </p>
            <div className="pt-8 border-t-2 border-slate-50">
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                Primary Patient
              </p>
              <p className="text-2xl font-black text-black">
                {selectedQuery.patientName}
              </p>
            </div>
          </section>

          {/* Expanded Response Box */}
          <section className="col-span-8 rounded-[3.5rem] bg-[#006666] p-12 shadow-2xl text-white flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-70 mb-8">
                Physician Response Interface
              </h2>
              <textarea
                rows="6"
                className="w-full bg-white/10 border-2 border-white/10 rounded-[2.5rem] p-10 text-white placeholder-white/20 outline-none focus:border-white/40 transition-all text-2xl font-bold mb-10 resize-none leading-relaxed"
                placeholder="Begin clinical analysis..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-50">
                  HIPAA Compliant Gateway Active
                </p>
              </div>
              <div className="flex gap-6">
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={sendAnswer}
                  className="bg-white text-[#006666] px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  Transmit Response
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DoctorAnswering;
