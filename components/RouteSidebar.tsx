import { useState } from 'react';
import { Route } from '@/types/route';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';

interface RouteSidebarProps {
  routes: Route[];
  selectedEndpointId: string | null;
  onSelectEndpoint: (routeId: string, endpointId: string) => void;
  onAddRoute: () => void;
  onRenameRoute: (routeId: string, newName: string) => void;
  onAddEndpoint: (routeId: string) => void;
  onDeleteEndpoint: (routeId: string, endpointId: string) => void;
  onSelectSettings: () => void;
  isSettingsSelected: boolean;
}

export default function RouteSidebar({ 
  routes, 
  selectedEndpointId, 
  onSelectEndpoint, 
  onAddRoute, 
  onRenameRoute,
  onAddEndpoint, 
  onDeleteEndpoint,
  onSelectSettings, 
  isSettingsSelected 
}: RouteSidebarProps) {
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editRouteName, setEditRouteName] = useState("");

  const handleEditRouteSubmit = (routeId: string) => {
    if (editRouteName.trim() !== '') {
      onRenameRoute(routeId, editRouteName.trim());
    }
    setEditingRouteId(null);
  };

  return (
    <div className="w-72 bg-zinc-100 p-4 border-r border-zinc-200 flex flex-col h-full overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-zinc-800">WP Route Architect</h2>
      <button 
        onClick={onAddRoute}
        className="w-full bg-emerald-600 text-white font-medium py-2 px-4 rounded-md mb-6 hover:bg-emerald-700 transition flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add Route
      </button>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
        {routes.map((route) => (
          <div key={route.id} className="space-y-2">
            <div className="font-semibold text-zinc-900 flex justify-between items-center group">
              {editingRouteId === route.id ? (
                <input 
                  autoFocus
                  className="w-full mr-2 px-2 py-1 text-sm bg-white border border-zinc-300 rounded focus:outline-none focus:border-emerald-500"
                  value={editRouteName}
                  onChange={(e) => setEditRouteName(e.target.value)}
                  onBlur={() => handleEditRouteSubmit(route.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditRouteSubmit(route.id);
                    if (e.key === 'Escape') setEditingRouteId(null);
                  }}
                />
              ) : (
                <span className="flex-1 truncate" title={route.name}>{route.name}</span>
              )}
              
              {editingRouteId !== route.id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditRouteName(route.name); setEditingRouteId(route.id); }}
                    className="p-1 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Rename Route"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onAddEndpoint(route.id)} 
                    className="p-1 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Add Endpoint"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1 pl-2 border-l-2 border-zinc-200 ml-1">
              {route.endpoints.map((endpoint) => {
                const isSelected = selectedEndpointId === endpoint.id && !isSettingsSelected;
                return (
                  <div
                    key={endpoint.id}
                    className={`group flex items-center justify-between rounded-md transition-colors ${
                      isSelected ? 'bg-zinc-200 text-zinc-900 font-medium' : 'hover:bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    <button
                      onClick={() => onSelectEndpoint(route.id, endpoint.id)}
                      className="flex-1 text-left px-2 py-1.5 text-sm font-mono truncate"
                    >
                      <span className={`text-xs mr-2 font-bold ${
                        endpoint.method === 'GET' ? 'text-blue-600' :
                        endpoint.method === 'POST' ? 'text-emerald-600' :
                        endpoint.method === 'PUT' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {endpoint.method}
                      </span>
                      {endpoint.path}
                    </button>
                    <button
                      onClick={() => onDeleteEndpoint(route.id, endpoint.id)}
                      className={`p-1.5 mr-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity`}
                      title="Delete Endpoint"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
              {route.endpoints.length === 0 && (
                <div className="text-xs text-zinc-400 italic py-1 px-2">No endpoints mapped</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-200">
        <button
          onClick={onSelectSettings}
          className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md font-medium transition-colors ${
            isSettingsSelected ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
          }`}
        >
          <Settings size={18} />
          Project Settings
        </button>
      </div>
    </div>
  );
}
