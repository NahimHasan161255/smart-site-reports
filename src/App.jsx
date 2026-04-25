import React, { useState } from 'react';
import './index.css';
import VoiceInput from './components/VoiceInput';
import ReportViewer from './components/ReportViewer';

function App() {
  const [reportData, setReportData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSpeechResult = async (transcript) => {
    setIsProcessing(true);
    // Mock AI Processing
    setTimeout(() => {
      const mockReport = {
        date: new Date().toLocaleDateString(),
        progress: "Completed drywall installation on the 3rd floor. Finished preliminary electrical routing for the east wing.",
        materials: "Used 50 drywall boards, 2 boxes of screws, 100ft of copper wiring.",
        issues: "One drill broke down, need replacement tomorrow. Heavy rain delayed exterior work.",
        rawTranscript: transcript || "No audio detected. This is a mock response."
      };
      setReportData(mockReport);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Smart Site Reports</h1>
        <p>Voice-automated daily logs for construction.</p>
      </header>

      <main>
        <VoiceInput onResult={handleSpeechResult} isProcessing={isProcessing} />
        {reportData && <ReportViewer data={reportData} />}
      </main>
    </div>
  );
}

export default App;
