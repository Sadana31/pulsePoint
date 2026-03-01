import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { doc, updateDoc, serverTimestamp, getDocs, collection, query, where} from "firebase/firestore"; // Use serverTimestamp for accuracy
import toast from "react-hot-toast";

export default function RescheduleAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const docId = location.state?.docId;
  const appointment = location.state?.appointment;

  const [loading, setLoading] = useState(false);

  const [doctorData, setDoctorData] = useState(null);
const [selectedDate, setSelectedDate] = useState("");


  // If someone refreshes the page and state is lost, send them back
  if (!docId || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <button onClick={() => navigate("/myvisits")} className="text-[#009999] font-black">
          ← Session lost. Return to Appointments
        </button>
      </div>
    );
  }
const [selectedTime, setSelectedTime] = useState("");

  const handleReschedule = async () => {
  if (!selectedDate || !selectedTime || !docId) return;

  setLoading(true);

  try {
    const clashQuery = query(
      collection(db, "appointments"),
      where("doctorID", "==", appointment.doctorID),
      where("date", "==", selectedDate),
      where("time", "==", selectedTime),
      where("status", "==", "booked")
    );

    const clashSnapshot = await getDocs(clashQuery);

    if (!clashSnapshot.empty) {
      toast.success("This time slot is already booked.");
      setLoading(false);
      return;
    }

    const appointmentRef = doc(db, "appointments", docId);

    const appointmentDateTime = new Date(
      `${selectedDate} ${selectedTime}`
    );

    await updateDoc(appointmentRef, {
      date: selectedDate,
      time: selectedTime,
      appointmentDateTime,
      status: "booked",
      updatedAt: serverTimestamp()
    });

    navigate("/myvisits");

  } catch (error) {
    console.error("Error updating appointment:", error);
    toast.success("Failed to reschedule.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  const fetchDoctor = async () => {
    if (!appointment?.doctorID) return;

    try {
      const snapshot = await getDocs(collection(db, "doctors"));
      const doctor = snapshot.docs
        .map(doc => doc.data())
        .find(doc => doc.doctorID === appointment.doctorID);

      setDoctorData(doctor || null);
    } catch (err) {
      console.error("Failed to fetch doctor:", err);
    }
  };

  fetchDoctor();
}, [appointment]);

const generateTimeSlots = () => {
  const slots = [];
  const now = new Date();

  for (let hour = 9; hour <= 18; hour++) {
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, 0, 0, 0);

    // 🚫 Prevent past time if today selected
    if (selectedDate) {
      if (slotDate > now) {
        const formatted = slotDate.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        });
        slots.push(formatted);
      }
    }
  }

  return slots;
};

const timeSlots = selectedDate ? generateTimeSlots() : [];

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] border-2 border-slate-100 p-12 shadow-xl relative overflow-hidden">
        
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="h-10 w-10 border-4 border-[#009999] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <header className="mb-10 text-center">
          <div className="inline-block rounded-full bg-[#009999]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#009999] mb-4">
            Clinical Action
          </div>
          <h1 className="text-4xl font-black tracking-tight text-black">Reschedule Visit</h1>
        </header>

        <div className="mb-10 bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Details (Read Only)</p>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-bold">Provider</span>
              <span className="text-black font-black">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-bold">Current Date</span>
              <span className="text-black font-black">{appointment.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Current Time</span>
              <span className="text-black font-black">{appointment.time}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <label className="block text-sm font-black text-black uppercase tracking-wider ml-2">
  Select New Date
</label>

<input
  type="date"
  value={selectedDate}
  onChange={(e) => {
    setSelectedDate(e.target.value);
    setSelectedTime("");
  }}
  min={new Date().toISOString().split("T")[0]}
  className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 font-bold focus:border-[#009999] focus:outline-none"
/>

<label className="block text-sm font-black text-black uppercase tracking-wider ml-2 mt-6">
  Select New Time
</label>

<select
  value={selectedTime}
  onChange={(e) => setSelectedTime(e.target.value)}
  disabled={!selectedDate}
  className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 font-bold focus:border-[#009999] focus:outline-none"
>
  <option value="">Choose a time...</option>

  {timeSlots.length === 0 && selectedDate && (
    <option disabled>No available slots</option>
  )}

  {timeSlots.map((slot, index) => (
    <option key={index} value={slot}>
      {slot}
    </option>
  ))}
</select>

          <div className="pt-6 flex flex-col gap-4">
            <button 
              disabled={!selectedDate || !selectedTime || loading}
              onClick={handleReschedule}
              className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-lg 
                ${selectedDate && selectedTime && !loading
                  ? "bg-[#009999] text-white shadow-[#009999]/20 hover:scale-[1.02]" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              {loading ? "Updating..." : "Confirm Reschedule"}
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-full py-5 rounded-2xl border-2 border-slate-100 text-slate-400 text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}