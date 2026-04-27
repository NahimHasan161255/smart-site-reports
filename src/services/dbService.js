const API_URL = 'http://localhost:5000/api/reports';

export const saveReport = async (reportData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    // Fallback to local storage if backend is not running
    const existing = getReportsSync();
    const newReport = { ...reportData, id: Date.now().toString() };
    localStorage.setItem('reports', JSON.stringify([newReport, ...existing]));
    return newReport;
  }
};

export const getReports = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Error fetching from MongoDB, falling back to local storage:", error);
    return getReportsSync();
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Network response was not ok');
    return true;
  } catch (error) {
    console.error("Error deleting from MongoDB:", error);
    // Fallback
    const reports = getReportsSync();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem('reports', JSON.stringify(filtered));
    return true;
  }
};

const getReportsSync = () => {
  const reports = localStorage.getItem('reports');
  return reports ? JSON.parse(reports) : [];
};
