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

  const generateMindMap = async (text) => {
    const prompt = `Create a mindmap from the following text. Format the output as a JSON object with two arrays: 'nodes' and 'edges'.
    Each node should have: id (string), label (string), and type (either 'input' for center or 'default' for others).
    Each edge should have: id (string), source (node id), target (node id).
    The first node (id: '1') should be the main topic.
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to generate mindmap structure');
    }
  };

  const handleGenerate = async () => {
    try {
      const data = await generateMindMap(inputText);
      setNodes(data.nodes);
      setEdges(data.edges);
      setError('');
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
