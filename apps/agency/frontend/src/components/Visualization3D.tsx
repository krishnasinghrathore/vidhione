import React from 'react';
import { Card } from 'primereact/card';

const Visualization3D: React.FC = () => {
  return (
    <Card className="h-full">
      <div className="flex flex-column align-items-center justify-content-center h-full text-center">
        <div className="text-2xl font-semibold mb-3 text-900">3D Dashboard Visualization</div>
        <div className="text-600 mb-4">Interactive 3D representation of business metrics</div>

        {/* Placeholder for 3D visualization */}
        <div
          className="w-full h-25rem border-2 border-dashed border-300 border-round flex align-items-center justify-content-center bg-blue-50"
          style={{
            background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
            minHeight: '400px'
          }}
        >
          <div className="text-center">
            <i className="pi pi-chart-bar text-6xl text-blue-400 mb-3"></i>
            <div className="text-lg font-medium text-blue-600 mb-2">3D Chart Placeholder</div>
            <div className="text-sm text-blue-500">
              Interactive visualization will be rendered here
            </div>
          </div>
        </div>

        {/* Legend or additional info */}
        <div className="mt-4 text-sm text-600">
          <div className="flex flex-wrap gap-4 justify-content-center">
            <div className="flex align-items-center gap-2">
              <div className="w-3 h-3 border-round bg-blue-500"></div>
              <span>Sales Data</span>
            </div>
            <div className="flex align-items-center gap-2">
              <div className="w-3 h-3 border-round bg-green-500"></div>
              <span>Revenue</span>
            </div>
            <div className="flex align-items-center gap-2">
              <div className="w-3 h-3 border-round bg-orange-500"></div>
              <span>Profit</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Visualization3D;