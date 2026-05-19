import { Route, Endpoint } from '@/types/route';

export function generateEndpointPHP(endpoint: Endpoint): string {
  const args = endpoint.queryParams.map(param => `
        '${param.name}' => [
            'type' => '${param.type}',
            'required' => ${param.required ? 'true' : 'false'},
        ],`).join('');

  let cptCode = '';
  if (endpoint.cptMapping?.enabled && endpoint.cptMapping?.postType) {
    const mappings = endpoint.cptMapping.mappings || [];
    const mappingCode = mappings.map(map => {
      if (!map.apiField || !map.cptField) return '';
      const isPostField = ['post_title', 'post_content', 'post_excerpt', 'post_name', 'post_status'].includes(map.cptField);
      if (isPostField) {
        return `            if (isset($params['${map.apiField}'])) { $post_data['${map.cptField}'] = sanitize_text_field($params['${map.apiField}']); }`;
      } else {
        return `            if (isset($params['${map.apiField}'])) { $meta_input['${map.cptField}'] = sanitize_text_field($params['${map.apiField}']); }`;
      }
    }).filter(Boolean).join('\n');

    cptCode = `
            // Auto-generated CPT Mapping
            $post_data = [
                'post_type' => '${endpoint.cptMapping.postType}',
                'post_status' => 'publish',
                'post_title' => 'API Post ' . time(), // Fallback title
            ];
            $meta_input = [];
${mappingCode}
            if (!empty($meta_input)) {
                $post_data['meta_input'] = $meta_input;
            }
            $post_id = wp_insert_post($post_data);
            if (is_wp_error($post_id)) {
                return new WP_Error('cpt_insert_failed', $post_id->get_error_message(), ['status' => 500]);
            }
`;
  }

  // Build the dynamic path based on pathParams
  const pathParams = endpoint.pathParams || [];
  let dynamicPath = endpoint.path;
  if (!dynamicPath.startsWith('/')) dynamicPath = '/' + dynamicPath;
  
  // Replace tokens like {id} with their regex
  let finalPath = dynamicPath;
  for (const param of pathParams) {
    if (param.name && param.regex) {
      finalPath = finalPath.replace(`{${param.name}}`, `(?P<${param.name}>${param.regex})`);
    }
  }

  return `
    register_rest_route('wp-route-architect/v1', '${finalPath}', [
        'methods' => '${endpoint.method}',
        'args' => [${args}
        ],
        'callback' => function (WP_REST_Request $request) {
            // Security: Check permissions
            if (!current_user_can('manage_options')) {
                return new WP_Error('forbidden', 'You do not have permission to access this route.', ['status' => 403]);
            }

            // Security: Sanitize inputs
            $params = $request->get_params();
            
            ${endpoint.callbackCode ? endpoint.callbackCode : '// TODO: Implement custom logic'}
            ${cptCode}

            return new WP_REST_Response([
                'status' => 'success',
                'message' => 'Endpoint executed successfully'
            ], 200);
        },
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
    ]);`;
}

export function generateFullPlugin(routes: Route[]): string {
  const endpointsPHP = routes.flatMap(route => route.endpoints.map(generateEndpointPHP)).join('\n');
  return `<?php
/**
 * Plugin Name: Generated WP API Routes
 * Description: Automatically generated API routes for Custom Endpoints.
 * Version: 1.1
 */

add_action('rest_api_init', function () {
${endpointsPHP}
});
`;
}
