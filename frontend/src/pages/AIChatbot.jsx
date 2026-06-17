import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { MessageSquare, Send, Bot, User, HelpCircle, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { askChatbot } from '../services/api';

export const AIChatbot = () => {
  const { user, language, t } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: language === 'te' 
        ? "నమస్కారం! నేను మీ కృత్రిమ మేధస్సు (AI) వ్యవసాయ సహాయకుడిని. మీ పంటల గురించి ఏవైనా ప్రశ్నలు ఉంటే అడగండి."
        : "Hello! I am your AI farming assistant. Ask me anything about crop recommendations, pest control, or weather changes.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [audioActive, setAudioActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    { text: "When should I water my Paddy?", telugu: "నా వరి పంటకు నీరు ఎప్పుడు పెట్టాలి?" },
    { text: "What fertilizer is best for Cotton?", telugu: "పత్తి పంటకు ఏ ఎరువులు శ్రేష్ఠం?" },
    { text: "How to prevent Leaf Curl in Chillies?", telugu: "మిరప ఆకు ముడత తెగులు నివారణ ఎలా?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    // Add user message
    const userMsg = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const currentHistory = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const data = await askChatbot(textToSend, currentHistory, user?.id, language);
      const responseText = data.response;

      setMessages(prev => [...prev, {
        sender: "bot",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      if (audioActive) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.lang = language === 'te' ? 'te-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Chat API error:", err);
      // Local fallback logic
      let responseText = "";
      const query = textToSend.toLowerCase();

      if (query.includes("water") || query.includes("irrigation") || query.includes("నీరు")) {
        responseText = language === 'te'
          ? `రైతు సోదరా, మీ పొలం మట్టి రకం: ${user?.soil_type || user?.soilType || "ఎర్ర ఇసుక"}. ప్రస్తుత వాతావరణ పరిస్థితుల దృష్ట్యా పంటకు ప్రతి 4-5 రోజులకు ఒకసారి తేలికపాటి తడులు ఇవ్వడం అవసరం. ముఖ్యంగా పొట్టదశలో నీరు నిలకడగా ఉండేలా చూసుకోండి.`
          : `Dear Farmer, since your soil type is ${user?.soil_type || user?.soilType || "Red Sandy"}, you should irrigate your field every 4-5 days. Ensure standing water during critical stages.`;
      } else if (query.includes("fertilizer") || query.includes("ఎరువులు")) {
        responseText = language === 'te'
          ? "పంట పూత దశలో ఉన్నప్పుడు ఎకరానికి 50 కిలోల యూరియా మరియు 15 కిలోల పొటాష్ మొదటి దఫాగా వేయండి. ఎరువులు వేసేటప్పుడు మట్టిలో తగినంత తేమ ఉండేలా చూసుకోండి."
          : "Apply 50 kg Urea and 15 kg MOP (Muriate of Potash) per acre. Ensure adequate soil moisture during fertilizer application.";
      } else if (query.includes("leaf curl") || query.includes("ముడత")) {
        responseText = language === 'te'
          ? "ఆకు ముడత మరియు తెగుళ్ళ నివారణకు ఎకరానికి డయాఫెన్థియురాన్ (Polo) 240 గ్రాములు లేదా ఫిప్రోనిల్ 400 మి.లీ చొప్పున 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి."
          : "To prevent Leaf Curl or pest infestation, spray Diafenthiuron @ 240g or Fipronil @ 400ml in 200 liters of water per acre.";
      } else {
        responseText = language === 'te'
          ? `ధన్యవాదాలు. మీ ప్రశ్నను విశ్లేషిస్తున్నాను. మీ ప్రాంతం ${user?.village || "నల్గొండ"} పంట పరిస్థితులకు అనుగుణంగా త్వరలో సమగ్ర సమాచారం అందిస్తాను.`
          : `Analyzing your query for your farm in ${user?.village || "Nalgonda"}. Based on your farm profile, we recommend maintaining balanced nitrogen dressing.`;
      }

      setMessages(prev => [...prev, {
        sender: "bot",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between page-fade-in relative">
      
      {/* Background ambient glowing shapes */}
      <div className="absolute top-10 right-20 w-64 h-64 bg-green-500/5 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-green-500/20 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <MessageSquare className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-100 glow-text-green">{t('aiChatbot')}</h2>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">24/7 personal agronomy advisor linked to local agricultural databases.</p>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setAudioActive(!audioActive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-300
            ${audioActive 
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]' 
              : 'border-green-500/20 text-slate-400 hover:text-slate-200'
            }
          `}
        >
          {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>Voice Output: {audioActive ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-grow overflow-y-auto glass-panel p-6 rounded-2xl border border-green-500/15 space-y-4 max-h-[calc(100vh-320px)] mb-4">
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0
              ${msg.sender === 'user' 
                ? 'bg-slate-900 border-green-500/30 text-green-400' 
                : 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.25)]'
              }
            `}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-1">
              <div className={`p-4 rounded-2xl border text-xs leading-normal
                ${msg.sender === 'user'
                  ? 'bg-green-950/20 border-green-500/30 text-slate-200 rounded-tr-none'
                  : 'bg-slate-950/50 border-green-500/10 text-slate-300 rounded-tl-none'
                }
              `}>
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
              <span className="block text-[9px] font-mono text-slate-500 text-right px-1">{msg.time}</span>
            </div>

          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto animate-fade-in">
            <div className="w-8 h-8 rounded-lg border bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.25)] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-1">
              <div className="p-4 rounded-2xl border border-green-500/10 bg-slate-950/50 text-slate-400 rounded-tl-none flex items-center gap-1.5 h-10 px-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length === 1 && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(language === 'te' ? q.telugu : q.text)}
              className="glass-panel p-3 rounded-xl border border-green-500/10 hover:border-green-500/30 text-left text-xs font-sans text-slate-400 hover:text-green-300 transition-all card-3d flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{language === 'te' ? q.telugu : q.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Box Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
        className="flex gap-3 items-center"
      >
        <input
          type="text"
          value={inputValue}
          disabled={loading}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={language === 'te' ? "వ్యవసాయ సంబంధిత ప్రశ్న టైప్ చేయండి..." : "Ask your agronomy question..."}
          className="flex-grow bg-slate-950/60 border border-green-500/20 focus:border-green-500/60 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-all focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="py-3 px-5 bg-green-600 hover:bg-green-500 disabled:bg-green-950/40 disabled:text-slate-600 disabled:border-transparent text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center border border-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.25)] glow-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
