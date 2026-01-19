import React, { useState } from 'react';
import { Send, Lightbulb, CheckCircle, XCircle, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
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

  const getPromptSegments = () => {
    // Wir mappen über das 'steps' Array, damit die Reihenfolge 
    // exakt der Eingabe-Reihenfolge entspricht
    return steps
      .map(step => ({
        id: step.id,
        label: step.title,
        value: promptData[step.id],
        color: getSegmentColor(step.id) // Hilfsfunktion für Farben
      }))
      .filter(s => s.value && s.value.trim() !== '');
  };
  
  // Hilfsfunktion für die Farben der Labels in der Vorschau
  const getSegmentColor = (id) => {
    // Findet den Schritt im steps-Array, um die Kategorie zu bestimmen
    const step = steps.find(s => s.id === id);
    if (!step) return 'text-gray-600 border-gray-200';
  
    switch(step.category) {
      case 'Essenziell': return 'text-green-600 border-green-300';
      case 'Wichtig': return 'text-blue-600 border-blue-300';
      case 'Nice to have': return 'text-purple-600 border-purple-300';
      default: return 'text-gray-600 border-gray-200';
    }
  };
  
  // Der finale Prompt für die API nutzt nun auch die korrekte Reihenfolge
  const buildFullPrompt = () => {
    return getPromptSegments()
      .map(s => `### ${s.label}\n${s.value}`)
      .join('\n\n');
  };

  const getFullParagraph = () => {
    return getPromptSegments()
      .map(s => s.value.trim())
      .join(' '); // Verbindet alles mit einem Leerzeichen zu einem Fließtext
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          apiKey: apiKey
        })
      });

      const data = await apiResponse.json();
      
      console.log('Received data:', data);
      
      if (data.error) {
        setResponse(`Fehler: ${data.error}`);
      } else if (data.choices && data.choices[0]?.message?.content) {
        setResponse(data.choices[0].message.content);
      } else {
        setResponse('Unerwartetes Antwortformat: ' + JSON.stringify(data));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-0 z-50">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Micro-Lernangebot: Prompting zur Steigerung der Effizienz
          </h1>
          <p className="text-gray-600">
            Interaktives Prompt Engineering
          </p>
          
          {showApiKeyInput && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    OpenRouter API Key benötigt 
                  </h3>
                  <ol className="text-sm text-gray-600 mb-3 space-y-1">
                    <li>1. Gehe zu <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">openrouter.ai/keys</a></li>
                    <li>2. Melde dich mit Google/GitHub an</li>
                    <li>3. Klicke "Create Key"</li>
                    <li>4. Kopiere den Key und füge ihn hier ein</li>
                  </ol>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-or-..."
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={saveApiKey}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showApiKeyInput && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getCompletionScore()}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {getCompletionScore()}% vollständig
                </span>
              </div>
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="ml-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Key size={14} />
                API Key ändern
              </button>
            </div>
          )}
        </div>

       {/* Prompt Engineering Einführung */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 border-l-8 border-purple-500">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Präzision in der KI-Kommunikation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed text-lg">
                KI-Modelle sind wie hochbegabte Praktikanten: Sie sind extrem fähig, benötigen aber 
                <strong> präzise Leitplanken</strong>. Ohne Struktur bleibt das Ergebnis oft generisch oder fehlerhaft.
              </p>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-2">
                  <Brain size={18} /> Das Ziel dieses Microlearnings
                </h4>
                <p className="text-sm text-purple-800">
                  Du lernst hier nicht nur das "Tippen", sondern ein <strong>mentales Framework</strong>. 
                  Wir nutzen das 6-Elemente-Modell, um die Varianz der KI-Antworten zu reduzieren und 
                  die Ergebnisqualität messbar zu steigern.
                </p>
              </div>

              <p className="text-gray-600 text-sm">
                In den folgenden Schritten baust du einen professionellen Prompt auf. Beobachte rechts live, 
                wie aus einzelnen Bausteinen eine mächtige Anweisung wird.
              </p>
            </div>

            <div className="relative group">
              <img 
                src={promptingImage} 
                alt="Didaktisches Framework der 6 Prompt-Elemente" 
                className="w-full h-auto rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10"></div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`bg-white rounded-lg shadow-md p-5 transition-all cursor-pointer hover:shadow-lg ${
                  activeStep === index ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-300">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {step.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(step.category)}`}>
                        {step.category}
                      </span>
                    </div>
                  </div>
                  {promptData[step.id] ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-gray-300" size={20} />
                  )}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {step.label}
                </label>
                
                <textarea
                  value={promptData[step.id]}
                  onChange={(e) => updatePromptData(step.id, e.target.value)}
                  placeholder={step.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />

                <div className="mt-2 flex items-start gap-2 bg-yellow-50 p-2 rounded">
                  <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={16} />
                  <p className="text-xs text-gray-600">{step.tip}</p>
                </div>
              </div>
            ))}

            <button
              onClick={sendPrompt}
              disabled={loading || !promptData.aufgabe || !apiKey}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                'Lädt...'
              ) : (
                <>
                  <Send size={20} />
                  Prompt an KI senden
                </>
              )}
            </button>
            <Link 
              to="/techniques"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              
              Weiter zum fortgeschrittenen Lernangebot →
            </Link>
          </div>

         {/* Ersetze die gesamte rechte Spalte (die mit der Vorschau) durch diesen Code */}
         <div className="space-y-4 lg:sticky lg:top-42 lg:self-start lg:max-h-[calc(100vh-120px)] flex flex-col">
  
            {/* SEKTION 1: PROMPT VORSCHAU - Kompakter optimiert */}
            <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-blue-500 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Brain size={20} className="text-blue-500" />
                  Dein Prompt-Entwurf
                </h3>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col text-left">
                <div className="p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: '50vh' }}>
                  {getPromptSegments().length > 0 ? (
                    <div className="space-y-4">
                      
                      {/* Die Timeline Ansicht */}
                      <div className="space-y-4">
                        {getPromptSegments().map((segment, index) => {
                          const colorClass = getSegmentColor(segment.id);
                          return (
                            <div key={segment.id} className="relative pl-6">
                              {index !== getPromptSegments().length - 1 && (
                                <div className="absolute left-[7px] top-6 bottom-[-16px] w-0.5 bg-slate-200"></div>
                              )}
                              <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-blue-400 z-10"></div>
                              <div className="flex flex-col">
                                <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${colorClass.split(' ')[0]}`}>
                                  {segment.label}
                                </span>
                                <p className="text-sm text-slate-700 leading-snug italic opacity-80">
                                  {segment.value}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Der zusammenhängende Fließtext */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                          Zusammengefasster Fließtext
                        </span>
                        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm relative">
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {getFullParagraph()}
                          </p>
                          <button 
                            onClick={() => navigator.clipboard.writeText(getFullParagraph())}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-blue-500 rounded transition-colors"
                            title="Kopieren"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <Send size={24} className="opacity-20 mb-2" />
                      <p className="text-sm italic text-center">Warte auf Eingabe der Bausteine...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* SEKTION 2: KI ANTWORT (Wiederhergestellt & Optimiert) */}
              <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-green-500 flex flex-col min-h-[100px]">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  KI Antwort
                </h3>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                    <p className="text-xs text-slate-500">KI denkt nach...</p>
                  </div>
                ) : response ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-slate-700 text-left whitespace-pre-wrap overflow-y-auto max-h-[30vh]">
                    {response}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    Sende deinen Prompt ab, um hier das Ergebnis zu sehen.
                  </div>
                )}
              </div>

              {/* SEKTION 3: REFLEXION (Optional, nur wenn Response da ist) */}
              {response && !response.includes('Fehler:') && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-4 border border-green-200 animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} className="text-yellow-600" />
                    Kurze Reflexion:
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Hat die Persona den Tonfall getroffen? Wenn nicht, präzisiere Schritt 5 & 6.
                  </p>
                </div>
              )}
            </div>


        </div>
      </div>
    </div>
  );
};

export default PromptCraft;