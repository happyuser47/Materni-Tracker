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


function SearchableSelect({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return options;
    return options.filter((option) => option.label.toLowerCase().includes(searchTerm));
  }, [options, query]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={selectedOption ? selectedOption.label : ''}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          readOnly
          required={required}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none bg-white shadow-sm cursor-pointer pr-10 placeholder:text-slate-400"
        />
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />

        {isOpen && (
          <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500">No matches found</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value || option.label}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm transition-colors flex items-center justify-between gap-3 ${isSelected ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-teal-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


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
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input type="text" name="name" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNIC (Patient ID) *</label>
                  <input 
                    type="text" 
                    name="cnic" 
                    placeholder="XXXXX-XXXXXXX-X" 
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
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="03XX-XXXXXXX" 
                    required 
                    minLength={12}
                    maxLength={12}
                    onChange={(e) => e.target.value = formatPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
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
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery (EDD) *</label>
                  <input type="date" name="edd" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
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
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!!addError} className="px-4 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" /> Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      
    </>
  );
}
