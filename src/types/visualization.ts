/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CodeStep {
  id: string;
  line: number;
  type: 'declaration' | 'assignment' | 'comparison' | 'loop' | 'swap';
  description: string;
  variables: { [key: string]: any };
  pointers: { [key: string]: number };
  highlights: string[];
  highlightedIndices?: number[];
  swapIndices?: [number, number]; // For tracking which elements are being swapped
}

export interface ArrayVisualization {
  name: string;
  values: (string | number)[];
  position: [number, number, number];
  color: string;
}

export interface PointerVisualization {
  name: string;
  index: number;
  targetArray: string;
  color: string;
  position: [number, number, number];
}

export interface VisualizationState {
  arrays: ArrayVisualization[];
  pointers: PointerVisualization[];
  currentStep: number;
  isPlaying: boolean;
  speed: number;
}

export interface TreeVisualization {
  name: string;
  nodes: (number | string | null)[];
  position: [number, number, number];
  color: string;
}

export interface GraphVisualization {
  name: string;
  nodes: (number | string)[];
  edges: { [key: number]: number[] };
  position: [number, number, number];
  color: string;
}