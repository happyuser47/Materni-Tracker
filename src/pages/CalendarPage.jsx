import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, CalendarHeart, BellRing, LayoutDashboard, Search, Filter, Phone, MapPin, 
  History, MessageSquare, Plus, ChevronRight, AlertCircle, Activity, UserPlus, X, 
  Edit2, Save, Eye, Settings, Trash2, Check, CheckCircle2, Stethoscope, Database, 
  Upload, Download, FileSpreadsheet, RotateCcw, Briefcase, BarChart2, ShieldCheck, 
  UserCircle, ChevronDown, ChevronUp, ClipboardList, Copy, Calendar, ChevronLeft, ArrowUpRight
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
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl hidden sm:block">
                    <CalendarHeart className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                      Delivery Calendar
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      Expected deliveries and clinic capacity tracker.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 bg-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                      onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))} 
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                    <span className="font-bold text-slate-800 text-sm sm:text-base min-w-[100px] sm:min-w-[140px] text-center">
                      {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))} 
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const d = new Date();
                      d.setDate(1);
                      setCalendarDate(d);
                    }} 
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-colors border border-teal-100"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Calendar Container */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
                {/* MOBILE VIEW: AGENDA LIST */}
                <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
                  {(() => {
                    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                    const daysWithPatients = monthDays.filter(d => getPatientsForDate(d).length > 0);
                    
                    if (daysWithPatients.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                          <div className="p-4 bg-white rounded-full border border-slate-100 mb-4 shadow-sm">
                            <Calendar className="h-10 w-10 text-slate-200" />
                          </div>
                          <p className="font-medium">No deliveries scheduled</p>
                          <p className="text-xs mt-1">For the month of {calendarDate.toLocaleString('default', { month: 'long' })}</p>
                        </div>
                      );
                    }

                    return daysWithPatients.map(d => {
                      const pts = getPatientsForDate(d);
                      const dateObj = new Date(calendarYear, calendarMonth, d);
                      const isToday = new Date().toDateString() === dateObj.toDateString();
                      
                      return (
                        <div key={`agenda-${d}`} className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border shadow-sm ${isToday ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                              <span className="text-[10px] font-bold uppercase tracking-tighter leading-none">{dateObj.toLocaleString('default', { weekday: 'short' })}</span>
                              <span className="text-lg font-black leading-none mt-0.5">{d}</span>
                            </div>
                            <div className="flex-1 border-b border-slate-100 pb-1">
                              <h4 className={`font-bold ${isToday ? 'text-teal-700' : 'text-slate-800'}`}>{isToday ? 'Today' : formatDate(dateObj.toISOString().split('T')[0])}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{pts.length} Delivery Expected</p>
                            </div>
                          </div>
                          <div className="pl-1 space-y-2">
                            {pts.map(p => (
                              <div 
                                key={p.id} 
                                onClick={() => setSelectedPatient(p)}
                                className={`p-3 rounded-xl border shadow-sm flex items-center gap-3 transition-all active:scale-[0.98] ${
                                  p.intent === 'High' ? 'bg-white border-l-4 border-l-emerald-500' : 
                                  p.intent === 'Medium' ? 'bg-white border-l-4 border-l-amber-400' : 
                                  'bg-white border-l-4 border-l-red-400'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                                  p.intent === 'High' ? 'bg-emerald-500' : 
                                  p.intent === 'Medium' ? 'bg-amber-400' : 
                                  'bg-red-400'
                                }`}>
                                  {p.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-bold text-slate-900 text-sm truncate">{p.name}</h5>
                                    <Badge type={p.intent}>{p.intent}</Badge>
                                  </div>
                                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                    <Phone className="h-3 w-3 mr-1 text-teal-600" /> {p.phone}
                                    <span className="mx-2">•</span>
                                    <MapPin className="h-3 w-3 mr-1 text-slate-400" /> {p.area}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300" />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* DESKTOP VIEW: CALENDAR GRID */}
                <div className="hidden md:flex flex-1 flex-col overflow-hidden">
                  <div className="overflow-x-auto flex-1 flex flex-col no-scrollbar">
                    <div className="min-w-[800px] flex flex-col h-full">
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
                             const dateObj = new Date(calendarYear, calendarMonth, d);
                             const isToday = new Date().toDateString() === dateObj.toDateString();
                             
                             return (
                                 <div key={`day-${d}`} className={`border-r border-b border-slate-100 p-2 ${isToday ? 'bg-teal-50/30' : 'bg-white'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                       <span className={`text-xs sm:text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-teal-600 text-white shadow-sm ring-4 ring-teal-50' : 'text-slate-700 hover:bg-slate-100'}`}>
                                         {d}
                                       </span>
                                       {pts.length > 0 && (
                                         <span className="text-[10px] font-bold text-white bg-slate-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                           {pts.length}
                                         </span>
                                       )}
                                    </div>
                                    <div className="space-y-1">
                                        {pts.map(p => (
                                            <div 
                                               key={p.id} 
                                               onClick={() => setSelectedPatient(p)}
                                               className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-lg border cursor-pointer hover:shadow-md transition-all truncate flex flex-col group ${
                                                 p.intent === 'High' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100' : 
                                                 p.intent === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100' : 
                                                 'bg-red-50 border-red-100 text-red-800 hover:bg-red-100'}`}
                                               title={`${p.name} - Assigned to ${p.assignedTo}`}
                                            >
                                                <span className="font-bold truncate group-hover:text-slate-900">{p.name}</span>
                                                <div className="flex items-center justify-between mt-1 opacity-70">
                                                  <span className="text-[9px] truncate">{p.area}</span>
                                                  <ArrowUpRight className="h-2 w-2" />
                                                </div>
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
            </div>
          
    </>
  );
}
