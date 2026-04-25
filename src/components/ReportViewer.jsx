import React from 'react';
import './ReportViewer.css';

const ReportViewer = ({ data }) => {
  return (
    <div className="report-viewer glass-card">
      <div className="report-header">
        <h2>Generated Daily Report</h2>
        <span className="date-badge">{data.date}</span>
      </div>

      <div className="report-grid">
        <div className="report-section progress">
          <h3>Progress</h3>
          <p>{data.progress}</p>
        </div>

        <div className="report-section materials">
          <h3>Materials Used</h3>
          <p>{data.materials}</p>
        </div>

        <div className="report-section issues">
          <h3>Issues & Delays</h3>
          <p>{data.issues}</p>
        </div>
      </div>

      <div className="raw-transcript">
        <h4>Raw Transcript</h4>
        <p>"{data.rawTranscript}"</p>
      </div>
      
      <button className="export-button">Export as PDF</button>
    </div>
  );
};

export default ReportViewer;
