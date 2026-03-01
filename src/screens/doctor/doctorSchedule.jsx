import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorID, setDoctorID] = useState(null);

  // 🔥 Get logged in doctor's ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const snapshot = await getDocs(
        query(collection(db, "doctors"), where("email", "==", user.email))
      );

      if (!snapshot.empty) {
        const doctorData = snapshot.docs[0].data();
        setDoctorID(doctorData.doctorID);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Fetch appointments for this doctor
  useEffect(() => {
    if (!doctorID) return;

    const fetchAppointments = async () => {
      const snapshot = await getDocs(
        query(
          collection(db, "appointments"),
          where("doctorID", "==", doctorID),
          where("status", "==", "booked")
        )
      );

      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAppointments(list);
    };

    fetchAppointments();
  }, [doctorID]);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-600 border-red-100";
      case "routine":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="h-full w-full p-8 bg-slate-50 overflow-y-auto">
      <header className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#006666] mb-2">
          Scheduling Suite
        </p>
        <h1 className="text-5xl font-black text-black tracking-tighter leading-none">
          Today's Queue
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border-2 border-slate-100"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#006666]/10 text-[#006666] flex items-center justify-center font-black text-xl">
                {apt.patientID?.substring(0, 2)}
              </div>
              <span
                className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border-2 ${getPriorityStyles(
                  apt.priority
                )}`}
              >
                {apt.priority}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-black">
                {apt.patientID}
              </h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                {apt.date} • {apt.time}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
              <p className="text-[12px] font-black uppercase tracking-widest mb-2">
                Primary Concern
              </p>
              <p className="text-slate-600 font-bold italic">
                {apt.reason}
              </p>
            </div>

            <button className="w-full py-4 bg-[#006666] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
              Confirm & Start
            </button>
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="mt-20 text-center">
          <div className="text-6xl opacity-20">📅</div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm mt-4">
            No Appointments Scheduled
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;