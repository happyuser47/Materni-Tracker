import React from 'react';
import { Phone, MapPin, Eye, Edit2 } from 'lucide-react';
import { Badge } from './Badge';
import { calculateDaysUntil, formatDate } from '../utils/helpers';

export function PatientCard({ patient, onClick, isAdmin }) {
  return (
    <div 
      onClick={() => onClick(patient)}
      className={`p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group ${patient.status !== 'Active' ? 'bg-slate-50/50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate text-lg">{patient.name}</h3>
          <p className="text-sm text-slate-500 flex items-center mt-1">
            <Phone className="h-3.5 w-3.5 mr-1.5 text-teal-600" /> {patient.phone}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">ID: {patient.id}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {patient.status === 'Active' ? (
            <Badge type={patient.intent}>{patient.intent} Intent</Badge>
          ) : (
            <Badge type={patient.status === 'Delivered (Clinic)' ? 'Success' : 'Closed'}>
              {patient.status}
            </Badge>
          )}
          {patient.status === 'Active' && (
            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
               {patient.preference}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Delivery</p>
          <p className={`text-sm font-semibold mt-0.5 ${patient.status !== 'Active' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {formatDate(patient.edd)}
          </p>
          {patient.status === 'Active' && (
            <p className="text-xs text-teal-600 font-medium">{calculateDaysUntil(patient.edd)} days left</p>
          )}
        </div>
        
        {isAdmin ? (
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned To</p>
            <div className="flex items-center mt-0.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold mr-1.5 shrink-0 ${patient.assignedTo === 'Unassigned' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-600'}`}>
                {patient.assignedTo === 'Unassigned' ? 'U' : patient.assignedTo.charAt(0)}
              </div>
              <span className={`text-xs font-medium truncate mr-1.5 ${patient.assignedTo === 'Unassigned' ? 'text-orange-600 italic' : 'text-slate-700'}`}>
                {patient.assignedTo}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${patient.assignmentType === 'Secondary' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {patient.assignmentType === 'Secondary' ? 'Secondary' : 'Primary'}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assignment Type</p>
            <div className="flex items-center mt-0.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${patient.assignmentType === 'Secondary' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {patient.assignmentType === 'Secondary' ? '🔵 Secondary' : '🟢 Primary'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interaction Dates */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Interaction</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(patient.lastContact)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next Interaction</p>
          {patient.nextInteractionDate ? (
            <p className="text-sm font-semibold text-teal-700 mt-0.5">{formatDate(patient.nextInteractionDate)}</p>
          ) : (
            <p className="text-xs text-slate-400 italic mt-1">Not Set</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center">
            <MapPin className="h-2.5 w-2.5 mr-1" /> {patient.area}
          </span>
          <span className="text-[10px] font-semibold bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">
            {patient.caste}
          </span>
        </div>
        
        <button className="text-teal-600 font-bold text-xs flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-all">
          Details <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// Re-using same local helper to avoid missing import
function ChevronRight({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
