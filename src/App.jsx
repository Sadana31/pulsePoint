import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { User, Stethoscope } from "lucide-react";
import Login from "./screens/patient/login";
import PatientChatbot from "./screens/patient/patientChatbot";
import AppointmentRequest from "./screens/patient/appointmentRequest";
import MyAppointments from "./screens/patient/myAppointments";
import Layout from "./components/Layout";
import EmergencyGuidance from "./screens/patient/emergencyGuidance";
import CommonSymptoms from "./screens/patient/commonSymptoms";
import MessageDoctor from "./screens/patient/messageDoctor";
import RescheduleAppointment from "./screens/patient/rescheduleAppointment";
import Home from "./screens/patient/dashboard";
import Profile from "./screens/patient/profile";
import DoctorLogin from "./screens/doctor/doctorLogin";
import DoctorAnswering from "./screens/doctor/answerQueries";
import DoctorProfile from "./screens/doctor/doctorProfile";
import DoctorLayout from "./components/doctorLayout";
import DoctorAppointments from "./screens/doctor/doctorSchedule";
import MyAnswers from "./screens/patient/myAnswers";
import { Toaster } from "react-hot-toast";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f1f4f9] flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-[#009999] mb-2">
        Welcome to PulsePoint
      </h1>

      <p className="text-gray-600 mb-12 text-[22px]">
        Please select your role to continue
      </p>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">

        {/* Patient Card */}
        <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#009688] rounded-full flex items-center justify-center mb-6">
            <User size={40} color="white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            I am a Patient
          </h2>

          <p className="text-gray-500 mb-8">
            Manage appointments and talk to Doctors.
          </p>

<button
  onClick={() => navigate("/login")} 
  className="w-full py-3 bg-[#009688] text-white rounded-xl font-semibold"
>
  Enter Patient Portal
</button>
        </div>

        {/* Doctor Card */}
        <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#009688] rounded-full flex items-center justify-center mb-6">
            <Stethoscope size={40} color="white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            I am a Doctor
          </h2>

          <p className="text-gray-500 mb-8">
            Answer patient queries and view your schedule.
          </p>

          <button
            onClick={() => navigate("/doctorLogin")}
            className="w-full py-3 border-2 border-[#009688] text-[#009688] rounded-xl font-semibold"
          >
            Doctor Login
          </button>
        </div>

      </div>
    </div>
  );
}

// Inside App.js
export default function App() {
  return (

    
    // App.js
<>
<Toaster position="top-right" />
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login/*" element={<Login />} />
  <Route path="/doctorLogin/*" element={<DoctorLogin/>} />
  

  <Route element={<Layout/>}>
    <Route path="/dashboard" element={<Home />} />
    <Route path="/chat" element={<PatientChatbot />} />
    <Route path="/appointment" element={<AppointmentRequest />} />
    <Route path="/myvisits" element={<MyAppointments />} />
    <Route path="/emergency" element={<EmergencyGuidance />} />
    <Route path="/library" element={<CommonSymptoms />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/messageDoctor" element={<MessageDoctor />} />
    <Route path="/reschedule" element={<RescheduleAppointment />} />
    <Route path="/answers" element={<MyAnswers />} />
  </Route>

  <Route element={<DoctorLayout />}>
    <Route path="/answer" element={<DoctorAnswering/>} />
    <Route path="/doctorProfile" element={<DoctorProfile/>} />
    <Route path="/doctorSchedule" element={<DoctorAppointments/>} />
  </Route>
  
</Routes>
</>
  );
}