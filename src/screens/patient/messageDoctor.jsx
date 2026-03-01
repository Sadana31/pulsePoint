import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";
import toast from "react-hot-toast";

export default function MessageDoctor() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);

  const [form, setForm] = useState({
    doctor: "",
    category: "General Consultation",
    title: "",
    message: "",
    severity: 3
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      const snapshot = await getDocs(collection(db, "doctors"));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDoctors(list);
    };
    fetchDoctors();
  }, []);

  function updateField(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "severity" ? Number(value) : value
    }));
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const snapshot = await getDocs(
        query(collection(db, "patients"), where("email", "==", user.email))
      );

      if (!snapshot.empty) {
        setPatientData(snapshot.docs[0].data());
      }
    });

    return () => unsubscribe();
  }, []);

  async function submitForm(e) {
    e.preventDefault();
    if (!form.doctor) {
      toast.success("Select a doctor.");
      return;
    }

    setLoading(true);

    try {
      const selectedDoctor = doctors.find(
        doc => doc.doctorID === form.doctor
      );

      await addDoc(collection(db, "queries"), {
        doctorID: form.doctor,
        doctorName: selectedDoctor?.doctorName || "",
        patientID: patientData?.patientID,
        patientName: patientData?.name,
        patientEmail: patientData?.email,
        category: form.category,
        title: form.title,
        message: form.message,
        severity: form.severity,
        status: "open",
        createdAt: serverTimestamp()
      });

      toast.success("Message sent successfully!");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black selection:bg-teal-100">
      <div className="flex w-full flex-col gap-10 px-20">

        {/* HEADER */}
        <header className="flex flex-col gap-6 border-b-4 border-[#009999] pb-10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#009999]" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#009999]">
                  Secure Messaging
                </p>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-black sm:text-5xl leading-tight">
                Message your doctor
              </h1>
            </div>

            {/* 🔥 PARALLEL BUTTON */}
            <Link
              to="/answers"
              className="group flex items-center gap-3 rounded-2xl border-2 border-[#009999] bg-white px-8 py-4 transition-all hover:bg-[#009999] hover:text-white active:scale-95"
            >
              <span className="text-2xl transition-transform group-hover:scale-110">📩</span>
              <span className="text-sm font-black uppercase tracking-widest text-[#009999] group-hover:text-white">
                View My Answers
              </span>
            </Link>
          </div>

          <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-500">
            Send a structured clinical inquiry directly to your healthcare provider.
          </p>
        </header>

        {/* MAIN FORM */}
        <form
          onSubmit={submitForm}
          className="rounded-[3rem] border-2 border-slate-200 bg-white p-10 shadow-[0_30px_70px_rgba(0,153,153,0.08)]"
        >
          <div className="grid gap-10">
            {/* DOCTOR + CATEGORY */}
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
                Select Doctor
                <select
                  name="doctor"
                  value={form.doctor}
                  onChange={updateField}
                  required
                  className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.doctorID}>
                      Dr. {doc.doctorName} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
                Question Category
                <select
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none"
                >
                  <option>General Consultation</option>
                  <option>New Symptom</option>
                  <option>Medication Question</option>
                  <option>Follow-up Clarification</option>
                  <option>Test Result Question</option>
                  <option>Urgent Concern</option>
                </select>
              </label>
            </div>

            {/* TITLE */}
            <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
              Subject
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                required
                placeholder="Brief summary of your concern"
                className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none"
              />
            </label>

            {/* MESSAGE */}
            <label className="flex flex-col gap-3 text-m font-semibold text-black uppercase tracking-wide">
              Message Details
              <textarea
                name="message"
                value={form.message}
                onChange={updateField}
                rows={5}
                required
                placeholder="Describe your symptoms, timeline, medications, etc."
                className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-base font-medium transition-all focus:border-[#009999] focus:bg-white focus:outline-none"
              />
            </label>

            {/* SEVERITY */}
            <div className="flex flex-col gap-4">
              <p className="text-m font-black uppercase tracking-[0.2em] text-[#009999]">
                Severity Level: {form.severity}/10
              </p>
              <input
                type="range"
                name="severity"
                min="1"
                max="10"
                value={form.severity}
                onChange={updateField}
                className="accent-[#009999]"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 rounded-full bg-[#009999] py-6 text-sm font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-[#009999]/30 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>

        <footer className="mb-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 sm:flex-row">
          <span>PulsePoint Messaging System</span>
          <span>Encrypted Communication</span>
        </footer>
      </div>
    </div>
  );
}