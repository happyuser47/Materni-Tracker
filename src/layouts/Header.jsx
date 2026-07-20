import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  BellRing, ChevronRight, Activity, Settings, BarChart2, LogOut, Menu, CheckCircle2, X
} from 'lucide-react';
import { calculateDaysUntil, formatDate, getPatientAlertType } from '../utils/helpers';


export default function Header() {
  const { activeTab, setActiveTab, setSelectedPatient, showNotifications, setShowNotifications, isSidebarOpen, setIsSidebarOpen, currentUser, alertConfig, requestConfirm, dismissAlert, dismissAllAlerts, displayBellAlerts } = useApp();
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
              {displayBellAlerts.length > 0 && (
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">Urgent Alerts</h3>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">{displayBellAlerts.length}</span>
                    </div>
                    {displayBellAlerts.length > 0 && (
                      <button 
                        onClick={() => dismissAllAlerts()}
                        className="text-xs text-slate-500 hover:text-teal-600 font-medium flex items-center transition-colors px-2 py-1 rounded-md hover:bg-teal-50"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-0">
                    {displayBellAlerts.length === 0 ? (
                      <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                          <CheckCircle2 className="h-6 w-6 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">You're all caught up!</p>
                          <p className="text-xs text-slate-400 mt-0.5">No urgent alerts at this time.</p>
                        </div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {displayBellAlerts.map(patient => (
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
                              <div className="flex items-center gap-1.5 shrink-0">
                                {(() => {
                                  const alertType = getPatientAlertType(patient, alertConfig);
                                  if (alertType === 'Delivery Overdue') {
                                    return <span className="text-[10px] uppercase font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">Delivery Overdue</span>;
                                  } else if (alertType === 'Delivery Due') {
                                    return <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 whitespace-nowrap">Delivery Due</span>;
                                  } else if (alertType === 'Follow-up Due') {
                                    return <span className="text-[10px] uppercase font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap">Follow-up Due</span>;
                                  } else {
                                    return <span className="text-[10px] uppercase font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">Contact Overdue</span>;
                                  }
                                })()}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismissAlert(patient.id);
                                  }}
                                  className="text-slate-300 hover:text-slate-500 hover:bg-slate-200 p-0.5 rounded-md transition-colors"
                                  title="Dismiss alert"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 flex justify-between items-center mt-1.5">
                              {(() => {
                                const alertType = getPatientAlertType(patient, alertConfig);
                                if (alertType === 'Delivery Overdue') {
                                  return (
                                    <span>
                                      <span className="font-medium text-red-600">{Math.abs(calculateDaysUntil(patient.edd))} days overdue</span>
                                      <span className="text-slate-400 mx-1.5">•</span>
                                      EDD: {formatDate(patient.edd)}
                                    </span>
                                  );
                                } else if (alertType === 'Follow-up Due') {
                                  return (
                                    <span>
                                      <span className="font-medium text-orange-600">Follow-up: {formatDate(patient.nextInteractionDate)}</span>
                                      <span className="text-slate-400 mx-1.5">•</span>
                                      EDD: {formatDate(patient.edd)}
                                    </span>
                                  );
                                } else if (alertType === 'Contact Overdue') {
                                  return (
                                    <span>
                                      <span className="font-medium text-red-600">Last: {formatDate(patient.lastContact)}</span>
                                      <span className="text-slate-400 mx-1.5">•</span>
                                      EDD: {formatDate(patient.edd)}
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span>
                                      <span className="font-medium text-blue-600">{calculateDaysUntil(patient.edd)} days left</span>
                                      <span className="text-slate-400 mx-1.5">•</span>
                                      EDD: {formatDate(patient.edd)}
                                    </span>
                                  );
                                }
                              })()}
                              <span className="text-teal-600 font-medium flex items-center shrink-0 ml-2">View <ChevronRight className="h-3 w-3 ml-0.5" /></span>
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
            className="hidden md:flex group items-center justify-start w-9 h-9 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-md hover:w-24 hover:rounded-lg active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <div
              className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-2.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512" fill="white">
                <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                ></path>
              </svg>
            </div>
            <div
              className="absolute right-3.5 transform translate-x-full opacity-0 text-white text-xs font-bold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              Logout
            </div>
          </button>

          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="md:hidden group flex items-center justify-start w-9 h-9 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-md hover:w-24 hover:rounded-lg active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <div
              className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-2.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512" fill="white">
                <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                ></path>
              </svg>
            </div>
            <div
              className="absolute right-3.5 transform translate-x-full opacity-0 text-white text-xs font-bold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              Logout
            </div>
          </button>
        </div>
      </header>
    </>
  );
}
