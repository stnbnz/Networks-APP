import React, { useState } from 'react';
import { Invoice } from '../types';
import { CreditCard, DollarSign, Calendar, CheckCircle, AlertTriangle, FileText, Send, Download, Filter, Plus } from 'lucide-react';

interface BillingSystemProps {
    invoices: Invoice[];
    setInvoices: (invoices: Invoice[]) => void;
}

const BillingSystem: React.FC<BillingSystemProps> = ({ invoices, setInvoices }) => {
    const [filter, setFilter] = useState('All');

    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOutstanding = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').reduce((acc, curr) => acc + curr.amount, 0);
    const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

    const filteredInvoices = filter === 'All' ? invoices : invoices.filter(i => i.status === filter);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Unpaid': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'Cancelled': return 'bg-slate-700 text-slate-400 border-slate-600';
            default: return 'bg-slate-700 text-slate-400';
        }
    };

    const handleMarkPaid = (id: string) => {
        setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="text-primary-500"/> Billing & Revenue
            </h2>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Revenue (YTD)</p>
                        <h3 className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-green-500/20 rounded-full text-green-500"><DollarSign size={24}/></div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Outstanding Balances</p>
                        <h3 className="text-3xl font-bold text-white">${totalOutstanding.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-500"><AlertTriangle size={24}/></div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Overdue Invoices</p>
                        <h3 className="text-3xl font-bold text-red-400">{overdueCount}</h3>
                    </div>
                    <div className="p-4 bg-red-500/20 rounded-full text-red-500"><FileText size={24}/></div>
                </div>
            </div>

            {/* Invoices Table Section */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        {['All', 'Paid', 'Unpaid', 'Overdue'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-bold">
                        <Plus size={16}/> Create Invoice
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs">
                            <tr>
                                <th className="p-4">Invoice #</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date Issued</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-700/30">
                                    <td className="p-4 font-mono text-slate-300">{inv.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{inv.subscriberName}</div>
                                        <div className="text-xs text-slate-500">{inv.items[0]}</div>
                                    </td>
                                    <td className="p-4 text-slate-400">{inv.issueDate}</td>
                                    <td className="p-4 text-slate-400">{inv.dueDate}</td>
                                    <td className="p-4 font-bold text-white">${inv.amount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {inv.status !== 'Paid' && (
                                                <button 
                                                    onClick={() => handleMarkPaid(inv.id)}
                                                    className="p-2 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white rounded-lg transition-colors" 
                                                    title="Mark as Paid"
                                                >
                                                    <DollarSign size={16}/>
                                                </button>
                                            )}
                                            <button className="p-2 bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-300 rounded-lg transition-colors" title="Send Email">
                                                <Send size={16}/>
                                            </button>
                                            <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors" title="Download PDF">
                                                <Download size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingSystem;