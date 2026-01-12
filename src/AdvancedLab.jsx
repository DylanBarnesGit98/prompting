import React, { useState } from 'react';
import { ArrowLeft, Workflow, RefreshCw, Target, Sparkles, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdvancedLab = () => {
  const [activeModule, setActiveModule] = useState('chaining');
  const [chainSteps, setChainSteps] = useState([
    { id: 1, prompt: '', response: '', completed: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selfConsistencyResults, setSelfConsistencyResults] = useState([]);
  const [consistencyPrompt, setConsistencyPrompt] = useState('');

  // Prompt Chaining Functions
  const addChainStep = () => {
    setChainSteps([...chainSteps, { 
      id: chainSteps.length + 1, 
      prompt: '', 
      response: '', 
      completed: false 
    }]);
  };

  const updateChainStep = (id, field, value) => {
    setChainSteps(chainSteps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const executeChainStep = async (stepId) => {
    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) {
      alert('Bitte setze zuerst deinen API Key!');
      return;
    }

    setLoading(true);
    const step = chainSteps.find(s => s.id === stepId);
    const previousStep = chainSteps.find(s => s.id === stepId - 1);
    
    // Build context from previous step
    let fullPrompt = step.prompt;
    if (previousStep && previousStep.response) {
      fullPrompt = `Basierend auf dieser Information:\n"${previousStep.response}"\n\n${step.prompt}`;
    }

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, apiKey })
      });

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'Keine Antwort';

      updateChainStep(stepId, 'response', result);
      updateChainStep(stepId, 'completed', true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Iterative Refinement Functions
  const refinePrompt = async () => {
    if (!currentPrompt.trim()) return;

    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) {
      alert('Bitte setze zuerst deinen API Key!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt, apiKey })
      });

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'Keine Antwort';

      setRefinementHistory([...refinementHistory, {
        version: refinementHistory.length + 1,
        prompt: currentPrompt,
        response: result,
        timestamp: new Date().toLocaleTimeString('de-DE')
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousVersion = (version) => {
    const selected = refinementHistory.find(h => h.version === version);
    if (selected) {
      setCurrentPrompt(selected.prompt);
    }
  };

  // Self-Consistency Functions
  const runSelfConsistency = async () => {
    if (!consistencyPrompt.trim()) return;

    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) {
      alert('Bitte setze zuerst deinen API Key!');
      return;
    }

    setLoading(true);
    setSelfConsistencyResults([]);

    try {
      // Run the same prompt 3 times
      const promises = Array(3).fill(null).map(() => 
        fetch('http://localhost:3001/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: consistencyPrompt, 
            apiKey 
          })
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      const formattedResults = results.map((data, idx) => ({
        run: idx + 1,
        response: data.choices?.[0]?.message?.content || 'Keine Antwort'
      }));

      setSelfConsistencyResults(formattedResults);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: 'chaining',
      name: 'Prompt Chaining',
      icon: Workflow,
      description: 'Zerlege komplexe Aufgaben in Einzelschritte, die aufeinander aufbauen',
      color: 'blue',
      tip: 'Perfekt für mehrstufige Analysen oder wenn der Output eines Schritts Input für den nächsten ist.'
    },
    {
      id: 'refinement',
      name: 'Iterative Verbesserung',
      icon: RefreshCw,
      description: 'Verbessere deine Prompts schrittweise durch Versionierung und Vergleich',
      color: 'green',
      tip: 'Dokumentiere jede Iteration - so lernst du, was funktioniert und was nicht.'
    },
    {
      id: 'consistency',
      name: 'Self-Consistency',
      icon: Target,
      description: 'Führe denselben Prompt mehrmals aus und vergleiche die Konsistenz',
      color: 'purple',
      tip: 'Besonders wertvoll für Reasoning-Aufgaben - mehrere Durchläufe erhöhen die Zuverlässigkeit.'
    }
  ];

  const currentModule = modules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white rounded-lg shadow-lg p-6 mb-6">
          <Link to="/techniques" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={20} />
            Zurück zu: Fortgeschrittenes Prompt Engineering
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Experten-Workflows & KI-Orchestrierung
          </h1>
          <p className="text-gray-600">
          Meistere komplexe Multi-Step-Workflows und orchestriere KI-Prozesse wie ein Profi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Module Selection */}
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                Module
              </h3>
              <div className="space-y-3">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.id}
                      onClick={() => setActiveModule(module.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        activeModule === module.id
                          ? `border-${module.color}-500 bg-${module.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon size={20} className={`text-${module.color}-600`} />
                        <span className="font-semibold text-gray-800">{module.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{module.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Module Tip */}
            {currentModule && (
              <div className={`bg-${currentModule.color}-50 border-2 border-${currentModule.color}-200 rounded-lg p-5`}>
                <div className="flex items-start gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Pro-Tipp</h4>
                    <p className="text-sm text-gray-700">{currentModule.tip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Prompt Chaining Module */}
            {activeModule === 'chaining' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Workflow className="text-blue-600" />
                    Prompt Chaining Workflow
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Erstelle eine Kette von Prompts, wo jeder Schritt auf dem vorherigen aufbaut. 
                    Perfekt für: Recherche → Analyse → Zusammenfassung oder Brainstorming → Bewertung → Entscheidung.
                  </p>

                  {/* Chain Steps */}
                  <div className="space-y-4">
                    {chainSteps.map((step, index) => (
                      <div key={step.id} className="border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            step.completed ? 'bg-green-500' : 'bg-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-gray-800">Schritt {index + 1}</h3>
                          {step.completed && <CheckCircle2 className="text-green-500 ml-auto" size={20} />}
                        </div>

                        <textarea
                          value={step.prompt}
                          onChange={(e) => updateChainStep(step.id, 'prompt', e.target.value)}
                          placeholder={`Prompt für Schritt ${index + 1}...${index > 0 ? ' (nutzt automatisch die Antwort von Schritt ' + index + ')' : ''}`}
                          className="w-full p-3 border border-gray-300 rounded-lg mb-2 resize-none"
                          rows={3}
                          disabled={index > 0 && !chainSteps[index - 1].completed}
                        />

                        {index > 0 && !chainSteps[index - 1].completed && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2 text-sm text-gray-600">
                            ⏳ Warte auf Abschluss von Schritt {index}
                          </div>
                        )}

                        <button
                          onClick={() => executeChainStep(step.id)}
                          disabled={loading || !step.prompt.trim() || (index > 0 && !chainSteps[index - 1].completed)}
                          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? 'Läuft...' : 'Schritt ausführen'}
                          <ChevronRight size={16} />
                        </button>

                        {step.response && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm text-gray-800 mb-2">Antwort:</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{step.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addChainStep}
                    className="mt-4 w-full border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
                  >
                    + Weiteren Schritt hinzufügen
                  </button>
                </div>
              </div>
            )}

            {/* Iterative Refinement Module */}
            {activeModule === 'refinement' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <RefreshCw className="text-green-600" />
                    Iterative Prompt-Verbesserung
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Verbessere deinen Prompt schrittweise. Jede Version wird gespeichert, damit du den Fortschritt nachverfolgen kannst.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aktueller Prompt (Version {refinementHistory.length + 1})
                    </label>
                    <textarea
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      placeholder="Schreibe deinen Prompt und verfeinere ihn iterativ..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={5}
                    />
                  </div>

                  <button
                    onClick={refinePrompt}
                    disabled={loading || !currentPrompt.trim()}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Führt aus...' : `Version ${refinementHistory.length + 1} testen`}
                  </button>

                  {/* History */}
                  {refinementHistory.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800 mb-3">📚 Versions-Historie</h3>
                      <div className="space-y-3">
                        {refinementHistory.map((item) => (
                          <div key={item.version} className="border-2 border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-800">Version {item.version}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{item.timestamp}</span>
                                <button
                                  onClick={() => loadPreviousVersion(item.version)}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  Laden
                                </button>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded mb-2">
                              <p className="text-sm text-gray-700 font-mono">{item.prompt}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-gray-700">{item.response}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Self-Consistency Module */}
            {activeModule === 'consistency' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Target className="text-purple-600" />
                    Self-Consistency Testing
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Führe denselben Prompt mehrmals aus und prüfe, ob die Antworten konsistent sind. 
                    Hilfreich bei Reasoning-Aufgaben oder um die Zuverlässigkeit zu testen.
                  </p>

                  <textarea
                    value={consistencyPrompt}
                    onChange={(e) => setConsistencyPrompt(e.target.value)}
                    placeholder="Gib hier einen Prompt ein, den du auf Konsistenz testen möchtest..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none mb-3"
                    rows={4}
                  />

                  <button
                    onClick={runSelfConsistency}
                    disabled={loading || !consistencyPrompt.trim()}
                    className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Führt 3 Durchläufe aus...' : '3x Ausführen & Vergleichen'}
                  </button>

                  {/* Results */}
                  {selfConsistencyResults.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800 mb-3">📊 Vergleich der Durchläufe</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {selfConsistencyResults.map((result) => (
                          <div key={result.run} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                            <h4 className="font-semibold text-gray-800 mb-2">Durchlauf {result.run}</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.response}</p>
                          </div>
                        ))}
                      </div>

                      {/* Consistency Analysis */}
                      <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">🔍 Analyse</h4>
                        <p className="text-sm text-gray-700">
                          Vergleiche die drei Antworten: Sind sie inhaltlich ähnlich? 
                          Hohe Konsistenz deutet auf zuverlässige Prompts hin. 
                          Große Unterschiede zeigen, dass der Prompt präziser formuliert werden sollte.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedLab;