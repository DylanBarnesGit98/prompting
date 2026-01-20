import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, Zap, Brain, GitCompare, AlertCircle, Sparkles, Send, CheckCircle, Info, Target, ListChecks, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TechniquesLab = () => {
  const [selectedTechnique, setSelectedTechnique] = useState('zero-shot');
  const [userPrompt, setUserPrompt] = useState('');
  const [basicResponse, setBasicResponse] = useState('');
  const [enhancedResponse, setEnhancedResponse] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [qualityScore, setQualityScore] = useState(null);

  const techniques = [
    {
      id: 'zero-shot',
      name: 'Zero-Shot Prompting',
      icon: Zap,
      title: 'Die Kunst der direkten Anweisung',
      fullDescription: 'Bei Zero-Shot gibst du der KI eine Aufgabe ohne jegliche Vorbeispiele. Es ist die schnellste Methode und zeigt, wie gut das Modell allgemeine Konzepte versteht. Ideal für einfache Fragen, Zusammenfassungen oder kreative Texte.',
      description: 'Direkte Anweisung ohne Beispiele - schnell und effizient für Standardaufgaben.',
      example: 'Erkläre, was Fotosynthese ist.',
      enhanced: 'Erkläre in 3 prägnanten Sätzen, was Fotosynthese ist und warum sie für das Leben auf der Erde wichtig ist.',
      tip: 'Sei spezifisch! Je klarer deine Anweisung, desto besser das Ergebnis.',
      color: 'blue'
    },
    {
      id: 'few-shot',
      name: 'Few-Shot Prompting',
      icon: Brain,
      title: 'Lernen durch Mustererkennung',
      fullDescription: 'Hier fütterst du die KI mit 2-5 Beispielen (Shots), bevor du die eigentliche Aufgabe stellst. Dadurch lernt das Modell deinen gewünschten Stil, das Format oder komplexe Klassifizierungen. Es reduziert Fehler bei Nuancen drastisch.',
      description: 'Zeige Beispiele, damit die KI das gewünschte Muster und den Stil exakt kopiert.',
      example: 'Klassifiziere die Stimmung:\nText: "Ich liebe diesen Film!"\nStimmung: Positiv\n\nText: "Das war schrecklich."\nStimmung:',
      enhanced: 'Klassifiziere die Stimmung:\nText: "Ich liebe diesen Film!"\nStimmung: Positiv\n\nText: "Das war schrecklich."\nStimmung: Negativ\n\nText: "Ganz okay, nichts Besonderes."\nStimmung: Neutral\n\nText: "Absolut fantastisch!"\nStimmung:',
      tip: 'Wähle repräsentative Beispiele, die das gewünschte Muster klar zeigen.',
      color: 'purple'
    },
    {
      id: 'chain-of-thought',
      name: 'Chain-of-Thought (CoT)',
      icon: GitCompare,
      title: 'Logisches Denken aktivieren',
      fullDescription: 'Diese Technik zwingt die KI dazu, Zwischenschritte zu formulieren, anstatt sofort eine Antwort zu "raten". Besonders bei Logik, Mathe oder strategischen Entscheidungen führt das explizite "Schritt-für-Schritt-Denken" zu deutlich korrekteren Ergebnissen.',
      description: 'Bringt die KI dazu, komplexe Probleme erst zu analysieren, bevor sie antwortet.',
      example: 'Wenn ein Zug 120 km in 2 Stunden fährt, wie schnell ist er?',
      enhanced: 'Wenn ein Zug 120 km in 2 Stunden fährt, wie schnell ist er?\n\nDenke Schritt für Schritt:\n1. Welche Formel brauchen wir?\n2. Setze die Werte ein\n3. Berechne das Ergebnis\n4. Gib die Antwort mit Einheit',
      tip: 'Füge "Lass uns Schritt für Schritt denken" hinzu.',
      color: 'green'
    }
  ];

  const currentTechnique = techniques.find(t => t.id === selectedTechnique);

  // LOGIK (Identisch)
  const analyzePromptQuality = (prompt) => {
    const issues = [];
    let score = 100;
    if (prompt.length < 20) { issues.push({ type: 'warning', text: 'Prompt ist sehr kurz - sei spezifischer!' }); score -= 20; }
    const vagueWords = ['gut', 'schön', 'nice', 'irgendwie', 'vielleicht'];
    if (vagueWords.some(word => prompt.toLowerCase().includes(word))) { issues.push({ type: 'error', text: 'Vermeide vage Begriffe!' }); score -= 15; }
    if (!prompt.match(/format|struktur|länge|wörter|sätze|liste|tabelle/i)) { issues.push({ type: 'info', text: 'Tipp: Gib ein Format an.' }); score -= 10; }
    return { score: Math.max(0, score), issues };
  };

  const testPrompt = async (isEnhanced = false) => {
    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) { alert('API Key fehlt!'); return; }
    setLoading(true);
    const promptToTest = isEnhanced ? currentTechnique.enhanced : currentTechnique.example;
    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToTest, apiKey })
      });
      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'Keine Antwort';
      if (isEnhanced) setEnhancedResponse(result); else setBasicResponse(result);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const testUserPrompt = async () => {
    if (!userPrompt.trim()) return;
    const quality = analyzePromptQuality(userPrompt);
    setQualityScore(quality);
    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) { alert('API Key fehlt!'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, apiKey })
      });
      const data = await response.json();
      setUserResponse(data.choices?.[0]?.message?.content || 'Keine Antwort');
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-2 hover:text-blue-600 transition-colors">
              <ArrowLeft size={14} /> Zurück zu den Prompt-Basics
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fortgeschrittene Methoden</h1>
            <p className="text-slate-500 font-light italic">Vom einfachen Befehl zur präzisen Steuerung</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: TECHNIQUE SELECTOR */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Methode wählen</h3>
              <div className="space-y-3">
                {techniques.map((tech) => {
                  const Icon = tech.icon;
                  const isActive = selectedTechnique === tech.id;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => { setSelectedTechnique(tech.id); setBasicResponse(''); setEnhancedResponse(''); }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                        isActive ? 'border-blue-500 bg-blue-50/50 shadow-md scale-[1.02]' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                          <Icon size={20} />
                        </div>
                        <span className={`font-bold ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>{tech.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{tech.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentTechnique && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-yellow-400 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">Pro-Insight</h4>
                    <p className="text-sm text-slate-300 leading-relaxed italic">"{currentTechnique.tip}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: DYNAMIC EXPLANATION & COMPARISON */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* NEW: DYNAMIC INFO CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${
                    currentTechnique.id === 'zero-shot' ? 'bg-blue-50 border-blue-200 text-blue-500' :
                    currentTechnique.id === 'few-shot' ? 'bg-purple-50 border-purple-200 text-purple-500' :
                    'bg-green-50 border-green-200 text-green-500'
                }`}>
                  <currentTechnique.icon size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">{currentTechnique.title}</h2>
                  <p className="text-slate-600 leading-relaxed text-sm">{currentTechnique.fullDescription}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BASIC PROMPT CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><HelpCircle size={10}/> Standard-Versuch</span>
                  <button onClick={() => testPrompt(false)} disabled={loading} className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-tighter transition-colors">Test Run</button>
                </div>
                <div className="p-5 flex-1 font-mono text-xs text-slate-600 bg-white italic whitespace-pre-wrap">
                   {currentTechnique?.example}
                </div>
                {basicResponse && (
                  <div className="p-5 bg-red-50/30 border-t border-red-100 animate-in slide-in-from-bottom-2">
                    <p className="text-xs text-red-800 leading-relaxed font-medium">{basicResponse}</p>
                  </div>
                )}
              </div>

              {/* ENHANCED PROMPT CARD */}
              <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-500 overflow-hidden flex flex-col scale-[1.03] z-10">
                <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 flex items-center gap-1">
                    <Sparkles size={12} /> {currentTechnique.name}
                  </span>
                  <button onClick={() => testPrompt(true)} disabled={loading} className="text-xs font-black bg-white text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter hover:bg-blue-50 transition-colors">Test Run</button>
                </div>
                <div className="p-5 flex-1 font-mono text-xs text-blue-900 bg-blue-50/20 font-bold whitespace-pre-wrap">
                   {currentTechnique?.enhanced}
                </div>
                {enhancedResponse && (
                  <div className="p-5 bg-white border-t border-blue-100 animate-in slide-in-from-bottom-2">
                    <p className="text-xs text-blue-800 leading-relaxed font-bold">{enhancedResponse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* PRACTICE AREA */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-900 flex justify-between items-center">
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">Spielwiese: Eigenes Training</h3>
                    <p className="text-slate-400 text-xs">Schreibe einen Prompt und lass die Qualität in Echtzeit bewerten.</p>
                </div>
                <ListChecks className="text-blue-500 opacity-50" size={32} />
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Dein Prompt zum Testen..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium"
                  rows={4}
                />
                <button
                  onClick={testUserPrompt}
                  disabled={loading || !userPrompt.trim()}
                  className="w-full bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'Analysiere...' : <><Send size={16} /> Analysieren & Absenden</>}
                </button>

                {qualityScore && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 animate-in fade-in">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-1">Score</span>
                      <span className={`text-3xl font-black ${qualityScore.score >= 80 ? 'text-green-500' : 'text-orange-500'}`}>
                        {qualityScore.score}
                      </span>
                    </div>
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Feedback-Bericht</span>
                      {qualityScore.issues.length > 0 ? qualityScore.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                          <span className={`${issue.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                             {issue.type === 'error' ? '●' : '○'}
                          </span>
                          {issue.text}
                        </div>
                      )) : (
                        <p className="text-[11px] text-green-600 font-bold flex items-center gap-2"><CheckCircle size={14}/> Perfekt formuliert!</p>
                      )}
                    </div>
                  </div>
                )}

                {userResponse && (
                  <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-8 border-l-blue-500 animate-in slide-in-from-left-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">KI-Resultat</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed italic">{userResponse}</p>
                  </div>
                )}
              </div>
            </div>

            <Link 
              to="/advanced"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-black flex items-center justify-center gap-3 transition-all shadow-xl uppercase tracking-widest text-sm"
            >
              Mastery-Lab: Experten-Workflows <ArrowRight size={20} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default TechniquesLab;