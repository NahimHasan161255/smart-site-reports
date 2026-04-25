import React, { useState, useEffect } from 'react';
import './index.css';
import VoiceInput from './components/VoiceInput';
import ReportViewer from './components/ReportViewer';
import { generateReport } from './services/geminiService';
import { translations } from './i18n/translations';

function App() {
  const [reportData, setReportData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [error, setError] = useState('');

  const t = translations[language];

  // Load API key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('geminiApiKey', val);
  };

  const handleSpeechResult = async (transcript) => {
    if (!transcript.trim()) {
      setError(t.errNoAudio);
      return;
    }

    setIsProcessing(true);
    setError('');
    
    if (!apiKey) {
      // Fallback to Mock AI if no API key is provided
      setTimeout(() => {
        setReportData({
          date: new Date().toLocaleDateString(),
          progress: t.mockProgress,
          materials: t.mockMaterials,
          issues: t.mockIssues,
          rawTranscript: transcript
        });
        setIsProcessing(false);
        setError(t.errMockNote);
      }, 1500);
      return;
    }

    try {
      const parsedData = await generateReport(transcript, apiKey, language);
      setReportData({
        date: new Date().toLocaleDateString(),
        progress: parsedData.progress || t.notMentioned,
        materials: parsedData.materials || t.notMentioned,
        issues: parsedData.issues || t.notMentioned,
        rawTranscript: transcript
      });
    } catch (err) {
      setError(err.message || "An error occurred while generating the report.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>{t.appTitle}</h1>
        <p>{t.appSubtitle}</p>
        
        <div className="settings-panel glass-card">
          <div className="setting-group">
            <label htmlFor="api-key">{t.apiKeyLabel}</label>
            <input 
              type="password" 
              id="api-key" 
              placeholder={t.apiKeyPlaceholder} 
              value={apiKey}
              onChange={handleApiKeyChange}
            />
          </div>
          <div className="setting-group">
            <label htmlFor="language">{t.languageLabel}</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en-US">English (US)</option>
              <option value="es-US">Spanish (US)</option>
              <option value="bn-BD">Bengali</option>
              <option value="hi-IN">Hindi</option>
              <option value="ja-JP">Japanese</option>
            </select>
          </div>
        </div>
      </header>

      <main>
        {error && <div className="error-message">{error}</div>}
        <VoiceInput onResult={handleSpeechResult} isProcessing={isProcessing} language={language} t={t} />
        {reportData && <ReportViewer data={reportData} t={t} />}
      </main>
    </div>
  );
}

export default App;
