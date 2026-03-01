import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/**
 * STATUS PILL COMPONENT
 * Renders the clinical status badge for each appointment.
 */
function StatusPill({ status }) {
  const styles = {
    Confirmed: "border-[#006600] text-[#006600] bg-[#009900]/10",
    "Awaiting confirmation": "border-amber-500 text-amber-600 bg-amber-50",
  };

  return (
    <span
      className={`inline-flex rounded-full border-2 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest ${
        styles[status] || "border-slate-200 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

/**
 * APPOINTMENT TABLE COMPONENT
 * Displays the grid of upcoming clinical sessions.
 */
function AppointmentTable({ title, subtitle, data }) {
  const navigate = useNavigate();

  function handleReschedule(appointment) {
    navigate("/reschedule", {
      state: {
        appointment,
        docId: appointment.firebaseId,
      },
    });
  }

  return (
    <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-[0_25px_60px_rgba(0,153,153,0.05)]">
      <div className="flex flex-col gap-1 border-l-8 border-[#009999] pl-8 mb-10">
        <h2 className="text-4xl font-black tracking-tighter text-black">{title}</h2>
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          {subtitle}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-slate-50 text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">
              <th className="px-6 py-6">ID</th>
              <th className="px-6 py-6">Provider</th>
              <th className="px-6 py-6">Date & Time</th>
              <th className="px-6 py-6 text-right">Status</th>
              <th className="px-10 py-6 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y-2 divide-slate-50">
            {data.map((item) => (
              <tr key={item.firebaseId} className="group transition-all hover:bg-slate-50/50">
                <td className="px-6 py-8 font-black text-[#009999] text-lg">
                  #{item.id}
                </td>

                <td className="px-6 py-8">
                  <div className="font-black text-2xl text-black tracking-tight">
                    Dr. {item.doctorName}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {item.specialty}
                  </div>
                </td>

                <td className="px-6 py-8">
                  <div className="font-black text-xl text-[#009876] tracking-tight">
                    {item.date}
                  </div>
                  <div className="text-lg font-bold text-slate-500 uppercase">
                    {item.time}
                  </div>
                </td>

                <td className="px-6 py-8 text-right">
                  <StatusPill status={item.status} />
                </td>

                <td className="px-10 py-8 text-center">
                  <button
                    onClick={() => handleReschedule(item)}
                    className="rounded-2xl border-2 border-[#009999] bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#009999] transition-all hover:bg-[#009999] hover:text-white shadow-sm active:scale-95"
                  >
                    Reschedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
              No upcoming clinical sessions found.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * MAIN PAGE COMPONENT
 */
export default function MyAppointments() {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Patient Info to get the PatientID
        const patientQuery = query(
          collection(db, "patients"),
          where("email", "==", currentUser.email)
        );
        const patientSnapshot = await getDocs(patientQuery);

        if (patientSnapshot.empty) {
          setLoading(false);
          return;
        }

        const patientData = patientSnapshot.docs[0].data();
        const currentPatientID = patientData.patientID;

        // 2. Fetch only "booked" (Upcoming) appointments
        const upcomingQuery = query(
          collection(db, "appointments"),
          where("patientID", "==", currentPatientID),
          where("status", "==", "booked"),
          orderBy("createdAt", "desc")
        );

        const upcomingSnapshot = await getDocs(upcomingQuery);
        
        const mappedData = upcomingSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            firebaseId: doc.id,
            id: data.appointmentID,
            doctorID: data.doctorID,
            doctorName: data.doctorName,
            specialty: data.specialization || "General Medicine",
            date: data.date,
            time: data.time,
            status: data.status === "booked" ? "Confirmed" : "Awaiting confirmation",
          };
        });

        setUpcoming(mappedData);
      } catch (error) {
        console.error("Clinical Sync Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xs font-black uppercase tracking-[0.5em] text-[#009999] animate-pulse">
          Synchronizing Records...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black selection:bg-teal-100">
      <div className="px-20 flex w-full flex-col gap-12">
        
        {/* HEADER */}
        <header className="flex flex-col gap-6 border-b-4 border-[#009999] pb-12">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#009999] animate-pulse" />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-[#009999]">
              Secure Patient Records
            </p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-black leading-none">
            My Appointments
          </h1>
          <p className="max-w-3xl text-2xl font-bold leading-tight text-slate-500">
            Review your upcoming clinical history and manage your healthcare schedule through our encrypted portal.
          </p>
        </header>

        {/* SCHEDULED TABLE */}
        <AppointmentTable
          title="Scheduled Visits"
          subtitle="Upcoming Clinical Sessions"
          data={upcoming}
        />

        {/* FOOTER */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 sm:flex-row">
          <div className="flex items-center gap-4">
             <span className="px-3 py-1 bg-slate-100 rounded-md">PULSEPOINT CORE v3.0</span>
             <span>AES-256 ENCRYPTION ACTIVE</span>
          </div>
          <span>Sync Status: Automated</span>
        </footer>
      </div>
    </div>
  );
}