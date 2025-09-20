import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Cone, Cylinder, Sphere } from '@react-three/drei';
import { Group } from 'three';
import { PointerVisualization as PointerType } from '../../types/visualization';

interface Props {
  pointer: PointerType;
  animated?: boolean;
  arrayLength?: number;
  arrayPosition?: [number, number, number];
}

export const PointerVisualization: React.FC<Props> = ({ 
  pointer, 
  animated = true, 
  arrayLength = 7,
  arrayPosition = [0, 0, 0]
}) => {
  const groupRef = useRef<Group>(null);
  const arrowRef = useRef<Group>(null);
  const glowRef = useRef<any>(null);

  // Advanced calculation for precise pointer positioning
  const targetPosition = useMemo(() => {
    const elementWidth = 1.2;
    const arrayStartX = arrayPosition[0] - ((arrayLength - 1) * elementWidth) / 2;
    const targetX = arrayStartX + (pointer.index * elementWidth);
    
    return [targetX, arrayPosition[1], arrayPosition[2]] as [number, number, number];
  }, [pointer.index, arrayLength, arrayPosition]);

  // Calculate arrow position (above the target element)
  const arrowPosition = useMemo(() => {
    return [targetPosition[0], targetPosition[1] + 2.5, targetPosition[2]] as [number, number, number];
  }, [targetPosition]);

  useFrame((state) => {
    if (animated && groupRef.current) {
      // Smooth floating motion
      groupRef.current.position.y = arrowPosition[1] + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      
      // Gentle rotation for the arrow
      if (arrowRef.current) {
        arrowRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        arrowRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      }
    }

    // Pulsing glow effect
    if (glowRef.current && animated) {
      const intensity = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.4;
      glowRef.current.intensity = intensity;
    }
  });

  return (
    <group ref={groupRef} position={[arrowPosition[0], arrowPosition[1], arrowPosition[2]]}>
      {/* Enhanced Arrow Design */}
      <group ref={arrowRef}>
        {/* Arrow shaft with gradient effect */}
        <Cylinder
          position={[0, -0.9, 0]}
          args={[0.08, 0.12, 1.8]}
          rotation={[0, 0, 0]}
          castShadow
        >
          <meshPhongMaterial 
            color={pointer.color}
            shininess={100}
            emissive={pointer.color}
            emissiveIntensity={0.3}
            specular="#ffffff"
          />
        </Cylinder>
        
        {/* Arrow head with enhanced design */}
        <Cone
          position={[0, -1.9, 0]}
          args={[0.25, 0.5]}
          rotation={[Math.PI, 0, 0]}
          castShadow
        >
          <meshPhongMaterial 
            color={pointer.color}
            shininess={100}
            emissive={pointer.color}
            emissiveIntensity={0.4}
            specular="#ffffff"
          />
        </Cone>

        {/* Glowing tip orb */}
        <Sphere
          position={[0, -2.2, 0]}
          args={[0.12]}
        >
          <meshBasicMaterial 
            color={pointer.color}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Pointer rings for better visibility */}
        <Cylinder
          position={[0, -0.3, 0]}
          args={[0.15, 0.15, 0.05]}
          rotation={[0, 0, 0]}
        >
          <meshPhongMaterial 
            color={pointer.color}
            transparent
            opacity={0.7}
            emissive={pointer.color}
            emissiveIntensity={0.2}
          />
        </Cylinder>
      </group>
      
      {/* Enhanced Pointer Label with Index Information */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.4}
        color={pointer.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {pointer.name}
      </Text>

      {/* Index Value Display */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        = {pointer.index}
      </Text>

      {/* Array Index Indicator */}
      <Text
        position={[0, -3.2, 0]}
        fontSize={0.35}
        color={pointer.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        [{pointer.index}]
      </Text>
      
      {/* Enhanced glowing effect with precise positioning */}
      <pointLight
        ref={glowRef}
        position={[0, -1, 0.8]}
        color={pointer.color}
        intensity={0.8}
        distance={5}
        decay={2}
        castShadow
      />

      {/* Ground indicator circle - precisely positioned */}
      <Cylinder
        position={[0, -3.8, 0]}
        args={[0.4, 0.4, 0.08]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshPhongMaterial 
          color={pointer.color}
          transparent
          opacity={0.7}
          emissive={pointer.color}
          emissiveIntensity={0.3}
        />
      </Cylinder>

      {/* Connecting line from arrow to ground */}
      <Cylinder
        position={[0, -3.0, 0]}
        args={[0.02, 0.02, 1.6]}
        rotation={[0, 0, 0]}
      >
        <meshBasicMaterial 
          color={pointer.color}
          transparent
          opacity={0.4}
        />
      </Cylinder>
    </group>
  );
};