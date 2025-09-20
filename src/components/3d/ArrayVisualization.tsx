/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import { Mesh, Group, Vector3 } from 'three';
import { ArrayVisualization as ArrayType } from '../../types/visualization';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface Props {
  array: ArrayType;
  animated?: boolean;
  highlightedIndices?: number[];
  swapAnimation?: {
    index1: number;
    index2: number;
    progress: number;
    isActive: boolean;
  };
}

interface ElementPosition {
  physicalIndex: number; // Where the box is physically positioned
  logicalValue: string | number; // What value this box represents
  isAnimating: boolean;
}

export const ArrayVisualization: React.FC<Props> = ({ 
  array, 
  animated = true, 
  highlightedIndices = [],
  swapAnimation
}) => {
  const groupRef = useRef<Group>(null);
  const meshRefs = useRef<(Mesh | null)[]>([]);
  const textRefs = useRef<any[]>([]);
  
  // Track which box is at which position (position-based system)
  const [elementPositions, setElementPositions] = useState<{ [boxIndex: number]: ElementPosition }>({});
  const [isCurrentlySwapping, setIsCurrentlySwapping] = useState(false);
  const [lastSwapKey, setLastSwapKey] = useState<string>('');
  const [initialValues, setInitialValues] = useState<(string | number)[]>([]);
  
  // Ensure we have valid values
  const validValues = useMemo(() => {
    return array.values.filter(value => value !== undefined && value !== null);
  }, [array.values]);

  // Layout constants
  const ELEMENT_WIDTH = 1.0;
  const SPACING = 0.2;
  const TOTAL_WIDTH = ELEMENT_WIDTH + SPACING;

  // Calculate base position for any physical index
  const getBasePosition = useCallback((physicalIndex: number): Vector3 => {
    const totalArrayWidth = validValues.length * TOTAL_WIDTH - SPACING;
    const startX = -totalArrayWidth / 2 + ELEMENT_WIDTH / 2;
    return new Vector3(startX + (physicalIndex * TOTAL_WIDTH), 0, 0);
  }, [validValues.length]);

  // Initialize element positions when array first loads or resets
  useEffect(() => {
    if (validValues.length > 0 && !isCurrentlySwapping) {
      // Check if this is a completely new array (different length or first time)
      const isNewArray = Object.keys(elementPositions).length !== validValues.length || 
                         initialValues.length === 0;
      
      if (isNewArray) {
        console.log('🆕 Initializing new array with values:', validValues);
        
        // Store initial values for reset functionality
        setInitialValues([...validValues]);
        
        // Initialize each box at its starting position with its starting value
        const newPositions: { [boxIndex: number]: ElementPosition } = {};
        validValues.forEach((value, index) => {
          newPositions[index] = {
            physicalIndex: index,
            logicalValue: value,
            isAnimating: false
          };
        });
        
        setElementPositions(newPositions);
        console.log('📍 Initial positions set:', newPositions);
      }
    }
  }, [validValues, isCurrentlySwapping, elementPositions, initialValues]);

  // Handle swap animation - ONLY move boxes, never change values directly
  useEffect(() => {
    if (swapAnimation && swapAnimation.isActive && !isCurrentlySwapping && Object.keys(elementPositions).length > 0) {
      const { index1, index2 } = swapAnimation;
      const swapKey = `${index1}-${index2}`;
      
      // Prevent duplicate animations for the same swap
      if (lastSwapKey === swapKey) {
        console.log('⏭️ Skipping duplicate swap animation:', swapKey);
        return;
      }
      
      console.log(`🎬 Starting POSITION-ONLY swap animation: ${index1} ↔ ${index2}`);
      
      // Find which boxes are currently at these logical positions
      let box1Index = -1;
      let box2Index = -1;
      
      Object.entries(elementPositions).forEach(([boxIndex, position]) => {
        if (position.physicalIndex === index1) box1Index = parseInt(boxIndex);
        if (position.physicalIndex === index2) box2Index = parseInt(boxIndex);
      });
      
      if (box1Index === -1 || box2Index === -1 || !meshRefs.current[box1Index] || !meshRefs.current[box2Index]) {
        console.error('❌ Cannot find boxes for swap positions:', { box1Index, box2Index, index1, index2 });
        return;
      }

      console.log(`📦 Moving box ${box1Index} (value: ${elementPositions[box1Index].logicalValue}) from position ${index1} to ${index2}`);
      console.log(`📦 Moving box ${box2Index} (value: ${elementPositions[box2Index].logicalValue}) from position ${index2} to ${index1}`);

      setIsCurrentlySwapping(true);
      setLastSwapKey(swapKey);
      
      // Mark boxes as animating
      setElementPositions(prev => ({
        ...prev,
        [box1Index]: { ...prev[box1Index], isAnimating: true },
        [box2Index]: { ...prev[box2Index], isAnimating: true }
      }));

      // Get target positions (where each box should move to)
      const pos1Target = getBasePosition(index2); // Box 1 moves to position 2
      const pos2Target = getBasePosition(index1); // Box 2 moves to position 1
      
      // Create GSAP timeline for smooth, single animation
      const tl = gsap.timeline({
        onComplete: () => {
          console.log('✅ Box movement animation completed');
          
          // Update the position mapping (boxes have swapped physical positions)
          setElementPositions(prev => ({
            ...prev,
            [box1Index]: {
              ...prev[box1Index],
              physicalIndex: index2, // Box 1 is now at position 2
              isAnimating: false
            },
            [box2Index]: {
              ...prev[box2Index],
              physicalIndex: index1, // Box 2 is now at position 1
              isAnimating: false
            }
          }));
          
          setIsCurrentlySwapping(false);
          console.log('🎯 Position swap completed - boxes moved, values unchanged');
        }
      });

      // Animate box 1 to position 2 with single smooth arc
      tl.to(meshRefs.current[box1Index].position, {
        x: pos1Target.x,
        y: 1.2, // Arc height
        z: 0.5,
        duration: 1.0,
        ease: "power2.out"
      }, 0)
      .to(meshRefs.current[box1Index].position, {
        y: pos1Target.y,
        z: pos1Target.z,
        duration: 1.0,
        ease: "power2.in"
      }, 1.0)
      .to(meshRefs.current[box1Index].rotation, {
        y: Math.PI * 0.5,
        duration: 1.0,
        ease: "power2.inOut"
      }, 0)
      .to(meshRefs.current[box1Index].rotation, {
        y: 0,
        duration: 1.0,
        ease: "power2.inOut"
      }, 1.0);

      // Animate box 2 to position 1 with single smooth arc
      tl.to(meshRefs.current[box2Index].position, {
        x: pos2Target.x,
        y: 1.2, // Arc height
        z: -0.5,
        duration: 1.0,
        ease: "power2.out"
      }, 0)
      .to(meshRefs.current[box2Index].position, {
        y: pos2Target.y,
        z: pos2Target.z,
        duration: 1.0,
        ease: "power2.in"
      }, 1.0)
      .to(meshRefs.current[box2Index].rotation, {
        y: -Math.PI * 0.5,
        duration: 1.0,
        ease: "power2.inOut"
      }, 0)
      .to(meshRefs.current[box2Index].rotation, {
        y: 0,
        duration: 1.0,
        ease: "power2.inOut"
      }, 1.0);
    }
  }, [swapAnimation, elementPositions, isCurrentlySwapping, getBasePosition, lastSwapKey]);

  // Reset functionality - restore to initial state
  const resetToInitialState = useCallback(() => {
    if (initialValues.length > 0) {
      console.log('🔄 Resetting array to initial state:', initialValues);
      
      // Reset all boxes to their original positions with original values
      const resetPositions: { [boxIndex: number]: ElementPosition } = {};
      initialValues.forEach((value, index) => {
        resetPositions[index] = {
          physicalIndex: index,
          logicalValue: value,
          isAnimating: false
        };
      });
      
      setElementPositions(resetPositions);
      setIsCurrentlySwapping(false);
      setLastSwapKey('');
      
      // Reset mesh positions immediately
      setTimeout(() => {
        meshRefs.current.forEach((mesh, index) => {
          if (mesh && resetPositions[index]) {
            const basePos = getBasePosition(resetPositions[index].physicalIndex);
            mesh.position.copy(basePos);
            mesh.rotation.set(0, 0, 0);
            mesh.scale.set(1, 1, 1);
          }
        });
      }, 0);
    }
  }, [initialValues, getBasePosition]);

  // Expose reset function globally (for store to call)
  useEffect(() => {
    (window as any).resetArrayVisualization = resetToInitialState;
    return () => {
      delete (window as any).resetArrayVisualization;
    };
  }, [resetToInitialState]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      gsap.killTweensOf(meshRefs.current);
    };
  }, []);

  // Frame-based updates for non-animating elements only
  useFrame((state) => {
    if (animated && groupRef.current) {
      // Gentle floating motion for the entire array
      groupRef.current.position.y = array.position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
    }

    // Update mesh positions for non-animating elements only
    meshRefs.current.forEach((mesh, boxIndex) => {
      if (mesh && elementPositions[boxIndex] && !elementPositions[boxIndex].isAnimating) {
        const position = elementPositions[boxIndex];
        const basePos = getBasePosition(position.physicalIndex);
        
        // Apply base position
        mesh.position.copy(basePos);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
        
        // Add subtle highlight animation for logical positions
        const logicalIndex = position.physicalIndex;
        const isHighlighted = highlightedIndices.includes(logicalIndex);
        if (isHighlighted && animated) {
          mesh.position.y += Math.sin(state.clock.elapsedTime * 4 + logicalIndex * 0.5) * 0.05;
        }
      }
    });

    // Keep text synchronized with meshes
    textRefs.current.forEach((text, boxIndex) => {
      if (text && meshRefs.current[boxIndex]) {
        const mesh = meshRefs.current[boxIndex];
        text.position.copy(mesh.position);
        text.position.z += 0.52;
        text.rotation.set(0, 0, 0);
      }
    });
  });

  if (validValues.length === 0 || Object.keys(elementPositions).length === 0) {
    return null;
  }

  const totalWidth = validValues.length * TOTAL_WIDTH - SPACING;

  return (
    <group ref={groupRef} position={array.position}>
      {/* Array container */}
      <Box 
        position={[0, -0.6, 0]} 
        args={[totalWidth + 0.4, 0.15, 1.6]} 
        receiveShadow
      >
        <meshPhongMaterial 
          color="#1e293b" 
          opacity={0.4} 
          transparent 
          emissive="#0f172a"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Array elements - render boxes with their logical values */}
      {Object.entries(elementPositions).map(([boxIndexStr, position]) => {
        const boxIndex = parseInt(boxIndexStr);
        const logicalIndex = position.physicalIndex;
        const isHighlighted = highlightedIndices.includes(logicalIndex);
        const isElementSwapping = position.isAnimating;
        
        return (
          <group key={`box-${boxIndex}`}>
            {/* Main element box */}
            <Box
              ref={(ref) => { meshRefs.current[boxIndex] = ref; }}
              args={[ELEMENT_WIDTH, ELEMENT_WIDTH, ELEMENT_WIDTH]}
              castShadow
              receiveShadow
            >
              <meshPhongMaterial 
                color={
                  isElementSwapping ? '#ff6b6b' : 
                  isHighlighted ? '#ef4444' : 
                  array.color
                }
                shininess={100}
                specular="#ffffff"
                emissive={
                  isElementSwapping ? '#ff3333' :
                  isHighlighted ? '#7f1d1d' : 
                  '#0f172a'
                }
                emissiveIntensity={
                  isElementSwapping ? 0.4 :
                  isHighlighted ? 0.2 : 
                  0.1
                }
                transparent={isElementSwapping}
                opacity={isElementSwapping ? 0.9 : 1}
              />
            </Box>
            
            {/* Glow effects */}
            {isElementSwapping && (
              <Box args={[ELEMENT_WIDTH + 0.1, ELEMENT_WIDTH + 0.1, ELEMENT_WIDTH + 0.1]}>
                <meshBasicMaterial 
                  color="#ff6b6b" 
                  transparent 
                  opacity={0.3}
                  side={THREE.BackSide}
                />
              </Box>
            )}
            
            {isHighlighted && !isElementSwapping && (
              <Box args={[ELEMENT_WIDTH + 0.05, ELEMENT_WIDTH + 0.05, ELEMENT_WIDTH + 0.05]}>
                <meshBasicMaterial 
                  color="#fbbf24" 
                  transparent 
                  opacity={0.2}
                  side={THREE.BackSide}
                />
              </Box>
            )}
            
            {/* Value text - shows the logical value that this box represents */}
            <Text
              ref={(ref) => { textRefs.current[boxIndex] = ref; }}
              fontSize={0.35}
              color={
                isElementSwapping ? "#ffffff" :
                isHighlighted ? "#fbbf24" : 
                "white"
              }
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {position.logicalValue?.toString() || '0'}
            </Text>
            
            {/* Index text - shows the current logical position */}
            <Text
              position={[getBasePosition(logicalIndex).x, -0.9, 0]}
              fontSize={0.22}
              color={
                isElementSwapping ? "#ff6b6b" :
                isHighlighted ? "#fbbf24" : 
                "#6b7280"
              }
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#000000"
            >
              [{logicalIndex}]
            </Text>

            {/* Lighting effects for swapping elements */}
            {isElementSwapping && (
              <pointLight
                position={[0, 1, 1]}
                color="#ff6b6b"
                intensity={1.0}
                distance={4}
                decay={2}
              />
            )}

            {/* Highlight lighting */}
            {isHighlighted && !isElementSwapping && (
              <pointLight
                position={[0, 0.5, 0.8]}
                color="#fbbf24"
                intensity={0.6}
                distance={3}
                decay={2}
              />
            )}
          </group>
        );
      })}
      
      {/* Array name */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {array.name}
      </Text>

      {/* Ambient lighting */}
      <pointLight
        position={[0, 0, 2]}
        color={array.color}
        intensity={0.3}
        distance={8}
        decay={2}
      />

      {/* Swap effect lighting */}
      {isCurrentlySwapping && (
        <>
          <pointLight
            position={[0, 3, 0]}
            color="#ff6b6b"
            intensity={1.5}
            distance={12}
            decay={1}
          />
          
          {/* Ground effect during swap */}
          <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2, 3, 32]} />
            <meshBasicMaterial 
              color="#ff6b6b" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
};