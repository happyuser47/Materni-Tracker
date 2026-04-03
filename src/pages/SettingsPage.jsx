import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BellRing, AlertCircle, Upload, Download, FileSpreadsheet,
  Briefcase, Trash2, CheckCircle2, UserCircle, Database, Settings,
  Users, ListChecks, ShieldAlert, Mail, Lock, Loader2, Eye, EyeOff, Skull, AlertTriangle,
  X, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ManageListCard } from '../components/ManageListCard';
import { generateCSVTemplate, exportDataToCSV } from '../utils/helpers';

const SETTINGS_TABS = [
  { id: 'staff', label: 'Staff & Roles', icon: Users, adminOnly: true },
  { id: 'alerts', label: 'Alerts', icon: ShieldAlert, adminOnly: false },
  { id: 'data', label: 'Data', icon: Database, adminOnly: false },
  { id: 'fields', label: 'Custom Fields', icon: ListChecks, adminOnly: false },
  { id: 'danger', label: 'Danger Zone', icon: Skull, superAdminOnly: true },
];

export default function SettingsPage() {
  const {
    patients, importStatus, setImportStatus, fileInputRef,
    requestConfirm, areas, castes, references, staffMembers,
    alertConfig, currentUser, isSuperAdmin, handleAddStaff,
    handleDeleteStaff, handleFileUpload, handleModifyList, handleUpdateSettings,
    handleWipeAllPatients, batchProgress
  } = useApp();
  const { login, user } = useAuth();

  const visibleTabs = SETTINGS_TABS.filter(t => {
    if (t.superAdminOnly) return isSuperAdmin;
    if (t.adminOnly) return currentUser?.role === 'Admin';
    return true;
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState(visibleTabs[0]?.id || 'alerts');
  const [viewingCredentials, setViewingCredentials] = useState(null);

  // Add Staff form state
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Staff');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [addStaffError, setAddStaffError] = useState('');
  const [addStaffSuccess, setAddStaffSuccess] = useState('');

  // Danger Zone state
  const [wipePassword, setWipePassword] = useState('');
  const [showWipePassword, setShowWipePassword] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeError, setWipeError] = useState('');
  const [wipeSuccess, setWipeSuccess] = useState('');

  const handleWipeData = async (e) => {
    e.preventDefault();
    setWipeError('');
    setIsWiping(true);

    try {
      // 1. Verify password using Supabase login (doesn't change session if successful)
      await login(user.email, wipePassword);

      // 2. Perform wipe
      const result = await handleWipeAllPatients();
      
      if (result.error) {
        setWipeError(result.error);
      } else {
        setWipeSuccess('System reset successful. All patient data has been cleared.');
        setWipePassword('');
        setTimeout(() => setWipeSuccess(''), 5000);
      }
    } catch (err) {
      setWipeError('Authentication failed. Please check Dr. Usama\'s password.');
    } finally {
      setIsWiping(false);
    }
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setAddStaffError('');
    setAddStaffSuccess('');
    setAddStaffLoading(true);

    try {
      const result = await handleAddStaff({
        name: staffName.trim(),
        role: staffRole,
        email: staffEmail.trim(),
        password: staffPassword
      });

      if (result?.error) {
        setAddStaffError(result.error);
      } else {
        setAddStaffSuccess(`${staffName} has been added successfully with login access.`);
        setStaffName('');
        setStaffRole('Staff');
        setStaffEmail('');
        setStaffPassword('');
        setTimeout(() => setAddStaffSuccess(''), 5000);
      }
    } catch (err) {
      setAddStaffError(err.message || 'Failed to add staff member.');
    } finally {
      setAddStaffLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl shadow-md">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">System Settings</h1>
            <p className="text-slate-500 text-xs md:text-sm">Configure preferences, manage staff, and handle data.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 md:gap-2 mb-6 md:mb-8 bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSettingsTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center md:flex-none
                ${isActive
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-600' : ''}`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* STAFF & ROLES TAB */}
      {activeSettingsTab === 'staff' && currentUser?.role === 'Admin' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Staff & Roles Management</h3>
                  <p className="text-sm text-slate-500">Add staff members with secure login credentials.</p>
                </div>
              </div>
            </div>

            {/* Add Staff Form */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100">
              {/* Status Messages */}
              {addStaffError && (
                <div className="mb-4 flex items-start gap-3 p-3.5 bg-red-50/80 border border-red-200/60 rounded-xl animate-in fade-in duration-300">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{addStaffError}</p>
                </div>
              )}
              {addStaffSuccess && (
                <div className="mb-4 flex items-start gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl animate-in fade-in duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 font-medium">{addStaffSuccess}</p>
                </div>
              )}

              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Staff Name</label>
                    <input
                      type="text" value={staffName} onChange={e => setStaffName(e.target.value)} required placeholder="e.g., LHV Maryam"
                      className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 bg-slate-50/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                    <select value={staffRole} onChange={e => setStaffRole(e.target.value)} className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 bg-slate-50/50 transition-all">
                      <option value="Staff">Staff (LHV/Nurse)</option>
                      <option value="Admin">Admin (Doctor/MO)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Login Email</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} required placeholder="staff@example.com"
                        autoComplete="off"
                        className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 bg-slate-50/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Login Password</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showStaffPassword ? 'text' : 'password'} value={staffPassword} onChange={e => setStaffPassword(e.target.value)} required placeholder="Min 6 characters" minLength={6}
                        autoComplete="new-password"
                        className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 bg-slate-50/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowStaffPassword(!showStaffPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={addStaffLoading}
                    className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 active:scale-[0.97] text-white py-2.5 px-8 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-teal-200 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addStaffLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Add Staff Member'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Staff Grid */}
            <div className="px-6 py-5 md:px-8 md:py-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{staffMembers.length} Team Members</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {staffMembers.map(staff => (
                  <div key={staff.id} className="group flex items-center justify-between bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-slate-200 p-3.5 rounded-xl transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-center overflow-hidden pr-2">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 shrink-0 ${staff.role === 'Admin' ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-slate-100'}`}>
                        {staff.role === 'Admin' ? (
                          <span className="text-white text-sm font-bold">{staff.name.charAt(0).toUpperCase()}</span>
                        ) : (
                          <UserCircle className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">{staff.name}</p>
                          {currentUser?.role === 'Admin' && (
                            <button 
                              onClick={() => setViewingCredentials(staff)}
                              className="p-1 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-lg transition-colors"
                              title="View Credentials"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-medium ${staff.role === 'Admin' ? 'text-teal-500' : 'text-slate-400'}`}>{staff.role}</p>
                          {staff.auth_id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Has login access" />}
                        </div>
                      </div>
                    </div>
                    {/* Delete button logic based on Super Admin rules */}
                    {(staff.email !== 'usama786@gmail.com' && (staff.role !== 'Admin' || isSuperAdmin)) ? (
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all shrink-0 md:opacity-0 md:group-hover:opacity-100"
                        title="Remove staff"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="p-2 shrink-0">
                        {staff.email === 'usama786@gmail.com' && (
                          <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">System</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Staff Credentials Modal */}
          {viewingCredentials && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-5 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <UserCircle className="h-5 w-5" />
                    </div>
                    <h2 className="font-bold text-lg">Staff Credentials</h2>
                  </div>
                  <button onClick={() => setViewingCredentials(null)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">NAME</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                        {viewingCredentials.name.charAt(0)}
                      </div>
                      <p className="font-bold text-slate-800">{viewingCredentials.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">EMAIL ADDRESS</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between group">
                        <span className="text-sm font-medium text-slate-700 select-all">{viewingCredentials.email || 'No email set'}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(viewingCredentials.email);
                          }}
                          className="text-teal-600 hover:text-teal-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">LOGIN PASSWORD</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between group">
                        <span className="text-sm font-bold text-teal-700 font-mono tracking-wider select-all">
                          {viewingCredentials.password || '••••••••'}
                        </span>
                        <button 
                          onClick={() => {
                            if (viewingCredentials.password) navigator.clipboard.writeText(viewingCredentials.password);
                          }}
                          className="text-teal-600 hover:text-teal-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                      {!viewingCredentials.password && (
                        <p className="text-[10px] text-amber-500 mt-2 flex items-start gap-1.5 bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" /> 
                          <span>Note: Passwords are encrypted for safety. Only new accounts created from now on will show their visible password here.</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setViewingCredentials(null)}
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALERTS TAB */}
      {activeSettingsTab === 'alerts' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-gradient-to-r from-orange-50/60 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Alert Conditions</h3>
                  <p className="text-sm text-slate-500">Define when patients appear in the "Urgent Follow-up" section.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8">
              {/* Info Banner */}
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 mb-8 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Patients will appear as <strong>"Contact Overdue"</strong> if their EDD is within the configured days <strong>AND</strong> they haven't been contacted within the gap period.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">EDD Proximity Threshold</label>
                  <p className="text-xs text-slate-400 mb-1">Alert when EDD is within this many days</p>
                  <div className="relative">
                    <input
                      type="number" min="1" max="100"
                      value={alertConfig.eddProximity}
                      onChange={(e) => handleUpdateSettings({ ...alertConfig, eddProximity: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 bg-slate-50/50 transition-all pr-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Contact Gap Threshold</label>
                  <p className="text-xs text-slate-400 mb-1">Alert if last contact was over this many days ago</p>
                  <div className="relative">
                    <input
                      type="number" min="1" max="100"
                      value={alertConfig.contactGap}
                      onChange={(e) => handleUpdateSettings({ ...alertConfig, contactGap: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 bg-slate-50/50 transition-all pr-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">days</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Rule Preview</p>
                <p className="text-sm text-slate-700">
                  Show alert when EDD is within <span className="font-bold text-orange-600">{alertConfig.eddProximity} days</span> and
                  last contact was more than <span className="font-bold text-orange-600">{alertConfig.contactGap} days</span> ago.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DATA TAB */}
      {activeSettingsTab === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Banner */}
          {importStatus && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top duration-300 ${importStatus.startsWith('success') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {importStatus.startsWith('success') ? <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
              <p className="text-sm font-medium">{importStatus.replace('success:', '')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-100 text-teal-600 rounded-xl">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Import Patients</h3>
                    <p className="text-xs text-slate-500">Bulk upload from CSV or PDF</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 md:px-8 md:py-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-500 mb-6 flex-1">
                  Upload a CSV or PDF file to bulk import new patients. CSV format is standard; PDFs match the specific OPD generated report format. Duplicates (by CNIC) are automatically skipped.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={generateCSVTemplate}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center border border-slate-200 hover:border-slate-300"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </button>
                  <div className="relative">
                    <input
                      type="file" accept=".csv,.pdf" onChange={handleFileUpload} ref={fileInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Click to upload CSV or PDF"
                    />
                    <div className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center shadow-sm shadow-teal-200">
                      <Upload className="h-4 w-4 mr-2" />
                      Select & Upload File
                    </div>
                  </div>

                  {/* Batch Progress Bar */}
                  {batchProgress && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Importing Records...</span>
                        <span className="text-xs font-bold text-teal-600">{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
                        Processing {batchProgress.current} of {batchProgress.total} patients
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Export Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Export Data</h3>
                    <p className="text-xs text-slate-500">Download full database backup</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 md:px-8 md:py-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-500 mb-6 flex-1">
                  Download a complete backup of all patients (Active and Closed) currently in the system. The file will be exported as a standard CSV.
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => exportDataToCSV(patients)}
                    className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center shadow-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Database ({patients.length} records)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Database Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Database Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <p className="text-2xl font-bold text-slate-800">{patients.length}</p>
                <p className="text-xs text-slate-500 mt-1">Total Records</p>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-4 text-center border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-700">{patients.filter(p => p.status === 'Active').length}</p>
                <p className="text-xs text-slate-500 mt-1">Active</p>
              </div>
              <div className="bg-teal-50/50 rounded-xl p-4 text-center border border-teal-100">
                <p className="text-2xl font-bold text-teal-700">{patients.filter(p => p.status === 'Delivered (Clinic)').length}</p>
                <p className="text-xs text-slate-500 mt-1">Delivered</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <p className="text-2xl font-bold text-slate-600">{patients.filter(p => p.status !== 'Active').length}</p>
                <p className="text-xs text-slate-500 mt-1">Closed/Other</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM FIELDS TAB */}
      {activeSettingsTab === 'fields' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Custom Dropdown Fields</h3>
                  <p className="text-sm text-slate-500">Manage the options available during patient registration and editing.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                <ManageListCard
                  title="Areas"
                  listType="area"
                  items={areas}
                  handleModifyList={handleModifyList}
                  placeholder="Add new area..."
                  requestConfirm={requestConfirm}
                />
                <ManageListCard
                  title="Castes"
                  listType="caste"
                  items={castes}
                  handleModifyList={handleModifyList}
                  placeholder="Add new caste..."
                  requestConfirm={requestConfirm}
                />
                <ManageListCard
                  title="References"
                  listType="reference"
                  items={references}
                  handleModifyList={handleModifyList}
                  placeholder="Add new reference..."
                  requestConfirm={requestConfirm}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DANGER ZONE TAB */}
      {activeSettingsTab === 'danger' && isSuperAdmin && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-red-100 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                  <Skull className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 text-lg">Danger Zone</h3>
                  <p className="text-sm text-red-600/70 font-medium">Destructive system-wide operations.</p>
                </div>
              </div>
            </div>

            <div className="p-5 md:px-10 md:py-10">
              <div className="max-w-2xl">
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 mb-6">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1 text-sm">System Factory Reset</h4>
                    <p className="text-xs text-red-700 leading-relaxed">
                      This action will <strong>permanently delete all patient records</strong>, including all follow-up histories, interactions, and case logs.
                      This cannot be undone. System staff and settings will remain intact.
                    </p>
                  </div>
                </div>

                {wipeError && (
                  <div className="mb-5 p-3.5 bg-red-100/50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-3 animate-in shake-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {wipeError}
                  </div>
                )}

                {wipeSuccess && (
                  <div className="mb-5 p-3.5 bg-emerald-100/50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {wipeSuccess}
                  </div>
                )}

                <form onSubmit={handleWipeData} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Enter Admin Password to Confirm</label>
                    <p className="text-xs text-slate-500">Verification required for Dr. Usama Akram's account.</p>
                    <div className="relative w-full sm:max-w-sm">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showWipePassword ? 'text' : 'password'}
                        value={wipePassword}
                        onChange={(e) => setWipePassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-10 py-3.5 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 bg-slate-50/50 transition-all font-mono"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowWipePassword(!showWipePassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showWipePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isWiping || !wipePassword}
                    className="w-full sm:max-w-sm bg-red-600 hover:bg-red-700 disabled:bg-red-300 active:scale-[0.98] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isWiping ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Deleting Records...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5 group-hover:animate-bounce" />
                        Permanently Wipe All Patient Data
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
