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
import { TagBadge } from '../components/TagBadge';
import { PatientCard } from '../components/PatientCard';
import { ManageListCard } from '../components/ManageListCard';
import { OUTCOMES } from '../lib/constants';
import { calculateDaysUntil, formatDate, formatDateTime, formatCNIC, formatPhone } from '../utils/helpers';


export default function MyPatients() {
  const { 
    activeTab, setActiveTab, patients, setPatients, 
    selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, 
    isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, 
    showAddModal, setShowAddModal, addError, setAddError, 
    importStatus, setImportStatus, showNotifications, setShowNotifications, 
    showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, 
    toastMessage, setToastMessage, confirmDialog, setConfirmDialog, 
    requestConfirm, closeConfirm, calendarDate, setCalendarDate, 
    areas, setAreas, castes, setCastes, references, setReferences, 
    tags, setTags, myFilterTag, setMyFilterTag, uniqueTags,
    staffMembers, setStaffMembers, alertConfig, setAlertConfig, 
    currentUser, setCurrentUser, searchTerm, setSearchTerm, 
    filterIntent, setFilterIntent, filterArea, setFilterArea, 
    filterCaste, setFilterCaste, filterReference, setFilterReference, 
    filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, 
    filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, 
    mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, 
    myFilterAssignmentType, setMyFilterAssignmentType, activityDateFilter, 
    setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, 
    staffNames, activeFilterCount, globalActive, globalDeliveries, 
    globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, 
    myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, 
    dashUpcoming, bellAlerts, clinicActivities, filteredPatients, 
    filteredMyPatientsList, filteredActivities, activitySummary, 
    teamPerformance, calendarYear, calendarMonth, daysInMonth, 
    firstDayIndex, getPatientsForDate, handleAddNewPatient, 
    handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, 
    handleReopenCase, handleUpdateInteraction, handleFileUpload, 
    handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient 
  } = useApp();

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
            className="relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-white bg-gray-800 rounded-md group w-full sm:w-auto cursor-pointer shrink-0 shadow-sm transition-transform duration-150 active:scale-[0.98]"
          >
            <span
              className="absolute w-0 h-0 transition-all duration-500 ease-out bg-teal-600 rounded-full group-hover:w-56 group-hover:h-56"
            ></span>
            <span className="absolute bottom-0 left-0 h-full -ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-auto h-full opacity-100 object-stretch"
                viewBox="0 0 487 487"
              >
                <path
                  fillOpacity=".1"
                  fillRule="nonzero"
                  fill="#FFF"
                  d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"
                ></path>
              </svg>
            </span>
            <span className="absolute top-0 right-0 w-12 h-full -mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="object-cover w-full h-full"
                viewBox="0 0 487 487"
              >
                <path
                  fillOpacity=".1"
                  fillRule="nonzero"
                  fill="#FFF"
                  d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"
                ></path>
              </svg>
            </span>
            <span
              className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-200"
            ></span>
            <span className="relative text-base font-semibold">Add New Patient</span>
          </button>
        </div>

        {/* Admin-Only Stat Cards for Personal Workload */}
        {currentUser?.role === 'Admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Active Pregnancies */}
            <div className="group relative overflow-hidden p-6 px-8 rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-xl">
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-blue-400/40 transition-colors duration-500"></div>
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-400/30 rounded-full mix-blend-multiply blur-2xl group-hover:bg-cyan-400/40 transition-colors duration-500"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="pr-2">
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Pregnancies</p>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{myActive.length}</h3>
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
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{myDeliveries.length}</h3>
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
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{myUpcoming.length}</h3>
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
                    <h3 className="text-3xl font-bold text-rose-600 tracking-tight">{myAlerts.length}</h3>
                    {myAlerts.length > 0 && <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/60 text-rose-600 flex items-center justify-center ring-1 ring-white/80 shadow-sm shrink-0 xl:-mr-2 backdrop-blur-md">
                  <AlertCircle className="h-6 w-6" />
                </div>
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
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto">
              <select
                value={myFilterTag || 'All'}
                onChange={(e) => setMyFilterTag(e.target.value)}
                className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1.5 rounded-lg outline-none border border-transparent focus:border-slate-300"
              >
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag === 'All' ? '🏷️ All Tags' : `🏷️ ${tag}`}</option>
                ))}
              </select>

              <select
                value={myFilterAssignmentType || 'All'}
                onChange={(e) => setMyFilterAssignmentType(e.target.value)}
                className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1.5 rounded-lg outline-none border border-transparent focus:border-slate-300"
              >
                <option value="All">All Types</option>
                <option value="Primary">🟢 Primary</option>
                <option value="Secondary">🔵 Secondary</option>
              </select>

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
                  <th className="p-4 font-medium whitespace-nowrap">Assignment</th>
                  <th className="p-4 font-medium whitespace-nowrap">Status / Intent</th>
                  <th className="p-4 font-medium whitespace-nowrap">EDD</th>
                  <th className="p-4 font-medium whitespace-nowrap">Last Contact</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMyPatientsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
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
                          <Phone className="h-3 w-3 mr-1 text-teal-600" /> {patient.phone}
                        </p>
                        {Array.isArray(patient.tags) && patient.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5 max-w-[200px]">
                            {patient.tags.slice(0, 2).map(tag => (
                              <TagBadge key={tag} tag={tag} size="sm" />
                            ))}
                            {patient.tags.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5 rounded bg-slate-100">
                                +{patient.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${patient.assignmentType === 'Secondary' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {patient.assignmentType === 'Secondary' ? '🔵 Secondary' : '🟢 Primary'}
                        </span>
                      </td>
                      <td className="p-4">
                        {patient.status === 'Active' ? (
                          <div className="flex flex-col items-start gap-1.5">
                            <Badge type={patient.intent}>{patient.intent} Intent</Badge>
                          </div>
                        ) : (
                          <Badge type={patient.status === 'Delivered (Clinic)' || patient.status === 'Delivered (MNHC)' ? 'Success' : 'Closed'}>
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
