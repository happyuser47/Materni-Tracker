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


export default function ConfirmModal() {
  const { activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();
  if (['PatientDetailModal', 'AddPatientModal', 'ConfirmModal', 'Toast'].includes('ConfirmModal')) {
     let isVisible = false;
     if ('ConfirmModal' === 'PatientDetailModal') isVisible = !!selectedPatient;
     if ('ConfirmModal' === 'AddPatientModal') isVisible = showAddModal;
     if ('ConfirmModal' === 'ConfirmModal') isVisible = confirmDialog.isOpen;
     if ('ConfirmModal' === 'Toast') isVisible = !!toastMessage;
     if (!isVisible) return null;
  }

  return (
    <>
      
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-lg font-bold text-slate-900">Confirm Deletion</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={closeConfirm} 
                className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { confirmDialog.onConfirm(); closeConfirm(); }} 
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      
    </>
  );
}
