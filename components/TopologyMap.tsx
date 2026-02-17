import React, { useEffect, useRef, useState } from 'react';
import { 
  select, 
  forceSimulation, 
  forceLink, 
  forceManyBody, 
  forceCenter, 
  drag as d3Drag, 
  Simulation 
} from 'd3';
import { NetworkData, NetworkNode, NetworkLink, DeviceType, DeviceStatus } from '../types';
import { Terminal, Settings, Activity, X } from 'lucide-react';

interface TopologyMapProps {
  data: NetworkData;
  onNavigate?: (tab: string) => void;
}

const TopologyMap: React.FC<TopologyMapProps> = ({ data, onNavigate }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = 600;

    // Clear previous render
    select(svgRef.current).selectAll("*").remove();

    const svg = select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font", "12px sans-serif");

    // Simulation setup
    const simulation = forceSimulation(data.nodes)
      .force("link", forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", forceManyBody().strength(-400))
      .force("center", forceCenter(width / 2, height / 2));

    // Links
    const link = svg.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value || 1) * 2);

    // Node Groups (Circle + Icon/Text)
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(drag(simulation) as any)
      .on("click", (event, d) => {
          event.stopPropagation();
          setSelectedNode(d);
      });

    // Node Circles
    node.append("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        switch (d.status) {
            case DeviceStatus.ONLINE: return "#22c55e"; // green-500
            case DeviceStatus.OFFLINE: return "#ef4444"; // red-500
            case DeviceStatus.WARNING: return "#eab308"; // yellow-500
            default: return "#94a3b8";
        }
      });

    // Icons (Simple text for now, could be SVG icons)
    node.append("text")
      .text(d => {
        switch(d.type) {
            case DeviceType.ROUTER: return "R";
            case DeviceType.SWITCH: return "S";
            case DeviceType.SERVER: return "SRV";
            case DeviceType.FIREWALL: return "FW";
            default: return "D";
        }
      })
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("stroke", "none")
      .style("font-weight", "bold")
      .style("font-size", "10px");

    // Labels
    node.append("text")
      .text(d => d.id)
      .attr("x", 25)
      .attr("y", 4)
      .attr("fill", "#e2e8f0")
      .attr("stroke", "none")
      .style("font-size", "12px");

    node.append("title")
      .text(d => `${d.id}\nType: ${d.type}\nStatus: ${d.status}`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Click background to deselect
    svg.on("click", () => setSelectedNode(null));

    function drag(simulation: Simulation<NetworkNode, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3Drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg shadow-inner overflow-hidden border border-slate-700 relative">
       <svg ref={svgRef} className="w-full h-[600px] cursor-move"></svg>
       
       {/* Interactive Node Details Panel */}
       {selectedNode && (
           <div className="absolute top-4 right-4 w-72 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-5 animate-in slide-in-from-right duration-300">
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <h3 className="text-lg font-bold text-white">{selectedNode.id}</h3>
                       <span className={`text-xs px-2 py-0.5 rounded ${selectedNode.status === 'ONLINE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                           {selectedNode.status}
                       </span>
                   </div>
                   <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white"><X size={18}/></button>
               </div>
               
               <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Type</span>
                       <span className="text-slate-200">{selectedNode.type}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Group</span>
                       <span className="text-slate-200">{selectedNode.group === 1 ? 'Core' : 'Access'}</span>
                   </div>
               </div>

               <div className="grid grid-cols-3 gap-2">
                   <button 
                        onClick={() => onNavigate && onNavigate('terminal')} 
                        className="flex flex-col items-center justify-center p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors gap-1"
                    >
                       <Terminal size={18}/>
                       <span className="text-[10px]">SSH</span>
                   </button>
                   <button 
                        onClick={() => onNavigate && onNavigate('config')}
                        className="flex flex-col items-center justify-center p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors gap-1"
                    >
                       <Settings size={18}/>
                       <span className="text-[10px]">Config</span>
                   </button>
                   <button 
                        onClick={() => onNavigate && onNavigate('tools')}
                        className="flex flex-col items-center justify-center p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors gap-1"
                    >
                       <Activity size={18}/>
                       <span className="text-[10px]">Ping</span>
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default TopologyMap;