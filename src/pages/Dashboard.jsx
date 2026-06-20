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
import { calculateDaysUntil, formatDate, formatDateTime, formatCNIC, formatPhone, getPatientAlertType } from '../utils/helpers';


export default function Dashboard() {
  const { activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient, displayDashAlerts, dismissAlert } = useApp();


  return (
    <>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 pr-4 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center flex-wrap gap-2">
              <span>MaterniTrack</span>
              {currentUser?.role === 'Staff' ? (
                <span className="text-sm font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg border border-teal-200 truncate">
                  {currentUser?.name}'s Dashboard
                </span>
              ) : (
                <span className="text-sm font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg border border-teal-200 whitespace-nowrap">
                  Clinic Overview
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 truncate">
              {currentUser?.role === 'Admin'
                ? 'Track active pregnancies, manage follow-ups, and monitor successful deliveries across the clinic.'
                : 'Overview of your assigned workload and upcoming follow-ups.'}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center justify-center transition-colors shrink-0 whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Patient
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Active Pregnancies */}
          <div className="group relative overflow-hidden p-6 px-8 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-xl">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-blue-400/40 transition-colors duration-500"></div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-cyan-400/40 transition-colors duration-500"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-2">
                <p className="text-sm font-medium text-slate-600 mb-1">Active Pregnancies</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{dashActive.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/60 text-blue-600 flex items-center justify-center ring-1 ring-white/80 shadow-sm shrink-0 xl:-mr-2 backdrop-blur-md">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Clinic Deliveries */}
          <div className="group relative overflow-hidden p-6 px-8 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-xl">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-emerald-400/40 transition-colors duration-500"></div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-teal-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-teal-400/40 transition-colors duration-500"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-2">
                <p className="text-sm font-medium text-slate-600 mb-1">Clinic Deliveries</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{dashDeliveries.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/60 text-emerald-600 flex items-center justify-center ring-1 ring-white/80 shadow-sm shrink-0 xl:-mr-2 backdrop-blur-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Upcoming Deliveries */}
          <div className="group relative overflow-hidden p-6 px-8 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-xl">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-violet-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-violet-400/40 transition-colors duration-500"></div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-fuchsia-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-fuchsia-400/40 transition-colors duration-500"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-2">
                <p className="text-sm font-medium text-slate-600 mb-1">Upcoming Deliveries</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{dashUpcoming.length}</h3>
                  <span className="text-[10px] font-semibold text-violet-700 bg-white/60 backdrop-blur-md ring-1 ring-white/80 shadow-sm px-2 py-0.5 rounded-full shrink-0">30 Days</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/60 text-violet-600 flex items-center justify-center ring-1 ring-white/80 shadow-sm shrink-0 xl:-mr-2 backdrop-blur-md">
                <CalendarHeart className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Urgent Follow-up */}
          <div className="group relative overflow-hidden p-6 px-8 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-xl">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-rose-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-rose-400/40 transition-colors duration-500"></div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-orange-400/40 transition-colors duration-500"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="pr-2">
                <p className="text-sm font-medium text-slate-600 mb-1">Urgent Follow-up</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold text-rose-600 tracking-tight">{dashAlerts.length}</h3>
                  {dashAlerts.length > 0 && <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/60 text-rose-600 flex items-center justify-center ring-1 ring-white/80 shadow-sm shrink-0 xl:-mr-2 backdrop-blur-md">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
          {/* ACTION REQUIRED LIST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <BellRing className="h-4 w-4 mr-2 text-orange-500" />
                Follow-up Alerts
              </h3>
            </div>
            <div className="p-0 flex-1 overflow-auto">
              {displayDashAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No urgent follow-ups needed.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {displayDashAlerts.map(patient => (
                    <li key={patient.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium text-slate-900">{patient.name}</span>
                          {currentUser?.role === 'Admin' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold w-fit ${patient.assignedTo === 'Unassigned' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {patient.assignedTo}
                            </span>
                          )}
                        </div>
                        <div className="shrink-0">
                          {(() => {
                            const alertType = getPatientAlertType(patient, alertConfig);
                            if (alertType === 'Delivery Overdue') return <Badge type="Urgent">Delivery Overdue</Badge>;
                            if (alertType === 'Delivery Due') return <Badge type="Delivery">Delivery Due</Badge>;
                            if (alertType === 'Follow-up Due') return <Badge type="Alert">Follow-up Due</Badge>;
                            return <Badge type="Urgent">Contact Overdue</Badge>;
                          })()}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center justify-between mt-1.5">
                        {(() => {
                          const alertType = getPatientAlertType(patient, alertConfig);
                          if (alertType === 'Delivery Overdue') {
                            return (
                              <span>
                                <span className="font-medium text-red-600">{Math.abs(calculateDaysUntil(patient.edd))} days overdue</span>
                                <span className="text-slate-400 mx-2">•</span>
                                EDD: {formatDate(patient.edd)}
                              </span>
                            );
                          } else if (alertType === 'Follow-up Due') {
                            return (
                              <span>
                                <span className="font-medium text-orange-600">Follow-up: {formatDate(patient.nextInteractionDate)}</span>
                                <span className="text-slate-400 mx-2">•</span>
                                EDD: {formatDate(patient.edd)}
                              </span>
                            );
                          } else if (alertType === 'Contact Overdue') {
                            return (
                              <span>
                                <span className="font-medium text-red-600">Last: {formatDate(patient.lastContact)}</span>
                                <span className="text-slate-400 mx-2">•</span>
                                EDD: {formatDate(patient.edd)}
                              </span>
                            );
                          } else {
                            return (
                              <span>
                                <span className="font-medium text-blue-600">{calculateDaysUntil(patient.edd)} days left</span>
                                <span className="text-slate-400 mx-2">•</span>
                                EDD: {formatDate(patient.edd)}
                              </span>
                            );
                          }
                        })()}
                        <span className="flex items-center text-teal-600 font-medium shrink-0 ml-2">
                          Action <ChevronRight className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* HIGH LIKELIHOOD UPCOMING */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <CalendarHeart className="h-4 w-4 mr-2 text-teal-600" />
                Upcoming Deliveries (Next 30 Days)
              </h3>
            </div>
            <div className="p-0 flex-1 overflow-auto">
              {dashUpcoming.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No deliveries expected in the next 30 days.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {dashUpcoming.map(patient => (
                    <li key={patient.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium text-slate-900">{patient.name}</span>
                          {currentUser?.role === 'Admin' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold w-fit ${patient.assignedTo === 'Unassigned' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {patient.assignedTo}
                            </span>
                          )}
                        </div>
                        <div className="shrink-0"><Badge type={patient.intent}>{patient.intent} Intent</Badge></div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-slate-500">
                        <span><span className="font-medium text-teal-600">{calculateDaysUntil(patient.edd)} days left</span> • EDD: <span className="font-medium text-slate-700">{formatDate(patient.edd)}</span></span>
                        <span className="text-xs">Prefers: {patient.preference}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
