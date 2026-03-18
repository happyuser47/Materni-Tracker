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


export default function ConfirmModal() {
  const { confirmDialog, closeConfirm } = useApp();
  
  if (!confirmDialog.isOpen) return null;

  const isDestructive = confirmDialog.message.toLowerCase().includes('delete') || 
                        confirmDialog.message.toLowerCase().includes('remove') ||
                        confirmDialog.message.toLowerCase().includes('wipe');

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className={`p-5 border-b border-slate-100 flex items-center gap-3 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
          {isDestructive ? <AlertCircle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          <h2 className="text-lg font-bold text-slate-900">
            {isDestructive ? 'Confirm Action' : 'Action Required'}
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{confirmDialog.message}</p>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={closeConfirm} 
            className="px-5 py-2.5 text-slate-600 text-sm font-bold hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => { confirmDialog.onConfirm(); closeConfirm(); }} 
            className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 ${
              isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-100'
            }`}
          >
            {isDestructive ? 'Confirm' : 'Yes, Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}
