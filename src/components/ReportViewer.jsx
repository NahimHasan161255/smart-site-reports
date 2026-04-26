import React from 'react';
import './ReportViewer.css';

const ReportViewer = ({ data, t, onSave, onClose }) => {
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
      
      <div className="report-actions no-print" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="export-button" style={{ flex: 1, margin: 0 }} onClick={handleExportPDF}>{t.btnExport}</button>
        {data.id ? (
           <button className="export-button" style={{ flex: 1, margin: 0, background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }} onClick={onClose}>{t.btnClose}</button>
        ) : (
           <button className="export-button" style={{ flex: 1, margin: 0, background: 'var(--success)', color: '#000', borderColor: 'var(--success)' }} onClick={() => onSave(data)}>{t.btnSaveDb}</button>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;
