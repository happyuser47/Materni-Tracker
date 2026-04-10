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
import { PatientCard } from '../components/PatientCard';
import { ManageListCard } from '../components/ManageListCard';
import { OUTCOMES } from '../lib/constants';
import { calculateDaysUntil, formatDate, formatDateTime, formatCNIC, formatPhone } from '../utils/helpers';


export default function MyPatients() {
  const { activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();


  return (
    <>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 pr-4 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center flex-wrap gap-2">
              <span>My Workspace</span>
              <span className="text-sm font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg border border-teal-200 truncate">
                Assigned to {currentUser?.name}
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 truncate">
              Manage your assigned patients, upcoming deliveries, and urgent follow-ups.
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

        {/* Admin-Only Stat Cards for Personal Workload */}
        {currentUser?.role === 'Admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-1 truncate" title="Active Pregnancies">Active Pregnancies</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">{myActive.length}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-teal-50 rounded-xl text-teal-600 shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-teal-200 shadow-sm flex items-start justify-between gap-3 bg-teal-50/30">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-teal-700 mb-1 truncate" title="Clinic Deliveries">Clinic Deliveries</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-teal-900">{myDeliveries.length}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-teal-100 rounded-xl text-teal-700 shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500 truncate" title="Upcoming Deliveries">Upcoming Deliveries</p>
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1 truncate">(Next 30 Days)</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">{myUpcoming.length}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                <CalendarHeart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-1 truncate" title="Needs Urgent Follow-up">Needs Urgent Follow-up</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-red-600">{myAlerts.length}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Top Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[350px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <BellRing className="h-4 w-4 mr-2 text-orange-500" /> My Urgent Alerts
              </h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">{myAlerts.length}</span>
            </div>
            <div className="p-0 flex-1 overflow-auto">
              {myAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">You have no urgent follow-ups pending.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {myAlerts.map(patient => (
                    <li key={patient.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-slate-900 text-sm">{patient.name}</span>
                        <Badge type="Alert">Overdue</Badge>
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span><span className="font-medium text-orange-600">{calculateDaysUntil(patient.edd)} days left</span> • EDD: {formatDate(patient.edd)}</span>
                        <span className="text-teal-600 font-medium">Log Note &rarr;</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[350px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <CalendarHeart className="h-4 w-4 mr-2 text-teal-600" /> My Upcoming Deliveries
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">{myUpcoming.length}</span>
            </div>
            <div className="p-0 flex-1 overflow-auto">
              {myUpcoming.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No assigned patients delivering in next 30 days.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {myUpcoming.map(patient => (
                    <li key={patient.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-slate-900 text-sm">{patient.name}</span>
                        <Badge type={patient.intent}>{patient.intent}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span><span className="font-medium text-teal-600">{calculateDaysUntil(patient.edd)} days left</span> • EDD: {formatDate(patient.edd)}</span>
                        <span className="text-teal-600 font-medium">View &rarr;</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* My Patients Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col mt-4 min-h-[300px]">
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search my patients..."
                className="w-full md:w-64 bg-transparent outline-none text-sm"
                value={mySearchTerm}
                onChange={(e) => setMySearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
              <button
                onClick={() => setMyFilterStatus('Active')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${myFilterStatus === 'Active' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Active ({myActive.length})
              </button>
              <button
                onClick={() => setMyFilterStatus('Resolved')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${myFilterStatus === 'Resolved' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Closed
              </button>
              <button
                onClick={() => setMyFilterStatus('All')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${myFilterStatus === 'All' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
            </div>
          </div>
          <div className="overflow-auto flex-1">
            {/* MOBILE CARD VIEW */}
            <div className="md:hidden p-4 space-y-4">
              {filteredMyPatientsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  No patients found in your personal workload.
                </div>
              ) : (
                filteredMyPatientsList.map(patient => (
                  <PatientCard 
                    key={patient.id} 
                    patient={patient} 
                    onClick={setSelectedPatient}
                    isAdmin={false} // Already in My Workspace
                  />
                ))
              )}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="p-4 font-medium whitespace-nowrap w-12 text-center">#</th>
                  <th className="p-4 font-medium whitespace-nowrap">Patient</th>
                  <th className="p-4 font-medium whitespace-nowrap">Status / Intent</th>
                  <th className="p-4 font-medium whitespace-nowrap">EDD</th>
                  <th className="p-4 font-medium whitespace-nowrap">Last Contact</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMyPatientsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No patients found in your personal workload.
                    </td>
                  </tr>
                ) : (
                  filteredMyPatientsList.map((patient, index) => (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${patient.status !== 'Active' ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="p-4 text-slate-500 font-medium text-center">
                        {index + 1}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 whitespace-nowrap">{patient.name}</p>
                        <p className="text-sm text-slate-500 flex items-center mt-1 whitespace-nowrap">
                          <Phone className="h-3 w-3 mr-1" /> {patient.phone}
                        </p>
                      </td>
                      <td className="p-4">
                        {patient.status === 'Active' ? (
                          <div className="flex flex-col items-start gap-1.5">
                            <Badge type={patient.intent}>{patient.intent} Intent</Badge>
                          </div>
                        ) : (
                          <Badge type={patient.status === 'Delivered (Clinic)' ? 'Success' : 'Closed'}>
                            {patient.status}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`font-medium block ${patient.status !== 'Active' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{formatDate(patient.edd)}</span>
                      </td>
                      <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                        {formatDate(patient.lastContact)}
                      </td>
                      <td className="p-4 text-right align-middle">
                        <button className="inline-flex items-center justify-center text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 mr-1.5" /> Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </>
  );
}
