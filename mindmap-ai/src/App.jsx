import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import MindMap from './components/MindMap';
import ModernHeader from './components/ModernHeader';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  const cleanAndParseJSON = (text) => {
    // Try to find JSON content between backticks or standalone
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) || text.match(/^[\s\n]*({[\s\S]*})[\s\n]*$/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1];
      try {
        const parsed = JSON.parse(jsonStr);
        
        // Validate the structure
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error('Invalid mindmap structure: missing nodes or edges arrays');
        }

        // Generate missing edges if needed
        if (parsed.edges.length === 0) {
          const newEdges = [];
          parsed.nodes.forEach((node, index) => {
            if (index > 0) {
              newEdges.push({
                id: `e1-${node.id}`,
                source: "1",
                target: node.id
              });
            }
          });
          parsed.edges = newEdges;
        }

        return parsed;
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Invalid JSON structure');
      }
    }
    throw new Error('No valid JSON found in response');
  };

  const generateMindMap = async (text) => {
    const prompt = `Create a mindmap from the following text. Return ONLY a JSON object with two arrays: 'nodes' and 'edges'.
    Each node should have: id (string), label (string), and type (either 'input' for center or 'default' for others).
    Each edge should have: id (string), source (node id), target (node id).
    The first node (id: '1') should be the main topic.
    Keep the response focused and concise.
    Text: ${text}`;

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      return cleanAndParseJSON(responseText);
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Failed to generate mindmap');
    }
  };

  const handleGenerate = async () => {
    try {
      setError('');
      const data = await generateMindMap(inputText);
      setNodes(data.nodes);
      setEdges(data.edges);
      setIsInputExpanded(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="app">
      <ModernHeader />
      <div className="mindmap-container">
        <div className={`input-section ${isInputExpanded ? 'expanded' : ''}`}>
          <button 
            className="toggle-button"
            onClick={() => setIsInputExpanded(!isInputExpanded)}
          >
            {isInputExpanded ? '▼ پنهان کردن' : '▲ نمایش ورودی'}
          </button>
          <div className="content">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="متن خود را وارد کنید..."
              className="input-text"
            />
            <button onClick={handleGenerate} className="generate-button">
              ایجاد نقشه ذهنی
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
        <MindMap nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}

export default App;
