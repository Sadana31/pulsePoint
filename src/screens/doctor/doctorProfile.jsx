import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import toast from "react-hot-toast";

function generateDoctorID(name) {
  const cleanName = name.replace(/[^a-zA-Z]/g, "");
  const firstTwo = cleanName.substring(0, 2).toUpperCase();

  const randomDigits = Math.floor(100 + Math.random() * 900);
  // ensures 3-digit number (100–999)

  return firstTwo + randomDigits;
}

export default function DoctorProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [docId, setDocId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "doctors", currentUser.uid);
        const docSnap = await getDoc(docRef);

        // 🚀 IF DOCTOR DOES NOT EXIST → CREATE
        if (!docSnap.exists()) {
          const name = currentUser.displayName || "Doctor";
          const email = currentUser.email;
          const doctorID = generateDoctorID(name);

          const newDoctor = {
            doctorID,
            doctorName: name,
            email,
            specialization: "",
            experience: 0,
            createdAt: new Date(),
          };

          await setDoc(docRef, newDoctor);

          setUser(newDoctor);
          setFormData(newDoctor);
          setDocId(currentUser.uid);
        } else {
          let data = docSnap.data();

          // Safety check: if doctorID missing
          if (!data.doctorID) {
            const doctorID = generateDoctorID(data.doctorName);
            await updateDoc(docRef, { doctorID });
            data.doctorID = doctorID;
          }

          setUser(data);
          setFormData(data);
          setDocId(currentUser.uid);
        }
      } catch (error) {
        console.error("Error setting up doctor:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    if (!docId) return;

    if (!formData.specialization || !formData.licenseNumber) {
      toast.success("Please complete specialization and license details.");
      return;
    }

    try {
      const userRef = doc(db, "doctors", docId);
      await updateDoc(userRef, formData);
      setUser(formData);
      setIsEditing(false);
      toast.success("Professional profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.success("Update failed.");
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center">
        <p className="text-[#006666] font-black text-lg animate-pulse">
          VERIFYING CREDENTIALS...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 flex flex-col overflow-hidden p-8">
      <div className="mx-auto w-full max-w-7xl h-full flex flex-col gap-6">
        {/* TOP SECTION */}
        <div className="flex gap-6 h-[30%]">
          <header className="flex-[2] rounded-[2.5rem] bg-white border-2 border-slate-100 p-10 shadow-sm flex items-center gap-10">
            <div className="h-28 w-28 shrink-0 rounded-3xl bg-[#006666] flex items-center justify-center text-5xl shadow-xl shadow-[#006666]/20">
              👨‍⚕️
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#006666] mb-2">
                Verified Practitioner
              </p>
              {isEditing ? (
                <input
                  name="name"
                  value={formData.doctorName || ""}
                  onChange={handleChange}
                  className="text-4xl font-black text-black tracking-tight border-b-3 border-[#006666] outline-none w-full bg-slate-50 px-2"
                />
              ) : (
                <h1 className="text-5xl font-black text-black tracking-tight leading-tight">
                  Dr. {formData.doctorName}
                </h1>
              )}
              <p className="text-s font-black uppercase tracking-[0.3em] text-[#006666] mb-2">
                Doctor ID • {formData.doctorID}
              </p>
            </div>
          </header>

          <div className="flex-1 rounded-[2.5rem] bg-white border-2 border-slate-100 p-10 flex items-center justify-around shadow-sm">
            <div className="h-12 w-px bg-slate-100" />
            <div className="text-center">
              <p className="text-4xl font-black text-[#006666]">4.9</p>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                Rating
              </p>
            </div>
            <div className="h-12 w-px bg-slate-100" />
            <div className="text-center">
              <p className="text-4xl font-black text-black">150+</p>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                Patients
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex gap-6 h-[70%]">
          <section className="flex-[2] rounded-[2.5rem] bg-white border-2 border-slate-100 p-12 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-black text-black flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#006666]" />
                Professional Registry
              </h2>
              <button
                onClick={isEditing ? saveChanges : () => setIsEditing(true)}
                className={`px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                  isEditing
                    ? "bg-green-600 text-white shadow-lg shadow-green-200"
                    : "bg-[#006666] text-white hover:bg-slate-800"
                }`}
              >
                {isEditing ? "Commit Changes" : "Modify Profile"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-10">
              <DoctorDetail
                label="Medical License #"
                name="licenseNumber"
                value={formData.licenseNumber}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <DoctorDetail
                label="Primary Specialization"
                name="specialization"
                value={formData.specialization}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <DoctorDetail
                label="Clinical Affiliation"
                name="hospital"
                value={formData.hospital}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <DoctorDetail
                label="Contact Extension"
                name="phone"
                value={formData.phone}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <DoctorDetail
                label="Professional Email"
                name="email"
                value={formData.email}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <DoctorDetail
                label="Consultation Fee ($)"
                name="fee"
                value={formData.fee}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </section>

          <div className="flex-1 flex flex-col gap-6">
            <section className="flex-1 rounded-[2.5rem] bg-[#006666] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -right-6 -bottom-6 opacity-10 text-9xl font-black rotate-12">
                🩺
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-8 opacity-70">
                Shift Schedule
              </h3>
              <div className="space-y-6 relative z-10">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">
                    Current Cycle
                  </p>
                  <p className="text-xl font-bold">Mon — Fri • 09:00 - 17:00</p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">
                    On-Call Status
                  </p>
                  <p className="text-xl font-bold text-teal-300">
                    Available for Emergency
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorDetail({ label, name, value, isEditing, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[15px] font-black text-black font-semibold uppercase tracking-[0.2em]">
        {label}
      </p>
      {isEditing ? (
        <input
          name={name}
          value={value || ""}
          onChange={onChange}
          className="text-xl font-bold border-b-2 border-[#006666] bg-slate-50 outline-none w-full py-1"
        />
      ) : (
        <p className="text-2xl font-bold text-slate-800 tracking-tight">
          {value || "—"}
        </p>
      )}
    </div>
  );
}
