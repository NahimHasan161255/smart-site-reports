import React from 'react';
import './ReportViewer.css';

const ReportViewer = ({ data, t }) => {
  const handleExportPDF = () => {
    // Uses the native browser print engine which guarantees a perfectly valid PDF
    window.print();
  };

  return (
    <div className="report-viewer glass-card printable-report">
      <div className="pdf-content">
        <div className="report-header">
          <h2>{t.reportTitle}</h2>
          <span className="date-badge">{data.date}</span>
        </div>

        <div className="report-grid">
          <div className="report-section progress">
            <h3>{t.catProgress}</h3>
            <p>{data.progress}</p>
          </div>

          <div className="report-section materials">
            <h3>{t.catMaterials}</h3>
            <p>{data.materials}</p>
          </div>

          <div className="report-section issues">
            <h3>{t.catIssues}</h3>
            <p>{data.issues}</p>
          </div>
        </div>

        <div className="raw-transcript">
          <h4>{t.rawTranscript}</h4>
          <p>"{data.rawTranscript}"</p>
        </div>
      </div>
      
      <button className="export-button no-print" onClick={handleExportPDF}>{t.btnExport}</button>
    </div>
  );
};

export default ReportViewer;
