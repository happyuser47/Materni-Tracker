import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, CalendarHeart, BellRing, LayoutDashboard, Search, Filter, Phone, MapPin, 
  History, MessageSquare, Plus, ChevronRight, AlertCircle, Activity, UserPlus, X, 
  Edit2, Save, Eye, Settings, Trash2, Check, CheckCircle2, Stethoscope, Database, 
  Upload, Download, FileSpreadsheet, RotateCcw, Briefcase, BarChart2, ShieldCheck, 
  UserCircle, ChevronDown, ChevronUp, ClipboardList, Copy, Calendar, ChevronLeft
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { ManageListCard } from '../components/ManageListCard';
import { OUTCOMES } from '../lib/constants';
import { calculateDaysUntil, formatDate, formatDateTime, formatCNIC, formatPhone } from '../utils/helpers';


export default function AddPatientModal() {
  const { activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();
  if (['PatientDetailModal', 'AddPatientModal', 'ConfirmModal', 'Toast'].includes('AddPatientModal')) {
     let isVisible = false;
     if ('AddPatientModal' === 'PatientDetailModal') isVisible = !!selectedPatient;
     if ('AddPatientModal' === 'AddPatientModal') isVisible = showAddModal;
     if ('AddPatientModal' === 'ConfirmModal') isVisible = confirmDialog.isOpen;
     if ('AddPatientModal' === 'Toast') isVisible = !!toastMessage;
     if (!isVisible) return null;
  }

  return (
    <>
      
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-teal-600" /> Register New Patient
              </h2>
              <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddNewPatient} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {addError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> {addError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input type="text" name="name" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNIC (Patient ID) *</label>
                  <input 
                    type="text" 
                    name="cnic" 
                    placeholder="XXXXX-XXXXXXX-X" 
                    required 
                    minLength={15}
                    maxLength={15}
                    onChange={(e) => {
                      e.target.value = formatCNIC(e.target.value);
                      if (e.target.value.length === 15 && patients.some(p => p.id === e.target.value)) {
                        setAddError('A patient with this CNIC is already registered.');
                      } else {
                        setAddError('');
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="03XX-XXXXXXX" 
                    required 
                    minLength={12}
                    maxLength={12}
                    onChange={(e) => e.target.value = formatPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Area / Location *</label>
                  <select name="area" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                    <option value="">Select Area...</option>
                    {areas.map(area => <option key={area.id} value={area.value}>{area.value}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Caste *</label>
                  <select name="caste" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                    <option value="">Select Caste...</option>
                    {castes.map(caste => <option key={caste.id} value={caste.value}>{caste.value}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference *</label>
                  <select name="reference" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                    <option value="">Select Reference...</option>
                    {references.map(ref => <option key={ref.id} value={ref.value}>{ref.value}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery (EDD) *</label>
                  <input type="date" name="edd" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                {currentUser?.role === 'Admin' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Staff Member *</label>
                    <select name="assignedTo" defaultValue="Unassigned" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                      <option value="Unassigned">Unassigned</option>
                      {staffNames.map(staff => <option key={staff} value={staff}>{staff}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!!addError} className="px-4 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" /> Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      
    </>
  );
}
