import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users, AlertCircle, Activity, X, History,
  BarChart2, UserCircle, ClipboardList, TrendingUp, 
  Phone, Eye, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { formatDate, formatDateTime } from '../utils/helpers';

const TEAM_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'breakdown', label: 'Activity Breakdown', icon: Activity },
  { id: 'logs', label: 'Activity Log', icon: ClipboardList },
];

export default function TeamPerformance() {
  const {
    patients, setSelectedPatient, setActiveTab, setFilterAssignedTo,
    setFilterStatus, activityDateFilter, setActivityDateFilter,
    activitySummary, teamPerformance, filteredActivities, activeTab
  } = useApp();

  const [activeTeamTab, setActiveTeamTab] = useState('overview');

  // Compute totals for overview
  const totals = useMemo(() => {
    const totalActive = teamPerformance.reduce((s, t) => s + t.totalActive, 0);
    const totalOverdue = teamPerformance.reduce((s, t) => s + t.overdueCount, 0);
    const totalLogs = activitySummary.reduce((s, t) => s + t.total, 0);
    const topPerformer = activitySummary.length > 0 ? activitySummary[0] : null;
    return { totalActive, totalOverdue, totalLogs, topPerformer };
  }, [teamPerformance, activitySummary]);

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* ──────── Page Header ──────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-xl shadow-md shadow-teal-200/50">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Team Performance</h1>
            <p className="text-slate-500 text-xs md:text-sm">Monitor workload, daily activity, and staff efficiency.</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-400 shadow-sm transition-all w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Date:</span>
          <input
            type="date"
            className="text-sm outline-none flex-1 bg-transparent text-slate-700 cursor-pointer"
            value={activityDateFilter}
            onChange={(e) => setActivityDateFilter(e.target.value)}
            title="Select date to filter activity"
          />
          {activityDateFilter && (
            <button onClick={() => setActivityDateFilter('')} className="text-slate-400 hover:text-red-500 transition-colors p-0.5" title="Clear Date">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ──────── Summary Stat Cards ──────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Size</p>
            <div className="p-1.5 bg-teal-50 rounded-lg"><Users className="h-3.5 w-3.5 text-teal-600" /></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">{teamPerformance.length}</p>
          <p className="text-xs text-slate-400 mt-1">Staff members</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cases</p>
            <div className="p-1.5 bg-emerald-50 rounded-lg"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">{totals.totalActive}</p>
          <p className="text-xs text-slate-400 mt-1">Across all staff</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue</p>
            <div className="p-1.5 bg-red-50 rounded-lg"><AlertCircle className="h-3.5 w-3.5 text-red-500" /></div>
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${totals.totalOverdue > 0 ? 'text-red-600' : 'text-slate-800'}`}>{totals.totalOverdue}</p>
          <p className="text-xs text-slate-400 mt-1">Need follow-up</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activities</p>
            <div className="p-1.5 bg-teal-50 rounded-lg"><Activity className="h-3.5 w-3.5 text-teal-600" /></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">{totals.totalLogs}</p>
          <p className="text-xs text-slate-400 mt-1">{activityDateFilter ? formatDate(activityDateFilter) : 'All time'}</p>
        </div>
      </div>

      {/* ──────── Tab Navigation ──────── */}
      <div className="flex gap-1.5 md:gap-2 mb-6 md:mb-8 bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
        {TEAM_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTeamTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTeamTab(tab.id)}
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

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTeamTab === 'overview' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {teamPerformance.map(staff => (
              <div key={staff.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-slate-300 hover:shadow-md transition-all duration-300">
                {/* Card Header */}
                <div className={`p-5 border-b border-slate-100 flex items-center justify-between ${staff.role === 'Admin' ? 'bg-gradient-to-r from-teal-50/70 to-white' : 'bg-gradient-to-r from-teal-50/30 to-white'}`}>
                  <div className="flex items-center min-w-0">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-bold mr-3 shrink-0 shadow-sm ${staff.role === 'Admin' ? 'bg-gradient-to-br from-teal-600 to-teal-800' : 'bg-gradient-to-br from-teal-500 to-teal-700'}`}>
                      {staff.name.charAt(0)}
                    </div>
                    <div className="min-w-0 pr-2">
                      <h3 className="font-bold text-slate-900 truncate">{staff.name}</h3>
                      <Badge type={staff.role}>{staff.role}</Badge>
                    </div>
                  </div>
                  {staff.overdueCount > 0 && (
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg shrink-0 animate-pulse">
                      {staff.overdueCount} Alert{staff.overdueCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="p-5 space-y-5 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Active Patients</p>
                      <p className="text-2xl font-bold text-slate-800">{staff.totalActive}</p>
                    </div>
                    <div className={`rounded-xl p-3.5 border ${staff.interactionsLogged > 0 ? 'bg-emerald-50/60 border-emerald-200/60' : 'bg-slate-50/80 border-slate-100'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">
                        {activityDateFilter ? 'Logs (Date)' : 'Logs (All)'}
                      </p>
                      <p className={`text-2xl font-bold ${staff.interactionsLogged > 0 ? 'text-emerald-700' : 'text-slate-800'}`}>{staff.interactionsLogged}</p>
                    </div>
                  </div>

                  {/* Intent Bars */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Intent Breakdown</p>
                    <div className="space-y-2.5">
                      {[
                        { label: 'High', value: staff.highIntent, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                        { label: 'Med', value: staff.mediumIntent, color: 'bg-amber-400', textColor: 'text-amber-600' },
                        { label: 'Low', value: staff.lowIntent, color: 'bg-red-400', textColor: 'text-red-600' }
                      ].map(bar => (
                        <div key={bar.label} className="flex items-center text-sm">
                          <span className={`w-10 text-xs font-semibold ${bar.textColor}`}>{bar.label}</span>
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden mx-3">
                            <div
                              className={`${bar.color} h-full rounded-full transition-all duration-700 ease-out`}
                              style={{ width: `${staff.totalActive ? (bar.value / staff.totalActive) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700 w-6 text-right text-xs">{bar.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <button
                  onClick={() => {
                    setFilterAssignedTo(staff.name);
                    setFilterStatus('Active');
                    setActiveTab('patients');
                  }}
                  className="p-3.5 bg-slate-50/80 border-t border-slate-100 text-center text-teal-600 hover:text-teal-800 hover:bg-teal-50 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 group-hover:bg-slate-50"
                >
                  View Patients <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Top Performer Highlight */}
          {totals.topPerformer && totals.topPerformer.total > 0 && (
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-5 md:p-6 text-white shadow-lg shadow-teal-200/40">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                    {totals.topPerformer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider">Top Performer {activityDateFilter ? `(${formatDate(activityDateFilter)})` : '(All Time)'}</p>
                    <p className="text-xl font-bold">{totals.topPerformer.name}</p>
                  </div>
                </div>
                <div className="flex gap-5 md:gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totals.topPerformer.total}</p>
                    <p className="text-teal-100 text-xs">Total Logs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totals.topPerformer.calls}</p>
                    <p className="text-teal-100 text-xs">Calls</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totals.topPerformer.visits}</p>
                    <p className="text-teal-100 text-xs">Visits</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ACTIVITY BREAKDOWN TAB ═══════════════ */}
      {activeTeamTab === 'breakdown' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Activity Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activityDateFilter ? `Showing data for ${formatDate(activityDateFilter)}` : 'Showing all-time data'}
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff Member</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Total</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center gap-1.5"><Phone className="h-3 w-3" /> Calls</div>
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center gap-1.5"><Eye className="h-3 w-3" /> Visits</div>
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Referrals</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Outcomes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activitySummary.map((stat, idx) => (
                    <tr key={stat.name} className={`hover:bg-slate-50/80 transition-colors ${idx === 0 && stat.total > 0 ? 'bg-emerald-50/30' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold mr-3 text-xs shrink-0 ${stat.role === 'Admin' ? 'bg-gradient-to-br from-teal-600 to-teal-800' : 'bg-gradient-to-br from-teal-500 to-teal-700'}`}>
                            {stat.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 text-sm">{stat.name}</span>
                            {idx === 0 && stat.total > 0 && (
                              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">TOP</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-full text-sm font-bold ${stat.total > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {stat.total}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm font-medium text-slate-600">{stat.calls > 0 ? stat.calls : <span className="text-slate-300">—</span>}</td>
                      <td className="p-4 text-center text-sm font-medium text-slate-600">{stat.visits > 0 ? stat.visits : <span className="text-slate-300">—</span>}</td>
                      <td className="p-4 text-center text-sm font-medium text-slate-600">{stat.referrals > 0 ? stat.referrals : <span className="text-slate-300">—</span>}</td>
                      <td className="p-4 text-center text-sm font-medium text-slate-600">{stat.outcomes > 0 ? stat.outcomes : <span className="text-slate-300">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ACTIVITY LOG TAB ═══════════════ */}
      {activeTeamTab === 'logs' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      Clinic Activity Log
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activityDateFilter ? `Showing logs for ${formatDate(activityDateFilter)}` : 'Showing most recent 50 entries'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                  {filteredActivities.length} {filteredActivities.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredActivities.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                  <div className="p-4 bg-slate-100 rounded-full mb-4">
                    <History className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-500">No activity recorded</p>
                  <p className="text-sm mt-1">Try selecting a different date or clearing the filter.</p>
                </div>
              ) : (
                filteredActivities.map((activity, index) => (
                  <div
                    key={`${activity.id}-${index}`}
                    className="p-5 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer flex gap-4 group"
                    onClick={() => {
                      setSelectedPatient(patients.find(p => p.id === activity.patientId));
                    }}
                  >
                    {/* Timeline Avatar */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                        activity.type === 'Outcome Logged' ? 'bg-gradient-to-br from-slate-700 to-slate-900' :
                        activity.type === 'Call' ? 'bg-gradient-to-br from-teal-400 to-teal-600' :
                        activity.type === 'Visit' ? 'bg-gradient-to-br from-teal-500 to-teal-700' :
                        activity.type === 'Referral' ? 'bg-gradient-to-br from-teal-600 to-teal-800' :
                        'bg-gradient-to-br from-teal-500 to-teal-700'
                      }`}>
                        {activity.staff.charAt(0)}
                      </div>
                      {index < filteredActivities.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 mt-2 min-h-[20px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{activity.staff}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                            activity.type === 'Outcome Logged' ? 'bg-slate-800 text-white' :
                            activity.type === 'Call' ? 'bg-teal-100 text-teal-700' :
                            activity.type === 'Visit' ? 'bg-teal-100 text-teal-700' :
                            activity.type === 'Referral' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {activity.type}
                          </span>
                          {activity.type !== 'Outcome Logged' && activity.intent && <Badge type={activity.intent}>{activity.intent}</Badge>}
                        </div>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {formatDateTime(activity.date)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Patient: <span className="font-semibold text-slate-800">{activity.patientName}</span>
                      </p>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-600 leading-relaxed">
                        {activity.notes}
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="shrink-0 flex items-start pt-2">
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
