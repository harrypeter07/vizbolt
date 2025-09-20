import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Code, Zap, RotateCcw, Settings, CheckCircle } from 'lucide-react';
import { JavaCodeParser, sampleCodes } from '../utils/javaParser';
import { useVisualizationStore } from '../store/visualizationStore';

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState(sampleCodes.bubbleSort);
  const [selectedSample, setSelectedSample] = useState('bubbleSort');
  const [autoPlay, setAutoPlay] = useState(true); // Default to true for better UX
  const [isCompleted, setIsCompleted] = useState(false);
  
  const {
    currentStep,
    isPlaying,
    speed,
    codeSteps,
    setCodeSteps,
    nextStep,
    play,
    pause,
    reset,
    setSpeed,
    setAutoPlay: setStoreAutoPlay
  } = useVisualizationStore();

  // Check if animation is completed
  const animationCompleted = currentStep >= codeSteps.length - 1 && codeSteps.length > 0;

  // Enhanced auto-play functionality with completion handling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < codeSteps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, speed);
    } else if (isPlaying && animationCompleted) {
      // Animation completed
      setIsCompleted(true);
      pause();
      
      if (autoPlay) {
        // Auto-restart after a brief pause to show completion
        setTimeout(() => {
          setIsCompleted(false);
          reset();
          setTimeout(() => play(), 300);
        }, speed * 1.5);
      }
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, codeSteps.length, speed, nextStep, pause, autoPlay, reset, play, animationCompleted]);

  // Reset completion state when starting new animation
  useEffect(() => {
    if (isPlaying && currentStep === 0) {
      setIsCompleted(false);
    }
  }, [isPlaying, currentStep]);

  const handleParseCode = () => {
    const parser = new JavaCodeParser(code);
    const steps = parser.parse();
    setCodeSteps(steps);
    setIsCompleted(false);
    
    // Auto-start simulation
    setTimeout(() => {
      play();
    }, 500);
  };

  const handleSampleChange = (sample: string) => {
    setSelectedSample(sample);
    setCode(sampleCodes[sample as keyof typeof sampleCodes]);
    pause();
    reset();
    setIsCompleted(false);
  };

  const handleAutoPlayToggle = () => {
    const newAutoPlay = !autoPlay;
    setAutoPlay(newAutoPlay);
    setStoreAutoPlay(newAutoPlay);
  };

  const handlePlayPause = () => {
    if (animationCompleted) {
      // If completed, restart the animation
      setIsCompleted(false);
      reset();
      setTimeout(() => play(), 100);
    } else {
      // Normal play/pause
      isPlaying ? pause() : play();
    }
  };

  const handleReset = () => {
    pause();
    reset();
    setIsCompleted(false);
  };

  const currentStepData = codeSteps[currentStep];
  const progress = codeSteps.length > 0 ? ((currentStep + 1) / codeSteps.length) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-6 h-full flex flex-col border-r border-gray-700">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Code className="text-white" size={24} />
          </div>
          <div>
            <div className="text-xl">Java Visualizer 3D</div>
            <div className="text-xs text-gray-400 font-normal">Advanced Algorithm Animation</div>
          </div>
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600 rounded-full">
          <Zap className="text-white" size={16} />
          <span className="text-xs font-semibold text-white">LIVE</span>
        </div>
      </div>

      {/* Sample Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Algorithm Templates:</label>
        <select
          value={selectedSample}
          onChange={(e) => handleSampleChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
        >
          <optgroup label="🔢 Array Algorithms">
          <option value="bubbleSort">🔄 Bubble Sort Algorithm</option>
          <option value="linearSearch">🔍 Linear Search Algorithm</option>
          <option value="reverseArray">↔️ Array Reversal Algorithm</option>
          </optgroup>
          <optgroup label="🌳 Tree Algorithms">
            <option value="binaryTreeTraversal">🌲 Binary Tree Traversal</option>
            <option value="binarySearchTree">🔍 Binary Search Tree</option>
            <option value="avlTree">⚖️ AVL Tree (Self-Balancing)</option>
          </optgroup>
          <optgroup label="🕸️ Graph Algorithms">
            <option value="graphDFS">🔍 Graph Depth-First Search</option>
            <option value="graphBFS">📊 Graph Breadth-First Search</option>
            <option value="dijkstraAlgorithm">🛣️ Dijkstra's Shortest Path</option>
          </optgroup>
        </select>
      </div>

      {/* Code Editor */}
      <div className="mb-4 flex-1">
        <label className="block text-sm font-medium mb-2 text-gray-300">Java Source Code:</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 resize-none transition-all"
          placeholder="Enter your Java code here..."
          spellCheck={false}
        />
      </div>

      {/* Enhanced Parse Button */}
      <button
        onClick={handleParseCode}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg mb-4 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        🚀 Parse & Auto-Simulate Code
      </button>

      {/* Enhanced Playback Controls */}
      {codeSteps.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 mb-4 border border-gray-700 shadow-xl">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-blue-400">
                Step {currentStep + 1} / {codeSteps.length}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                isCompleted 
                  ? 'bg-green-600 text-white' 
                  : isPlaying 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-600 text-gray-300'
              }`}>
                {isCompleted ? (
                  <>
                    <CheckCircle size={12} />
                    COMPLETED
                  </>
                ) : isPlaying ? (
                  '▶ RUNNING'
                ) : (
                  '⏸ PAUSED'
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Auto-play toggle */}
              <button
                onClick={handleAutoPlayToggle}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  autoPlay 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Auto-restart when finished"
              >
                🔄 Loop
              </button>
              
              {/* Speed Control */}
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-gray-400" />
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value={2000}>0.5x</option>
                  <option value={1000}>1x</option>
                  <option value={500}>2x</option>
                  <option value={250}>4x</option>
                  <option value={100}>10x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={handleReset}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all transform hover:scale-105 shadow-md"
              title="Reset to beginning"
            >
              <RotateCcw size={18} />
            </button>
            
            <button
              onClick={handlePlayPause}
              className={`p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
              }`}
              title={
                isCompleted 
                  ? 'Restart animation' 
                  : isPlaying 
                    ? 'Pause simulation' 
                    : 'Start simulation'
              }
            >
              {isCompleted ? <RotateCcw size={24} /> : isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={() => {
                pause();
                reset();
                setIsCompleted(false);
              }}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all transform hover:scale-105 shadow-md"
              title="Stop simulation"
            >
              <Square size={18} />
            </button>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ease-out shadow-lg ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Completion Message */}
          {isCompleted && (
            <div className="bg-gradient-to-r from-green-700 to-emerald-700 rounded-lg p-4 border border-green-600 mb-4">
              <div className="flex items-center gap-2 text-green-100">
                <CheckCircle size={20} />
                <div className="font-semibold">Animation Completed!</div>
              </div>
              <div className="text-sm text-green-200 mt-1">
                {autoPlay ? 'Auto-restarting in a moment...' : 'Click play to restart or enable loop mode.'}
              </div>
            </div>
          )}

          {/* Current Step Info */}
          {currentStepData && !isCompleted && (
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                Line {currentStepData.line} - {currentStepData.type.toUpperCase()}
              </div>
              <div className="text-sm text-gray-200 mb-3 leading-relaxed">
                {currentStepData.description}
              </div>
              {currentStepData.highlights.length > 0 && (
                <div className="text-xs text-yellow-400 bg-yellow-900 bg-opacity-30 rounded px-2 py-1">
                  🎯 Highlighting: {currentStepData.highlights.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Performance Info */}
      <div className="text-xs text-gray-500 text-center">
        <div>🎮 Real-time 3D visualization with advanced animations</div>
        <div>⚡ Powered by React Three Fiber & WebGL</div>
      </div>
    </div>
  );
};

export default CodeEditor;