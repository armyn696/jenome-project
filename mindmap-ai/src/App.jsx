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
    console.log('Raw AI Response:', text); // Log raw response

    // Remove any text before the first {
    const jsonStart = text.indexOf('{');
    if (jsonStart === -1) {
      console.error('No JSON object found in response');
      throw new Error('Invalid response format');
    }
    
    const jsonEnd = text.lastIndexOf('}');
    if (jsonEnd === -1) {
      console.error('Incomplete JSON in response');
      throw new Error('Invalid response format');
    }
    
    const jsonStr = text.substring(jsonStart, jsonEnd + 1);
    console.log('Extracted JSON:', jsonStr); // Log extracted JSON

    try {
      const parsed = JSON.parse(jsonStr);
      console.log('Parsed JSON:', parsed); // Log parsed JSON
      
      // Validate the structure
      if (!Array.isArray(parsed.nodes) || !parsed.nodes.length) {
        throw new Error('Invalid mindmap structure: missing or empty nodes array');
      }

      // Ensure edges array exists
      if (!Array.isArray(parsed.edges)) {
        parsed.edges = [];
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
      throw new Error('Failed to parse mindmap structure');
    }
  };

  const generateMindMap = async (text) => {
    const prompt = `Generate a mindmap structure for the following text. Return ONLY a JSON object in this exact format:
{
  "nodes": [
    {"id": "1", "label": "Main Topic", "type": "input"},
    {"id": "2", "label": "Subtopic 1", "type": "default"},
    ...
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    ...
  ]
}
Do not include any other text, markdown formatting, or explanations. The response should be a valid JSON object only.
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
    if (!inputText.trim()) {
      setError('لطفاً متنی وارد کنید');
      return;
    }

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
            <button 
              onClick={handleGenerate} 
              className="generate-button"
              disabled={!inputText.trim()}
            >
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
