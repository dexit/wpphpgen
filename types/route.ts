export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type AuthType = 'none' | 'basic' | 'jwt' | 'apikey';

export type StorageType = 'logs' | 'cpt' | 'none';

export type PresetType = 'hubspot' | 'twilio' | 'generic';

export interface QueryParam {
  name: string;
  type: 'string' | 'integer' | 'boolean';
  required: boolean;
}

export interface CPTFieldMapping {
  apiField: string;
  cptField: string;
}

export interface CPTMapping {
  enabled: boolean;
  postType: string;
  mappings: CPTFieldMapping[];
}

export interface PathParam {
  name: string;
  regex: string;
}

export interface Endpoint {
  id: string;
  path: string;
  method: HttpMethod;
  auth: AuthType;
  storage: StorageType;
  preset: PresetType | null;
  description: string;
  callbackCode: string;
  queryParams: QueryParam[];
  pathParams: PathParam[];
  cptMapping: CPTMapping;
}

export interface Route {
  id: string;
  name: string;
  endpoints: Endpoint[];
}
