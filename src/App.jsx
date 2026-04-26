import React, { useState, useEffect } from 'react';
import './index.css';
import VoiceInput from './components/VoiceInput';
import ReportViewer from './components/ReportViewer';
import ReportHistory from './components/ReportHistory';
import { generateReport, translateReportContent } from './services/geminiService';
import { translations } from './i18n/translations';
import { getReports, saveReport, deleteReport } from './services/dbService';

function App() {
  const [reportData, setReportData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [error, setError] = useState('');

  const t = translations[language];

  // Load API key and saved reports on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
    setSavedReports(getReports());
  }, []);

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('geminiApiKey', val);
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // If a report is currently on screen, automatically translate its content!
    if (reportData) {
      const newT = translations[newLang];
      setIsTranslating(true);
      setError('');
      
      if (!apiKey) {
        // Fallback: Just swap to the new language's mock text
        setTimeout(() => {
          setReportData(prev => ({
            ...prev,
            progress: newT.mockProgress,
            materials: newT.mockMaterials,
            issues: newT.mockIssues
          }));
          setIsTranslating(false);
        }, 500);
      } else {
        // Send to Gemini for real live translation
        try {
          const translatedData = await translateReportContent(reportData, apiKey, newLang);
          setReportData(prev => ({
            ...prev,
            progress: translatedData.progress,
            materials: translatedData.materials,
            issues: translatedData.issues
          }));
        } catch (err) {
          console.error("Translation failed", err);
          setError("Failed to translate report content.");
        } finally {
          setIsTranslating(false);
        }
      }
    }
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

  const handleSaveReport = (report) => {
    saveReport(report);
    setSavedReports(getReports());
    setReportData(null); // Clear viewer to return to main screen
  };

  const handleDeleteReport = (id) => {
    deleteReport(id);
    setSavedReports(getReports());
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
            <select id="language" value={language} onChange={handleLanguageChange}>
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
        
        {isTranslating && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent)', marginTop: '1rem' }}>
            <div className="pulse-ring" style={{ position: 'relative', margin: '0 auto 1rem', width: '40px', height: '40px' }}></div>
            <p>Translating content...</p>
          </div>
        )}

        {reportData && !isTranslating && (
          <ReportViewer data={reportData} t={t} onSave={handleSaveReport} onClose={() => setReportData(null)} />
        )}

        {!reportData && !isTranslating && (
          <ReportHistory reports={savedReports} onDelete={handleDeleteReport} onView={(report) => setReportData(report)} t={t} />
        )}
      </main>
    </div>
  );
}

export default App;
