import React, { useState } from 'react';

const mockAppointments = [
    { id: 1, patientName: "Eleanor Pena", age: 42, time: "09:00 AM", date: "Today", issue: "Routine Checkup", priority: "Low", avatar: "EP" },
    { id: 2, patientName: "Guy Hawkins", age: 28, time: "10:30 AM", date: "Today", issue: "Severe Migraines", priority: "High", avatar: "GH" },
    { id: 3, patientName: "Esther Howard", age: 64, time: "01:15 PM", date: "Today", issue: "Post-surgery observation", priority: "Medium", avatar: "EH" },
    { id: 4, patientName: "Wade Warren", age: 31, time: "03:00 PM", date: "Today", issue: "Sprained ankle", priority: "Low", avatar: "WW" }
];

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState(mockAppointments);

    const getPriorityColors = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-700 border-red-200';
            case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleAction = (patientName) => {
        console.log(`Open patient file for: ${patientName}`);
        // TODO: implement action
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Today's Appointments</h1>
                        <p className="text-slate-500 mt-2">You have {appointments.length} patients scheduled for today.</p>
                    </div>
                    <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                        <button className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-md">Upcoming</button>
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md">Past</button>
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md">Cancelled</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-200 shadow-sm">
                                        {apt.avatar}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">{apt.patientName}</h2>
                                        <p className="text-sm text-slate-500">{apt.age} years old</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColors(apt.priority)}`}>
                                    {apt.priority} Priority
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
                                <div className="flex items-center mb-2">
                                    <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="text-sm font-semibold text-slate-700">{apt.time} - {apt.date}</span>
                                </div>
                                <div className="flex items-start">
                                    <svg className="w-4 h-4 text-teal-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <span className="text-sm text-slate-600 line-clamp-2">{apt.issue}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(apt.patientName)}
                                    className="flex-1 bg-white border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                                >
                                    View Profile
                                </button>
                                <button
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-2.5 rounded-xl shadow-sm transition-colors text-sm"
                                >
                                    Start Consultation
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoctorAppointments;
