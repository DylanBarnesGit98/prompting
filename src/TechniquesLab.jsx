import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, Zap, Brain, GitCompare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const TechniquesLab = () => {
  const [selectedTechnique, setSelectedTechnique] = useState('zero-shot');
  const [userPrompt, setUserPrompt] = useState('');
  const [basicResponse, setBasicResponse] = useState('');
  const [enhancedResponse, setEnhancedResponse] = useState('');
  const [userResponse, setUserResponse] = useState(''); // Neu: Separate Response für User
  const [loading, setLoading] = useState(false);
  const [qualityScore, setQualityScore] = useState(null);

  const techniques = [
    {
      id: 'zero-shot',
      name: 'Zero-Shot Prompting',
      icon: Zap,
      description: 'Direkte Anweisung ohne Beispiele - am einfachsten, aber oft weniger präzise',
      example: 'Erkläre, was Fotosynthese ist.',
      enhanced: 'Erkläre in 3 prägnanten Sätzen, was Fotosynthese ist und warum sie für das Leben auf der Erde wichtig ist.',
      tip: 'Sei spezifisch! Je klarer deine Anweisung, desto besser das Ergebnis.',
      color: 'blue'
    },
    {
      id: 'few-shot',
      name: 'Few-Shot Prompting',
      icon: Brain,
      description: 'Zeige 2-5 Beispiele, damit die KI das Muster versteht',
      example: 'Klassifiziere die Stimmung:\nText: "Ich liebe diesen Film!"\nStimmung: Positiv\n\nText: "Das war schrecklich."\nStimmung:',
      enhanced: 'Klassifiziere die Stimmung:\nText: "Ich liebe diesen Film!"\nStimmung: Positiv\n\nText: "Das war schrecklich."\nStimmung: Negativ\n\nText: "Ganz okay, nichts Besonderes."\nStimmung: Neutral\n\nText: "Absolut fantastisch!"\nStimmung:',
      tip: 'Wähle repräsentative Beispiele, die das gewünschte Muster klar zeigen.',
      color: 'purple'
    },
    {
      id: 'chain-of-thought',
      name: 'Chain-of-Thought (CoT)',
      icon: GitCompare,
      description: 'Bitte die KI, Schritt für Schritt zu denken - ideal für komplexe Aufgaben',
      example: 'Wenn ein Zug 120 km in 2 Stunden fährt, wie schnell ist er?',
      enhanced: 'Wenn ein Zug 120 km in 2 Stunden fährt, wie schnell ist er?\n\nDenke Schritt für Schritt:\n1. Welche Formel brauchen wir?\n2. Setze die Werte ein\n3. Berechne das Ergebnis\n4. Gib die Antwort mit Einheit',
      tip: 'Füge "Lass uns Schritt für Schritt denken" oder "Erkläre dein Vorgehen" hinzu.',
      color: 'green'
    }
  ];

  const currentTechnique = techniques.find(t => t.id === selectedTechnique);

  const analyzePromptQuality = (prompt) => {
    const issues = [];
    let score = 100;

    if (prompt.length < 20) {
      issues.push({ type: 'warning', text: 'Prompt ist sehr kurz - sei spezifischer!' });
      score -= 20;
    }

    const vagueWords = ['gut', 'schön', 'nice', 'irgendwie', 'vielleicht'];
    const hasVagueWords = vagueWords.some(word => prompt.toLowerCase().includes(word));
    if (hasVagueWords) {
      issues.push({ type: 'error', text: 'Vermeide vage Begriffe wie "gut" oder "schön" - sei konkret!' });
      score -= 15;
    }

    if (!prompt.match(/format|struktur|länge|wörter|sätze|liste|tabelle/i)) {
      issues.push({ type: 'info', text: 'Tipp: Gib ein gewünschtes Format an (z.B. "in 3 Sätzen", "als Liste")' });
      score -= 10;
    }

    if (prompt.match(/nicht|kein|ohne|vermeide/i)) {
      issues.push({ type: 'warning', text: 'Sag lieber WAS du willst, statt was du NICHT willst' });
      score -= 10;
    }

    if (prompt.split(' ').length > 10 && !prompt.includes('Kontext:') && !prompt.includes('Hintergrund:')) {
      issues.push({ type: 'info', text: 'Bei komplexen Aufgaben: Gib Kontext oder Hintergrund an' });
      score -= 5;
    }

    return { score: Math.max(0, score), issues };
  };

  const testPrompt = async (isEnhanced = false) => {
    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) {
      alert('Bitte setze zuerst deinen API Key auf der Hauptseite!');
      return;
    }

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

      if (isEnhanced) {
        setEnhancedResponse(result);
      } else {
        setBasicResponse(result);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testUserPrompt = async () => {
    if (!userPrompt.trim()) return;

    const quality = analyzePromptQuality(userPrompt);
    setQualityScore(quality);

    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) {
      alert('Bitte setze zuerst deinen API Key auf der Hauptseite!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, apiKey })
      });

      const data = await response.json();
      setUserResponse(data.choices?.[0]?.message?.content || 'Keine Antwort'); // Hier setzen wir userResponse
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIssueIcon = (type) => {
    if (type === 'error') return '❌';
    if (type === 'warning') return '⚠️';
    return '💡';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 z-50 bg-white rounded-lg shadow-lg p-6 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={20} />
            Zurück zu Prompting Basics
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fortgeschrittenes Prompt Engineering
          </h1>
          <p className="text-gray-600">
            Lerne fortgeschrittene Prompting-Techniken durch interaktive Vergleiche
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Wähle eine Technik
              </h3>
              <div className="space-y-3">
                {techniques.map((tech) => {
                  const Icon = tech.icon;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => {
                        setSelectedTechnique(tech.id);
                        setBasicResponse('');
                        setEnhancedResponse('');
                      }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedTechnique === tech.id
                          ? `border-${tech.color}-500 bg-${tech.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon size={24} className={`text-${tech.color}-600`} />
                        <span className="font-semibold text-gray-800">{tech.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{tech.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentTechnique && (
              <div className={`bg-${currentTechnique.color}-50 border-2 border-${currentTechnique.color}-200 rounded-lg p-5`}>
                <div className="flex items-start gap-2 mb-3">
                  <Lightbulb className={`text-${currentTechnique.color}-600 flex-shrink-0 mt-1`} size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Pro-Tipp</h4>
                    <p className="text-sm text-gray-700">{currentTechnique.tip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Basis-Prompt
                </h3>
                <button
                  onClick={() => testPrompt(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  {loading ? 'Lädt...' : 'Testen'}
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
                <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                  {currentTechnique?.example}
                </p>
              </div>
              {basicResponse && (
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{basicResponse}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Verbesserter Prompt (mit {currentTechnique?.name})
                </h3>
                <button
                  onClick={() => testPrompt(true)}
                  disabled={loading}
                  className={`px-4 py-2 bg-${currentTechnique?.color}-500 text-white rounded-lg hover:bg-${currentTechnique?.color}-600 disabled:opacity-50`}
                >
                  {loading ? 'Lädt...' : 'Testen'}
                </button>
              </div>
              <div className={`bg-${currentTechnique?.color}-50 p-4 rounded border border-${currentTechnique?.color}-200 mb-3`}>
                <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                  {currentTechnique?.enhanced}
                </p>
              </div>
              {enhancedResponse && (
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{enhancedResponse}</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Jetzt bist du dran!
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Schreibe deinen eigenen Prompt und erhalte sofort Feedback zur Qualität:
              </p>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Schreibe hier deinen Prompt..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none mb-3"
                rows={4}
              />
              <button
                onClick={testUserPrompt}
                disabled={loading || !userPrompt.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
              >
                {loading ? 'Analysiere...' : 'Prompt analysieren & testen'}
              </button>

              {qualityScore && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Qualitäts-Score</h4>
                    <span className={`text-2xl font-bold ${getScoreColor(qualityScore.score)}`}>
                      {qualityScore.score}/100
                    </span>
                  </div>
                  {qualityScore.issues.length > 0 && (
                    <div className="space-y-2">
                      {qualityScore.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span>{getIssueIcon(issue.type)}</span>
                          <span className="text-gray-700">{issue.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NEU: User Response direkt hier drunter */}
              {userResponse && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">🤖 AI Antwort auf deinen Prompt</h4>
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{userResponse}</p>
                  </div>
                </div>
              )}
            </div>
              {/* Add this after the user practice area */}
              <Link 
              to="/advanced"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl mt-4"
            >
              Weiter zu: Experten-Workflows & KI-Orchestrierung →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechniquesLab;