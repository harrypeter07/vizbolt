import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { TreeVisualization as TreeType } from '../types/visualization';
import { gsap } from 'gsap';

interface Props {
  tree: TreeType;
  animated?: boolean;
  highlightedNodes?: number[];
  traversalAnimation?: {
    currentNode: number;
    visitedNodes: number[];
    isActive: boolean;
  };
}

interface TreeNode {
  id: number;
  value: number | string;
  position: Vector3;
  children: TreeNode[];
  parent?: TreeNode;
  level: number;
}

export const TreeVisualization: React.FC<Props> = ({ 
  tree, 
  animated = true, 
  highlightedNodes = [],
  traversalAnimation
}) => {
  const groupRef = useRef<Group>(null);
  const nodeRefs = useRef<{ [key: number]: any }>({});
  const edgeRefs = useRef<{ [key: string]: any }>({});

  // Build tree structure from flat array representation
  const treeStructure = useMemo(() => {
    const buildTree = (nodes: any[], rootIndex: number = 0): TreeNode | null => {
      if (rootIndex >= nodes.length || nodes[rootIndex] === null) return null;

      const calculatePosition = (index: number, level: number): Vector3 => {
        const levelWidth = Math.pow(2, level) * 2.5;
        const positionInLevel = Math.floor(index / Math.pow(2, level));
        const x = (positionInLevel - (Math.pow(2, level) - 1) / 2) * (levelWidth / Math.pow(2, level));
        const y = 4 - level * 2;
        return new Vector3(x, y, 0);
      };

      const createNode = (value: any, index: number, level: number): TreeNode => {
        return {
          id: index,
          value,
          position: calculatePosition(index, level),
          children: [],
          level
        };
      };

      const root = createNode(nodes[rootIndex], rootIndex, 0);
      const queue: { node: TreeNode; index: number }[] = [{ node: root, index: rootIndex }];

      while (queue.length > 0) {
        const { node, index } = queue.shift()!;
        const leftIndex = 2 * index + 1;
        const rightIndex = 2 * index + 2;

        if (leftIndex < nodes.length && nodes[leftIndex] !== null) {
          const leftChild = createNode(nodes[leftIndex], leftIndex, node.level + 1);
          leftChild.parent = node;
          node.children.push(leftChild);
          queue.push({ node: leftChild, index: leftIndex });
        }

        if (rightIndex < nodes.length && nodes[rightIndex] !== null) {
          const rightChild = createNode(nodes[rightIndex], rightIndex, node.level + 1);
          rightChild.parent = node;
          node.children.push(rightChild);
          queue.push({ node: rightChild, index: rightIndex });
        }
      }

      return root;
    };

    return buildTree(tree.nodes);
  }, [tree.nodes]);

  // Collect all nodes for rendering
  const allNodes = useMemo(() => {
    const nodes: TreeNode[] = [];
    const traverse = (node: TreeNode | null) => {
      if (!node) return;
      nodes.push(node);
      node.children.forEach(traverse);
    };
    traverse(treeStructure);
    return nodes;
  }, [treeStructure]);

  // Handle traversal animation
  useEffect(() => {
    if (traversalAnimation?.isActive && traversalAnimation.currentNode !== undefined) {
      const currentNodeRef = nodeRefs.current[traversalAnimation.currentNode];
      if (currentNodeRef) {
        // Animate current node
        gsap.to(currentNodeRef.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });

        // Pulse effect
        gsap.to(currentNodeRef.material, {
          emissiveIntensity: 0.8,
          duration: 0.3,
          yoyo: true,
          repeat: 3,
          ease: "power2.inOut"
        });
      }
    }
  }, [traversalAnimation]);

  useFrame((state) => {
    if (animated && groupRef.current) {
      // Gentle floating motion
      groupRef.current.position.y = tree.position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      
      // Rotate the entire tree slowly
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }

    // Animate individual nodes
    allNodes.forEach((node) => {
      const nodeRef = nodeRefs.current[node.id];
      if (nodeRef && animated) {
        const isHighlighted = highlightedNodes.includes(node.id);
        const isCurrentTraversal = traversalAnimation?.currentNode === node.id;
        const isVisited = traversalAnimation?.visitedNodes.includes(node.id);

        if (isHighlighted || isCurrentTraversal) {
          nodeRef.position.y = node.position.y + Math.sin(state.clock.elapsedTime * 3 + node.id * 0.5) * 0.1;
        }
      }
    });
  });

  if (!treeStructure) return null;

  return (
    <group ref={groupRef} position={tree.position}>
      {/* Render all nodes */}
      {allNodes.map((node) => {
        const isHighlighted = highlightedNodes.includes(node.id);
        const isCurrentTraversal = traversalAnimation?.currentNode === node.id;
        const isVisited = traversalAnimation?.visitedNodes.includes(node.id);

        return (
          <group key={`node-${node.id}`} position={node.position}>
            {/* Node sphere */}
            <Sphere
              ref={(ref) => { nodeRefs.current[node.id] = ref; }}
              args={[0.4]}
              castShadow
              receiveShadow
            >
              <meshPhongMaterial 
                color={
                  isCurrentTraversal ? '#ff6b6b' :
                  isVisited ? '#10b981' :
                  isHighlighted ? '#f59e0b' : 
                  tree.color
                }
                shininess={100}
                emissive={
                  isCurrentTraversal ? '#ff3333' :
                  isVisited ? '#065f46' :
                  isHighlighted ? '#92400e' : 
                  '#1e293b'
                }
                emissiveIntensity={
                  isCurrentTraversal ? 0.6 :
                  isVisited ? 0.3 :
                  isHighlighted ? 0.4 : 
                  0.1
                }
              />
            </Sphere>

            {/* Node value text */}
            <Text
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
              position={[0, 0, 0.45]}
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {node.value?.toString()}
            </Text>

            {/* Node ID text */}
            <Text
              fontSize={0.15}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.7, 0]}
              outlineWidth={0.01}
              outlineColor="#000000"
            >
              id: {node.id}
            </Text>

            {/* Glow effects */}
            {isCurrentTraversal && (
              <>
                <Sphere args={[0.5]}>
                  <meshBasicMaterial 
                    color="#ff6b6b" 
                    transparent 
                    opacity={0.3}
                  />
                </Sphere>
                <pointLight
                  position={[0, 0, 1]}
                  color="#ff6b6b"
                  intensity={1.5}
                  distance={4}
                  decay={2}
                />
              </>
            )}
          </group>
        );
      })}

      {/* Render edges */}
      {allNodes.map((node) => 
        node.children.map((child, index) => {
          const edgeKey = `${node.id}-${child.id}`;
          const direction = new Vector3().subVectors(child.position, node.position);
          const length = direction.length();
          const midpoint = new Vector3().addVectors(node.position, child.position).multiplyScalar(0.5);
          
          return (
            <group key={edgeKey}>
              <Cylinder
                ref={(ref) => { edgeRefs.current[edgeKey] = ref; }}
                position={midpoint}
                args={[0.05, 0.05, length]}
                rotation={[
                  Math.atan2(direction.y, Math.sqrt(direction.x * direction.x + direction.z * direction.z)),
                  Math.atan2(direction.x, direction.z),
                  0
                ]}
              >
                <meshPhongMaterial 
                  color="#64748b"
                  emissive="#1e293b"
                  emissiveIntensity={0.2}
                />
              </Cylinder>
            </group>
          );
        })
      )}

      {/* Tree name */}
      <Text
        position={[0, 6, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {tree.name}
      </Text>

      {/* Ambient lighting for tree */}
      <pointLight
        position={[0, 2, 3]}
        color={tree.color}
        intensity={0.5}
        distance={12}
        decay={2}
      />
    </group>
  );
};