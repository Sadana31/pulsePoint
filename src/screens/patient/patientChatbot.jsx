import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { classifyMessage } from "../../services/triageEngine";

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "assistant",
    text: "Hi! I'm PulsePoint Bot. I can help with symptoms, medications, and appointment prep. What is going on today?"
  }
];

const QUICK_PROMPTS = [
  "Check if my symptoms need urgent care",
  "How should I prepare for my appointment?",
  "What can I do for pain relief today?"
];

export default function PatientChatbot() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [triageState, setTriageState] = useState({ symptoms: [], askedQuestions: [], score: 0 });
  
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); // Reference for auto-scroll

  // --- AUTO SCROLL LOGIC ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  function sendMessage(overrideText) {
    const text = typeof overrideText === "string" ? overrideText : input.trim();
    if (!text) return;

    // 1. Add User Message
    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text }]);
    setInput("");
    
    // 2. Show Typing Bubble
    setIsTyping(true);

    // 3. Process Logic
    const result = classifyMessage(text, triageState);

    setTimeout(() => {
      setIsTyping(false); // Hide dots
      
      // 4. Add Bot Response
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now() + 1, 
          sender: "assistant", 
          text: result.botResponse,
          showBookingButton: result.final || result.botResponse.includes("schedule") // Logic to show button
        }
      ]);

      if (result.state) setTriageState(result.state);

        // 5. Emergency Navigation
if (result.navigate) {
  navigate(result.navigate);
  return;
}
    }, 1500); // 1.5s delay for the "Typing" feel
  }

  



  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <div className=" flex w-full flex-col gap-8 px-20">
        
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#009999]">AI Medical Assistant</p>
            <h1 className="text-4xl font-black tracking-tight text-black">PulsePoint Bot</h1>
          </div>
          <Link to="/emergency" className="rounded-full bg-red-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-red-700 shadow-lg shadow-red-200">
            Emergency Guidance
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* SIDEBAR */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-[2rem] border-2 border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#009999]">Quick Prompts</h2>
              <div className="mt-6 flex flex-col gap-3">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-sm font-medium text-black transition-all hover:border-[#009999] hover:bg-slate-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border-4 border-red-300 bg-red-50 p-6 shadow-md">
              <h3 className="text-sm font-black uppercase text-red-600 tracking-tighter">Critical Warning</h3>
              <p className="mt-2 text-sm text-black leading-relaxed">
                If you are experiencing <strong>chest pain</strong>, <strong>shortness of breath</strong>, or <strong>uncontrolled bleeding</strong>, call emergency services immediately.
              </p>
            </div>
          </aside>

          {/* CHAT BOX */}
          <section className="flex h-[620px] flex-col overflow-hidden rounded-[2.5rem] border-2 border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#009999] animate-pulse" />
                <h2 className="text-lg font-bold text-black">Live Consultation</h2>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Secure Terminal</span>
            </div>

            {/* MESSAGE AREA */}
            <div className="flex-1 space-y-6 overflow-y-auto px-8 py-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[80%] rounded-3xl px-6 py-4 text-[15px] leading-relaxed ${
                      msg.sender === "user" ? "bg-[#009999] text-white rounded-tr-none" : "bg-slate-100 text-black rounded-tl-none border border-slate-200"
                    }`}>
                    {msg.text}
                  </div>
                  
                  {/* DYNAMIC BOOKING BUTTON */}
                  {msg.showBookingButton && (
                    <button 
                      onClick={() =>
  navigate("/appointment", {
    state: {
      reason: triageState.symptoms?.join(", "),
      symptoms: [...new Set(triageState.symptoms)]
  .filter(s => s.length > 2 && !["yes", "no", "ok"].includes(s))
  .join(" | "),
    }
  })
}
                      className="mt-4 rounded-2xl bg-white border-2 border-[#009999] px-6 py-3 text-sm font-bold text-[#009999] hover:bg-[#009999] hover:text-white transition-all shadow-md active:scale-95"
                    >
                      📅 Book Appointment Now
                    </button>
                  )}
                </div>
              ))}

              {/* TYPING BUBBLE INDICATOR */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-3xl px-6 py-4 border border-slate-200 flex gap-1 items-center">
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="border-t border-slate-100 p-6 bg-white">
              <div className="flex gap-3 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 p-1.5 focus-within:border-[#009999] transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Describe how you're feeling..."
                  className="flex-1 bg-transparent px-6 py-3 text-sm text-black focus:outline-none placeholder:text-slate-400"
                />
                <button onClick={sendMessage} className="rounded-full bg-[#009999] px-8 py-3 text-sm font-bold text-white transition-all hover:brightness-110 shadow-md">
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}