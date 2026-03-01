import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useEffect } from "react";
import toast from "react-hot-toast";

const PRIORITIES = [
  { id: "urgent", label: "Urgent", desc: "Severe symptoms" },
  { id: "soon", label: "Serious", desc: "1-3 days" },
  { id: "routine", label: "Routine", desc: "General checkup" },
];

export default function AppointmentRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const [patientID, setPatientID] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    reason: location.state?.reason || "",
    symptoms: location.state?.symptoms || "",
    preferredDate: "",
    preferredTime: "",
    doctor: "",
    priority: location.state?.priority || "soon",
  });

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return;

      const patientQuery = query(
        collection(db, "patients"),
        where("email", "==", currentUser.email),
      );

      const snapshot = await getDocs(patientQuery);

      if (!snapshot.empty) {
        const patientData = snapshot.docs[0].data();
        setPatientID(patientData.patientID);
      }
    });

    return () => unsubscribe();
  }, []);
  async function submitForm(e) {
    if (!patientID) {
      toast.success("Patient not loaded yet.");
      return;
    }

    e.preventDefault();

    // Phone validation
    if (!/^\d{10}$/.test(form.phone)) {
      toast.success("Phone number must be exactly 10 digits.");
      return;
    }

    if (!selectedDoctor) {
      toast.success("Doctor not found.");
      return;
    }

    // 🔎 Validate slot
    // 🎟 Generate custom appointment ID
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const appointmentID = "SA" + random4; // since patientID is SA123

    const clashQuery = query(
      collection(db, "appointments"),
      where("doctorID", "==", selectedDoctor.doctorID),
      where("date", "==", form.preferredDate),
      where("time", "==", form.preferredTime),
      where("status", "==", "booked"),
    );

    const clashSnapshot = await getDocs(clashQuery);

    if (!clashSnapshot.empty) {
      toast.success(
        "This time slot is already booked. Please select another time.",
      );
      return;
    }

    const appointmentDateTime = new Date(
      `${form.preferredDate} ${form.preferredTime}`,
    );
    try {
      await addDoc(collection(db, "appointments"), {
        appointmentID,
        patientID,
        doctorID: selectedDoctor.doctorID,
        doctorName: selectedDoctor.doctorName,
        specialization: selectedDoctor.specialization,

        priority: form.priority,
        date: form.preferredDate,
        time: form.preferredTime,
        appointmentDateTime,

        reason: form.reason,
        symptoms: form.symptoms,

        status: "booked",
        createdAt: new Date(),
      });

      toast.success("Appointment booked successfully!");
      navigate("/myvisits");
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  }
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "doctors"));

        const doctorList = snapshot.docs.map((doc) => ({
          id: doc.id, // Firestore doc ID
          ...doc.data(),
        }));

        setDoctors(doctorList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, preferredTime: "" }));
  }, [form.doctor, form.preferredDate]);

  const selectedDoctor = doctors.find((doc) => doc.doctorID === form.doctor);

  // Generate time slots 9 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const formatted = new Date(0, 0, 0, hour).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      slots.push(formatted);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-slate-50 text-black selection:bg-teal-100">
      <div className="flex w-full flex-col gap-10 px-20 ">
        {/* HEADER - High Definition */}
        <header className="flex flex-col gap-4 border-b-4 border-[#009999] pb-10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#009999]" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#009999]">
              Scheduling Portal
            </p>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-black sm:text-5xl">
            Book an appointment
          </h1>
          <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-500">
            Share your symptoms and preferred schedule. We’ll prioritize your
            care and confirm your slot instantly.
          </p>
        </header>

        {/* MAIN FORM - Defined & Sleek */}
        <form
          onSubmit={submitForm}
          className="rounded-[3rem] border-2 border-slate-200 bg-white p-10 shadow-[0_30px_70px_rgba(0,153,153,0.08)] sm:p-10"
        >
          <div className="grid gap-10">
            {/* Personal Info Group */}
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
                Full name
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField}
                  required
                  className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                  placeholder="Alex Morgan"
                />
              </label>
              <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
                Phone Number
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value;

                    // allow only digits, max 10
                    if (/^\d{0,10}$/.test(value)) {
                      setForm((prev) => ({ ...prev, phone: value }));
                    }
                  }}
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d{10}"
                  className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                  placeholder="10 digit phone number"
                />
              </label>
            </div>

            {/* Reason */}
            <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
              Primary Reason for Visit
              <input
                name="reason"
                value={form.reason}
                onChange={updateField}
                required
                className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                placeholder="Brief description of the issue"
              />
            </label>

            {/* Symptoms */}
            <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
              Symptom Summary
              <textarea
                name="symptoms"
                value={form.symptoms}
                onChange={updateField}
                rows={4}
                className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                placeholder="How long have you felt this way? Any current meds?"
              />
            </label>

            {/* Schedule & Doctor */}
            {/* Schedule & Doctor - Parallel Layout */}
            <div className="grid gap-8 sm:grid-cols-3">
              <label className="flex flex-col gap-3 text-m font-bold text-black uppercase tracking-wide">
                Select Doctor
                <div className="relative">
                  <select
                    name="doctor"
                    value={form.doctor}
                    onChange={updateField}
                    required
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.doctorID}>
                        Dr. {doc.doctorName} - {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              {/* PREFERRED DATE */}
              <label className="flex flex-col gap-3 text-m font-bold text-black uppercase tracking-wide">
                Select Date
                <input
                  type="date"
                  name="preferredDate"
                  value={form.preferredDate}
                  onChange={updateField}
                  required
                  min={new Date().toISOString().split("T")[0]} // 🚀 disables past dates
                  className="w-full rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:outline-none"
                />
              </label>

              {/* PREFERRED TIME SLOT */}
              <label className="flex flex-col gap-3 text-m font-bold text-black uppercase tracking-wide">
                Time Slot
                <select
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={updateField}
                  required
                  disabled={!form.preferredDate}
                  className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:outline-none"
                >
                  <option value="">Select Time</option>

                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>

              {/* SELECT DOCTOR */}
            </div>

            {/* Priority Section */}
            <div className="grid gap-5">
              <p className="text-m font-black uppercase tracking-[0.2em] text-[#009999]">
                Assign Priority
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {PRIORITIES.map((option) => (
                  <label
                    key={option.id}
                    className={`group cursor-pointer rounded-3xl border-2 px-6 py-6 transition-all ${
                      form.priority === option.id
                        ? "border-[#009999] bg-[#009999]/5 shadow-inner"
                        : "border-slate-100 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={option.id}
                      checked={form.priority === option.id}
                      onChange={updateField}
                      className="sr-only"
                    />
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-lg font-black ${form.priority === option.id ? "text-[#009999]" : "text-black"}`}
                      >
                        {option.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500">
                        {option.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="mt-6 rounded-full bg-[#009999] py-6 text-sm font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-[#009999]/30 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95"
            >
              Confirm Appointment
            </button>
          </div>
        </form>

        <footer className="mb-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 sm:flex-row">
          <span>PulsePoint Bot System</span>
          <span>Encrypted Patient Data</span>
        </footer>
      </div>
    </div>
  );
}
