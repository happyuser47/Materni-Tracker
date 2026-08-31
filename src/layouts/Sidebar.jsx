import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Users, LayoutDashboard, Activity, X,
  Settings, BarChart2,
  UserCircle, ClipboardList, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';


export default function Sidebar() {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, currentUser, setFilterAssignedTo, requestConfirm, setShowProfileModal } = useApp();
  const { userFullName } = useAuth();

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 bg-white flex flex-col shrink-0 z-50 md:z-20 transition-all duration-300 ease-in-out ${isSidebarOpen
        ? 'w-64 translate-x-0'
        : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        }`}
        style={{ boxShadow: '1px 0 0 0 rgba(226,232,240,0.8), 4px 0 16px -4px rgba(15,23,42,0.06)' }}
      >

        {/* Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-6 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-teal-600 z-30 transition-transform hover:scale-110 hidden md:flex items-center justify-center"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-slate-200 shrink-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'px-6' : 'px-0 justify-center'}`}>
          <img src="/logo.png" alt="Logo" className="h-8 w-8 shrink-0 object-contain" />
          <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 truncate whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'ml-2 max-w-xs opacity-100' : 'ml-0 max-w-0 opacity-0'}`}>
            MaterniTrack
          </span>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? 'px-4' : 'px-3 items-center'}`}>
          <div className="space-y-2 w-full flex flex-col items-center">
            {[
              {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard},
              {id: 'my-patients', label: 'My Patients', icon: ClipboardList},
              {
                id: 'patients',
                label: currentUser?.role === 'Admin' ? 'Patient Directory' : 'All Patients',
                icon: Users,
                onClick: () => setFilterAssignedTo('All')
              },
              ...(currentUser?.role === 'Admin' ? [
                {id: 'calendar', label: 'Delivery Calendar', icon: Calendar},
                {id: 'team', label: 'Team Performance', icon: BarChart2}
              ] : [])
            ].map(item => {
              const isActive = activeTab === item.id;
              return isSidebarOpen ? (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.onClick) item.onClick();
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className="group relative w-full inline-flex items-center justify-start px-6 py-2.5 overflow-hidden tracking-tighter text-white bg-slate-800 rounded-xl transition-all duration-300 ease-in-out cursor-pointer select-none"
                >
                  <span
                    className={`absolute transition-all duration-500 ease-out bg-teal-600 rounded-full group-hover:w-56 group-hover:h-56 ${isActive ? 'w-56 h-56' : 'w-0 h-0'}`}
                  ></span>
                  <span className="absolute bottom-0 left-0 h-full -ml-2 pointer-events-none">
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
                  <span className="absolute top-0 right-0 w-12 h-full -mr-3 pointer-events-none">
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
                    className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-slate-200 pointer-events-none"
                  ></span>
                  <span className="relative z-10 flex items-center gap-3">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                  </span>
                </button>
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.onClick) item.onClick();
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  title={item.label}
                  className="group relative inline-flex items-center justify-center w-11 h-11 overflow-hidden tracking-tighter text-white bg-slate-800 rounded-xl transition-all duration-300 ease-in-out cursor-pointer select-none"
                >
                  <span
                    className={`absolute transition-all duration-500 ease-out bg-teal-600 rounded-full group-hover:w-20 group-hover:h-20 ${isActive ? 'w-20 h-20' : 'w-0 h-0'}`}
                  ></span>
                  <span
                    className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-slate-200 pointer-events-none"
                  ></span>
                  <span className="relative z-10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 shrink-0" />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 w-full flex justify-center">
            {isSidebarOpen ? (
              <button
                onClick={() => {
                  setActiveTab('settings');
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className="group relative w-full inline-flex items-center justify-start px-6 py-2.5 overflow-hidden tracking-tighter text-white bg-slate-800 rounded-xl transition-all duration-300 ease-in-out cursor-pointer select-none"
              >
                <span
                  className={`absolute transition-all duration-500 ease-out bg-teal-600 rounded-full group-hover:w-56 group-hover:h-56 ${activeTab === 'settings' ? 'w-56 h-56' : 'w-0 h-0'}`}
                ></span>
                <span className="absolute bottom-0 left-0 h-full -ml-2 pointer-events-none">
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
                <span className="absolute top-0 right-0 w-12 h-full -mr-3 pointer-events-none">
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
                  className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-slate-200 pointer-events-none"
                ></span>
                <span className="relative z-10 flex items-center gap-3">
                  <Settings className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold tracking-wide">Settings</span>
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('settings');
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                title="Settings"
                className="group relative inline-flex items-center justify-center w-11 h-11 overflow-hidden tracking-tighter text-white bg-slate-800 rounded-xl transition-all duration-300 ease-in-out cursor-pointer select-none"
              >
                <span
                  className={`absolute transition-all duration-500 ease-out bg-teal-600 rounded-full group-hover:w-20 group-hover:h-20 ${activeTab === 'settings' ? 'w-20 h-20' : 'w-0 h-0'}`}
                ></span>
                <span
                  className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-slate-200 pointer-events-none"
                ></span>
                <span className="relative z-10 flex items-center justify-center">
                  <Settings className="h-5 w-5 shrink-0" />
                </span>
              </button>
            )}
          </div>
        </nav>

        {/* User Profile & Account Settings Button */}
        <div className={`border-t border-slate-200 shrink-0 bg-slate-50/80 transition-all duration-300 flex overflow-hidden ${isSidebarOpen ? 'p-3 items-center h-[76px]' : 'p-0 items-center justify-center h-[76px]'}`}>
          {isSidebarOpen ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-2 rounded-xl active:scale-[0.98] transition-all cursor-pointer group text-left ${
                activeTab === 'profile'
                  ? 'bg-teal-50/90 border border-teal-200 ring-2 ring-teal-500/20 shadow-xs'
                  : 'hover:bg-slate-200/70 border border-transparent'
              }`}
              title="Click to view & edit your profile"
            >
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={userFullName || currentUser?.name}
                  className="h-10 w-10 rounded-full object-cover shrink-0 ring-2 ring-teal-500/40 shadow-sm"
                />
              ) : (
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentUser?.role === 'Admin' ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                  <span className="text-white text-sm font-bold">
                    {(userFullName || currentUser?.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="ml-3 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold truncate transition-colors ${activeTab === 'profile' ? 'text-teal-900' : 'text-slate-800 group-hover:text-teal-700'}`}>
                    {userFullName || currentUser?.name}
                  </p>
                  <span className={`text-[10px] font-medium transition-opacity ${activeTab === 'profile' ? 'text-teal-700 opacity-100' : 'text-teal-600 opacity-0 group-hover:opacity-100'}`}>
                    Profile ⚙
                  </span>
                </div>
                <p className={`text-[11px] font-medium ${activeTab === 'profile' ? 'text-teal-700' : currentUser?.role === 'Admin' ? 'text-teal-600' : 'text-slate-400'}`}>
                  {currentUser?.role}
                </p>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`p-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'profile' ? 'ring-2 ring-teal-600 bg-teal-50' : 'hover:ring-2 hover:ring-teal-500/50'
              }`}
              title="My Profile & Account"
            >
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={userFullName || currentUser?.name}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-teal-500/40 shadow-sm"
                />
              ) : (
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentUser?.role === 'Admin' ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                  <span className="text-white text-sm font-bold">
                    {(userFullName || currentUser?.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
