import React, { useState, useEffect, useRef } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ onResult, isProcessing, language, t }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        // Overwrite the textarea with what the speech engine thinks we said
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }, []);

  // Update language when prop changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript(''); // Clear to start fresh
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleGenerate = () => {
    onResult(transcript);
  };

  return (
    <div className="voice-input-container glass-card">
      <div className="input-header">
        <h2>{t.recordTitle}</h2>
        <p>{t.recordSubtitle}</p>
      </div>

      <div className="mic-wrapper">
        {isListening && <div className="pulse-ring"></div>}
        <button 
          className={`mic-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={toggleListening}
          disabled={isProcessing}
        >
          {isListening ? t.btnStop : isProcessing ? t.btnWait : t.btnMic}
        </button>
      </div>

      <textarea 
        className="transcript-area editable" 
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder={isListening ? t.statusListening : t.placeholderTranscript}
        disabled={isListening || isProcessing}
      />
      
      {isListening && (
        <button className="finish-button" onClick={toggleListening}>
          {t.btnFinish}
        </button>
      )}

      {!isListening && transcript.trim() && (
        <button className="generate-button" onClick={handleGenerate} disabled={isProcessing}>
          {isProcessing ? "..." : t.btnGenerateReport}
        </button>
      )}
    </div>
  );
};

export default VoiceInput;
