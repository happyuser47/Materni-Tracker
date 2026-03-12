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


export default function Dashboard() {
  const { activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();


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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 mb-1 truncate" title="Active">Active Pregnancies</p>
              <h3 className="text-2xl font-bold text-slate-800">{dashActive.length}</h3>
            </div>
            <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-sm flex items-start justify-between gap-3 bg-teal-50/30">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-teal-700 mb-1 truncate" title="Deliveries">Clinic Deliveries</p>
              <h3 className="text-2xl font-bold text-teal-900">{dashDeliveries.length}</h3>
            </div>
            <div className="p-2.5 bg-teal-100 rounded-xl text-teal-700 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate" title="Upcoming">Upcoming Deliveries</p>
              <p className="text-[10px] text-slate-400 mb-1 truncate">(Next 30 Days)</p>
              <h3 className="text-2xl font-bold text-slate-800">{dashUpcoming.length}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
              <CalendarHeart className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 mb-1 truncate" title="Urgent">Urgent Follow-up</p>
              <h3 className="text-2xl font-bold text-red-600">{dashAlerts.length}</h3>
            </div>
            <div className="p-2.5 bg-red-50 rounded-xl text-red-600 shrink-0">
              <AlertCircle className="h-5 w-5" />
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
              {dashAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No urgent follow-ups needed.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {dashAlerts.map(patient => (
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
                        <div className="shrink-0"><Badge type="Alert">Contact Overdue</Badge></div>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center justify-between">
                        <span><span className="font-medium text-orange-600">{calculateDaysUntil(patient.edd)} days left</span> • EDD: {formatDate(patient.edd)}</span>
                        <span className="flex items-center text-teal-600 font-medium">
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
