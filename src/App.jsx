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

  const buildFullPrompt = () => {
    let prompt = '';
    if (promptData.persona) prompt += `${promptData.persona}\n\n`;
    if (promptData.kontext) prompt += `Kontext: ${promptData.kontext}\n\n`;
    if (promptData.aufgabe) prompt += `Aufgabe: ${promptData.aufgabe}\n`;
    if (promptData.format) prompt += `Format: ${promptData.format}\n`;
    if (promptData.tonfall) prompt += `Tonfall: ${promptData.tonfall}\n`;
    if (promptData.beispiel) prompt += `\nBeispiel: ${promptData.beispiel}`;
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Was ist Prompt Engineering?
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Prompt Engineering ist die Kunst und Wissenschaft, KI-Modelle durch präzise Anweisungen zu steuern. 
            In einer Welt, in der KI-Tools wie ChatGPT, Claude und andere Sprachmodelle allgegenwärtig sind, 
            wird die Fähigkeit, <strong>effektive Prompts zu schreiben</strong>, zur Schlüsselkompetenz. 
            Gute Prompts können die Produktivität um das <strong>10-fache steigern</strong>, von der E-Mail-Erstellung 
            über Code-Generierung bis hin zu strategischen Analysen. Diese interaktive Übung zeigt dir die 
            6 essentiellen Elemente eines professionellen Prompts. 
          </p>
          <img 
            src={promptingImage} 
            alt="Prompt Engineering Cheat Sheet - Die 6 Kern-Elemente" 
            className="w-full h-auto rounded-lg border-2 border-gray-200"
          />
          <p className="text-sm text-gray-500 mt-2 italic">
            Die Cheat Sheet zeigt die 6 Kern-Elemente: Aufgabe, Kontext, Format, Beispiel, Persona und Tonfall
          </p>
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

          <div className="space-y-4 lg:sticky lg:top-40 lg:self-start">
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Dein zusammengesetzter Prompt
              </h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {buildFullPrompt() || 'Fülle die Felder aus, um deinen Prompt zu sehen...'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                KI Antwort
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : response ? (
                <div className="bg-blue-50 p-4 rounded border border-blue-200 text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {response}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Sende deinen Prompt, um eine Antwort zu erhalten
                </div>
              )}
            </div>

            {response && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-5 border-2 border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  💡 Reflexionsfragen
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Hat die Antwort deine Erwartungen erfüllt?</li>
                  <li>• Welche Prompt-Elemente haben den größten Einfluss gehabt?</li>
                  <li>• Was würdest du beim nächsten Mal anders machen?</li>
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