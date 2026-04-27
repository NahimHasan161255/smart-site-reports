import React, { useState, useEffect, useRef } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ onResult, isProcessing, language, t }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [dailyLogs, setDailyLogs] = useState([]);
  const [editingLogId, setEditingLogId] = useState(null);
  const recognitionRef = useRef(null);
  const baseTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported.');
      alert("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(baseTranscriptRef.current + currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Could not start recognition:", err);
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Set the base transcript so live speech appends properly to any existing manual text
      baseTranscriptRef.current = transcript;
      startListening();
    }
  };

  const handleSaveEntry = () => {
    if (!transcript.trim()) return;

    if (editingLogId) {
      setDailyLogs(prev => prev.map(log => 
        log.id === editingLogId ? { ...log, text: transcript.trim() } : log
      ));
      setEditingLogId(null);
    } else {
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDailyLogs(prev => [...prev, { id: Date.now(), time: timeString, text: transcript.trim() }]);
    }
    
    setTranscript('');
    baseTranscriptRef.current = '';
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setTranscript('');
    baseTranscriptRef.current = '';
  };

  const handleEditLog = (log) => {
    setEditingLogId(log.id);
    setTranscript(log.text);
    baseTranscriptRef.current = log.text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLog = (id) => {
    if (window.confirm("Are you sure you want to delete this log entry?")) {
      setDailyLogs(prev => prev.filter(log => log.id !== id));
      if (editingLogId === id) handleCancelEdit();
    }
  };

  const handleGenerate = () => {
    if (dailyLogs.length === 0) return;
    const combinedText = dailyLogs.map(l => `[${l.time}] ${l.text}`).join('\n\n');
    onResult(combinedText);
    setDailyLogs([]); // Clear the list after successful generation
  };

  return (
    <div className="voice-input-container">
      {/* Top Card: Active Recording / Editing */}
      <div className="glass-card record-card">
        <div className="input-header">
          <h2>{editingLogId ? t.btnEdit : t.recordTitle}</h2>
          <p>{editingLogId ? "" : t.recordSubtitle}</p>
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
          onChange={(e) => {
            setTranscript(e.target.value);
            baseTranscriptRef.current = e.target.value;
          }}
          placeholder={isListening ? t.statusListening : t.placeholderTranscript}
          disabled={isListening || isProcessing}
        />
        
        {isListening && (
          <button className="finish-button" onClick={toggleListening}>
            {t.btnFinish}
          </button>
        )}

        {!isListening && transcript.trim() && (
          <div className="entry-actions">
            {editingLogId && (
              <button className="cancel-button" onClick={handleCancelEdit}>
                ✖ Cancel
              </button>
            )}
            <button className="save-entry-button" onClick={handleSaveEntry}>
              {editingLogId ? t.btnUpdateEntry : t.btnSaveEntry}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Card: List of accumulated daily logs */}
      {dailyLogs.length > 0 && (
        <div className="glass-card log-list-card">
          <h3 className="log-list-title">{t.dailyLogsTitle} ({dailyLogs.length})</h3>
          
          <div className="log-list">
            {dailyLogs.map(log => (
              <div key={log.id} className={`log-item ${editingLogId === log.id ? 'editing' : ''}`}>
                <div className="log-time-badge">{log.time}</div>
                <div className="log-text">{log.text}</div>
                <div className="log-item-actions">
                  <button className="log-btn edit-btn" onClick={() => handleEditLog(log)}>{t.btnEdit}</button>
                  <button className="log-btn delete-btn" onClick={() => handleDeleteLog(log.id)}>{t.btnDelete}</button>
                </div>
              </div>
            ))}
          </div>

          <button className="generate-button final-generate-button" onClick={handleGenerate} disabled={isProcessing || editingLogId !== null}>
            {isProcessing ? "..." : t.btnGenerateReport}
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
