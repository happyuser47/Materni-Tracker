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


export default function Toast() {
  const { activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();
  if (['PatientDetailModal', 'AddPatientModal', 'ConfirmModal', 'Toast'].includes('Toast')) {
     let isVisible = false;
     if ('Toast' === 'PatientDetailModal') isVisible = !!selectedPatient;
     if ('Toast' === 'AddPatientModal') isVisible = showAddModal;
     if ('Toast' === 'ConfirmModal') isVisible = confirmDialog.isOpen;
     if ('Toast' === 'Toast') isVisible = !!toastMessage;
     if (!isVisible) return null;
  }

  return (
    <>
      
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 max-w-md mx-auto md:mx-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="font-medium text-sm">{toastMessage.text}</p>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-600 hover:text-emerald-900 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      
    </>
  );
}
