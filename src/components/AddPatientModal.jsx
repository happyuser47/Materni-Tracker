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
import SearchableSelect from './SearchableSelect';


export default function AddPatientModal() {
  const { handleModifyList, activeTab, setActiveTab, patients, setPatients, selectedPatient, setSelectedPatient, editingInteractionId, setEditingInteractionId, isEditingDetails, setIsEditingDetails, isClosingCase, setIsClosingCase, showAddModal, setShowAddModal, addError, setAddError, importStatus, setImportStatus, showNotifications, setShowNotifications, showFilters, setShowFilters, fileInputRef, isSidebarOpen, setIsSidebarOpen, toastMessage, setToastMessage, confirmDialog, setConfirmDialog, requestConfirm, closeConfirm, calendarDate, setCalendarDate, areas, setAreas, castes, setCastes, references, setReferences, staffMembers, setStaffMembers, alertConfig, setAlertConfig, currentUser, setCurrentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent, filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference, filterAssignedTo, setFilterAssignedTo, filterStatus, setFilterStatus, filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd, mySearchTerm, setMySearchTerm, myFilterStatus, setMyFilterStatus, activityDateFilter, setActivityDateFilter, uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount, globalActive, globalDeliveries, globalAlerts, globalUpcoming, myPatientsList, myActive, myDeliveries, myAlerts, myUpcoming, dashActive, dashDeliveries, dashAlerts, dashUpcoming, bellAlerts, clinicActivities, filteredPatients, filteredMyPatientsList, filteredActivities, activitySummary, teamPerformance, calendarYear, calendarMonth, daysInMonth, firstDayIndex, getPatientsForDate, handleAddNewPatient, handleUpdatePatientDetails, handleAddInteraction, handleCloseCase, handleReopenCase, handleUpdateInteraction, handleFileUpload, handleAddStaff, handleDeleteStaff, handleCopyPhone, handleDeletePatient } = useApp();
  
  // Inline Add states
  const [addingArea, setAddingArea] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [addingCaste, setAddingCaste] = useState(false);
  const [newCaste, setNewCaste] = useState('');
  const [addingRef, setAddingRef] = useState(false);
  const [newRef, setNewRef] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCaste, setSelectedCaste] = useState('');
  const [selectedReference, setSelectedReference] = useState('');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState('Unassigned');

  useEffect(() => {
    if (!showAddModal) {
      setAddingArea(false);
      setNewArea('');
      setAddingCaste(false);
      setNewCaste('');
      setAddingRef(false);
      setNewRef('');
      setSelectedArea('');
      setSelectedCaste('');
      setSelectedReference('');
      setSelectedAssignedTo('Unassigned');
    }
  }, [showAddModal]);

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
                <div className="col-span-2 relative group">
                  <span
                    className="absolute -left-0.5 top-2 bottom-2 w-1.5 rounded bg-gradient-to-b from-indigo-500 to-purple-500 opacity-70 transition-all duration-300 group-focus-within:opacity-100"
                  ></span>
                  <input
                    type="text"
                    name="name"
                    id="reg-name"
                    required
                    placeholder=" "
                    className="peer w-full pl-6 pr-4 pt-6 pb-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm focus:border-transparent focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-300 delay-200 placeholder-shown:placeholder-transparent"
                  />
                  <label
                    htmlFor="reg-name"
                    className="absolute left-6 top-1 text-xs text-slate-500 transition-all duration-200 ease-in-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-indigo-500 peer-focus:font-semibold cursor-text"
                  >
                    Full Name *
                  </label>
                </div>
                <div className="col-span-2 sm:col-span-1 relative group">
                  <span
                    className="absolute -left-0.5 top-2 bottom-2 w-1.5 rounded bg-gradient-to-b from-indigo-500 to-purple-500 opacity-70 transition-all duration-300 group-focus-within:opacity-100"
                  ></span>
                  <input 
                    type="text" 
                    name="cnic" 
                    id="reg-cnic"
                    placeholder=" " 
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
                    className="peer w-full pl-6 pr-4 pt-6 pb-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm focus:border-transparent focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-300 delay-200 placeholder-shown:placeholder-transparent" 
                  />
                  <label
                    htmlFor="reg-cnic"
                    className="absolute left-6 top-1 text-xs text-slate-500 transition-all duration-200 ease-in-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-indigo-500 peer-focus:font-semibold cursor-text"
                  >
                    CNIC (XXXXX-XXXXXXX-X) *
                  </label>
                </div>
                <div className="col-span-2 sm:col-span-1 relative group">
                  <span
                    className="absolute -left-0.5 top-2 bottom-2 w-1.5 rounded bg-gradient-to-b from-indigo-500 to-purple-500 opacity-70 transition-all duration-300 group-focus-within:opacity-100"
                  ></span>
                  <input 
                    type="tel" 
                    name="phone" 
                    id="reg-phone"
                    placeholder=" " 
                    required 
                    minLength={12}
                    maxLength={12}
                    onChange={(e) => e.target.value = formatPhone(e.target.value)}
                    className="peer w-full pl-6 pr-4 pt-6 pb-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm focus:border-transparent focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-300 delay-200 placeholder-shown:placeholder-transparent" 
                  />
                  <label
                    htmlFor="reg-phone"
                    className="absolute left-6 top-1 text-xs text-slate-500 transition-all duration-200 ease-in-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-indigo-500 peer-focus:font-semibold cursor-text"
                  >
                    Phone (03XX-XXXXXXX) *
                  </label>
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-slate-700">Area / Location *</label>
                    {!addingArea ? (
                      <button 
                        type="button" 
                        onClick={() => setAddingArea(true)}
                        className="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded border border-teal-200 hover:bg-teal-100 transition-colors flex items-center font-bold"
                      >
                        <Plus className="h-2.5 w-2.5 mr-1" /> QUICK ADD
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
                          className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded hover:bg-emerald-600 transition-colors font-bold"
                        >
                          SAVE
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setAddingArea(false); setNewArea(''); }}
                          className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-300 transition-colors font-bold"
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
                      placeholder="Enter new area..." 
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
                      className="w-full border border-teal-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-teal-50/30"
                    />
                  ) : (
                    <SearchableSelect
                      name="area"
                      label=""
                      value={selectedArea}
                      onChange={setSelectedArea}
                      options={areas.map((area) => ({ value: area.value, label: area.value }))}
                      placeholder="Search area..."
                      required
                    />
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-slate-700">Caste *</label>
                    {!addingCaste ? (
                      <button 
                        type="button" 
                        onClick={() => setAddingCaste(true)}
                        className="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded border border-teal-200 hover:bg-teal-100 transition-colors flex items-center font-bold"
                      >
                        <Plus className="h-2.5 w-2.5 mr-1" /> QUICK ADD
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
                          className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded hover:bg-emerald-600 transition-colors font-bold"
                        >
                          SAVE
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setAddingCaste(false); setNewCaste(''); }}
                          className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-300 transition-colors font-bold"
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
                      placeholder="Enter new caste..." 
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
                      className="w-full border border-teal-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-teal-50/30"
                    />
                  ) : (
                    <SearchableSelect
                      name="caste"
                      label=""
                      value={selectedCaste}
                      onChange={setSelectedCaste}
                      options={castes.map((caste) => ({ value: caste.value, label: caste.value }))}
                      placeholder="Search caste..."
                      required
                    />
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-slate-700">Reference *</label>
                    {!addingRef ? (
                      <button 
                        type="button" 
                        onClick={() => setAddingRef(true)}
                        className="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded border border-teal-200 hover:bg-teal-100 transition-colors flex items-center font-bold"
                      >
                        <Plus className="h-2.5 w-2.5 mr-1" /> QUICK ADD
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
                          className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded hover:bg-emerald-600 transition-colors font-bold"
                        >
                          SAVE
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setAddingRef(false); setNewRef(''); }}
                          className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-300 transition-colors font-bold"
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
                      placeholder="Enter new reference..." 
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
                      className="w-full border border-teal-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-teal-50/30"
                    />
                  ) : (
                    <SearchableSelect
                      name="reference"
                      label=""
                      value={selectedReference}
                      onChange={setSelectedReference}
                      options={references.map((ref) => ({ value: ref.value, label: ref.value }))}
                      placeholder="Search reference..."
                      required
                    />
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1 relative group">
                  <input 
                    type="date" 
                    name="edd" 
                    id="reg-edd"
                    required 
                    placeholder=" "
                    className="peer w-full pl-3 pr-4 pt-6 pb-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm focus:border-transparent focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-300 delay-200 placeholder-shown:placeholder-transparent cursor-pointer" 
                  />
                  <label
                    htmlFor="reg-edd"
                    className="absolute left-3 top-1 text-xs text-slate-500 transition-all duration-200 ease-in-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-indigo-500 peer-focus:font-semibold cursor-text"
                  >
                    Expected Delivery (EDD) *
                  </label>
                </div>
                {currentUser?.role === 'Admin' ? (
                  <>
                    {/* Assign to Staff */}
                    <div className="col-span-2 sm:col-span-1">
                      <SearchableSelect
                        name="assignedTo"
                        label="Assign to Staff *"
                        value={selectedAssignedTo}
                        onChange={setSelectedAssignedTo}
                        options={[
                          { value: 'Unassigned', label: 'Unassigned' },
                          ...staffNames.map((staff) => ({ value: staff, label: staff })),
                        ]}
                        placeholder="Search staff..."
                        required
                      />
                    </div>
                    {/* Assignment Type */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Type *</label>
                      <select name="assignmentType" defaultValue="Secondary" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option value="Primary">🟢 Primary Case</option>
                        <option value="Secondary">🔵 Secondary Case</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">Secondary = default supportive role. Primary = main responsibility.</p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                      <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{currentUser?.name?.charAt(0)}</span>
                      <div>
                        <p className="text-sm font-semibold text-teal-900">{currentUser?.name}</p>
                        <p className="text-[11px] text-teal-600">You will be assigned as Secondary for this patient.</p>
                      </div>
                      <span className="ml-auto text-[10px] font-bold bg-blue-600 text-white px-2 py-1 rounded">SECONDARY</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); }} className="premium-btn-soft px-4 py-2 font-medium">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!addError}
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm sm:text-base font-bold text-white transition-all duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full overflow-hidden shadow-md shadow-indigo-500/15 cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 rounded-full transition-all duration-300 group-hover:scale-105"
                  ></div>

                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-white blur-md"
                  ></div>

                  <div
                    className="absolute inset-0 rounded-full border-2 border-white opacity-20 group-hover:opacity-40 group-hover:scale-102 transition-all duration-300"
                  ></div>

                  <span className="relative z-10 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="tracking-wider">Register Patient</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      
    </>
  );
}
