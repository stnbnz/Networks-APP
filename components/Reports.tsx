import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileText, Download, Calendar, CheckCircle, AlertTriangle, ShieldAlert, Users, DollarSign } from 'lucide-react';

const REVENUE_DATA = [
    { month: 'May', revenue: 12000 }, { month: 'Jun', revenue: 13500 }, { month: 'Jul', revenue: 13200 },
    { month: 'Aug', revenue: 14800 }, { month: 'Sep', revenue: 15500 }, { month: 'Oct', revenue: 16200 }
];

const DATA_USAGE_DATA = [
    { category: 'Streaming', gbs: 45000 },
    { category: 'Gaming', gbs: 12000 },
    { category: 'Web/Social', gbs: 25000 },
    { category: 'File Transfer', gbs: 8000 },
    { category: 'VoIP/Other', gbs: 3000 },
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
           <h2 className="text-2xl font-bold text-white">ISP Performance Reports</h2>
           <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
               <Download size={16} /> Export Monthly Data
           </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Summary Cards */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-green-500/10 text-green-500 mb-4">
                    <DollarSign size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white">$452.00</h3>
                <p className="text-slate-400 text-sm mt-1">ARPU (Avg Revenue Per User)</p>
           </div>
           
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 mb-4">
                    <Users size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white">1.2%</h3>
                <p className="text-slate-400 text-sm mt-1">Monthly Churn Rate</p>
           </div>

           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-purple-500/10 text-purple-500 mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white">99.98%</h3>
                <p className="text-slate-400 text-sm mt-1">Core Network Uptime</p>
           </div>
       </div>

       {/* Charts Section */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="font-bold text-white mb-6">Revenue Growth (6 Months)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={REVENUE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} 
                                formatter={(value) => [`$${value}`, 'Revenue']}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="font-bold text-white mb-6">Subscriber Data Usage by Type (GB)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DATA_USAGE_DATA} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis dataKey="category" type="category" width={100} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                            <Bar dataKey="gbs" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
       </div>

       {/* Previous Reports List */}
       <div className="space-y-4">
           <h3 className="text-lg font-bold text-white">Generated Statements</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ReportCard title="Financial Statement - October 2023" date="Nov 1, 2023" size="1.2 MB" />
               <ReportCard title="Subscriber Growth Analysis - Q3" date="Oct 15, 2023" size="3.5 MB" />
               <ReportCard title="Bandwidth Utilization Report" date="Oct 01, 2023" size="5.8 MB" />
               <ReportCard title="Regulatory Compliance Doc" date="Sep 28, 2023" size="0.5 MB" />
           </div>
       </div>
    </div>
  );
};

export default Reports;