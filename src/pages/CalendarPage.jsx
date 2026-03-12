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


export default function CalendarPage() {
  const { activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();
  

  return (
    <>
      
            <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    Delivery Calendar
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Track expected deliveries across all patients and predict clinic capacity.
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <button 
                    onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))} 
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="font-bold text-slate-800 min-w-[120px] text-center">
                    {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))} 
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => {
                      const d = new Date('2026-03-12'); // Actual Today
                      d.setDate(1);
                      setCalendarDate(d);
                    }} 
                    className="ml-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto flex-1 flex flex-col">
                  <div className="min-w-[700px] flex flex-col h-full">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Grid Body */}
                    <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,1fr)]">
                       {/* Empty Slots Before 1st */}
                       {Array.from({length: firstDayIndex}).map((_, i) => (
                           <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/50"></div>
                       ))}
                       {/* Days */}
                       {Array.from({length: daysInMonth}).map((_, i) => {
                           const d = i + 1;
                           const pts = getPatientsForDate(d);
                           const isToday = calendarYear === 2026 && calendarMonth === 2 && d === 12; // Actual Current Date: Mar 12, 2026
                           
                           return (
                               <div key={`day-${d}`} className={`border-r border-b border-slate-100 p-1.5 sm:p-2 ${isToday ? 'bg-teal-50/20' : 'bg-white'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                     <span className={`text-xs sm:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-teal-600 text-white' : 'text-slate-700'}`}>
                                       {d}
                                     </span>
                                     {pts.length > 0 && <span className="text-[10px] font-bold text-slate-400">{pts.length}</span>}
                                  </div>
                                  <div className="space-y-1">
                                      {pts.map(p => (
                                          <div 
                                             key={p.id} 
                                             onClick={() => setSelectedPatient(p)}
                                             className={`text-[10px] sm:text-xs px-1.5 py-1 rounded border cursor-pointer hover:shadow-sm transition-all truncate flex flex-col ${p.intent === 'High' ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' : p.intent === 'Medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100' : 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'}`}
                                             title={`${p.name} - Assigned to ${p.assignedTo}`}
                                          >
                                              <span className="font-semibold truncate">{p.name}</span>
                                              <span className="text-[9px] opacity-75 truncate hidden sm:block">{p.assignedTo}</span>
                                          </div>
                                      ))}
                                  </div>
                               </div>
                           )
                       })}
                       {/* Fill remaining slots to complete grid if necessary */}
                       {Array.from({length: (7 - ((firstDayIndex + daysInMonth) % 7)) % 7}).map((_, i) => (
                           <div key={`empty-end-${i}`} className="border-r border-b border-slate-100 bg-slate-50/50"></div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
    </>
  );
}
