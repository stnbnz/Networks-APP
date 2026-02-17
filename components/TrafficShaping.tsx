import React, { useState } from 'react';
import { BandwidthPlan } from '../types';
import { Zap, Edit, Plus, Users, ArrowUp, ArrowDown } from 'lucide-react';

interface TrafficShapingProps {
    plans: BandwidthPlan[];
    setPlans: (plans: BandwidthPlan[]) => void;
}

const TrafficShaping: React.FC<TrafficShapingProps> = ({ plans, setPlans }) => {
    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <div>
                     <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-500"/> Traffic Shaping & QoS Plans
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">Manage bandwidth allocation profiles for subscribers.</p>
                </div>
                <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                    <Plus size={18}/> Create New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden group hover:border-primary-500/50 transition-colors">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <div className="px-3 py-1 bg-slate-700 rounded-full text-xs text-white font-bold">
                                    ${plan.price}/mo
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 bg-slate-900 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
                                    <ArrowDown size={20} className="text-green-500 mb-1"/>
                                    <span className="text-2xl font-bold text-white">{plan.downloadSpeed}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Mbps Down</span>
                                </div>
                                <div className="flex-1 bg-slate-900 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
                                    <ArrowUp size={20} className="text-blue-500 mb-1"/>
                                    <span className="text-2xl font-bold text-white">{plan.uploadSpeed}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Mbps Up</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-400 mb-6">
                                <div className="flex justify-between">
                                    <span>Burst Limit</span>
                                    <span className="text-slate-300">Disabled</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Priority</span>
                                    <span className="text-slate-300">8/1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Address Pool</span>
                                    <span className="text-slate-300">pool_fiber_res</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Users size={16}/> {plan.subscribers} Users
                                </div>
                                <button className="text-primary-400 hover:text-white text-sm font-bold flex items-center gap-1">
                                    <Edit size={14}/> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Add New Card Placeholder */}
                <button className="border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 text-slate-500 hover:text-primary-400 hover:border-primary-500/50 transition-all cursor-pointer bg-slate-900/30">
                    <Plus size={48} className="mb-2 opacity-50"/>
                    <span className="font-bold">Add Custom Plan</span>
                </button>
            </div>
        </div>
    );
};

export default TrafficShaping;