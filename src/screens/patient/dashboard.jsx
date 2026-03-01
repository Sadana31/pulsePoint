import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("Incomplete");
  const [nextAppointment, setNextAppointment] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return;

      // Fetch Profile
      const profileQuery = query(
        collection(db, "patients"),
        where("email", "==", currentUser.email),
      );

      const profileSnapshot = await getDocs(profileQuery);

      if (!profileSnapshot.empty) {
        const data = profileSnapshot.docs[0].data();
        setProfile(data);

        const isComplete =
          data.age &&
          data.bloodGroup &&
          data.phone &&
          data.emergencyContact &&
          data.emergencyPhone;

        setStatus(isComplete ? "Complete" : "Incomplete");

        // 🔥 Fetch Appointment using patientID
        const appointmentQuery = query(
          collection(db, "appointments"),
          where("patientID", "==", data.patientID),
        );

        const appointmentSnapshot = await getDocs(appointmentQuery);

        if (!appointmentSnapshot.empty) {
          const appointments = appointmentSnapshot.docs.map((doc) =>
            doc.data(),
          );

          // Sort by date ascending
          appointments.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateA - dateB;
          });

          const today = new Date();

          const futureAppointments = appointments.filter((a) => {
            const appointmentDate = a.date?.toDate
              ? a.date.toDate()
              : new Date(a.date);

            return appointmentDate >= today;
          });

          if (futureAppointments.length > 0) {
            setNextAppointment(futureAppointments[0]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] w-full overflow-hidden px-20 bg-slate-50">
      <div className=" h-full grid grid-cols-12 grid-rows-6 gap-8">
        {/* LEFT MAIN SECTION (UNCHANGED) */}
        <section className="col-span-8 row-span-4 rounded-[3rem] bg-white border-2 border-slate-100 p-12 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-[0.03] text-[20rem] font-black pointer-events-none text-[#009999]">
            🩺
          </div>
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-[0.4em] text-[#009999] mb-6">
              PulsePoint Intelligence
            </p>
            <h1 className="text-6xl font-black tracking-tighter text-black mb-8">
              Hello, {profile?.name || "Patient"}.
            </h1>
            <p className="text-xl text-slate-500 max-w-lg mb-10 leading-relaxed">
              Your clinical dashboard is ready. Analyze symptoms with AI or
              browse the medical library.
            </p>
            <div className="flex gap-6">
              <Link
                to="/chat"
                className="rounded-2xl bg-[#009999] px-10 py-5 text-base font-bold text-white shadow-2xl shadow-[#009999]/30 hover:scale-105 active:scale-95 transition-all"
              >
                Start AI Triage
              </Link>
              <Link
                to="/library"
                className="rounded-2xl border-2 border-slate-200 bg-white px-10 py-5 text-base font-bold text-slate-600 hover:border-[#009999] hover:text-[#009999] transition-all"
              >
                Medical Library
              </Link>
            </div>
          </div>
        </section>

        {/* 🔥 UPDATED PROFILE CARD */}
        <section className="col-span-4 row-span-4 rounded-[3rem] bg-white border-2 border-slate-100 p-10 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-9xl font-black pointer-events-none text-[#009999]">
            👤
          </div>

          <div className="relative z-10">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#009999] mb-5">
              Patient Profile
            </h2>

            <div className="space-y-1 mb-8">
              <p className="text-3xl font-black text-black">
                {profile?.name || "—"}
              </p>
              <p className="text-lg text-slate-400 font-medium">
                {profile?.email || "—"}
              </p>
            </div>

            {/* QUICK INFO GRID */}
            <div className="grid grid-cols-2 gap-y-6 text-sm font-semibold">
              <div>
                <p className="text-slate-300 uppercase text-[10px] font-black tracking-wider">
                  Age
                </p>
                <p className="text-black">{profile?.age || "—"}</p>
              </div>

              <div>
                <p className="text-slate-300 uppercase text-[10px] font-black tracking-wider">
                  Blood Group
                </p>
                <p className="text-[#009999] font-black">
                  {profile?.bloodGroup || "—"}
                </p>
              </div>

              <div>
                <p className="text-slate-300 uppercase text-[10px] font-black tracking-wider">
                  Phone
                </p>
                <p className="text-black">{profile?.phone || "—"}</p>
              </div>

              <div>
                <p className="text-slate-300 uppercase text-[10px] font-black tracking-wider">
                  Location
                </p>
                <p className="text-black">{profile?.location || "—"}</p>
              </div>
            </div>

            {/* STATUS STRIP */}
            <div className="mt-5 flex justify-between items-center border-t pt-6">
              <span className="text-xs font-black uppercase text-slate-300">
                Profile Status
              </span>
              <span
                className={`text-xs font-black uppercase ${
                  status === "Complete" ? "text-green-500" : "text-orange-500"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          <Link
            to="/profile"
            className="relative z-10 w-full py-5 mt-3 bg-[#009999] text-white rounded-[2rem] text-center text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-[#009999]/20 hover:scale-[1.02] transition-all"
          >
            {status === "Complete" ? "View Profile" : "Complete Profile"}
          </Link>
        </section>

        <section className="col-span-12 row-span-2 rounded-[3rem] bg-[#009999] p-8 text-white shadow-2xl flex items-center gap-12 relative overflow-hidden">
          {nextAppointment ? (
            <div className="flex gap-16 items-center relative z-10 w-full">
              {/* LEFT BLOCK (UNCHANGED STYLE) */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">
                  Next Visit
                </h2>
                <p className="text-4xl font-black">
                  {nextAppointment.doctorName || nextAppointment.doctorID}
                </p>
                <p className="text-sm font-bold opacity-70 uppercase tracking-wider mt-1">
                  {nextAppointment.specialization || "Consultation"}
                </p>
              </div>

              <div className="h-16 w-px bg-white/20" />

              {/* DATE + TIME */}
              <div className="space-y-2">
                <p className="text-2xl font-black">
                  {new Date(nextAppointment.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-lg font-semibold opacity-90">
                  {nextAppointment.time}
                </p>
              </div>

              <div className="h-16 w-px bg-white/20" />

              {/* PRIORITY */}
              <div>
                <p className="text-xs font-black uppercase opacity-70 mb-1">
                  Priority
                </p>
                <p
                  className={`text-lg font-black uppercase ${
                    nextAppointment.priority === "urgent"
                      ? "text-red-200"
                      : nextAppointment.priority === "soon"
                        ? "text-yellow-200"
                        : "text-white"
                  }`}
                >
                  {nextAppointment.priority}
                </p>
              </div>

              <div className="h-16 w-px bg-white/20" />

              {/* PATIENT TIP */}
              <div className="max-w-xs">
                <p className="text-xs font-black uppercase opacity-70 mb-1">
                  Preparation Tip
                </p>
                <p className="text-sm font-semibold leading-relaxed">
                  Please arrive 20 minutes early and carry any previous reports.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <h2 className="text-xl font-black">No Upcoming Appointments</h2>
              <p className="opacity-70 mt-2">Book your next consultation.</p>
            </div>
          )}

          <Link
            to="/myvisits"
            className="relative z-10 py-4 px-8 bg-white text-[#009999] rounded-2xl text-center text-xs font-black uppercase tracking-[0.2em] hover:shadow-xl transition-all"
          >
            Manage
          </Link>
        </section>
      </div>
    </div>
  );
}
