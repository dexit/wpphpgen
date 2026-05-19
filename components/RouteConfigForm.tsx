import { Endpoint, PresetType, HttpMethod, AuthType, StorageType, QueryParam, PathParam, CPTFieldMapping } from '@/types/route';
import { isValidPath, isReservedPath } from '@/lib/validation';
import { Plus, Trash2 } from 'lucide-react';

interface RouteConfigFormProps {
  endpoint: Endpoint;
  onChange: (endpoint: Endpoint) => void;
}

export default function RouteConfigForm({ endpoint, onChange }: RouteConfigFormProps) {
  const handlePresetChange = (preset: PresetType) => {
    const newConfig = { ...endpoint, preset };
    if (preset === 'hubspot') {
      newConfig.path = '/hubspot';
      newConfig.method = 'POST';
    } else if (preset === 'twilio') {
      newConfig.path = '/twilio';
      newConfig.method = 'POST';
    }
    onChange(newConfig);
  };

  const isPathValid = isValidPath(endpoint.path);
  const isPathReserved = isReservedPath(endpoint.path);

  const handlePathChange = (newPath: string) => {
    // Extract dynamic variables like {id}
    const matches = Array.from(newPath.matchAll(/\{([a-zA-Z0-9_]+)\}/g));
    const paramNames = matches.map(m => m[1]);
    
    let newPathParams = [...(endpoint.pathParams || [])];
    // Keep only the ones present in the path
    newPathParams = newPathParams.filter(p => paramNames.includes(p.name));
    
    // Add new ones with default regex
    for (const name of paramNames) {
      if (!newPathParams.find(p => p.name === name)) {
        newPathParams.push({ name, regex: '[a-zA-Z0-9_-]+' }); // default regex matches words/numbers
      }
    }
    
    onChange({ ...endpoint, path: newPath, pathParams: newPathParams });
  };

  // --- Path Params ---
  const updatePathParam = (index: number, param: PathParam) => {
    const newParams = [...(endpoint.pathParams || [])];
    newParams[index] = param;
    onChange({ ...endpoint, pathParams: newParams });
  };

  // --- Query Params ---
  const addQueryParam = () => {
    onChange({ ...endpoint, queryParams: [...endpoint.queryParams, { name: '', type: 'string', required: false }] });
  };
  const updateQueryParam = (index: number, param: QueryParam) => {
    const newParams = [...endpoint.queryParams];
    newParams[index] = param;
    onChange({ ...endpoint, queryParams: newParams });
  };
  const removeQueryParam = (index: number) => {
    const newParams = [...endpoint.queryParams];
    newParams.splice(index, 1);
    onChange({ ...endpoint, queryParams: newParams });
  };

  // --- CPT Mappings ---
  const addCptMapping = () => {
    const mappings = endpoint.cptMapping.mappings || [];
    onChange({ ...endpoint, cptMapping: { ...endpoint.cptMapping, mappings: [...mappings, { apiField: '', cptField: '' }] } });
  };
  const updateCptMapping = (index: number, mapping: CPTFieldMapping) => {
    const mappings = [...(endpoint.cptMapping.mappings || [])];
    mappings[index] = mapping;
    onChange({ ...endpoint, cptMapping: { ...endpoint.cptMapping, mappings } });
  };
  const removeCptMapping = (index: number) => {
    const mappings = [...(endpoint.cptMapping.mappings || [])];
    mappings.splice(index, 1);
    onChange({ ...endpoint, cptMapping: { ...endpoint.cptMapping, mappings } });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-zinc-200 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-800">Endpoint Configuration</h2>
        <p className="text-sm text-zinc-500 mt-1">Configure path, settings, and payload mapping for this API route.</p>
      </div>
      
      {/* Basics Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Basics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Preset configuration</label>
            <select value={endpoint.preset || ''} onChange={(e) => handlePresetChange(e.target.value as PresetType)} className="mt-1 block w-full border border-zinc-300 rounded-md p-2 text-sm focus:border-emerald-500 focus:ring-emerald-500">
              <option value="">None (Custom UI)</option>
              <option value="hubspot">HubSpot Webhook</option>
              <option value="twilio">Twilio Webhook</option>
              <option value="generic">Generic Setup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Description</label>
            <input 
              type="text" 
              placeholder="e.g. Sync user profiles" 
              value={endpoint.description} 
              onChange={(e) => onChange({ ...endpoint, description: e.target.value })} 
              className="mt-1 block w-full border border-zinc-300 rounded-md p-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
        </div>
      </div>

      {/* Path & Methods Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Routing</h3>
        
        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <label className="block text-sm font-medium text-zinc-700">Method</label>
              <select value={endpoint.method} onChange={(e) => onChange({ ...endpoint, method: e.target.value as HttpMethod })} className="mt-1 block w-full border border-zinc-300 rounded-md p-2 text-sm font-mono focus:border-emerald-500 focus:ring-emerald-500">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700">Path (e.g. /users/&#123;id&#125;)</label>
              <input type="text" value={endpoint.path} onChange={(e) => handlePathChange(e.target.value)} className={`mt-1 block w-full border rounded-md p-2 text-sm font-mono focus:ring-emerald-500 ${!isPathValid || isPathReserved ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 focus:border-emerald-500'}`} />
              {isPathReserved && <p className="text-xs text-red-600 mt-1">This path uses a reserved WordPress keyword.</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Dynamic Path Parameters</label>
            <div className="space-y-2">
              {(endpoint.pathParams || []).length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Add parameter tokens like &#123;id&#125; in the Path field above to define dynamic parameters.</p>
              ) : (
                (endpoint.pathParams || []).map((param, index) => (
                  <div key={index} className="flex gap-2 items-center bg-zinc-50 p-2 border border-zinc-200 rounded-md">
                    <span className="text-sm font-mono font-medium text-zinc-700 px-2 py-1 bg-zinc-200 rounded shrink-0">
                      &#123;{param.name}&#125;
                    </span>
                    <input type="text" placeholder="Regex (e.g. \d+)" value={param.regex} onChange={(e) => updatePathParam(index, { ...param, regex: e.target.value })} className="border border-zinc-300 rounded-md p-1.5 text-sm flex-1 font-mono text-emerald-700 focus:border-emerald-500 focus:ring-emerald-500" title="Regex pattern without capturing groups" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Query Params */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Query Parameters</h3>
        <div className="space-y-2">
          {endpoint.queryParams.map((param, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input type="text" placeholder="Param Name" value={param.name} onChange={(e) => updateQueryParam(index, { ...param, name: e.target.value })} className="border border-zinc-300 rounded-md p-1.5 text-sm flex-1 font-mono" />
              <select value={param.type} onChange={(e) => updateQueryParam(index, { ...param, type: e.target.value as any })} className="border border-zinc-300 rounded-md p-1.5 text-sm">
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="boolean">Boolean</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-700 w-24">
                <input type="checkbox" checked={param.required} onChange={(e) => updateQueryParam(index, { ...param, required: e.target.checked })} className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" /> 
                Required
              </label>
              <button onClick={() => removeQueryParam(index)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={addQueryParam} className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            <Plus size={14} /> Add Parameter
          </button>
        </div>
      </div>

      {/* Auth & Storage */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Security & Storage</h3>
        <div className="grid grid-cols-2 gap-4 w-2/3">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Authentication</label>
            <select value={endpoint.auth} onChange={(e) => onChange({ ...endpoint, auth: e.target.value as AuthType })} className="mt-1 block w-full border border-zinc-300 rounded-md p-2 text-sm">
              <option value="none">Public (None)</option>
              <option value="basic">Basic Auth</option>
              <option value="jwt">JWT (Requires Plugin)</option>
              <option value="apikey">API Key / Token</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Storage Provider</label>
            <select value={endpoint.storage} onChange={(e) => onChange({ ...endpoint, storage: e.target.value as StorageType })} className="mt-1 block w-full border border-zinc-300 rounded-md p-2 text-sm">
              <option value="none">None (Passthrough)</option>
              <option value="logs">Local Log Table</option>
              <option value="cpt">Custom Post Type (CPT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* CPT Mapping */}
      {endpoint.storage === 'cpt' && (
        <div className="space-y-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
            <label className="flex items-center gap-2 font-semibold text-zinc-900">
              <input type="checkbox" checked={endpoint.cptMapping.enabled} onChange={(e) => onChange({ ...endpoint, cptMapping: { ...endpoint.cptMapping, enabled: e.target.checked } })} className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
              Enable CPT Payload Mapping
            </label>
          </div>
          
          {endpoint.cptMapping.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">Target Post Type</label>
                <input type="text" placeholder="e.g. employee, log_entry" value={endpoint.cptMapping.postType} onChange={(e) => onChange({ ...endpoint, cptMapping: { ...endpoint.cptMapping, postType: e.target.value } })} className="mt-1 block w-64 border border-zinc-300 rounded-md p-2 text-sm font-mono" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Field Mappings</label>
                <div className="space-y-2">
                  {(endpoint.cptMapping.mappings || []).map((mapping, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input type="text" placeholder="API Request Field (e.g. user_age)" value={mapping.apiField} onChange={(e) => updateCptMapping(index, { ...mapping, apiField: e.target.value })} className="border border-zinc-300 rounded-md p-1.5 text-sm flex-1 font-mono" />
                      <span className="text-zinc-400">→</span>
                      <input type="text" placeholder="ACF / Meta Field (e.g. age)" value={mapping.cptField} onChange={(e) => updateCptMapping(index, { ...mapping, cptField: e.target.value })} className="border border-zinc-300 rounded-md p-1.5 text-sm flex-1 font-mono text-emerald-700" />
                      <button onClick={() => removeCptMapping(index)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addCptMapping} className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    <Plus size={14} /> Add Field Mapping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Callbacks */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Custom Integration Code</h3>
        <p className="text-xs text-zinc-500">Add custom PHP code here. It escapes into WP environment context.</p>
        <textarea 
          placeholder="// $request is available here..."
          value={endpoint.callbackCode} 
          onChange={(e) => onChange({ ...endpoint, callbackCode: e.target.value })} 
          className="block w-full border border-zinc-700 rounded-md p-3 font-mono text-sm bg-zinc-900 text-zinc-100 focus:ring-emerald-500 focus:border-emerald-500" 
          rows={8} 
        />
      </div>
    </div>
  );
}
