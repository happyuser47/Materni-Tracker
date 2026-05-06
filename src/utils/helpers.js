export const calculateDaysUntil = (dateString) => {
  if (!dateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dateString);
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  
  const diffTime = targetDate - today;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatCNIC = (value) => {
  const v = value.replace(/\D/g, '').slice(0, 13);
  if (v.length > 12) return `${v.slice(0, 5)}-${v.slice(5, 12)}-${v.slice(12)}`;
  if (v.length > 5) return `${v.slice(0, 5)}-${v.slice(5)}`;
  return v;
};

export const formatPhone = (value) => {
  const v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 4) return `${v.slice(0, 4)}-${v.slice(4)}`;
  return v;
};

// --- Alert System Thresholds ---
// Patients whose EDD passed beyond this grace period need case closure, not alerts.
const PAST_EDD_GRACE_DAYS = 14;

export const isPatientOverdue = (patient, alertConfig) => {
  if (!patient.edd || patient.status !== 'Active') return false;

  const daysToEdd = calculateDaysUntil(patient.edd);

  // Hard cutoff: EDD passed beyond grace period → needs case closure, not alerts
  if (daysToEdd < -PAST_EDD_GRACE_DAYS) return false;

  // 1. Delivery Overdue — EDD has passed but within grace window (most urgent)
  if (daysToEdd < 0) return true;

  // 2. Delivery Due — EDD approaching within configured proximity window
  if (daysToEdd <= (alertConfig?.eddProximity || 30)) return true;

  // 3. Scheduled follow-up is due today or overdue (only recent, staff-set dates)
  if (patient.nextInteractionDate) {
    const daysToNext = calculateDaysUntil(patient.nextInteractionDate);
    if (daysToNext <= 0 && daysToNext >= -(alertConfig?.contactGap || 14)) return true;
  }

  // No generic contact gap fallback — avoids flooding with bulk-imported records
  return false;
};

export const getPatientAlertType = (patient, alertConfig) => {
  if (!patient.edd || patient.status !== 'Active') return null;
  const daysToEdd = calculateDaysUntil(patient.edd);

  // Past EDD within grace → most critical
  if (daysToEdd < 0 && daysToEdd >= -PAST_EDD_GRACE_DAYS) return 'Delivery Overdue';

  // Upcoming delivery within proximity
  if (daysToEdd >= 0 && daysToEdd <= (alertConfig?.eddProximity || 30)) return 'Delivery Due';

  // Scheduled follow-up overdue (recent, staff-set)
  if (patient.nextInteractionDate) {
    const daysToNext = calculateDaysUntil(patient.nextInteractionDate);
    if (daysToNext <= 0 && daysToNext >= -(alertConfig?.contactGap || 14)) return 'Follow-up Due';
  }

  return null;
};

// CSV Helper Functions
export const generateCSVTemplate = () => {
  const headers = ['Name', 'CNIC', 'Phone', 'Area', 'Caste', 'Reference', 'AssignedTo', 'EDD_YYYY_MM_DD'];
  const csvContent = headers.join(',') + '\nExample Name,12345-1234567-1,0300-1234567,Ward 5 Layyah,Rajput,LHV,Nurse Fatima,2026-10-15';
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'MaterniTrack_Patient_Template.csv';
  link.click();
};

export const exportDataToCSV = (patients) => {
  const headers = ['#', 'CNIC', 'Name', 'Phone', 'Area', 'Caste', 'Reference', 'Primary Worker', 'Role', 'Status', 'Intent', 'Preference', 'EDD', 'Days Until EDD', 'Registration Date', 'Last Contact', 'Follow-up Count'];
  
  const rows = patients.map((p, index) => {
    const daysUntilEDD = calculateDaysUntil(p.edd);
    const interactionCount = p.interactions?.length || 0;
    return `"${index + 1}","${p.id}","${p.name}","${p.phone}","${p.area}","${p.caste}","${p.reference}","${p.assignedTo}","${p.assignmentType || 'Secondary'}","${p.status}","${p.intent}","${p.preference}","${formatDate(p.edd)}","${daysUntilEDD}","${formatDate(p.registrationDate)}","${formatDate(p.lastContact)}","${interactionCount}"`;
  });
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  
  // Adding BOM (\uFEFF) to make Excel parse UTF-8 correctly automatically
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Patient_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
