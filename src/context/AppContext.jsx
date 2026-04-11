import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

import { calculateDaysUntil, formatDate, formatDateTime, formatCNIC, formatPhone, isPatientOverdue, generateCSVTemplate, exportDataToCSV } from '../utils/helpers';
import { extractTextFromPDF, parsePdfPatientsForImport } from '../lib/pdfParser';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user: authUser, isSuperAdmin } = useAuth();
  const handleModifyList = async (type, action, value, id = null) => {
    if (action === 'add') {
      const { data } = await supabase.from('custom_lists').insert({ list_type: type, value }).select().single();
      if (data) {
        if (type === 'area') setAreas(p => [...p, { id: data.id, value: data.value }]);
        if (type === 'caste') setCastes(p => [...p, { id: data.id, value: data.value }]);
        if (type === 'reference') setReferences(p => [...p, { id: data.id, value: data.value }]);
      }
    } else if (action === 'edit' && id) {
      await supabase.from('custom_lists').update({ value }).eq('id', id);
      if (type === 'area') setAreas(p => p.map(x => x.id === id ? { ...x, value } : x));
      if (type === 'caste') setCastes(p => p.map(x => x.id === id ? { ...x, value } : x));
      if (type === 'reference') setReferences(p => p.map(x => x.id === id ? { ...x, value } : x));
    } else if (action === 'delete' && id) {
      await supabase.from('custom_lists').delete().eq('id', id);
      if (type === 'area') setAreas(p => p.filter(x => x.id !== id));
      if (type === 'caste') setCastes(p => p.filter(x => x.id !== id));
      if (type === 'reference') setReferences(p => p.filter(x => x.id !== id));
    }
  };
  const handleUpdateSettings = async (newConfig) => {
    setAlertConfig(newConfig);
    await supabase.from('system_settings').update({ value: newConfig }).eq('key', 'alertConfig');
  };

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'my-patients', 'patients', 'calendar', 'team', 'settings'
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingInteractionId, setEditingInteractionId] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isClosingCase, setIsClosingCase] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [pdfImportPreview, setPdfImportPreview] = useState(null); // { rows, mapping, formatLabel, fileName }
  const [batchProgress, setBatchProgress] = useState(null); // { current: 0, total: 0 }
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef(null);

  // Sidebar Expansion State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Global Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Custom Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  // Delivery Calendar State
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date('2026-03-12');
    d.setDate(1); // Set to start of month
    return d;
  });

  const requestConfirm = (message, onConfirm) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
  };

  // Customization States
  const [areas, setAreas] = useState([]);
  const [castes, setCastes] = useState([]);
  const [references, setReferences] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ eddProximity: 30, contactGap: 14 });

  // Role/Auth State
  const [currentUser, setCurrentUser] = useState(null);

  // Filtering States (Global Directory)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntent, setFilterIntent] = useState('All');
  const [filterArea, setFilterArea] = useState('All');
  const [filterCaste, setFilterCaste] = useState('All');
  const [filterReference, setFilterReference] = useState('All');
  const [filterAssignedTo, setFilterAssignedTo] = useState('All');
  const [filterAssignmentType, setFilterAssignmentType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [filterRegStart, setFilterRegStart] = useState('');
  const [filterRegEnd, setFilterRegEnd] = useState('');

  // Filtering States (My Patients Table)
  const [mySearchTerm, setMySearchTerm] = useState('');
  const [myFilterStatus, setMyFilterStatus] = useState('Active');
  const [myFilterAssignmentType, setMyFilterAssignmentType] = useState('All');

  // Daily Activity State
  const [activityDateFilter, setActivityDateFilter] = useState('');

  // Derived Data
  const uniqueAreas = ['All', ...areas.map(a => a.value)];
  const uniqueCastes = ['All', ...castes.map(c => c.value)];
  const uniqueReferences = ['All', ...references.map(r => r.value)];
  const staffNames = staffMembers.map(s => s.name);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterArea !== 'All') count++;
    if (filterCaste !== 'All') count++;
    if (filterReference !== 'All') count++;
    if (filterIntent !== 'All') count++;
    if (currentUser?.role === 'Admin' && filterAssignedTo !== 'All') count++;
    if (filterRegStart || filterRegEnd) count++;
    return count;
  }, [filterArea, filterCaste, filterReference, filterIntent, filterAssignedTo, filterRegStart, filterRegEnd, currentUser?.role]);

  // --- CORE DATA SEGMENTATION ---

  // Global Clinic Data
  const globalActive = useMemo(() => patients.filter(p => p.status === 'Active'), [patients]);
  const globalDeliveries = useMemo(() => patients.filter(p => p.status === 'Delivered (Clinic)'), [patients]);
  const globalAlerts = useMemo(() => globalActive.filter(p => isPatientOverdue(p, alertConfig)), [globalActive, alertConfig]);
  const globalUpcoming = useMemo(() => globalActive.filter(p => {
    const daysToEdd = calculateDaysUntil(p.edd);
    return daysToEdd >= 0 && daysToEdd <= 30;
  }).sort((a, b) => new Date(a.edd) - new Date(b.edd)), [globalActive]);

  // Personal Workload Data
  const myPatientsList = useMemo(() => patients.filter(p => p.assignedTo === currentUser?.name), [patients, currentUser]);
  const myActive = useMemo(() => myPatientsList.filter(p => p.status === 'Active'), [myPatientsList]);
  const myDeliveries = useMemo(() => myPatientsList.filter(p => p.status === 'Delivered (Clinic)'), [myPatientsList]);
  const myAlerts = useMemo(() => myActive.filter(p => isPatientOverdue(p, alertConfig)), [myActive, alertConfig]);
  const myUpcoming = useMemo(() => myActive.filter(p => {
    const daysToEdd = calculateDaysUntil(p.edd);
    return daysToEdd >= 0 && daysToEdd <= 30;
  }).sort((a, b) => new Date(a.edd) - new Date(b.edd)), [myActive]);

  // Dashboard Role Resolver
  const dashActive = currentUser?.role === 'Admin' ? globalActive : myActive;
  const dashDeliveries = currentUser?.role === 'Admin' ? globalDeliveries : myDeliveries;
  const dashAlerts = currentUser?.role === 'Admin' ? globalAlerts : myAlerts;
  const dashUpcoming = currentUser?.role === 'Admin' ? globalUpcoming : myUpcoming;

  // Notifications Icon Resolver
  const bellAlerts = currentUser?.role === 'Admin' ? globalAlerts : myAlerts;

  // Extract all interactions into a flat activity feed list
  const clinicActivities = useMemo(() => {
    const activities = [];
    patients.forEach(p => {
      p.interactions.forEach(interaction => {
        activities.push({
          ...interaction,
          patientId: p.id,
          patientName: p.name
        });
      });
    });
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [patients]);

  // Global Directory Filtering
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm) || p.id.includes(searchTerm);
      const matchesIntent = filterIntent === 'All' || p.intent === filterIntent;
      const matchesArea = filterArea === 'All' || p.area === filterArea;
      const matchesCaste = filterCaste === 'All' || p.caste === filterCaste;
      const matchesReference = filterReference === 'All' || p.reference === filterReference;
      const matchesAssigned = filterAssignedTo === 'All' || p.assignedTo === filterAssignedTo;
      const matchesAssignmentType = filterAssignmentType === 'All' || p.assignmentType === filterAssignmentType;
      const matchesStatus = filterStatus === 'All' ? true :
                            filterStatus === 'Active' ? p.status === 'Active' :
                            filterStatus === 'Resolved' ? p.status !== 'Active' :
                            p.status === filterStatus;

      let matchesRegDate = true;
      if (filterRegStart || filterRegEnd) {
        if (!p.registrationDate) {
          matchesRegDate = false;
        } else {
          const regDate = new Date(p.registrationDate);
          regDate.setHours(0, 0, 0, 0);

          if (filterRegStart) {
            const [y, m, d] = filterRegStart.split('-');
            const startDate = new Date(y, parseInt(m) - 1, d);
            startDate.setHours(0, 0, 0, 0);
            if (regDate < startDate) matchesRegDate = false;
          }

          if (filterRegEnd) {
            const [y, m, d] = filterRegEnd.split('-');
            const endDate = new Date(y, parseInt(m) - 1, d);
            endDate.setHours(0, 0, 0, 0);
            if (regDate > endDate) matchesRegDate = false;
          }
        }
      }

      return matchesSearch && matchesIntent && matchesArea && matchesCaste && matchesReference && matchesAssigned && matchesAssignmentType && matchesStatus && matchesRegDate;
    }).sort((a, b) => new Date(a.edd) - new Date(b.edd));
  }, [patients, searchTerm, filterIntent, filterArea, filterCaste, filterReference, filterAssignedTo, filterAssignmentType, filterStatus, filterRegStart, filterRegEnd]);

  // Personal Directory Filtering ("My Patients" Table)
  const filteredMyPatientsList = useMemo(() => {
    return myPatientsList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(mySearchTerm.toLowerCase()) || p.phone.includes(mySearchTerm) || p.id.includes(mySearchTerm);
      const matchesStatus = myFilterStatus === 'All' ? true :
                            myFilterStatus === 'Active' ? p.status === 'Active' :
                            myFilterStatus === 'Resolved' ? p.status !== 'Active' :
                            p.status === myFilterStatus;
      const matchesAssignment = myFilterAssignmentType === 'All' || p.assignmentType === myFilterAssignmentType;
      return matchesSearch && matchesStatus && matchesAssignment;
    }).sort((a, b) => new Date(a.edd) - new Date(b.edd));
  }, [myPatientsList, mySearchTerm, myFilterStatus, myFilterAssignmentType]);

  // Daily Activity Filtering
  const filteredActivities = useMemo(() => {
    if (!activityDateFilter) return clinicActivities.slice(0, 50); // Show latest 50 if no specific date selected
    return clinicActivities.filter(a => a.date.startsWith(activityDateFilter));
  }, [clinicActivities, activityDateFilter]);

  // Activity Comparison Summary (For the new Overview Table)
  const activitySummary = useMemo(() => {
    return staffMembers.map(staff => {
      const acts = clinicActivities.filter(a => a.staff === staff.name && (!activityDateFilter || a.date.startsWith(activityDateFilter)));
      return {
        name: staff.name,
        role: staff.role,
        total: acts.length,
        calls: acts.filter(a => a.type === 'Call').length,
        visits: acts.filter(a => a.type === 'Visit').length,
        referrals: acts.filter(a => a.type === 'Referral').length,
        outcomes: acts.filter(a => a.type === 'Outcome Logged').length
      };
    }).sort((a, b) => b.total - a.total); // Sort by highest performer
  }, [staffMembers, clinicActivities, activityDateFilter]);

  // Admin Team Performance Data
  const teamPerformance = useMemo(() => {
    return staffMembers.map(staff => {
      const assigned = patients.filter(p => p.assignedTo === staff.name && p.status === 'Active');
      const overdue = assigned.filter(p => isPatientOverdue(p, alertConfig));
      const highIntent = assigned.filter(p => p.intent === 'High').length;
      const mediumIntent = assigned.filter(p => p.intent === 'Medium').length;
      const lowIntent = assigned.filter(p => p.intent === 'Low').length;

      // Calculate follow-ups logged on the specific date filter (or all-time if empty)
      const interactionsLogged = clinicActivities.filter(a => a.staff === staff.name && (!activityDateFilter || a.date.startsWith(activityDateFilter))).length;

      return {
        ...staff,
        totalActive: assigned.length,
        overdueCount: overdue.length,
        interactionsLogged,
        highIntent,
        mediumIntent,
        lowIntent
      };
    });
  }, [patients, staffMembers, alertConfig, clinicActivities, activityDateFilter]);

  // Calendar Helpers
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();

  const getPatientsForDate = (d) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return globalActive.filter(p => p.edd === dateStr);
  };


  useEffect(() => {
    if (authUser) {
      fetchInitialData();
    }
  }, [authUser]);

  const fetchInitialData = async () => {
    // Only show full-screen loader on very first load ever
    if (!hasLoadedOnce.current) {
      setIsLoading(true);
    }
    // Fetch Settings
    const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'alertConfig').maybeSingle();
    if (settings?.value) setAlertConfig(settings.value);

    // Fetch Lists
    const { data: lists } = await supabase.from('custom_lists').select('*');
    if (lists) {
      setAreas(lists.filter(l => l.list_type === 'area').map(l => ({ id: l.id, value: l.value })));
      setCastes(lists.filter(l => l.list_type === 'caste').map(l => ({ id: l.id, value: l.value })));
      setReferences(lists.filter(l => l.list_type === 'reference').map(l => ({ id: l.id, value: l.value })));
    }

    // Fetch Staff
    const { data: staffData } = await supabase.from('staff').select('*').order('created_at');
    if (staffData && staffData.length > 0) {
      setStaffMembers(staffData);
      // Set current user based on authenticated user's auth_id
      if (authUser) {
        const matchedStaff = staffData.find(s => s.auth_id === authUser.id);
        if (matchedStaff) {
          setCurrentUser(matchedStaff);
        } else {
          console.warn('Auth user found but no matching public.staff record exists.');
          // We don't call setIsLoading(false) yet, or we let it finish and handle null currentUser in UI
        }
      }
    }

    // Fetch Patients & Interactions
    const { data: pData, error: pError } = await supabase.from('patients').select(`
      *,
      assigned_to_staff:staff!patients_assigned_to_fkey(name),
      interactions(*, interaction_staff:staff!interactions_staff_id_fkey(name))
    `);

    if (pError) {
      console.error("Supabase Fetch Error (Patients):", pError);
    }

    if (pData) {
      const mapped = pData.map(p => ({
        uuid: p.id,
        id: p.cnic,
        name: p.name,
        phone: p.phone,
        area: p.area,
        caste: p.caste,
        reference: p.reference,
        assignedTo: p.assigned_to_staff ? p.assigned_to_staff.name : 'Unassigned',
        assignmentType: p.assignment_type || 'Secondary',
        edd: p.edd,
        intent: p.intent,
        preference: p.preference,
        status: p.status,
        registrationDate: p.registration_date,
        lastContact: p.last_contact,
        nextInteractionDate: p.next_interaction_date,
        interactions: (p.interactions || []).map(i => ({
          uuid: i.id,
          id: i.id,
          date: i.date,
          type: i.type,
          staff: i.interaction_staff ? i.interaction_staff.name : 'Unknown',
          notes: i.notes,
          intent: i.intent,
          preference: i.preference,
          nextInteractionDate: i.next_interaction_date
        })).sort((a, b) => new Date(b.date) - new Date(a.date))
      }));
      setPatients(mapped);
    }

    setIsLoading(false);
    hasLoadedOnce.current = true;
  };

  // Keep selected patient in sync with updates
  useEffect(() => {
    if (selectedPatient) {
      setSelectedPatient(patients.find(p => p.id === selectedPatient.id) || null);
    }
  }, [patients]);

  // Handlers
  const handleAddNewPatient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cnic = formData.get('cnic');
    const name = formData.get('name');

    if (patients.some(p => p.id === cnic)) {
      setAddError('A patient with this CNIC already exists in the system!');
      return;
    }

    const assignedStaffName = currentUser?.role === 'Admin' ? (formData.get('assignedTo') || 'Unassigned') : (currentUser?.name || 'Unassigned');
    const assignedStaffObj = staffMembers.find(s => s.name === assignedStaffName);
    const assignedToId = assignedStaffObj ? assignedStaffObj.id : null;

    // Assignment type: Primary or Secondary (admin can set, staff defaults to Secondary)
    const assignmentType = currentUser?.role === 'Admin' ? (formData.get('assignmentType') || 'Secondary') : 'Secondary';

    const newPatient = {
      cnic, name, phone: formData.get('phone'), area: formData.get('area'),
      caste: formData.get('caste'), reference: formData.get('reference'),
      assigned_to: assignedToId,
      assignment_type: assignmentType,
      edd: formData.get('edd'), intent: 'Medium', preference: 'Undecided',
      status: 'Active', registration_date: new Date().toISOString(), last_contact: new Date().toISOString()
    };

    const { data: pData, error: pErr } = await supabase.from('patients').insert(newPatient).select().single();
    if (pErr) { setAddError(pErr.message); return; }

    const newInteraction = {
      patient_id: pData.id, date: new Date().toISOString(), type: 'Visit',
      staff_id: currentUser?.id, notes: 'Patient registered in system.', intent: 'Medium', preference: 'Undecided'
    };
    const { data: iData } = await supabase.from('interactions').insert(newInteraction).select().single();

    const mappedPatient = {
      uuid: pData.id, id: pData.cnic, name: pData.name, phone: pData.phone, area: pData.area, caste: pData.caste, reference: pData.reference,
      assignedTo: assignedStaffName, assignmentType,
      edd: pData.edd, intent: pData.intent, preference: pData.preference, status: pData.status,
      registrationDate: pData.registration_date, lastContact: pData.last_contact,
      interactions: [{
        uuid: iData?.id, id: iData?.id, date: iData?.date, type: iData?.type, staff: currentUser?.name || 'Unknown', notes: iData?.notes, intent: iData?.intent, preference: iData?.preference
      }]
    };

    setPatients([mappedPatient, ...patients]);
    setShowAddModal(false);
    setAddError('');
    setToastMessage({ type: 'success', text: `${name} registered successfully!` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdatePatientDetails = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const assignedStaffName = currentUser?.role === 'Admin' ? formData.get('assignedTo') : selectedPatient.assignedTo;
    const assignedStaffObj = staffMembers.find(s => s.name === assignedStaffName);
    const assignedToId = assignedStaffObj ? assignedStaffObj.id : null;

    const assignmentType = currentUser?.role === 'Admin' ? (formData.get('assignmentType') || selectedPatient.assignmentType) : selectedPatient.assignmentType;

    const updates = {
      name: formData.get('name'), phone: formData.get('phone'), area: formData.get('area'),
      caste: formData.get('caste'), reference: formData.get('reference'),
      assigned_to: assignedToId,
      assignment_type: assignmentType,
      edd: formData.get('edd')
    };

    await supabase.from('patients').update(updates).eq('id', selectedPatient.uuid);

    setPatients(prev => prev.map(p => {
      if (p.uuid === selectedPatient.uuid) {
        return { 
          ...p, 
          name: updates.name, phone: updates.phone, area: updates.area,
          caste: updates.caste, reference: updates.reference, edd: updates.edd,
          assignedTo: assignedStaffName, assignmentType,
          id: selectedPatient.id
        };
      }
      return p;
    }));
    setIsEditingDetails(false);
  };

  const handleAddInteraction = async (patientId, interactionData) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newIntent = interactionData.newIntent || patient.intent;
    const newPreference = interactionData.newPreference || patient.preference;

    const newInteraction = {
      patient_id: patient.uuid, date: interactionData.date, type: interactionData.type,
      staff_id: currentUser?.id, notes: interactionData.notes, intent: newIntent, preference: newPreference,
      next_interaction_date: interactionData.nextInteractionDate || null
    };

    const [{ data: iData }, { data: pData }] = await Promise.all([
      supabase.from('interactions').insert(newInteraction).select().single(),
      supabase.from('patients').update({ intent: newIntent, preference: newPreference, last_contact: interactionData.date, next_interaction_date: interactionData.nextInteractionDate || patient.nextInteractionDate || null }).eq('id', patient.uuid).select().single()
    ]);

    setPatients(prev => prev.map(p => {
      if (p.uuid === patient.uuid) {
        return {
          ...p, intent: newIntent, preference: newPreference, lastContact: interactionData.date, nextInteractionDate: interactionData.nextInteractionDate || p.nextInteractionDate,
          interactions: [{
            uuid: iData?.id, id: iData?.id, date: iData?.date, type: iData?.type, staff: currentUser?.name || 'Unknown', notes: iData?.notes, intent: iData?.intent, preference: iData?.preference, nextInteractionDate: iData?.next_interaction_date
          }, ...p.interactions].sort((a, b) => new Date(b.date) - new Date(a.date))
        };
      }
      return p;
    }));
  };

  const handleCloseCase = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const outcome = formData.get('outcome');
    const notes = formData.get('notes');
    const patient = selectedPatient;

    const newInteraction = {
      patient_id: patient.uuid, date: new Date().toISOString(), type: 'Outcome Logged',
      staff_id: currentUser?.id, notes: `Case closed. Outcome: ${outcome}. Additional notes: ${notes}`, intent: patient.intent, preference: patient.preference
    };

    const [{ data: iData }] = await Promise.all([
      supabase.from('interactions').insert(newInteraction).select().single(),
      supabase.from('patients').update({ status: outcome, last_contact: new Date().toISOString() }).eq('id', patient.uuid)
    ]);

    setPatients(prev => prev.map(p => {
      if (p.uuid === patient.uuid) {
        return {
          ...p, status: outcome, lastContact: new Date().toISOString(),
          interactions: [{
            uuid: iData?.id, id: iData?.id, date: iData?.date, type: iData?.type, staff: currentUser?.name || 'Unknown', notes: iData?.notes, intent: iData?.intent, preference: iData?.preference
          }, ...p.interactions].sort((a, b) => new Date(b.date) - new Date(a.date))
        };
      }
      return p;
    }));
    setIsClosingCase(false);
  };

  const handleReopenCase = async (patientId) => {
    const patient = patients.find(p => p.id === patientId);

    const newInteraction = {
      patient_id: patient.uuid, date: new Date().toISOString(), type: 'Case Reopened',
      staff_id: currentUser?.id, notes: 'Case was manually reopened to resume tracking.', intent: patient.intent, preference: patient.preference
    };

    const [{ data: iData }] = await Promise.all([
      supabase.from('interactions').insert(newInteraction).select().single(),
      supabase.from('patients').update({ status: 'Active', last_contact: new Date().toISOString() }).eq('id', patient.uuid)
    ]);

    setPatients(prev => prev.map(p => {
      if (p.uuid === patient.uuid) {
        return {
          ...p, status: 'Active', lastContact: new Date().toISOString(),
          interactions: [{
            uuid: iData?.id, id: iData?.id, date: iData?.date, type: iData?.type, staff: currentUser?.name || 'Unknown', notes: iData?.notes, intent: iData?.intent, preference: iData?.preference
          }, ...p.interactions].sort((a, b) => new Date(b.date) - new Date(a.date))
        };
      }
      return p;
    }));
  };

  const handleUpdateInteraction = async (patientId, interactionId, updatedData) => {
    const patient = patients.find(p => p.id === patientId);
    const interaction = patient.interactions.find(i => i.id === interactionId);

    await supabase.from('interactions').update(updatedData).eq('id', interaction.uuid);

    const isLatest = patient.interactions[0]?.id === interactionId;
    if (isLatest && (updatedData.intent || updatedData.preference || updatedData.date || updatedData.next_interaction_date !== undefined)) {
      const pUpdates = {};
      if (updatedData.intent) pUpdates.intent = updatedData.intent;
      if (updatedData.preference) pUpdates.preference = updatedData.preference;
      if (updatedData.date) pUpdates.last_contact = updatedData.date;
      if (updatedData.next_interaction_date !== undefined) pUpdates.next_interaction_date = updatedData.next_interaction_date;
      
      await supabase.from('patients').update(pUpdates).eq('id', patient.uuid);
    }
    
    setPatients(prev => prev.map(p => {
      if (p.uuid === patient.uuid) {
        return {
          ...p,
          intent: isLatest && updatedData.intent ? updatedData.intent : p.intent,
          preference: isLatest && updatedData.preference ? updatedData.preference : p.preference,
          lastContact: isLatest && updatedData.date ? updatedData.date : p.lastContact,
          nextInteractionDate: isLatest && updatedData.next_interaction_date !== undefined ? updatedData.next_interaction_date : p.nextInteractionDate,
          interactions: p.interactions.map(i => i.id === interactionId ? { ...i, ...updatedData, nextInteractionDate: updatedData.next_interaction_date !== undefined ? updatedData.next_interaction_date : i.nextInteractionDate } : i)
        };
      }
      return p;
    }));
    setEditingInteractionId(null);
  };

  const runBulkPatientUpsert = async (rows, mapping) => {
    const BATCH_SIZE = 50;
    let successCount = 0;
    let errorCount = 0;

    setBatchProgress({ current: 0, total: rows.length });

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const toUpsert = [];

      for (const cells of chunk) {
        const cnicRaw = mapping.cnic !== -1 && cells[mapping.cnic] ? cells[mapping.cnic] : '';
        const formattedCnic = formatCNIC(cnicRaw);

        if (formattedCnic.length !== 15) { errorCount++; continue; }

        const staffObj = staffMembers.find(s => s.name === (mapping.staff !== -1 ? cells[mapping.staff] : ''));

        toUpsert.push({
          cnic: formattedCnic,
          name: mapping.name !== -1 ? cells[mapping.name] : 'Unknown',
          phone: mapping.phone !== -1 ? formatPhone(cells[mapping.phone]) : '',
          area: mapping.area !== -1 ? cells[mapping.area] : 'Other',
          caste: mapping.caste !== -1 ? cells[mapping.caste] : 'Other',
          reference: mapping.ref !== -1 ? cells[mapping.ref] : 'Other',
          assigned_to: staffObj ? staffObj.id : null,
          edd: mapping.edd !== -1 && cells[mapping.edd] ? cells[mapping.edd] : new Date(Date.now() + Math.random() * 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          intent: 'Medium', preference: 'Undecided', status: 'Active',
          registration_date: new Date().toISOString(), last_contact: new Date().toISOString()
        });
      }

      if (toUpsert.length > 0) {
        const { data, error } = await supabase.from('patients').upsert(toUpsert, { onConflict: 'cnic' }).select();
        if (!error) successCount += (data?.length || 0);
        else errorCount += toUpsert.length;
      }

      setBatchProgress({ current: Math.min(i + BATCH_SIZE, rows.length), total: rows.length });
      await new Promise(r => setTimeout(r, 0));
    }

    const { data: all } = await supabase.from('patients').select(`*, staff:assigned_to (name), interactions:interactions (*, staff:staff_id (name))`).order('registration_date', { ascending: false });
    if (all) {
      setPatients(all.map(p => ({
        uuid: p.id, id: p.cnic, name: p.name, phone: p.phone, area: p.area, caste: p.caste, reference: p.reference,
        assignedTo: p.staff?.name || 'Unassigned', edd: p.edd, intent: p.intent, preference: p.preference, status: p.status,
        registrationDate: p.registration_date, lastContact: p.last_contact,
        interactions: p.interactions?.map(i => ({
          uuid: i.id, id: i.id, date: i.date, type: i.type, staff: i.staff?.name || 'System', notes: i.notes, intent: i.intent, preference: i.preference
        })).sort((a, b) => new Date(b.date) - new Date(a.date)) || []
      })));
    }

    setImportStatus(`success: Processed ${rows.length} records. Imported/Updated: ${successCount}. Errors: ${errorCount}.`);
    setBatchProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelPdfImport = () => {
    setPdfImportPreview(null);
    setImportStatus(null);
    setBatchProgress(null);
  };

  const confirmPdfImport = async () => {
    if (!pdfImportPreview) return;
    const { rows, mapping } = pdfImportPreview;
    try {
      await runBulkPatientUpsert(rows, mapping);
    } finally {
      setPdfImportPreview(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPdfImportPreview(null);
    setImportStatus(null);
    setBatchProgress({ current: 0, total: 0 });

    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    let dataRows = [];
    const m = { name: 0, cnic: 1, phone: 2, area: 3, caste: 4, ref: 5, staff: 6, edd: 7 };

    if (isPDF) {
      setImportStatus('Parsing PDF…');
      try {
        const fullText = await extractTextFromPDF(file);
        console.log('[PDF Import] Extracted text length:', fullText.length);

        const { format, patients: parsedPatients, parseError } = parsePdfPatientsForImport(fullText);
        console.log('[PDF Import] format:', format, 'count:', parsedPatients?.length, parseError || '');

        if (parseError === 'maternal_marker_but_no_rows') {
          setImportStatus('error: This PDF looks like a Maternal Health Register, but no patient rows could be parsed. Try re-exporting from the source system.');
          setBatchProgress(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        if (!parsedPatients.length) {
          setImportStatus('error: No patient rows found. Supported PDFs: MNHC Maternal Health Register (ANC), or the legacy OPD export with Female + CNIC layout.');
          setBatchProgress(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const formatLabel = format === 'maternal' ? 'Maternal Health Register (MNHC / HISDU)' : 'OPD export';
        for (const p of parsedPatients) {
          dataRows.push([
            p.name,
            p.cnic,
            p.phone,
            p.address,
            'Other',
            format === 'maternal' ? 'MNHC Register' : 'OPD',
            '',
            p.eddIso || ''
          ]);
        }

        setBatchProgress(null);
        setPdfImportPreview({ rows: dataRows, mapping: m, formatLabel, fileName: file.name });
        setImportStatus(
          `info: Parsed ${dataRows.length} row(s) from ${formatLabel}. Review the preview and click Confirm import. Existing CNICs will be updated (upsert), not duplicated.`
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setImportStatus(`error: Failed to read PDF. (${err.message})`);
        console.error('[PDF Import] Error:', err);
        setBatchProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        const allLines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (allLines.length < 2) {
          setImportStatus('error: File is empty or invalid format.');
          setBatchProgress(null);
          return;
        }

        const parseCSV = (l) => {
          const res = [];
          let s = '', q = false;
          for (let i = 0; i < l.length; i++) {
            const c = l[i];
            if (c === '"' && l[i + 1] === '"') { s += '"'; i++; }
            else if (c === '"') q = !q;
            else if (c === ',' && !q) { res.push(s.trim()); s = ''; }
            else s += c;
          }
          res.push(s.trim());
          return res.map(v => v.replace(/^"|"$/g, '').trim());
        };

        const rawHeaders = parseCSV(allLines[0]);
        const csvMapping = {
          name: rawHeaders.findIndex(h => /name|full/i.test(h)),
          cnic: rawHeaders.findIndex(h => /cnic|id|identity/i.test(h)),
          phone: rawHeaders.findIndex(h => /phone|mobile|contact/i.test(h)),
          area: rawHeaders.findIndex(h => /area|location/i.test(h)),
          caste: rawHeaders.findIndex(h => /caste/i.test(h)),
          ref: rawHeaders.findIndex(h => /ref/i.test(h)),
          staff: rawHeaders.findIndex(h => /assign/i.test(h)),
          edd: rawHeaders.findIndex(h => /edd|delivery/i.test(h))
        };

        dataRows = allLines.slice(1).map(line => parseCSV(line));
        await runBulkPatientUpsert(dataRows, csvMapping);
      };
      reader.readAsText(file);
    }
  };
  const handleAddStaff = async (staffData) => {
    const { name, role, email, password } = staffData;

    if (!name || staffMembers.some(s => s.name === name)) return { error: 'Staff name already exists or is empty.' };

    // Use server-side RPC to create auth user + staff record atomically
    const { data: result, error: rpcError } = await supabase.rpc('create_staff_auth_user', {
      staff_email: email,
      staff_password: password,
      staff_name: name,
      staff_role: role
    });

    if (rpcError) return { error: rpcError.message };
    if (result?.error) return { error: result.error };

    // Refresh staff list from DB to get the new record
    const { data: staffData2 } = await supabase.from('staff').select('*').order('created_at');
    if (staffData2) setStaffMembers(staffData2);

    return { success: true };
  };

  const handleDeleteStaff = (id) => {
    const staff = staffMembers.find(s => s.id === id);
    if (!staff) return;

    // PROTECTION: Cannot delete Dr. Usama Akram (Super Admin)
    if (staff.email === 'usama786@gmail.com') {
      setToastMessage({ type: 'error', text: 'Dr. Usama Akram is the Super Admin and cannot be removed.' });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // PROTECTION: Only Super Admin can delete other Admins
    if (staff.role === 'Admin' && !isSuperAdmin) {
      setToastMessage({ type: 'error', text: 'Only the Super Admin can remove other Admin accounts.' });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (staffMembers.length === 1) return;
    if (currentUser?.id === id) {
      setToastMessage({ type: 'error', text: 'You cannot remove your own account while logged in.' });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    requestConfirm(
      `Are you sure you want to remove ${staff.name} from the system? This will also permanently delete their login account.`,
      async () => {
        const { data: res, error: rpcError } = await supabase.rpc('delete_staff_member', { 
          target_staff_id: id 
        });

        if (rpcError || res?.error) {
          setToastMessage({ type: 'error', text: rpcError?.message || res?.error || 'Failed to remove staff member.' });
        } else {
          // Update local staff list
          setStaffMembers(prev => prev.filter(s => s.id !== id));
          
          // CRITICAL: Update local patients state to reflect "Unassigned" status
          setPatients(prev => prev.map(p => ({
            ...p,
            assignedTo: p.assignedTo === staff.name ? 'Unassigned' : p.assignedTo,
            interactions: p.interactions.map(i => 
              i.staff === staff.name ? { ...i, staff: 'System' } : i
            )
          })));

          setToastMessage({ type: 'success', text: `${staff.name} and their login account removed successfully.` });
        }
        setTimeout(() => setToastMessage(null), 3000);
      }
    );
  };

  const handleCopyPhone = (phone) => {
    const textArea = document.createElement("textarea");
    textArea.value = phone;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setToastMessage({ type: 'success', text: 'Phone number copied to clipboard!' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handleDeletePatient = (id) => {
    const patient = patients.find(p => p.id === id);
    requestConfirm(
      `Are you sure you want to permanently delete this patient record? All interactions and data will be lost.`,
      async () => {
        await supabase.from('patients').delete().eq('id', patient.uuid);
        setPatients(prev => prev.filter(p => p.id !== id));
        setSelectedPatient(null);
        setIsEditingDetails(false);
        setIsClosingCase(false);
        setEditingInteractionId(null);
      }
    );
  };
  const handleWipeAllPatients = async () => {
    try {
      // First, we need to delete interactions because of foreign key constraints if not set to cascade
      // But typically patients table delete with cascade is better. 
      // To bypass the "where" requirement, we use a filter that matches everything.
      const { error } = await supabase.from('patients').delete().neq('name', '___NON_EXISTENT_PATIENT___');
      
      if (error) throw error;
      
      setPatients([]);
      setSelectedPatient(null);
      return { success: true };
    } catch (err) {
      console.error('Wipe failed:', err);
      return { error: err.message };
    }
  };



  const contextValue = useMemo(() => ({
    isLoading, isSuperAdmin, handleModifyList, handleUpdateSettings,
    activeTab,
    setActiveTab,
    patients,
    setPatients,
    selectedPatient,
    setSelectedPatient,
    editingInteractionId,
    setEditingInteractionId,
    isEditingDetails,
    setIsEditingDetails,
    isClosingCase,
    setIsClosingCase,
    showAddModal,
    setShowAddModal,
    addError,
    setAddError,
    importStatus,
    setImportStatus,
    showNotifications,
    setShowNotifications,
    showFilters,
    setShowFilters,
    fileInputRef,
    isSidebarOpen,
    setIsSidebarOpen,
    toastMessage,
    setToastMessage,
    confirmDialog,
    setConfirmDialog,
    requestConfirm,
    closeConfirm,
    calendarDate,
    setCalendarDate,
    areas,
    setAreas,
    castes,
    setCastes,
    references,
    setReferences,
    staffMembers,
    setStaffMembers,
    alertConfig,
    setAlertConfig,
    currentUser,
    setCurrentUser,
    searchTerm,
    setSearchTerm,
    filterIntent,
    setFilterIntent,
    filterArea,
    setFilterArea,
    filterCaste,
    setFilterCaste,
    filterReference,
    setFilterReference,
    filterAssignedTo,
    setFilterAssignedTo,
    filterAssignmentType,
    setFilterAssignmentType,
    filterStatus,
    setFilterStatus,
    filterRegStart,
    setFilterRegStart,
    filterRegEnd,
    setFilterRegEnd,
    mySearchTerm,
    setMySearchTerm,
    myFilterStatus,
    setMyFilterStatus,
    myFilterAssignmentType,
    setMyFilterAssignmentType,
    activityDateFilter,
    setActivityDateFilter,
    uniqueAreas,
    uniqueCastes,
    uniqueReferences,
    staffNames,
    activeFilterCount,
    globalActive,
    globalDeliveries,
    globalAlerts,
    globalUpcoming,
    myPatientsList,
    myActive,
    myDeliveries,
    myAlerts,
    myUpcoming,
    dashActive,
    dashDeliveries,
    dashAlerts,
    dashUpcoming,
    bellAlerts,
    clinicActivities,
    filteredPatients,
    filteredMyPatientsList,
    filteredActivities,
    activitySummary,
    teamPerformance,
    calendarYear,
    calendarMonth,
    daysInMonth,
    firstDayIndex,
    getPatientsForDate,
    handleAddNewPatient,
    handleUpdatePatientDetails,
    handleAddInteraction,
    handleCloseCase,
    handleReopenCase,
    handleUpdateInteraction,
    handleFileUpload,
    pdfImportPreview,
    cancelPdfImport,
    confirmPdfImport,
    handleAddStaff,
    handleDeleteStaff,
    handleCopyPhone,
    handleDeletePatient,
    handleWipeAllPatients,
    batchProgress
  }), [
    isLoading, isSuperAdmin, activeTab, patients, selectedPatient, editingInteractionId, 
    isEditingDetails, isClosingCase, showAddModal, addError, importStatus, pdfImportPreview,
    showNotifications, showFilters, isSidebarOpen, toastMessage, confirmDialog,
    calendarDate, areas, castes, references, staffMembers, alertConfig, currentUser,
    searchTerm, filterIntent, filterArea, filterCaste, filterReference, filterAssignedTo, filterAssignmentType,
    filterStatus, filterRegStart, filterRegEnd, mySearchTerm, myFilterStatus,
    myFilterAssignmentType, activityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames,
    activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming,
    myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive,
    dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities,
    filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary,
    teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex,
    batchProgress
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
