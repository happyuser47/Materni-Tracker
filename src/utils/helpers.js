export const calculateDaysUntil = (dateString) => {
  if (!dateString) return 0;
  const today = new Date('2026-03-12');
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

export const isPatientOverdue = (patient, alertConfig) => {
  if (!patient.edd || patient.status !== 'Active') return false;
  
  const daysToEdd = calculateDaysUntil(patient.edd);
  const daysSinceContact = calculateDaysUntil(patient.lastContact) * -1;
  
  // Broaden criteria:
  // 1. Critical proximity to EDD (7 days) regardless of contact
  const isNearDelivery = daysToEdd >= 0 && daysToEdd <= 7;
  
  // 2. Proximity to EDD (alertConfig.eddProximity) AND overdue for contact
  const isOverdueContact = daysSinceContact > alertConfig.contactGap;
  
  // 3. Or just generally nearing EDD while overdue
  const isNearingDeliveryAndOverdue = daysToEdd <= alertConfig.eddProximity && isOverdueContact;

  return isNearDelivery || isNearingDeliveryAndOverdue;
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
  const headers = ['CNIC', 'Name', 'Phone', 'Area', 'Caste', 'Reference', 'AssignedTo', 'RegistrationDate', 'EDD', 'Status', 'Intent', 'Preference', 'LastContact'];
  const rows = patients.map(p => 
    `"${p.id}","${p.name}","${p.phone}","${p.area}","${p.caste}","${p.reference}","${p.assignedTo}","${p.registrationDate}","${p.edd}","${p.status}","${p.intent}","${p.preference}","${p.lastContact}"`
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `MaterniTrack_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
