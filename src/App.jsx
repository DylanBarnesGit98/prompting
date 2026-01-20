import React, { useState } from 'react';
import { Send, Lightbulb, CheckCircle, XCircle, Key, Brain, ArrowRight, Clipboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import promptingImage from './assets/prompting.png';

const PromptCraft = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [promptData, setPromptData] = useState({
    aufgabe: '',
    kontext: '',
    format: '',
    beispiel: '',
    persona: '',
    tonfall: ''
  });
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!localStorage.getItem('openrouter_api_key'));

  const steps = [
    {
      id: 'aufgabe',
      title: 'Aufgabe',
      label: 'Was genau will ich erreichen?',
      placeholder: 'z.B. "Schreibe eine E-Mail an mein Team über die neue Projektstruktur"',
      category: 'Essenziell',
      tip: 'Sei spezifisch! Eine klare Aufgabe ist die Grundlage für gute Ergebnisse.'
    },
    {
      id: 'kontext',
      title: 'Kontext',
      label: 'Um was geht\'s?',
      placeholder: 'z.B. "Wir haben unser Projekt in 3 Arbeitspakete aufgeteilt: UX, Backend, Frontend"',
      category: 'Wichtig',
      tip: 'Kontext hilft der KI, die Situation zu verstehen und relevanter zu antworten.'
    },
    {
      id: 'format',
      title: 'Format',
      label: 'Wie will ich meine Ausgabe haben?',
      placeholder: 'z.B. "Formelle E-Mail, ca. 200 Wörter, mit Bullet Points"',
      category: 'Wichtig',
      tip: 'Gib das gewünschte Format vor - Länge, Struktur, Stil.'
    },
    {
      id: 'beispiel',
      title: 'Beispiel',
      label: 'Ctrl+C → Ctrl+V',
      placeholder: 'z.B. "Ähnlich wie: \'Liebes Team, ich möchte euch über...\'"',
      category: 'Nice to have',
      tip: 'Beispiele zeigen der KI genau, was du möchtest.'
    },
    {
      id: 'persona',
      title: 'Persona',
      label: 'Wer soll antworten?',
      placeholder: 'z.B. "Du bist ein erfahrener Projektmanager mit 10 Jahren Erfahrung"',
      category: 'Nice to have',
      tip: 'Eine Persona gibt der KI eine Perspektive und Expertise.'
    },
    {
      id: 'tonfall',
      title: 'Tonfall',
      label: 'Welche Emotionen will ich?',
      placeholder: 'z.B. "Professionell aber freundlich, motivierend"',
      category: 'Nice to have',
      tip: 'Der Tonfall bestimmt, wie die Nachricht beim Empfänger ankommt.'
    }
  ];

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Essenziell': return 'bg-green-100 text-green-800 border-green-300';
      case 'Wichtig': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Nice to have': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const updatePromptData = (field, value) => {
    setPromptData(prev => ({ ...prev, [field]: value }));
  };

  const buildFullPrompt = () => {
    let prompt = '';
    if (promptData.persona) prompt += `### Persona\n${promptData.persona}\n\n`;
    if (promptData.kontext) prompt += `### Kontext\n${promptData.kontext}\n\n`;
    if (promptData.aufgabe) prompt += `### Aufgabe\n${promptData.aufgabe}\n`;
    if (promptData.format) prompt += `### Format\n${promptData.format}\n`;
    if (promptData.tonfall) prompt += `### Tonfall\n${promptData.tonfall}\n`;
    if (promptData.beispiel) prompt += `\n### Beispiel\n${promptData.beispiel}`;
    return prompt;
  };

  const saveApiKey = () => {
    localStorage.setItem('openrouter_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  const sendPrompt = async () => {
    if (!apiKey) {
      setResponse('Bitte gib zuerst deinen OpenRouter API Key ein.');
      return;
    }
    const fullPrompt = buildFullPrompt();
    if (!fullPrompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const apiResponse = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, apiKey: apiKey })
      });
      const data = await apiResponse.json();
      if (data.error) {
        setResponse(`Fehler: ${data.error.message || JSON.stringify(data.error)}`);
      } else if (data.choices && data.choices[0]?.message?.content) {
        setResponse(data.choices[0].message.content);
      } else {
        setResponse('Unerwartetes Antwortformat.');
      }
    } catch (error) {
      setResponse('Fehler: Stelle sicher, dass der Backend-Server läuft (npm run server)');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionScore = () => {
    const filled = Object.values(promptData).filter(v => v.trim()).length;
    return Math.round((filled / 6) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Was macht gutes Prompting aus?</h1>
            <p className="text-slate-500 font-medium">Grundbausteine eines Prompts</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {showApiKeyInput ? (
              <div className="flex gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key eingeben" className="bg-transparent text-sm px-2 outline-none w-48" />
                <button onClick={saveApiKey} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-black transition-colors">Save</button>
              </div>
            ) : (
              <button onClick={() => setShowApiKeyInput(true)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                <Key size={14} /> Key ändern
              </button>
            )}
            <div className="w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
               <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${getCompletionScore()}%` }}></div>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{getCompletionScore()}% Completion Score</span>
          </div>
        </div>

        {/* INTRODUCTION SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              <Brain size={14} /> Cognitive Scaffolding
            </div>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">Präzision in der KI-Kommunikation</h2>
            <p className="text-slate-600 leading-relaxed">
              KI-Modelle benötigen <strong>präzise Leitplanken</strong>. Ohne Struktur bleibt das Ergebnis oft generisch. 
              Wir nutzen das 6-Elemente-Modell, um die Ergebnisqualität messbar zu steigern.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-500 text-sm italic text-slate-600">
              "Gute Prompts können die Produktivität um das 10-fache steigern."
            </div>
          </div>
          <div className="relative group">
            <img src={promptingImage} alt="Cheat Sheet" className="w-full h-auto rounded-xl shadow-2xl transition-transform group-hover:scale-[1.01]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: INPUT STEPS */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                  activeStep === index ? 'border-blue-500 shadow-md scale-[1.01]' : 'border-transparent shadow-sm opacity-80 grayscale-[0.3]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-slate-200">{index + 1}</span>
                    <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest border ${getCategoryColor(step.category)}`}>
                      {step.category}
                    </span>
                  </div>
                  {promptData[step.id] ? <CheckCircle className="text-green-500" size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-slate-100"></div>}
                </div>
                
                <textarea
                  value={promptData[step.id]}
                  onChange={(e) => updatePromptData(step.id, e.target.value)}
                  placeholder={step.placeholder}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-700"
                  rows={3}
                />

                {activeStep === index && (
                  <div className="mt-4 flex items-start gap-3 bg-blue-50 p-3 rounded-lg animate-in fade-in">
                    <Lightbulb className="text-blue-600 flex-shrink-0" size={18} />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">{step.tip}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                onClick={sendPrompt}
                disabled={loading || !promptData.aufgabe || !apiKey}
                className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-black disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-xl uppercase tracking-widest text-sm"
                >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Send size={20} /> Prompt senden</>}
                </button>
                <Link to="/techniques" className="flex-1 bg-white border-2 border-slate-200 text-slate-900 py-5 rounded-2xl font-black hover:border-purple-500 hover:text-purple-600 flex items-center justify-center gap-3 transition-all shadow-sm uppercase tracking-widest text-sm">
                Fortgeschrittene Methoden <ArrowRight size={20} />
                </Link>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW & RESPONSE */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* PROMPT PREVIEW */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:sticky lg:top-8">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Blueprint</h3>
                <button onClick={() => navigator.clipboard.writeText(buildFullPrompt())} className="text-slate-400 hover:text-blue-500"><Clipboard size={16} /></button>
              </div>
              <div className="p-6">
                <div className="space-y-4 font-mono text-[13px] leading-relaxed text-slate-600">
                  {Object.entries(promptData).map(([key, value]) => value && (
                    <div key={key} className="relative pl-4 border-l-2 border-blue-200">
                      <span className="text-[10px] font-bold text-blue-500 uppercase block mb-1">{key}</span>
                      <p className="italic">{value}</p>
                    </div>
                  ))}
                  {!Object.values(promptData).some(v => v) && (
                    <p className="text-slate-300 italic text-center py-10">Bausteine füllen, um Entwurf zu sehen...</p>
                  )}
                </div>
              </div>

              {/* AI RESPONSE AREA */}
              <div className="p-6 border-t-4 border-green-500 bg-green-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">KI-Output</h3>
                </div>
                
                {loading ? (
                  <div className="space-y-2 py-4">
                    <div className="h-2 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-slate-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-2 bg-slate-200 rounded animate-pulse w-4/6"></div>
                  </div>
                ) : response ? (
                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap animate-in fade-in bg-white p-4 rounded-xl border border-green-100 shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                    {response}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">Bereit für die Generierung.</p>
                )}
              </div>
            </div>

            {response && !response.includes('Fehler') && (
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 mb-3">
                        <CheckCircle size={16} /> Reflexion
                    </h4>
                    <ul className="text-xs space-y-3 text-slate-300">
                        <li className="flex gap-2"><span>•</span> War die Antwort spezifisch genug?</li>
                        <li className="flex gap-2"><span>•</span> Hat die Persona den richtigen Ton getroffen?</li>
                        <li className="flex gap-2"><span>•</span> Falls nein: Verfeinere Schritt 5 und 6!</li>
                    </ul>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PromptCraft;