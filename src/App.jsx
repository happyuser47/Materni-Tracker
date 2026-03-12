import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import LoginView from './views/LoginView';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import Dashboard from './pages/Dashboard';
import MyPatients from './pages/MyPatients';
import CalendarPage from './pages/CalendarPage';
import TeamPerformance from './pages/TeamPerformance';
import PatientDirectory from './pages/PatientDirectory';
import SettingsPage from './pages/SettingsPage';
import PatientDetailModal from './components/PatientDetailModal';
import AddPatientModal from './components/AddPatientModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { Activity, LogOut } from 'lucide-react';

const AppContent = () => {
  const { activeTab, isLoading, batchProgress, currentUser } = useApp();
  const { logout } = useAuth();

  if (isLoading) {
    return <LoadingScreen title="Establishing Secure Connection" subtitle="Synchronizing clinic data and patient records..." />;
  }

  // Handle case where user is authenticated but not in public.staff table
  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Restricted</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your account is authenticated, but you haven't been registered in the MaterniTrack staff directory yet. 
            Please contact the administrator to activate your profile.
          </p>
          <button
            onClick={() => logout()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      {/* CSV Upload Overlay Loader */}
      {batchProgress && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-white/90 rounded-2xl p-8 shadow-2xl border border-slate-200 max-w-sm w-full mx-4">
            <div className="w-16 h-16 relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-t-2 border-teal-600 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-2 border-teal-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-teal-500">Importing Patient Records</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Processing bulk data — please wait...</p>

            <div className="w-full mt-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-bold text-teal-600">{batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-600 to-teal-500 h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center font-medium">
                {batchProgress.current} of {batchProgress.total} records processed
              </p>
            </div>
          </div>
        </div>
      )}
      <Toast />
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
        <Header />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'my-patients' && <MyPatients />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'team' && <TeamPerformance />}
          {activeTab === 'patients' && <PatientDirectory />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>
      <PatientDetailModal />
      <AddPatientModal />
      <ConfirmModal />
    </div>
  );
};

const LoadingScreen = ({ title, subtitle }) => (
  <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-t-2 border-teal-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-t-2 border-teal-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <h2 className="mt-6 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-teal-500">{title}</h2>
      <p className="text-sm text-slate-500 mt-2 font-medium">{subtitle}</p>
    </div>
  </div>
);

const AuthGate = () => {
  const { user, authLoading } = useAuth();
  const [showProgressiveLoader, setShowProgressiveLoader] = React.useState(false);

  React.useEffect(() => {
    // Only show the "Verifying session" loader if it takes longer than 200ms
    // to avoid the "double flash" on hard reload
    const timer = setTimeout(() => setShowProgressiveLoader(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading) {
    if (!showProgressiveLoader) return null;
    return <LoadingScreen title="MaterniTrack" subtitle="Verifying session..." />;
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
