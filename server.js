import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { prompt, apiKey } = req.body;

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'PromptCraft Trainer'
        },
        body: JSON.stringify({
          // 'openrouter/auto' wählt automatisch das beste verfügbare Modell
          // Da wir keine Kosten wollen, schränken wir es über das provider-Objekt ein
          model: 'openrouter/auto',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          // Hier ist der Trick: Wir erlauben NUR kostenlose Provider
          provider: {
            order: ["HuggingFace", "Together", "DeepInfra"],
            require_parameters: false
          }
        })
      }
    );

    const data = await response.json();
    
    // Falls OpenRouter trotz Status 200 einen Fehler im JSON schickt
    if (data.error) {
       console.error('OpenRouter Internal Error:', data.error);
       return res.status(402).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});