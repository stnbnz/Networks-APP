import React, { useState } from 'react';
import { SupportTicket } from '../types';
import { Headphones, Search, Plus, Filter, MessageCircle, Clock, CheckCircle, AlertCircle, User, Send } from 'lucide-react';

interface SupportTicketsProps {
    tickets: SupportTicket[];
    setTickets: (tickets: SupportTicket[]) => void;
}

const SupportTickets: React.FC<SupportTicketsProps> = ({ tickets, setTickets }) => {
    const [filter, setFilter] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newMessage, setNewMessage] = useState('');

    const filteredTickets = tickets.filter(t => 
        t.subject.toLowerCase().includes(filter.toLowerCase()) || 
        t.subscriberName.toLowerCase().includes(filter.toLowerCase()) ||
        t.id.includes(filter)
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'In Progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Closed': return 'bg-slate-700 text-slate-400 border-slate-600';
            default: return 'bg-slate-700 text-slate-400';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'Critical': return 'text-red-500 font-bold';
            case 'High': return 'text-orange-500';
            case 'Medium': return 'text-yellow-500';
            default: return 'text-green-500';
        }
    };

    const handleSendMessage = () => {
        if (!selectedTicket || !newMessage.trim()) return;
        
        const updatedTicket = {
            ...selectedTicket,
            messages: [...selectedTicket.messages, { sender: 'Admin', text: newMessage, time: 'Just now' }]
        };

        setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setNewMessage('');
    };

    const updateStatus = (status: any) => {
        if (!selectedTicket) return;
        const updated = { ...selectedTicket, status: status };
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
        setSelectedTicket(updated);
    };

    return (
        <div className="flex gap-6 h-full">
            {/* Ticket List */}
            <div className={`${selectedTicket ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-1/3 bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden`}>
                <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Headphones size={18} className="text-primary-500"/> Support Desk
                        </h3>
                        <button className="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg">
                            <Plus size={18}/>
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                        <input 
                            type="text" 
                            placeholder="Search tickets..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {filteredTickets.map(ticket => (
                        <div 
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-slate-700/50 border-l-4 border-l-primary-500' : 'hover:bg-slate-700/30 border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-200 text-sm truncate">{ticket.subscriberName}</span>
                                <span className="text-xs text-slate-500">{ticket.created}</span>
                            </div>
                            <h4 className="text-sm font-medium text-white mb-2 truncate">{ticket.subject}</h4>
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                                <span className={`text-[10px] px-2 py-0.5 bg-slate-900 rounded border border-slate-700 ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ticket Detail / Chat */}
            <div className={`${!selectedTicket ? 'hidden lg:flex' : 'flex'} flex-col flex-1 bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden`}>
                {selectedTicket ? (
                    <>
                        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button onClick={() => setSelectedTicket(null)} className="lg:hidden text-slate-400 mr-2">&larr;</button>
                                    <h2 className="text-lg font-bold text-white">#{selectedTicket.id} - {selectedTicket.subject}</h2>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><User size={12}/> {selectedTicket.subscriberName}</span>
                                    <span className="flex items-center gap-1"><AlertCircle size={12}/> {selectedTicket.category}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    value={selectedTicket.status} 
                                    onChange={(e) => updateStatus(e.target.value)}
                                    className="bg-slate-900 border border-slate-600 rounded text-xs text-white px-2 py-1 outline-none"
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
                            {selectedTicket.messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'Admin' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.sender} • {msg.time}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-slate-900 border-t border-slate-700">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a reply..." 
                                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                                />
                                <button onClick={handleSendMessage} className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                                    <Send size={18}/>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageCircle size={48} className="opacity-20 mb-4"/>
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTickets;