import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileText, Download, Calendar, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const UPTIME_DATA = [
    { day: '1', uptime: 100 }, { day: '5', uptime: 99.9 }, { day: '10', uptime: 100 },
    { day: '15', uptime: 99.5 }, { day: '20', uptime: 100 }, { day: '25', uptime: 100 }, { day: '30', uptime: 99.8 }
];

const INCIDENT_DATA = [
    { category: 'Auth Failures', count: 145 },
    { category: 'Malware', count: 2 },
    { category: 'Policy Violation', count: 23 },
    { category: 'DDoS Attempt', count: 12 },
    { category: 'Hardware', count: 5 },
];

const ReportCard = ({ title, date, size }: any) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between hover:bg-slate-750 transition-colors group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-700 rounded-lg group-hover:bg-primary-600/20 group-hover:text-primary-400 transition-colors text-slate-400">
                <FileText size={24} />
            </div>
            <div>
                <h4 className="font-medium text-slate-200">{title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Calendar size={12} /> {date} • {size}
                </div>
            </div>
        </div>
        <button className="p-2 hover:bg-slate-600 rounded-full text-slate-500 hover:text-white transition-colors">
            <Download size={18} />
        </button>
    </div>
);

const Reports: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
           <h2 className="text-2xl font-bold text-white">Executive Reporting</h2>
           <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
               <Download size={16} /> Generate Monthly Report
           </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Summary Cards */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-green-500/10 text-green-500 mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white">99.92%</h3>
                <p className="text-slate-400 text-sm mt-1">Average Monthly Uptime</p>
           </div>
           
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-500 mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white">24</h3>
                <p className="text-slate-400 text-sm mt-1">Open Warnings</p>
           </div>

           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-red-500/10 text-red-500 mb-4">
                    <ShieldAlert size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white">5</h3>
                <p className="text-slate-400 text-sm mt-1">Critical Security Incidents</p>
           </div>
       </div>

       {/* Charts Section */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="font-bold text-white mb-6">SLA Uptime Trend (30 Days)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={UPTIME_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis domain={[98, 100]} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                            <Line type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="font-bold text-white mb-6">Security Incidents by Type</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={INCIDENT_DATA} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis dataKey="category" type="category" width={100} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                            <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
       </div>

       {/* Previous Reports List */}
       <div className="space-y-4">
           <h3 className="text-lg font-bold text-white">Archived Reports</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ReportCard title="Network Performance Report - October 2023" date="Nov 1, 2023" size="2.4 MB" />
               <ReportCard title="Security Audit Summary - Q3 2023" date="Oct 15, 2023" size="4.1 MB" />
               <ReportCard title="Capacity Planning Forecast" date="Oct 01, 2023" size="1.8 MB" />
               <ReportCard title="Network Performance Report - September 2023" date="Oct 1, 2023" size="2.3 MB" />
           </div>
       </div>
    </div>
  );
};

export default Reports;