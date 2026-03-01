import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { auth } from "../../firebase";
import toast from "react-hot-toast";

export default function Profile() {
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
        const q = query(
          collection(db, "patients"),
          where("email", "==", currentUser.email)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];

          setUser(docSnap.data());
          setFormData(docSnap.data());
          setDocId(docSnap.id); // 🔥 important for update
        } else {
          console.log("No patient found with this email.");
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;

  // Phone validation (10 digits max, numbers only)
  if (name === "phone" || name === "emergencyPhone") {
    if (/^\d{0,10}$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    return;
  }

  // Email validation (basic)
  if (name === "email") {
    setFormData((prev) => ({ ...prev, email: value }));
    return;
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
};
const saveChanges = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("User not authenticated.");
      return;
    }

    let userRef;

    // If document already exists → update
    if (docId) {
      userRef = doc(db, "patients", docId);
      await updateDoc(userRef, formData);
      toast.success("Profile updated successfully!");
    } 
    // If document does NOT exist → create
    else {
      userRef = doc(collection(db, "patients")); // auto ID

      const newPatient = {
        ...formData,
        email: currentUser.email,
        patientID: userRef.id,
        createdAt: new Date(),
      };

      await setDoc(userRef, newPatient);

      setDocId(userRef.id);
      setUser(newPatient);
      setFormData(newPatient);

      toast.success("Profile created successfully!");
    }

    setIsEditing(false);

  } catch (error) {
    console.error("Error saving profile:", error);
    toast.error("Something went wrong.");
  }
};

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center">
        <p className="text-[#009999] font-bold text-lg">
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-7xl h-full flex flex-col gap-4">

        {/* TOP SECTION */}
        <div className="flex gap-4 h-[30%]">
          <header className="flex-[2] rounded-3xl bg-white border-2 border-slate-100 p-8 shadow-sm flex items-center gap-8">
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-[#009999] flex items-center justify-center text-5xl shadow-lg">
              👤
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-widest text-[#009999] mb-1">
                Authenticated Identity
              </p>

              {isEditing ? (
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="text-4xl font-black text-black tracking-tight border-b-2 border-[#009999] outline-none w-full bg-slate-50 rounded px-2"
                />
              ) : (
                <h1 className="text-5xl font-black text-black tracking-tight leading-tight">
                  {formData.name}
                </h1>
              )}

              <p className="text-lg font-bold text-slate-400 mt-2">
                Patient ID: {formData.patientID}
              </p>
            </div>
          </header>

          <div className="flex-1 rounded-3xl bg-white border-2 border-slate-100 p-8 flex items-center justify-around shadow-sm">
            <div className="text-center">
              <p className="text-4xl font-black text-black">12</p>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest mt-1">
                Reports
              </p>
            </div>

            <div className="h-12 w-px bg-slate-200" />

            <div className="text-center">
              <p className="text-4xl font-black text-[#009999]">
                {formData.bloodGroup || "—"}
              </p>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest mt-1">
                Blood Group
              </p>
            </div>

            <div className="h-12 w-px bg-slate-200" />

            <div className="text-center">
              <p className="text-4xl font-black text-black">
                {formData.createdAt?.toDate
                  ? formData.createdAt.toDate().getFullYear()
                  : "—"}
              </p>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest mt-1">
                Join Date
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex gap-4 h-[70%]">
          <section className="flex-[2] rounded-3xl bg-white border-2 border-slate-100 p-10 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-black">
                Account Registry
              </h2>

              <button
                onClick={isEditing ? saveChanges : () => setIsEditing(true)}
                className={`px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                  isEditing
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-[#009999] text-white hover:opacity-90"
                }`}
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <DetailBox label="Full Name" name="name" value={formData.name} isEditing={isEditing} onChange={handleChange} />
              <DetailBox label="Biological Age" name="age" value={formData.age} isEditing={isEditing} onChange={handleChange} />
              <DetailBox label="Blood Group" name="bloodGroup" value={formData.bloodGroup} isEditing={isEditing} onChange={handleChange} />
              <DetailBox label="Primary Phone" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleChange} />
              <DetailBox label="Registry Email" name="email" value={formData.email} isEditing={isEditing} onChange={handleChange} />
              <DetailBox label="Current Location" name="location" value={formData.location} isEditing={isEditing} onChange={handleChange} />
            </div>
          </section>

          {/* EMERGENCY SECTION */}
          <div className="flex-1 flex flex-col gap-4">
            <section className="flex-1 rounded-3xl bg-gradient-to-br from-[#009999] to-[#007777] p-10 text-white shadow-xl flex flex-col justify-center">
  <h3 className="text-xl font-black uppercase tracking-widest mb-6">
    Emergency Contact
  </h3>

  {isEditing ? (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-bold opacity-80">Contact Name</label>
        <input
          name="emergencyContact"
          value={formData.emergencyContact || ""}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg bg-white/20 px-3 py-2 outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-bold opacity-80">Contact Phone</label>
        <input
          name="emergencyPhone"
          value={formData.emergencyPhone || ""}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg bg-white/20 px-3 py-2 outline-none"
        />
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      <p className="text-2xl font-black">
        {formData.emergencyContact || "Not Provided"}
      </p>
      <p className="text-lg font-semibold opacity-90">
        {formData.emergencyPhone || "—"}
      </p>
    </div>
  )}
</section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, name, value, isEditing, onChange }) {
  const isAge = name === "age";
  const isBlood = name === "bloodGroup";

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
        {label}
      </p>

      {isEditing ? (
        isAge ? (
          <select
            name="age"
            value={value || ""}
            onChange={onChange}
            className="text-[20px] font-semibold border-b border-[#009999] bg-slate-50 outline-none w-full"
          >
            <option value="">Select Age</option>
            {[...Array(101)].map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        ) : isBlood ? (
          <select
            name="bloodGroup"
            value={value || ""}
            onChange={onChange}
            className="text-[20px] font-semibold border-b border-[#009999] bg-slate-50 outline-none w-full"
          >
            <option value="">Select Blood Group</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            value={value || ""}
            onChange={onChange}
            className="text-[20px] font-semibold border-b border-[#009999] bg-slate-50 outline-none w-full"
          />
        )
      ) : (
        <p className="text-[25px] font-semibold tracking-tight">
          {value || "—"}
        </p>
      )}
    </div>
  );
}