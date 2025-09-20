/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { CodeStep, VisualizationState } from '../types/visualization';

interface SwapAnimation {
  index1: number;
  index2: number;
  progress: number;
  isActive: boolean;
}

interface VisualizationStore extends VisualizationState {
  codeSteps: CodeStep[];
  autoPlay: boolean;
  swapAnimation: SwapAnimation | null;
  originalArrayValues: (string | number)[];
  setCodeSteps: (steps: CodeStep[]) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  updateFromStep: (step: CodeStep) => void;
  triggerSwapAnimation: (index1: number, index2: number) => void;
}

export const useVisualizationStore = create<VisualizationStore>((set, get) => ({
  // Initialize with sample data to show something immediately
  arrays: [
    {
      name: 'Sample Array',
      values: [64, 34, 25, 12, 22, 11, 90],
      position: [0, 0, 0],
      color: '#3b82f6'
    }
  ],
  pointers: [
    {
      name: 'i',
      index: 0,
      targetArray: 'arr',
      color: '#10b981',
      position: [0, -2, 0]
    }
  ],
  currentStep: 0,
  isPlaying: false,
  speed: 800,
  autoPlay: false,
  codeSteps: [],
  swapAnimation: null,
  originalArrayValues: [64, 34, 25, 12, 22, 11, 90],

  setCodeSteps: (steps) => {
    // Store original array values when setting new steps
    if (steps.length > 0 && steps[0].variables.arr) {
      const originalValues = [...steps[0].variables.arr];
      set({ originalArrayValues: originalValues });
      console.log('📚 Stored original array values:', originalValues);
    }
    
    set({ codeSteps: steps, currentStep: 0 });
    if (steps.length > 0) {
      get().updateFromStep(steps[0]);
    }
  },

  setCurrentStep: (step) => {
    const { codeSteps } = get();
    if (step >= 0 && step < codeSteps.length) {
      set({ currentStep: step });
      get().updateFromStep(codeSteps[step]);
    }
  },

  nextStep: () => {
    const { currentStep, codeSteps } = get();
    if (currentStep < codeSteps.length - 1) {
      const newStep = currentStep + 1;
      const currentStepData = codeSteps[newStep];
      
      // Check if this step involves a swap
      if (currentStepData.type === 'swap' && currentStepData.swapIndices) {
        const [index1, index2] = currentStepData.swapIndices;
        console.log(`🔄 Step ${newStep}: Triggering swap animation ${index1} ↔ ${index2}`);
        get().triggerSwapAnimation(index1, index2);
      }
      
      // Always update pointers and highlights, but NOT array values during swaps
      get().updateFromStep(currentStepData);
      set({ currentStep: newStep });
    }
  },

  previousStep: () => {
    const { currentStep, codeSteps } = get();
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      set({ currentStep: newStep });
      get().updateFromStep(codeSteps[newStep]);
    }
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  
  reset: () => {
    const { originalArrayValues } = get();
    console.log('🔄 Resetting to original values:', originalArrayValues);
    
    set({ currentStep: 0, isPlaying: false, swapAnimation: null });
    
    // Reset array to original values
    if (originalArrayValues.length > 0) {
      const resetArrays = [{
        name: 'arr',
        values: [...originalArrayValues],
        position: [0, 0, 0] as [number, number, number],
        color: '#3b82f6'
      }];
      
      set({ arrays: resetArrays });
      
      // Call the visualization reset function if available
      if ((window as any).resetArrayVisualization) {
        (window as any).resetArrayVisualization();
      }
    }
  },

  setSpeed: (speed) => set({ speed }),
  setAutoPlay: (autoPlay) => set({ autoPlay }),

  triggerSwapAnimation: (index1: number, index2: number) => {
    console.log(`🎬 Store: Starting swap animation ${index1} ↔ ${index2}`);
    
    // Start swap animation - this will ONLY move boxes, not change values
    set({ 
      swapAnimation: { 
        index1, 
        index2, 
        progress: 0, 
        isActive: true 
      } 
    });

    // Clear the animation after 2.5 seconds (slightly longer than animation)
    setTimeout(() => {
      console.log(`✅ Store: Clearing swap animation ${index1} ↔ ${index2}`);
      set({ swapAnimation: null });
    }, 2500);
  },

  updateFromStep: (step) => {
    const arrays = [];
    const pointers = [];
    let arrayIndex = 0;

    // Convert variables to 3D visualizations
    // IMPORTANT: We only update the display values, not the actual box positions
    for (const [name, value] of Object.entries(step.variables)) {
      if (Array.isArray(value)) {
        arrays.push({
          name,
          values: [...value], // Create a copy to avoid mutations
          position: [(arrayIndex * 10) - 5, 0, 0] as [number, number, number],
          color: step.highlights.includes(name) ? '#ef4444' : '#3b82f6'
        });
        arrayIndex++;
      }
    }

    // Convert pointers to 3D visualizations
    let pointerIndex = 0;
    for (const [name, index] of Object.entries(step.pointers)) {
      if (typeof index === 'number') {
        const targetArray = Object.keys(step.variables).find(key => Array.isArray(step.variables[key]));
        if (targetArray) {
          // Calculate pointer colors based on their role
          let pointerColor = '#10b981'; // Default green
          if (name === 'i') pointerColor = '#10b981'; // Green for outer loop
          if (name === 'j') pointerColor = '#f59e0b'; // Orange for inner loop
          if (name === 'start') pointerColor = '#3b82f6'; // Blue for start
          if (name === 'end') pointerColor = '#ef4444'; // Red for end
          if (name === 'temp') pointerColor = '#8b5cf6'; // Purple for temp
          
          // Override with highlight color if highlighted
          if (step.highlights.includes(name)) {
            pointerColor = '#f59e0b';
          }

          pointers.push({
            name,
            index,
            targetArray,
            color: pointerColor,
            position: [0, -2.5 - (pointerIndex * 0.8), pointerIndex * 0.3] as [number, number, number]
          });
          pointerIndex++;
        }
      }
    }

    // Only update arrays if we're not currently in a swap animation
    const currentState = get();
    if (!currentState.swapAnimation?.isActive) {
      set({ arrays, pointers });
    } else {
      // During swap animations, only update pointers and highlights
      set({ pointers });
    }
  }
}));