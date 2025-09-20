import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { GraphVisualization as GraphType } from '../types/visualization';
import { gsap } from 'gsap';

interface Props {
  graph: GraphType;
  animated?: boolean;
  highlightedNodes?: number[];
  highlightedEdges?: string[];
  pathAnimation?: {
    currentNode: number;
    visitedNodes: number[];
    currentPath: number[];
    isActive: boolean;
  };
}

interface GraphNode {
  id: number;
  value: number | string;
  position: Vector3;
  connections: number[];
}

export const GraphVisualization: React.FC<Props> = ({ 
  graph, 
  animated = true, 
  highlightedNodes = [],
  highlightedEdges = [],
  pathAnimation
}) => {
  const groupRef = useRef<Group>(null);
  const nodeRefs = useRef<{ [key: number]: any }>({});
  const edgeRefs = useRef<{ [key: string]: any }>({});

  // Generate node positions in a circular layout
  const graphStructure = useMemo(() => {
    const nodes: GraphNode[] = [];
    const nodeCount = graph.nodes.length;
    const radius = Math.max(3, nodeCount * 0.8);

    graph.nodes.forEach((nodeValue, index) => {
      const angle = (index / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 0.5; // Add some vertical variation

      nodes.push({
        id: index,
        value: nodeValue,
        position: new Vector3(x, y, z),
        connections: graph.edges[index] || []
      });
    });

    return nodes;
  }, [graph.nodes, graph.edges]);

  // Handle path animation
  useEffect(() => {
    if (pathAnimation?.isActive && pathAnimation.currentNode !== undefined) {
      const currentNodeRef = nodeRefs.current[pathAnimation.currentNode];
      if (currentNodeRef) {
        // Animate current node
        gsap.to(currentNodeRef.scale, {
          x: 1.4,
          y: 1.4,
          z: 1.4,
          duration: 0.6,
          yoyo: true,
          repeat: 1,
          ease: "elastic.out(1, 0.3)"
        });

        // Ripple effect
        gsap.to(currentNodeRef.material, {
          emissiveIntensity: 1.0,
          duration: 0.4,
          yoyo: true,
          repeat: 2,
          ease: "power2.inOut"
        });
      }

      // Animate path edges
      if (pathAnimation.currentPath.length > 1) {
        for (let i = 0; i < pathAnimation.currentPath.length - 1; i++) {
          const from = pathAnimation.currentPath[i];
          const to = pathAnimation.currentPath[i + 1];
          const edgeKey = `${Math.min(from, to)}-${Math.max(from, to)}`;
          const edgeRef = edgeRefs.current[edgeKey];
          
          if (edgeRef) {
            gsap.to(edgeRef.material, {
              emissiveIntensity: 0.8,
              duration: 0.3,
              delay: i * 0.1,
              yoyo: true,
              repeat: 1
            });
          }
        }
      }
    }
  }, [pathAnimation]);

  useFrame((state) => {
    if (animated && groupRef.current) {
      // Gentle rotation of the entire graph
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // Floating motion
      groupRef.current.position.y = graph.position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    // Animate individual nodes
    graphStructure.forEach((node) => {
      const nodeRef = nodeRefs.current[node.id];
      if (nodeRef && animated) {
        const isHighlighted = highlightedNodes.includes(node.id);
        const isCurrentPath = pathAnimation?.currentNode === node.id;
        const isVisited = pathAnimation?.visitedNodes.includes(node.id);

        if (isHighlighted || isCurrentPath) {
          const baseY = node.position.y;
          nodeRef.position.y = baseY + Math.sin(state.clock.elapsedTime * 4 + node.id * 0.8) * 0.15;
        }

        // Gentle pulsing for visited nodes
        if (isVisited && !isCurrentPath) {
          const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + node.id) * 0.05;
          nodeRef.scale.setScalar(scale);
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={graph.position}>
      {/* Render all nodes */}
      {graphStructure.map((node) => {
        const isHighlighted = highlightedNodes.includes(node.id);
        const isCurrentPath = pathAnimation?.currentNode === node.id;
        const isVisited = pathAnimation?.visitedNodes.includes(node.id);
        const isInPath = pathAnimation?.currentPath.includes(node.id);

        return (
          <group key={`node-${node.id}`} position={node.position}>
            {/* Node sphere */}
            <Sphere
              ref={(ref) => { nodeRefs.current[node.id] = ref; }}
              args={[0.5]}
              castShadow
              receiveShadow
            >
              <meshPhongMaterial 
                color={
                  isCurrentPath ? '#ff6b6b' :
                  isInPath ? '#8b5cf6' :
                  isVisited ? '#10b981' :
                  isHighlighted ? '#f59e0b' : 
                  graph.color
                }
                shininess={100}
                emissive={
                  isCurrentPath ? '#ff3333' :
                  isInPath ? '#6d28d9' :
                  isVisited ? '#065f46' :
                  isHighlighted ? '#92400e' : 
                  '#1e293b'
                }
                emissiveIntensity={
                  isCurrentPath ? 0.7 :
                  isInPath ? 0.5 :
                  isVisited ? 0.3 :
                  isHighlighted ? 0.4 : 
                  0.1
                }
              />
            </Sphere>

            {/* Node value text */}
            <Text
              fontSize={0.35}
              color="white"
              anchorX="center"
              anchorY="middle"
              position={[0, 0, 0.55]}
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {node.value?.toString()}
            </Text>

            {/* Node ID text */}
            <Text
              fontSize={0.2}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.9, 0]}
              outlineWidth={0.01}
              outlineColor="#000000"
            >
              [{node.id}]
            </Text>

            {/* Special effects for current path node */}
            {isCurrentPath && (
              <>
                <Sphere args={[0.7]}>
                  <meshBasicMaterial 
                    color="#ff6b6b" 
                    transparent 
                    opacity={0.2}
                  />
                </Sphere>
                <pointLight
                  position={[0, 0, 1]}
                  color="#ff6b6b"
                  intensity={2.0}
                  distance={5}
                  decay={2}
                />
              </>
            )}

            {/* Path highlight ring */}
            {isInPath && !isCurrentPath && (
              <Sphere args={[0.6]}>
                <meshBasicMaterial 
                  color="#8b5cf6" 
                  transparent 
                  opacity={0.15}
                />
              </Sphere>
            )}
          </group>
        );
      })}

      {/* Render edges */}
      {graphStructure.map((node) => 
        node.connections.map((targetId) => {
          if (targetId <= node.id) return null; // Avoid duplicate edges
          
          const targetNode = graphStructure.find(n => n.id === targetId);
          if (!targetNode) return null;

          const edgeKey = `${node.id}-${targetId}`;
          const isHighlighted = highlightedEdges.includes(edgeKey);
          const isInPath = pathAnimation?.currentPath.includes(node.id) && 
                          pathAnimation?.currentPath.includes(targetId);
          
          const direction = new Vector3().subVectors(targetNode.position, node.position);
          const length = direction.length() - 1.0; // Account for node radius
          const midpoint = new Vector3().addVectors(node.position, targetNode.position).multiplyScalar(0.5);
          
          return (
            <group key={edgeKey}>
              <Cylinder
                ref={(ref) => { edgeRefs.current[edgeKey] = ref; }}
                position={midpoint}
                args={[isHighlighted || isInPath ? 0.08 : 0.06, isHighlighted || isInPath ? 0.08 : 0.06, length]}
                rotation={[
                  Math.atan2(direction.y, Math.sqrt(direction.x * direction.x + direction.z * direction.z)),
                  Math.atan2(direction.x, direction.z),
                  0
                ]}
              >
                <meshPhongMaterial 
                  color={
                    isInPath ? '#8b5cf6' :
                    isHighlighted ? '#f59e0b' : 
                    '#64748b'
                  }
                  emissive={
                    isInPath ? '#6d28d9' :
                    isHighlighted ? '#92400e' : 
                    '#1e293b'
                  }
                  emissiveIntensity={
                    isInPath ? 0.4 :
                    isHighlighted ? 0.3 : 
                    0.1
                  }
                />
              </Cylinder>
            </group>
          );
        })
      )}

      {/* Graph name */}
      <Text
        position={[0, Math.max(4, graphStructure.length * 0.5), 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {graph.name}
      </Text>

      {/* Central ambient lighting */}
      <pointLight
        position={[0, 2, 0]}
        color={graph.color}
        intensity={0.8}
        distance={15}
        decay={2}
      />

      {/* Rim lighting */}
      <pointLight
        position={[5, 1, 5]}
        color="#3b82f6"
        intensity={0.6}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[-5, 1, -5]}
        color="#8b5cf6"
        intensity={0.6}
        distance={12}
        decay={2}
      />
    </group>
  );
};