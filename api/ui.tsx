import React, { useState, useEffect } from 'react';
import { html } from 'hono/html';

interface Endpoint {
  path: string;
  method: 'GET' | 'POST';
  description: string;
  parameters?: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: string;
  }[];
  responses: {
    status: number;
    description: string;
    example: any;
  }[];
}

interface ApiSection {
  name: string;
  description: string;
  endpoints: Endpoint[];
}

const apiDocs: ApiSection[] = [
  {
    name: 'Quakes',
    description: 'Endpoints for retrieving earthquake data',
    endpoints: [
      {
        path: '/api/quakes',
        method: 'GET',
        description: 'Get all earthquakes',
        responses: [
          {
            status: 200,
            description: 'List of all earthquakes',
            example: { earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.2, location: 'EXAMPLE LOCATION' }] }
          }
        ]
      }
    ]
  },
  {
    name: 'Filters',
    description: 'Endpoints for filtering earthquake data',
    endpoints: [
      {
        path: '/api/filters/date',
        method: 'GET',
        description: 'Filter earthquakes by date range',
        parameters: [
          { name: 'start', type: 'string', description: 'Start date (YYYY.MM.DD)', required: true, default: '' },
          { name: 'end', type: 'string', description: 'End date (YYYY.MM.DD)', required: true, default: '' }
        ],
        responses: [
          {
            status: 200,
            description: 'Filtered earthquakes by date range',
            example: { earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.2, location: 'EXAMPLE LOCATION' }] }
          }
        ]
      },
      {
        path: '/api/filters/magnitude',
        method: 'GET',
        description: 'Filter earthquakes by magnitude range',
        parameters: [
          { name: 'min', type: 'number', description: 'Minimum magnitude', required: false, default: '0' },
          { name: 'max', type: 'number', description: 'Maximum magnitude', required: false, default: '10' }
        ],
        responses: [
          {
            status: 200,
            description: 'Filtered earthquakes by magnitude range',
            example: { earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.2, location: 'EXAMPLE LOCATION' }] }
          }
        ]
      },
      {
        path: '/api/filters/location',
        method: 'GET',
        description: 'Filter earthquakes by location',
        parameters: [
          { name: 'q', type: 'string', description: 'Location query', required: true, default: '' }
        ],
        responses: [
          {
            status: 200,
            description: 'Filtered earthquakes by location',
            example: { earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.2, location: 'EXAMPLE LOCATION' }] }
          }
        ]
      },
      {
        path: '/api/filters/radius',
        method: 'GET',
        description: 'Filter earthquakes by geographic radius',
        parameters: [
          { name: 'lat', type: 'number', description: 'Latitude', required: true, default: '' },
          { name: 'lon', type: 'number', description: 'Longitude', required: true, default: '' },
          { name: 'radius', type: 'number', description: 'Radius in kilometers', required: false, default: '100' }
        ],
        responses: [
          {
            status: 200,
            description: 'Filtered earthquakes by geographic radius',
            example: { earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.2, location: 'EXAMPLE LOCATION' }] }
          }
        ]
      },
      {
        path: '/api/filters/latest',
        method: 'GET',
        description: 'Get latest N earthquakes',
        parameters: [
          { name: 'limit', type: 'number', description: 'Number of earthquakes to return', required: false, default: '10' }
        ],
        responses: [
          {
            status: 200,
            description: 'Latest earthquakes',
            example: { earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.2, location: 'EXAMPLE LOCATION' }] }
          }
        ]
      }
    ]
  },
  {
    name: 'Statistics',
    description: 'Endpoints for earthquake statistics',
    endpoints: [
      {
        path: '/api/statistics/daily',
        method: 'GET',
        description: 'Get daily earthquake count',
        responses: [
          {
            status: 200,
            description: 'Daily earthquake counts',
            example: { daily_counts: { '2023.01.01': 5, '2023.01.02': 3 } }
          }
        ]
      },
      {
        path: '/api/statistics/magnitude-distribution',
        method: 'GET',
        description: 'Get magnitude distribution',
        responses: [
          {
            status: 200,
            description: 'Magnitude distribution',
            example: { magnitude_distribution: [{ range: '0-2', count: 10 }, { range: '2-3', count: 15 }] }
          }
        ]
      },
      {
        path: '/api/statistics/region-distribution',
        method: 'GET',
        description: 'Get region distribution',
        responses: [
          {
            status: 200,
            description: 'Region distribution',
            example: { region_distribution: [{ region: 'ISTANBUL', count: 5 }, { region: 'IZMIR', count: 3 }] }
          }
        ]
      },
      {
        path: '/api/statistics/depth-distribution',
        method: 'GET',
        description: 'Get depth distribution',
        responses: [
          {
            status: 200,
            description: 'Depth distribution',
            example: { depth_distribution: [{ range: '0-5 km', count: 8 }, { range: '5-10 km', count: 12 }] }
          }
        ]
      },
      {
        path: '/api/statistics/summary',
        method: 'GET',
        description: 'Get summary statistics',
        responses: [
          {
            status: 200,
            description: 'Summary statistics',
            example: { summary: { total_earthquakes: 100, max_magnitude: 5.6, avg_magnitude: 3.2, avg_depth: 8.5 } }
          }
        ]
      }
    ]
  },
  {
    name: 'Alerts',
    description: 'Endpoints for earthquake alerts',
    endpoints: [
      {
        path: '/api/alerts/significant',
        method: 'GET',
        description: 'Get significant earthquakes',
        parameters: [
          { name: 'min', type: 'number', description: 'Minimum magnitude', required: false, default: '4.0' }
        ],
        responses: [
          {
            status: 200,
            description: 'Significant earthquakes',
            example: { significant_earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.5, location: 'EXAMPLE LOCATION' }], count: 1 }
          }
        ]
      },
      {
        path: '/api/alerts/critical-regions',
        method: 'GET',
        description: 'Get earthquakes in critical regions',
        responses: [
          {
            status: 200,
            description: 'Earthquakes in critical regions',
            example: { critical_region_earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 4.2, location: 'ISTANBUL' }], count: 1 }
          }
        ]
      },
      {
        path: '/api/alerts/recent-significant',
        method: 'GET',
        description: 'Get recent significant earthquakes',
        parameters: [
          { name: 'min', type: 'number', description: 'Minimum magnitude', required: false, default: '3.0' },
          { name: 'hours', type: 'number', description: 'Time window in hours', required: false, default: '24' }
        ],
        responses: [
          {
            status: 200,
            description: 'Recent significant earthquakes',
            example: { recent_significant_earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 10.5, magnitude: 3.5, location: 'EXAMPLE LOCATION' }], count: 1, parameters: { min_magnitude: 3.0, hours_window: 24 } }
          }
        ]
      },
      {
        path: '/api/alerts/potentially-damaging',
        method: 'GET',
        description: 'Get potentially damaging earthquakes',
        parameters: [
          { name: 'min', type: 'number', description: 'Minimum magnitude', required: false, default: '4.5' },
          { name: 'depth', type: 'number', description: 'Maximum depth in km', required: false, default: '10' }
        ],
        responses: [
          {
            status: 200,
            description: 'Potentially damaging earthquakes',
            example: { potentially_damaging_earthquakes: [{ date: '2023.01.01', time: '12:00:00', latitude: 40.123, longitude: 29.456, depth: 5.5, magnitude: 4.8, location: 'EXAMPLE LOCATION' }], count: 1, parameters: { min_magnitude: 4.5, max_depth: 10 } }
          }
        ]
      }
    ]
  }
];

const ApiDocsUI = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, Record<string, string>>>({});
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize parameter values with defaults
    const initialParams: Record<string, Record<string, string>> = {};
    
    apiDocs.forEach(section => {
      section.endpoints.forEach(endpoint => {
        initialParams[endpoint.path] = {};
        endpoint.parameters?.forEach(param => {
          initialParams[endpoint.path][param.name] = param.default || '';
        });
      });
    });
    
    setParamValues(initialParams);
  }, []);

  const handleSectionClick = (sectionName: string) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };

  const handleEndpointClick = (endpointPath: string) => {
    setActiveEndpoint(activeEndpoint === endpointPath ? null : endpointPath);
    setResponseData(null);
  };

  const handleParamChange = (endpointPath: string, paramName: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [endpointPath]: {
        ...prev[endpointPath],
        [paramName]: value
      }
    }));
  };

  const executeRequest = async (endpoint: Endpoint) => {
    setIsLoading(true);
    setResponseData(null);
    
    try {
      let url = endpoint.path;
      
      // Add query parameters if they exist
      if (endpoint.parameters && endpoint.parameters.length > 0) {
        const queryParams = new URLSearchParams();
        
        endpoint.parameters.forEach(param => {
          const value = paramValues[endpoint.path]?.[param.name];
          if (value) {
            queryParams.append(param.name, value);
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          url = `${url}?${queryString}`;
        }
      }
      
      const response = await fetch(url, {
        method: endpoint.method
      });
      
      const data = await response.json();
      setResponseData({
        status: response.status,
        data
      });
    } catch (error) {
      setResponseData({
        status: 'Error',
        data: { error: 'Failed to fetch data' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-docs">
      <header>
        <h1>Kandilli Observatory API Documentation</h1>
        <p>Interactive documentation for the Kandilli Observatory Earthquake API</p>
      </header>
      
      <main>
        {apiDocs.map(section => (
          <div key={section.name} className="api-section">
            <div 
              className={`section-header ${activeSection === section.name ? 'active' : ''}`}
              onClick={() => handleSectionClick(section.name)}
            >
              <h2>{section.name}</h2>
              <p>{section.description}</p>
              <span className="toggle-icon">{activeSection === section.name ? '−' : '+'}</span>
            </div>
            
            {activeSection === section.name && (
              <div className="endpoints">
                {section.endpoints.map(endpoint => (
                  <div key={endpoint.path} className="endpoint">
                    <div 
                      className={`endpoint-header ${activeEndpoint === endpoint.path ? 'active' : ''}`}
                      onClick={() => handleEndpointClick(endpoint.path)}
                    >
                      <div className="endpoint-method-path">
                        <span className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
                        <span className="path">{endpoint.path}</span>
                      </div>
                      <p className="description">{endpoint.description}</p>
                    </div>
                    
                    {activeEndpoint === endpoint.path && (
                      <div className="endpoint-details">
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="parameters">
                            <h4>Parameters</h4>
                            <div className="params-table">
                              <div className="param-header">
                                <span>Name</span>
                                <span>Type</span>
                                <span>Description</span>
                                <span>Required</span>
                                <span>Value</span>
                              </div>
                              {endpoint.parameters.map(param => (
                                <div key={param.name} className="param-row">
                                  <span>{param.name}</span>
                                  <span>{param.type}</span>
                                  <span>{param.description}</span>
                                  <span>{param.required ? 'Yes' : 'No'}</span>
                                  <input
                                    type={param.type === 'number' ? 'number' : 'text'}
                                    value={paramValues[endpoint.path]?.[param.name] || ''}
                                    onChange={(e) => handleParamChange(endpoint.path, param.name, e.target.value)}
                                    placeholder={param.default || ''}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="execute">
                          <button 
                            onClick={() => executeRequest(endpoint)}
                            disabled={isLoading}
                            className={endpoint.method.toLowerCase()}
                          >
                            {isLoading ? 'Loading...' : `Execute ${endpoint.method}`}
                          </button>
                        </div>
                        
                        {responseData && (
                          <div className="response">
                            <h4>Response</h4>
                            <div className="response-status">
                              Status: <span>{responseData.status}</span>
                            </div>
                            <div className="response-body">
                              <pre>{JSON.stringify(responseData.data, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                        
                        <div className="response-examples">
                          <h4>Response Examples</h4>
                          {endpoint.responses.map(response => (
                            <div key={response.status} className="example">
                              <div className="example-status">
                                Status: <span>{response.status}</span>
                              </div>
                              <div className="example-description">
                                {response.description}
                              </div>
                              <div className="example-body">
                                <pre>{JSON.stringify(response.example, null, 2)}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>
      
      <style>
        {`
        .api-docs {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        
        header {
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        
        header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .api-section {
          margin-bottom: 20px;
          border: 1px solid #eee;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .section-header {
          padding: 15px 20px;
          background-color: #f8f9fa;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 18px;
          flex: 0 0 150px;
        }
        
        .section-header p {
          margin: 0;
          flex: 1;
          color: #666;
        }
        
        .toggle-icon {
          font-size: 20px;
          font-weight: bold;
        }
        
        .endpoints {
          padding: 0 10px;
        }
        
        .endpoint {
          margin: 10px 0;
          border: 1px solid #eee;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .endpoint-header {
          padding: 15px;
          cursor: pointer;
          background-color: #fff;
        }
        
        .endpoint-method-path {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .method {
          padding: 5px 10px;
          border-radius: 3px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          margin-right: 10px;
        }
        
        .method.get {
          background-color: #61affe;
          color: white;
        }
        
        .method.post {
          background-color: #49cc90;
          color: white;
        }
        
        .path {
          font-family: monospace;
          font-size: 14px;
        }
        
        .description {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .endpoint-details {
          padding: 15px;
          border-top: 1px solid #eee;
          background-color: #fafafa;
        }
        
        .parameters {
          margin-bottom: 20px;
        }
        
        .params-table {
          display: grid;
          grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        
        .param-header {
          display: contents;
          font-weight: bold;
        }
        
        .param-header span {
          padding: 8px;
          background-color: #f0f0f0;
          border-radius: 3px;
        }
        
        .param-row {
          display: contents;
        }
        
        .param-row span {
          padding: 8px;
          align-self: center;
        }
        
        .param-row input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
        
        .execute {
          margin: 20px 0;
        }
        
        button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          color: white;
        }
        
        button.get {
          background-color: #61affe;
        }
        
        button.post {
          background-color: #49cc90;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .response, .response-examples {
          margin-top: 20px;
        }
        
        .response-status, .example-status {
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .response-body, .example-body {
          background-color: #272b33;
          color: #fff;
          padding: 15px;
          border-radius: 4px;
          overflow: auto;
        }
        
        pre {
          margin: 0;
          white-space: pre-wrap;
          font-family: monospace;
        }
        
        .example {
          margin-bottom: 20px;
        }
        
        .example-description {
          margin-bottom: 10px;
          color: #666;
        }
        `}
      </style>
    </div>
  );
};

// Export the UI component as HTML string for Hono
export default function ApiDocsPage() {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kandilli Observatory API Documentation</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const { useState, useEffect } = React;
          
          // Define the ApiDocsUI component directly in the script
          const ApiDocsUI = ${ApiDocsUI.toString()}
          
          // Wait for DOM to be fully loaded before rendering
          document.addEventListener('DOMContentLoaded', () => {
            try {
              // Use legacy render method for better compatibility
              ReactDOM.render(
                React.createElement(ApiDocsUI),
                document.getElementById('root')
              );
            } catch (error) {
              console.error('Error rendering React component:', error);
              document.getElementById('root').innerHTML = '<div style="padding: 20px;"><h1>Kandilli Observatory API Documentation</h1><p>There was an error loading the interactive documentation. Please try again later.</p></div>';
            }
          });
        </script>
      </body>
    </html>
  `;
}