const DB_KEY = 'smart_site_reports_db';

export const saveReport = (report) => {
  const existingReports = getReports();
  const newReport = { ...report, id: Date.now().toString() };
  existingReports.unshift(newReport); // Add to beginning of array
  localStorage.setItem(DB_KEY, JSON.stringify(existingReports));
  return newReport;
};

export const getReports = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from local database:", error);
    return [];
  }
};

export const deleteReport = (id) => {
  const existingReports = getReports();
  const updatedReports = existingReports.filter(r => r.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(updatedReports));
  return updatedReports;
};
