import React from 'react';
import './ReportHistory.css';

const ReportHistory = ({ reports, onDelete, onView, t }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="report-history glass-card empty-history">
        <h3>{t.historyTitle}</h3>
        <p>{t.noHistory}</p>
      </div>
    );
  }

  return (
    <div className="report-history glass-card">
      <h3>{t.historyTitle}</h3>
      <div className="history-list">
        {reports.map((report) => (
          <div key={report.id} className="history-card">
            <div className="history-header">
              <span className="history-date">{report.date}</span>
              <div className="history-actions">
                <button 
                  className="view-button" 
                  onClick={() => onView(report)}
                  title={t.btnView}
                >
                  {t.btnView}
                </button>
                <button 
                  className="delete-button" 
                  onClick={() => onDelete(report.id)}
                  title={t.btnDelete}
                >
                  {t.btnDelete}
                </button>
              </div>
            </div>
            <div className="history-preview" onClick={() => onView(report)} style={{cursor: 'pointer'}}>
              <p><strong>{t.catProgress}:</strong> {report.progress.substring(0, 60)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportHistory;
