'use client';

import { useState } from 'react';
import { Route, Endpoint } from '@/types/route';
import RouteSidebar from '@/components/RouteSidebar';
import RouteConfigForm from '@/components/RouteConfigForm';
import SettingsView from '@/components/SettingsView';
import CodeBlock from '@/components/CodeBlock';
import { generateFullPlugin } from '@/lib/generator';

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: '1',
      name: 'HubSpot Integration',
      endpoints: [
        { 
          id: '1-1', 
          path: '/hubspot', 
          method: 'POST', 
          auth: 'none', 
          storage: 'logs', 
          preset: 'hubspot', 
          description: 'Handle HubSpot webhooks', 
          callbackCode: '',
          queryParams: [],
          pathParams: [],
          cptMapping: { enabled: false, postType: '', mappings: [] }
        }
      ]
    }
  ]);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>('1-1');
  const [isSettingsSelected, setIsSettingsSelected] = useState(false);

  const selectedEndpoint = routes.flatMap(r => r.endpoints).find(e => e.id === selectedEndpointId);

  const handleEndpointUpdate = (updatedEndpoint: Endpoint) => {
    setRoutes(routes.map(route => ({
      ...route,
      endpoints: route.endpoints.map(e => e.id === updatedEndpoint.id ? updatedEndpoint : e)
    })));
  };

  const handleAddRoute = () => {
    const newRoute: Route = { id: Date.now().toString(), name: 'New Route', endpoints: [] };
    setRoutes([...routes, newRoute]);
  };

  const handleRenameRoute = (routeId: string, newName: string) => {
    setRoutes(routes.map(route => route.id === routeId ? { ...route, name: newName } : route));
  };

  const handleAddEndpoint = (routeId: string) => {
    setRoutes(routes.map(route => route.id === routeId ? {
      ...route,
      endpoints: [...route.endpoints, { 
        id: Date.now().toString(), 
        path: '/new-endpoint', 
        method: 'GET', 
        auth: 'none', 
        storage: 'none', 
        preset: null, 
        description: '', 
        callbackCode: '',
        queryParams: [],
        pathParams: [],
        cptMapping: { enabled: false, postType: '', mappings: [] }
      }]
    } : route));
  };

  const handleDeleteEndpoint = (routeId: string, endpointId: string) => {
    setRoutes(routes.map(route => route.id === routeId ? {
      ...route,
      endpoints: route.endpoints.filter(e => e.id !== endpointId)
    } : route));
    if (selectedEndpointId === endpointId) {
      setSelectedEndpointId(null);
    }
  };

  return (
    <main className="flex h-screen">
      <RouteSidebar 
        routes={routes} 
        selectedEndpointId={selectedEndpointId} 
        onSelectEndpoint={(routeId, endpointId) => { setSelectedEndpointId(endpointId); setIsSettingsSelected(false); }}
        onAddRoute={handleAddRoute}
        onRenameRoute={handleRenameRoute}
        onAddEndpoint={handleAddEndpoint}
        onDeleteEndpoint={handleDeleteEndpoint}
        onSelectSettings={() => setIsSettingsSelected(true)}
        isSettingsSelected={isSettingsSelected}
      />
      <div className="flex-1 p-8 bg-zinc-50 flex flex-col gap-8 overflow-y-auto">
        {isSettingsSelected ? (
          <SettingsView />
        ) : selectedEndpoint ? (
          <>
            <RouteConfigForm endpoint={selectedEndpoint} onChange={handleEndpointUpdate} />
            <div className="p-6 bg-white rounded-lg shadow-sm border border-zinc-200">
              <h2 className="text-xl font-semibold mb-4">Generated PHP Code</h2>
              <CodeBlock code={generateFullPlugin(routes)} language="php" />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500">
            Select an endpoint to configure or add a new one.
          </div>
        )}
      </div>
    </main>
  );
}
