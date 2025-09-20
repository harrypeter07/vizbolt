import React from 'react';
import Scene3D from './components/3d/Scene3D';
import CodeEditor from './components/CodeEditor';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="h-screen flex">
        {/* Left Panel - Code Editor */}
        <div className="w-1/3 min-w-[400px] border-r border-gray-700">
          <CodeEditor />
        </div>
        
        {/* Right Panel - 3D Visualization */}
        <div className="flex-1 relative">
          <Scene3D />
          
          {/* Overlay Info */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white">
            <h3 className="font-bold text-lg mb-2">3D Visualization Controls</h3>
            <ul className="text-sm space-y-1">
              <li>• Left click + drag: Rotate view</li>
              <li>• Right click + drag: Pan view</li>
              <li>• Scroll: Zoom in/out</li>
              <li>• Real-time 3D animations</li>
              <li>• Advanced lighting & effects</li>
            </ul>
          </div>
          
          {/* Tech Stack Info */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="text-xs opacity-75">
              <div className="font-semibold mb-1">Tech Stack:</div>
              <div>• React Three Fiber (3D)</div>
              <div>• Three.js Engine</div>
              <div>• Post-processing Effects</div>
              <div>• Advanced Animations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;