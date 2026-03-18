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


export default function PatientDetailModal() {
  const { handleModifyList, activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();
  
  // Inline Add states
  const [addingArea, setAddingArea] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [addingCaste, setAddingCaste] = useState(false);
  const [newCaste, setNewCaste] = useState('');
  const [addingRef, setAddingRef] = useState(false);
  const [newRef, setNewRef] = useState('');

  if (['PatientDetailModal', 'AddPatientModal', 'ConfirmModal', 'Toast'].includes('PatientDetailModal')) {
     let isVisible = false;
     if ('PatientDetailModal' === 'PatientDetailModal') isVisible = !!selectedPatient;
     if ('PatientDetailModal' === 'AddPatientModal') isVisible = showAddModal;
     if ('PatientDetailModal' === 'ConfirmModal') isVisible = confirmDialog.isOpen;
     if ('PatientDetailModal' === 'Toast') isVisible = !!toastMessage;
     if (!isVisible) return null;
  }

  return (
    <>
      
        <div className="fixed inset-0 z-[150] flex justify-end bg-slate-900/20 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                  {selectedPatient.status === 'Active' ? (
                     <Badge type={selectedPatient.intent}>{selectedPatient.intent} Intent</Badge>
                  ) : (
                     <Badge type={selectedPatient.status === 'Delivered (Clinic)' ? 'Success' : 'Closed'}>
                       {selectedPatient.status}
                     </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  CNIC: {selectedPatient.id} • Reg: {formatDate(selectedPatient.registrationDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Only allow editing details if Active OR if user is Admin */}
                {(selectedPatient.status === 'Active' || currentUser?.role === 'Admin') && (
                  <button 
                    onClick={() => {
                      setIsEditingDetails(!isEditingDetails);
                      setIsClosingCase(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${isEditingDetails ? 'bg-teal-100 text-teal-700' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-200'}`}
                    title="Edit Patient Details"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
                {currentUser?.role === 'Admin' && (
                  <button 
                    onClick={() => handleDeletePatient(selectedPatient.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Patient Record"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSelectedPatient(null);
                    setEditingInteractionId(null);
                    setIsEditingDetails(false);
                    setIsClosingCase(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Info Cards / Edit Form */}
              {isEditingDetails ? (
                <form onSubmit={handleUpdatePatientDetails} className="bg-slate-50 p-4 rounded-xl border border-teal-200 space-y-3 shadow-sm">
                  <h3 className="font-semibold text-teal-800 flex items-center mb-2">
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Patient Info
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Patient Name</label>
                      <input type="text" name="name" defaultValue={selectedPatient.name} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Contact Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        defaultValue={selectedPatient.phone} 
                        onChange={(e) => e.target.value = formatPhone(e.target.value)}
                        minLength={12} 
                        maxLength={12}
                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Expected Delivery (EDD)</label>
                      <input type="date" name="edd" defaultValue={selectedPatient.edd} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white" required />
                    </div>
                    <div className="col-span-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Area / Location</label>
                        {!addingArea ? (
                          <button 
                            type="button" 
                            onClick={() => setAddingArea(true)}
                            className="text-[9px] bg-teal-50 text-teal-600 px-1 py-0.5 rounded border border-teal-200"
                          >
                            + ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                if (newArea.trim()) {
                                  handleModifyList('area', 'add', newArea.trim());
                                  setNewArea('');
                                  setAddingArea(false);
                                }
                              }}
                              className="text-[9px] bg-emerald-500 text-white px-1 py-0.5 rounded"
                            >
                              OK
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setAddingArea(false); setNewArea(''); }}
                              className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      {addingArea ? (
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="New area..." 
                          value={newArea}
                          onChange={(e) => setNewArea(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newArea.trim()) {
                                handleModifyList('area', 'add', newArea.trim());
                                setNewArea('');
                                setAddingArea(false);
                              }
                            }
                          }}
                          className="w-full text-sm border border-teal-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50/30"
                        />
                      ) : (
                        <select name="area" defaultValue={selectedPatient.area} className="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm" required>
                          {areas.map(area => <option key={area.id} value={area.value}>{area.value}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="col-span-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Caste</label>
                        {!addingCaste ? (
                          <button 
                            type="button" 
                            onClick={() => setAddingCaste(true)}
                            className="text-[9px] bg-teal-50 text-teal-600 px-1 py-0.5 rounded border border-teal-200"
                          >
                            + ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                if (newCaste.trim()) {
                                  handleModifyList('caste', 'add', newCaste.trim());
                                  setNewCaste('');
                                  setAddingCaste(false);
                                }
                              }}
                              className="text-[9px] bg-emerald-500 text-white px-1 py-0.5 rounded"
                            >
                              OK
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setAddingCaste(false); setNewCaste(''); }}
                              className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      {addingCaste ? (
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="New caste..." 
                          value={newCaste}
                          onChange={(e) => setNewCaste(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCaste.trim()) {
                                handleModifyList('caste', 'add', newCaste.trim());
                                setNewCaste('');
                                setAddingCaste(false);
                              }
                            }
                          }}
                          className="w-full text-sm border border-teal-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50/30"
                        />
                      ) : (
                        <select name="caste" defaultValue={selectedPatient.caste} className="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm" required>
                          {castes.map(caste => <option key={caste.id} value={caste.value}>{caste.value}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reference</label>
                        {!addingRef ? (
                          <button 
                            type="button" 
                            onClick={() => setAddingRef(true)}
                            className="text-[9px] bg-teal-50 text-teal-600 px-1 py-0.5 rounded border border-teal-200"
                          >
                            + ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                if (newRef.trim()) {
                                  handleModifyList('reference', 'add', newRef.trim());
                                  setNewRef('');
                                  setAddingRef(false);
                                }
                              }}
                              className="text-[9px] bg-emerald-500 text-white px-1 py-0.5 rounded"
                            >
                              OK
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setAddingRef(false); setNewRef(''); }}
                              className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      {addingRef ? (
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="New reference..." 
                          value={newRef}
                          onChange={(e) => setNewRef(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newRef.trim()) {
                                handleModifyList('reference', 'add', newRef.trim());
                                setNewRef('');
                                setAddingRef(false);
                              }
                            }
                          }}
                          className="w-full text-sm border border-teal-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50/30"
                        />
                      ) : (
                        <select name="reference" defaultValue={selectedPatient.reference} className="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm" required>
                          {references.map(ref => <option key={ref.id} value={ref.value}>{ref.value}</option>)}
                        </select>
                      )}
                    </div>
                    {currentUser?.role === 'Admin' && (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Assigned Staff</label>
                        <select name="assignedTo" defaultValue={selectedPatient.assignedTo} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white" required>
                          <option value="Unassigned">Unassigned</option>
                          {staffNames.map(staff => <option key={staff} value={staff}>{staff}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditingDetails(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-sm bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors flex items-center">
                      <Save className="h-4 w-4 mr-1" /> Save Info
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Expected Delivery */}
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center">
                        <CalendarHeart className="h-3.5 w-3.5 mr-1.5" /> Expected Delivery
                      </p>
                      <p className={`font-semibold text-sm sm:text-base ${selectedPatient.status !== 'Active' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{formatDate(selectedPatient.edd)}</p>
                      {selectedPatient.status === 'Active' && (
                        <p className="text-[10px] text-teal-600 font-medium mt-0.5">{calculateDaysUntil(selectedPatient.edd)} days away</p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center min-w-0">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" /> Location
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 truncate" title={selectedPatient.area}>{selectedPatient.area}</p>
                    </div>

                    {/* Caste & Reference */}
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center min-w-0">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1.5" /> Caste & Reference
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">{selectedPatient.caste}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">Ref: {selectedPatient.reference}</p>
                    </div>

                    {/* Assigned To (Admin) OR Preference (Staff) */}
                    {currentUser?.role === 'Admin' ? (
                      <div className="bg-teal-50/50 p-3.5 sm:p-4 rounded-xl border border-teal-100 flex flex-col justify-center min-w-0">
                         <div className="flex items-center mb-1">
                           <Briefcase className="h-3.5 w-3.5 mr-1.5 text-teal-500 shrink-0" />
                           <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider truncate">Assigned To</p>
                         </div>
                        <p className={`font-semibold text-sm sm:text-base truncate ${selectedPatient.assignedTo === 'Unassigned' ? 'text-orange-600 italic' : 'text-teal-700'}`}>
                          {selectedPatient.assignedTo}
                        </p>
                      </div>
                    ) : (
                      selectedPatient.status === 'Active' ? (
                        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center min-w-0">
                           <div className="flex items-center mb-1">
                             <ClipboardList className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">Preference</span>
                           </div>
                           <span className="font-semibold text-slate-900 text-sm sm:text-base truncate" title={selectedPatient.preference}>{selectedPatient.preference}</span>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center min-w-0">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 truncate">Status</p>
                          <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">Case Closed</span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Preference row for Admin (since Assigned To took the spot above) */}
                  {currentUser?.role === 'Admin' && selectedPatient.status === 'Active' && (
                    <div className="bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100 flex justify-between items-center gap-3">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Patient Preference</span>
                       <span className="font-medium text-slate-800 text-sm truncate" title={selectedPatient.preference}>{selectedPatient.preference}</span>
                    </div>
                  )}

                  {/* FULL WIDTH Contact Card */}
                  <div className="bg-teal-50/30 p-4 rounded-xl border border-teal-100 flex items-center justify-between mt-1">
                     <div className="flex-1 min-w-0 mr-3">
                       <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider mb-1 flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1.5" /> Contact Number
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="font-bold text-lg text-slate-900 tracking-wide truncate">{selectedPatient.phone}</p>
                        <button 
                          onClick={() => handleCopyPhone(selectedPatient.phone)}
                          className="text-slate-400 hover:text-teal-600 transition-colors p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 shadow-sm shrink-0"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                     </div>
                     <a 
                       href={`tel:${selectedPatient.phone}`}
                       className="h-12 w-12 shrink-0 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-colors shadow-md ml-3"
                       title="Call Patient"
                     >
                       <Phone className="h-5 w-5" />
                     </a>
                  </div>
                </div>
              )}

              {/* Outcome / Close Case Section */}
              {selectedPatient.status === 'Active' ? (
                !isClosingCase ? (
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Delivery Occurred?</h4>
                      <p className="text-xs text-slate-500">Record final outcome to close case.</p>
                    </div>
                    <button 
                      onClick={() => setIsClosingCase(true)}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Resolve Case
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-slate-300 bg-slate-50 rounded-xl p-5 shadow-inner">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-slate-600" />
                      Log Outcome & Close Case
                    </h3>
                    <form onSubmit={handleCloseCase} className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Final Outcome</label>
                        <select name="outcome" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium" required>
                          <option value="">Select Outcome...</option>
                          {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <textarea 
                        name="notes"
                        placeholder="Add final notes regarding the delivery or referral..." 
                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white resize-none"
                        rows="2"
                        required
                      ></textarea>
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setIsClosingCase(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                          Confirm & Close Case
                        </button>
                      </div>
                    </form>
                  </div>
                )
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <h3 className="font-bold text-emerald-800 mb-1">Case Closed</h3>
                  <p className="text-sm text-emerald-600 mb-3">This patient's journey has been marked as <strong>{selectedPatient.status}</strong>.</p>
                  <button 
                    onClick={() => handleReopenCase(selectedPatient.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors shadow-sm"
                  >
                    <RotateCcw className="h-3 w-3 mr-1.5" /> Reopen Case
                  </button>
                </div>
              )}

              {/* Log Interaction Form (Only visible if Active) */}
              {selectedPatient.status === 'Active' && !isClosingCase && (
                <div className="border border-teal-100 bg-teal-50/30 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-teal-600" />
                    Log Follow-up / Note
                  </h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      handleAddInteraction(selectedPatient.id, {
                        date: new Date().toISOString(),
                        type: formData.get('type'),
                        newIntent: formData.get('intent'),
                        newPreference: formData.get('preference'),
                        notes: formData.get('notes'),
                        nextInteractionDate: formData.get('next_interaction_date')
                      });
                      e.target.reset();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Interaction Type</label>
                        <select name="type" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white" required>
                          <option value="Call">Phone Call</option>
                          <option value="Visit">Clinic Visit</option>
                          <option value="Referral">Referral (Third Party)</option>
                        </select>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Updated Intent</label>
                        <select name="intent" defaultValue={selectedPatient.intent} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                          <option value="High">High Intent</option>
                          <option value="Medium">Medium Intent</option>
                          <option value="Low">Low Intent</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Updated Preference</label>
                        <select name="preference" defaultValue={selectedPatient.preference} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                          <option value="Clinic">Prefers Clinic</option>
                          <option value="Home">Prefers Home Delivery</option>
                          <option value="Other Hospital">Prefers Other Hospital</option>
                          <option value="Undecided">Undecided</option>
                        </select>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Next Follow-up Date (Optional)</label>
                        <input type="date" name="next_interaction_date" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                      </div>
                    </div>
                    <textarea 
                      name="notes"
                      placeholder="Add conversation notes or follow-up details here..." 
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white resize-none"
                      rows="3"
                      required
                    ></textarea>
                    <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      Save Interaction
                    </button>
                  </form>
                </div>
              )}

              {/* History Timeline */}
              <div>
                 <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center uppercase tracking-wider">
                  <History className="h-4 w-4 mr-2 text-slate-500" />
                  Interaction History
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {selectedPatient.interactions.map((interaction, index) => (
                    <div key={interaction.id} className="relative flex items-start justify-between gap-4">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm mt-1 ${interaction.type === 'Outcome Logged' ? 'bg-slate-800' : 'bg-teal-500'}`}></div>
                      
                      {editingInteractionId === interaction.id ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleUpdateInteraction(selectedPatient.id, interaction.id, {
                              type: formData.get('type'),
                              intent: formData.get('intent'),
                              preference: formData.get('preference'),
                              notes: formData.get('notes'),
                              next_interaction_date: formData.get('next_interaction_date') || null
                            });
                          }}
                          className="bg-white border border-teal-300 p-4 rounded-xl shadow-md w-full ml-6 space-y-3 relative z-10"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <select name="type" defaultValue={interaction.type} className="col-span-2 sm:col-span-1 text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-white" required>
                              <option value="Call">Phone Call</option>
                              <option value="Visit">Clinic Visit</option>
                              <option value="Referral">Referral (Third Party)</option>
                              <option value="Outcome Logged">Outcome Logged</option>
                              <option value="Case Reopened">Case Reopened</option>
                            </select>
                            <select name="intent" defaultValue={interaction.intent} className="col-span-2 sm:col-span-1 text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                              <option value="High">High Intent</option>
                              <option value="Medium">Medium Intent</option>
                              <option value="Low">Low Intent</option>
                            </select>
                            <select name="preference" defaultValue={interaction.preference} className="col-span-2 text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                              <option value="Clinic">Prefers Clinic</option>
                              <option value="Home">Prefers Home Delivery</option>
                              <option value="Other Hospital">Prefers Other Hospital</option>
                              <option value="Undecided">Undecided</option>
                            </select>
                            <input 
                              type="date" 
                              name="next_interaction_date" 
                              defaultValue={interaction.nextInteractionDate || ''}
                              className="col-span-2 sm:col-span-1 text-sm border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500 bg-white" 
                              title="Next Follow-up Date"
                            />
                          </div>
                          <textarea 
                            name="notes"
                            defaultValue={interaction.notes} 
                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white resize-none"
                            rows="2"
                            required
                          ></textarea>
                          <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => setEditingInteractionId(null)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              Cancel
                            </button>
                            <button type="submit" className="px-3 py-1.5 text-sm bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors">
                              Save Changes
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className={`border p-4 rounded-xl shadow-sm w-full ml-6 group relative ${interaction.type === 'Outcome Logged' || interaction.type === 'Case Reopened' ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'}`}>
                          <button 
                            onClick={() => setEditingInteractionId(interaction.id)}
                            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md opacity-0 md:group-hover:opacity-100 transition-all"
                            title="Edit interaction"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 pr-8">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${interaction.type === 'Outcome Logged' || interaction.type === 'Case Reopened' ? 'bg-slate-800 text-white' : 'text-slate-500 bg-slate-100'}`}>
                                {interaction.type}
                              </span>
                              {interaction.type !== 'Outcome Logged' && interaction.intent && <Badge type={interaction.intent}>{interaction.intent}</Badge>}
                              {interaction.type !== 'Outcome Logged' && interaction.preference && (
                                <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                  Prefers: {interaction.preference}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                              {formatDateTime(interaction.date)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed mb-2">
                            {interaction.notes}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <p className="text-xs text-slate-400 flex items-center">
                               <Users className="h-3 w-3 mr-1" /> Logged by {interaction.staff}
                            </p>
                            {interaction.nextInteractionDate && (
                              <p className="text-xs text-teal-600 font-medium flex items-center sm:ml-auto">
                                <CalendarHeart className="h-3 w-3 mr-1" /> Next Date: {formatDate(interaction.nextInteractionDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      
    </>
  );
}
