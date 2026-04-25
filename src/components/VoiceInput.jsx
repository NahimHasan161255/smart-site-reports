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
      onResult(transcript);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
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

      <div className="transcript-area">
        {transcript || (isListening ? t.statusListening : t.statusAwaiting)}
      </div>
      
      {isListening && (
        <button className="finish-button" onClick={toggleListening}>
          {t.btnFinish}
        </button>
      )}
    </div>
  );
};

export default VoiceInput;
