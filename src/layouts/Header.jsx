import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  BellRing, ChevronRight, Activity, Settings, BarChart2, LogOut, Menu
} from 'lucide-react';
import { calculateDaysUntil, formatDate, getPatientAlertType } from '../utils/helpers';


export default function Header() {
  const { activeTab, setActiveTab, setSelectedPatient, showNotifications, setShowNotifications, isSidebarOpen, setIsSidebarOpen, currentUser, bellAlerts, alertConfig, requestConfirm } = useApp();
  const { logout, userFullName } = useAuth();

  const handleLogout = () => {
    requestConfirm(
      'Are you sure you want to sign out of MaterniTrack?',
      async () => {
        try {
          await logout();
        } catch (err) {
          console.error('Logout failed:', err);
        }
      }
    );
  };

  if (!currentUser) return null;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 mr-1 flex items-center justify-center text-slate-500 hover:text-teal-600 transition-colors rounded-lg hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="md:hidden flex items-center overflow-hidden">
            <span className="text-lg font-bold text-slate-800 truncate">MaterniTrack</span>
          </div>
          <div className="hidden md:flex items-center text-sm text-slate-500">
            {formatDate(new Date().toISOString().split('T')[0])} • Welcome, <span className="font-medium text-slate-700 ml-1">{userFullName || currentUser?.name}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 md:space-x-3 shrink-0">
          {currentUser?.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('team')}
              className="md:hidden relative p-2 text-slate-400 hover:text-teal-600 transition-colors"
            >
              <BarChart2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className="md:hidden relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* NOTIFICATIONS DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 transition-colors rounded-full ${showNotifications ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <BellRing className="h-5 w-5" />
              {bellAlerts.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                ></div>

                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Urgent Alerts</h3>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">{bellAlerts.length}</span>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-0">
                    {bellAlerts.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">No new alerts at the moment.</div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {bellAlerts.map(patient => (
                          <li
                            key={patient.id}
                            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowNotifications(false);
                              if (activeTab !== 'patients' && activeTab !== 'my-patients') setActiveTab('my-patients');
                            }}
                          >
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-sm text-slate-900">{patient.name}</span>
                                {currentUser?.role === 'Admin' && (
                                  <span className={`text-[10px] font-medium mt-0.5 ${patient.assignedTo === 'Unassigned' ? 'text-orange-500' : 'text-slate-500'}`}>
                                    {patient.assignedTo}
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const alertType = getPatientAlertType(patient, alertConfig);
                                if (alertType === 'Delivery Due') {
                                  return <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 whitespace-nowrap shrink-0">Delivery Due</span>;
                                } else if (alertType === 'Follow-up Due') {
                                  return <span className="text-[10px] uppercase font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap shrink-0">Follow-up Due</span>;
                                } else {
                                  return <span className="text-[10px] uppercase font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap shrink-0">Contact Overdue</span>;
                                }
                              })()}
                            </div>
                            <div className="text-xs text-slate-500 flex justify-between items-center mt-1.5">
                              <span><span className="font-medium text-orange-600">{calculateDaysUntil(patient.edd)} days left</span> • EDD: {formatDate(patient.edd)}</span>
                              <span className="text-teal-600 font-medium flex items-center">View <ChevronRight className="h-3 w-3 ml-0.5" /></span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Logout Button in Header (visible on all sizes) */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="hidden md:flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="md:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
    </>
  );
}
