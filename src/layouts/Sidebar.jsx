import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Users, LayoutDashboard, Activity, X,
  Settings, BarChart2,
  UserCircle, ClipboardList, Calendar, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';


export default function Sidebar() {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, currentUser, setFilterAssignedTo, requestConfirm } = useApp();
  const { logout, userFullName, userRole } = useAuth();

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
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col shrink-0 z-50 md:z-20 transition-all duration-300 ease-in-out ${isSidebarOpen
        ? 'w-64 translate-x-0'
        : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        }`}>

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
          <div className="space-y-1 w-full">
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
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.onClick) item.onClick();
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                title={!isSidebarOpen ? item.label : undefined}
                className={`w-full flex items-center py-2.5 rounded-xl transition-all duration-200 ${isSidebarOpen ? 'px-4 justify-start' : 'justify-center'
                  } ${activeTab === item.id
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-xs opacity-100' : 'ml-0 max-w-0 opacity-0'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4 w-full">
            <button
              onClick={() => {
                setActiveTab('settings');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              title={!isSidebarOpen ? "Settings" : undefined}
              className={`w-full flex items-center py-2.5 rounded-xl transition-all duration-200 ${isSidebarOpen ? 'px-4 justify-start' : 'justify-center'
                } ${activeTab === 'settings' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-xs opacity-100' : 'ml-0 max-w-0 opacity-0'}`}>
                Settings
              </span>
            </button>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className={`border-t border-slate-200 shrink-0 bg-slate-50/80 transition-all duration-300 flex overflow-hidden ${isSidebarOpen ? 'p-4 items-center h-[76px]' : 'p-0 items-center justify-center h-[76px]'}`}>
          {isSidebarOpen ? (
            <div className="w-full flex items-center justify-between animate-in fade-in duration-300">
              <div className="flex items-center min-w-0 mr-2">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${currentUser?.role === 'Admin' ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                  <span className="text-white text-sm font-bold">
                    {(userFullName || currentUser?.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{userFullName || currentUser?.name}</p>
                  <p className={`text-[11px] font-medium ${currentUser?.role === 'Admin' ? 'text-teal-600' : 'text-slate-400'}`}>{currentUser?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
