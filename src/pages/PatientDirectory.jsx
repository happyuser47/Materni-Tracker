import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Search, Filter, Phone, MapPin, 
  UserPlus, Edit2, Eye, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { PatientCard } from '../components/PatientCard';
import { calculateDaysUntil, formatDate } from '../utils/helpers';
import { OUTCOMES } from '../lib/constants';

const PAGE_SIZE = 25;

export default function PatientDirectory() {
  const { 
    setSelectedPatient, setShowAddModal, showFilters, setShowFilters,
    currentUser, searchTerm, setSearchTerm, filterIntent, setFilterIntent,
    filterArea, setFilterArea, filterCaste, setFilterCaste, filterReference, setFilterReference,
    filterAssignedTo, setFilterAssignedTo, filterAssignmentType, setFilterAssignmentType, filterStatus, setFilterStatus,
    filterRegStart, setFilterRegStart, filterRegEnd, setFilterRegEnd,
    uniqueAreas, uniqueCastes, uniqueReferences, staffNames, activeFilterCount,
    filteredPatients
  } = useApp();

  const [page, setPage] = useState(0);
  
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visiblePatients = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredPatients.slice(start, start + PAGE_SIZE);
  }, [filteredPatients, safePage]);

  const resetPage = () => setPage(0);

  return (
    <>
            <div className="max-w-7xl mx-auto space-y-2.5 h-full flex flex-col">
              {/* COMPACT HEADER */}
              <div className="flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="truncate">
                      {filterAssignedTo === currentUser?.name 
                        ? 'My Patients' 
                        : filterAssignedTo !== 'All' && filterAssignedTo !== 'Unassigned'
                          ? `${filterAssignedTo}'s Patients` 
                          : currentUser?.role === 'Staff' ? 'All Patients' : 'Patient Directory'}
                    </span>
                    <span className="text-xs sm:text-sm font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-lg border border-teal-200 shrink-0">
                      {filteredPatients.length} {filteredPatients.length === 1 ? 'Record' : 'Records'}
                    </span>
                  </h1>
                  <p className="text-slate-500 mt-0.5 text-sm hidden md:block truncate">
                    {filterAssignedTo === currentUser?.name 
                      ? 'Manage and track patients currently assigned to you.' 
                      : filterAssignedTo !== 'All' && filterAssignedTo !== 'Unassigned'
                        ? `Viewing all active and past cases assigned to ${filterAssignedTo}.`
                        : 'Manage and track all registered pregnant women and past cases.'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium shadow-sm flex items-center transition-colors shrink-0"
                >
                  <UserPlus className="h-4 w-4 sm:mr-2 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">New Registration</span>
                  <span className="inline sm:hidden whitespace-nowrap">Add New</span>
                </button>
              </div>

              {/* SMART COMPACT FILTERS */}
              <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">
                <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search by name, CNIC or phone..." 
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                    />
                  </div>
                  
                  <div className="flex flex-nowrap items-center gap-2 sm:gap-3 overflow-x-auto pb-1 md:pb-0">
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
                      {['Active', 'Resolved', 'All'].map(s => (
                        <button 
                          key={s}
                          onClick={() => { setFilterStatus(s); resetPage(); }}
                          className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {s === 'Resolved' ? 'Closed' : s}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-1.5 border rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 ${showFilters || activeFilterCount > 0 ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="hidden sm:block">Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="bg-teal-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shrink-0">
                          {activeFilterCount}
                        </span>
                      )}
                      {showFilters ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                    </button>
                  </div>
                </div>
                
                {showFilters && (
                  <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                    
                    {currentUser?.role === 'Admin' && (
                      <>
                        <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white" value={filterAssignedTo} onChange={(e) => { setFilterAssignedTo(e.target.value); resetPage(); }}>
                          <option value="All">All Staff</option>
                          <option value="Unassigned">Unassigned</option>
                          {staffNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>

                        <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white" value={filterAssignmentType} onChange={(e) => { setFilterAssignmentType(e.target.value); resetPage(); }}>
                          <option value="All">All Assignment Types</option>
                          <option value="Primary">Primary</option>
                          <option value="Secondary">Secondary</option>
                        </select>
                      </>
                    )}

                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white" value={filterArea} onChange={(e) => { setFilterArea(e.target.value); resetPage(); }}>
                      {uniqueAreas.map(area => <option key={area} value={area}>{area === 'All' ? 'All Areas' : area}</option>)}
                    </select>

                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white" value={filterCaste} onChange={(e) => { setFilterCaste(e.target.value); resetPage(); }}>
                      {uniqueCastes.map(caste => <option key={caste} value={caste}>{caste === 'All' ? 'All Castes' : caste}</option>)}
                    </select>
                    
                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white" value={filterReference} onChange={(e) => { setFilterReference(e.target.value); resetPage(); }}>
                      {uniqueReferences.map(ref => <option key={ref} value={ref}>{ref}</option>)}
                    </select>

                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white" value={filterIntent} onChange={(e) => { setFilterIntent(e.target.value); resetPage(); }} disabled={filterStatus === 'Resolved' || filterStatus !== 'All' && filterStatus !== 'Active'}>
                      <option value="All">All Intent Levels</option>
                      <option value="High">High Intent</option>
                      <option value="Medium">Medium Intent</option>
                      <option value="Low">Low Intent</option>
                    </select>

                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}>
                      <option value="All">All Statuses</option>
                      <option value="Active">Active Cases</option>
                      <option value="Resolved">All Closed Cases</option>
                      <optgroup label="Specific Outcomes">
                        {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    </select>

                    <div className="col-span-1 sm:col-span-2 xl:col-span-2 flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-teal-500">
                      <span className="text-xs text-slate-500 font-medium mr-2 whitespace-nowrap">Reg. Date:</span>
                      <input type="date" className="text-sm outline-none w-full bg-transparent text-slate-700 cursor-pointer" value={filterRegStart} onChange={(e) => { setFilterRegStart(e.target.value); resetPage(); }} />
                      <span className="text-slate-300 mx-1">-</span>
                      <input type="date" className="text-sm outline-none w-full bg-transparent text-slate-700 cursor-pointer" value={filterRegEnd} onChange={(e) => { setFilterRegEnd(e.target.value); resetPage(); }} />
                    </div>
                    
                    {activeFilterCount > 0 && (
                      <button 
                        onClick={() => {
                          setFilterArea('All'); setFilterCaste('All'); setFilterReference('All'); setFilterIntent('All');
                          if (currentUser?.role === 'Admin') setFilterAssignedTo('All');
                          setFilterRegStart(''); setFilterRegEnd(''); resetPage();
                        }}
                        className="text-xs text-slate-500 hover:text-red-600 font-medium text-right self-center underline decoration-dotted underline-offset-2"
                      >
                        Clear Advanced
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* DATA VIEW */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden p-4 space-y-4">
                    {visiblePatients.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        No patients found matching the criteria.
                      </div>
                    ) : (
                      visiblePatients.map(patient => (
                        <PatientCard 
                          key={patient.id} 
                          patient={patient} 
                          onClick={setSelectedPatient}
                          isAdmin={currentUser?.role === 'Admin'}
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
                        {currentUser?.role === 'Admin' && <th className="p-4 font-medium whitespace-nowrap">Assigned To</th>}
                        <th className="p-4 font-medium whitespace-nowrap">EDD</th>
                        <th className="p-4 font-medium whitespace-nowrap">Interaction Dates</th>
                        <th className="p-4 font-medium whitespace-nowrap">Area & Details</th>
                        <th className="p-4 font-medium text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visiblePatients.length === 0 ? (
                        <tr>
                          <td colSpan={currentUser?.role === 'Admin' ? "8" : "7"} className="p-8 text-center text-slate-500">
                            No patients found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        visiblePatients.map((patient, index) => (
                          <tr 
                            key={patient.id} 
                            onClick={() => setSelectedPatient(patient)}
                            className={`hover:bg-slate-50 transition-colors group cursor-pointer ${patient.status !== 'Active' ? 'bg-slate-50/50' : ''}`}
                          >
                            <td className="p-4 text-slate-500 font-medium text-center">
                              {safePage * PAGE_SIZE + index + 1}
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-900 whitespace-nowrap">{patient.name}</p>
                              <p className="text-sm text-slate-500 flex items-center mt-1 whitespace-nowrap">
                                <Phone className="h-3 w-3 mr-1" /> {patient.phone}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">ID: {patient.id}</p>
                            </td>
                            <td className="p-4">
                              {patient.status === 'Active' ? (
                                <div className="flex flex-col items-start gap-1.5">
                                  <Badge type={patient.intent}>{patient.intent} Intent</Badge>
                                  <span className="text-xs text-slate-500 whitespace-nowrap block">Prefers: {patient.preference}</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-start gap-1.5">
                                  <Badge type={patient.status === 'Delivered (Clinic)' ? 'Success' : 'Closed'}>
                                    {patient.status}
                                  </Badge>
                                  <span className="text-xs text-slate-400 whitespace-nowrap block">Case Closed</span>
                                </div>
                              )}
                            </td>
                            {currentUser?.role === 'Admin' && (
                              <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${patient.assignedTo === 'Unassigned' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-600'}`}>
                                    {patient.assignedTo === 'Unassigned' ? 'U' : patient.assignedTo.charAt(0)}
                                  </div>
                                  <span className={`text-sm font-medium whitespace-nowrap ${patient.assignedTo === 'Unassigned' ? 'text-orange-600 italic' : 'text-slate-800'}`}>
                                    {patient.assignedTo}
                                  </span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${patient.assignmentType === 'Secondary' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {patient.assignmentType === 'Secondary' ? 'Secondary' : 'Primary'}
                                  </span>
                                </div>
                              </td>
                            )}
                            <td className="p-4 whitespace-nowrap">
                              <span className={`font-medium block ${patient.status !== 'Active' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{formatDate(patient.edd)}</span>
                              {patient.status === 'Active' && (
                                <span className="text-xs text-slate-500 mt-0.5 block">{calculateDaysUntil(patient.edd)} days left</span>
                              )}
                            </td>
                            <td className="p-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-slate-700 font-medium flex items-center">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-10">Last:</span>
                                  {formatDate(patient.lastContact)}
                                </span>
                                {patient.nextInteractionDate ? (
                                  <span className="text-teal-700 font-bold flex items-center">
                                    <span className="text-[10px] uppercase tracking-wider text-teal-600/70 w-10">Next:</span>
                                    {formatDate(patient.nextInteractionDate)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-xs flex items-center">
                                    <span className="text-[10px] not-italic font-bold uppercase tracking-wider text-slate-300 w-10">Next:</span>
                                    Not Set
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 text-sm">
                              <span className="flex items-center whitespace-nowrap">
                                <MapPin className="h-3 w-3 mr-1 text-slate-400" /> {patient.area}
                              </span>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                                  {patient.caste}
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-50 text-teal-600 px-2 py-0.5 rounded border border-teal-100 whitespace-nowrap">
                                  Ref: {patient.reference}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right align-middle">
                              <button 
                                className="inline-flex items-center justify-center text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                title="View / Update"
                              >
                                <Eye className="h-4 w-4 mr-1.5" />
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="border-t border-slate-200 bg-slate-50/50 px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                      Showing <span className="font-bold text-slate-700">{safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filteredPatients.length)}</span> of <span className="font-bold text-slate-700">{filteredPatients.length}</span>
                    </p>
                    <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2">
                      <button onClick={() => setPage(0)} disabled={safePage === 0} className="hidden sm:block px-2 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">First</button>
                      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-3.5 w-3.5" /></button>
                      <span className="px-2.5 py-1 text-[11px] sm:text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-md whitespace-nowrap">{safePage + 1} / {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setPage(totalPages - 1)} disabled={safePage >= totalPages - 1} className="hidden sm:block px-2 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Last</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
    </>
  );
}
