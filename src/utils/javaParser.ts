/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CodeStep } from '../types/visualization';

export class JavaCodeParser {
  private code: string;
  private steps: CodeStep[];
  private variables: { [key: string]: any };
  private pointers: { [key: string]: number };
  private stepId: number;

  constructor(code: string) {
    this.code = code;
    this.steps = [];
    this.variables = {};
    this.pointers = {};
    this.stepId = 0;
  }

  parse(): CodeStep[] {
    this.steps = [];
    this.variables = {};
    this.pointers = {};
    this.stepId = 0;

    const lines = this.code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // First pass: Initialize variables and arrays
    this.initializeVariables(lines);
    
    // Second pass: Execute the algorithm step by step
    this.executeAlgorithm(lines);
    
    return this.steps;
  }

  private initializeVariables(lines: string[]) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Array declaration: int[] arr = {1, 2, 3, 4, 5};
      if (line.includes('[]') && line.includes('=') && line.includes('{')) {
        const varName = this.extractVariableName(line);
        const values = this.extractArrayValues(line);
        this.variables[varName] = [...values];
        
        this.addStep(i + 1, 'declaration', 
          `📋 Initialize array ${varName} with ${values.length} elements: [${values.join(', ')}]`,
          [varName], []);
      }
      
      // Variable initialization: int i = 0; or int n = arr.length;
      else if (line.includes('int ') && line.includes('=') && !line.includes('[]') && !line.includes('for') && !line.includes('while')) {
        const varName = this.extractVariableName(line);
        const value = this.extractAndEvaluateValue(line, this.variables, this.pointers);
        this.variables[varName] = value;
        this.pointers[varName] = value;
        
        this.addStep(i + 1, 'declaration',
          `🔢 Initialize variable ${varName} = ${value}`,
          [varName], []);
      }
    }
  }

  private executeAlgorithm(lines: string[]) {
    // Detect algorithm type and execute accordingly
    const codeStr = lines.join(' ').toLowerCase();
    
    if (codeStr.includes('bubble') || (codeStr.includes('for') && codeStr.includes('for') && codeStr.includes('temp'))) {
      this.executeBubbleSort(lines);
    } else if (codeStr.includes('while') && codeStr.includes('start') && codeStr.includes('end')) {
      this.executeArrayReversal(lines);
    } else if (codeStr.includes('target') || codeStr.includes('search')) {
      this.executeLinearSearch(lines);
    } else {
      // Generic execution for other algorithms
      this.executeGeneric(lines);
    }
  }

  private executeBubbleSort(lines: string[]) {
    const arr = this.variables['arr'];
    if (!arr) return;

    const n = arr.length;
    this.addStep(0, 'loop', `🔄 Starting Bubble Sort on array of ${n} elements`, ['arr'], []);

    // Outer loop: i from 0 to n-1
    for (let i = 0; i < n - 1; i++) {
      this.pointers['i'] = i;
      this.variables['i'] = i;
      this.addStep(0, 'loop', 
        `🔄 Outer loop: Pass ${i + 1} of ${n - 1} (i = ${i})`, 
        ['i'], []);

      // Inner loop: j from 0 to n-i-1
      for (let j = 0; j < n - i - 1; j++) {
        this.pointers['j'] = j;
        this.variables['j'] = j;
        this.addStep(0, 'loop', 
          `🔄 Inner loop: Comparing positions ${j} and ${j + 1} (j = ${j})`, 
          ['j'], [j, j + 1]);

        // Compare arr[j] and arr[j+1]
        const leftValue = arr[j];
        const rightValue = arr[j + 1];
        const needSwap = leftValue > rightValue;
        
        this.addStep(0, 'comparison', 
          `🔍 Compare arr[${j}] = ${leftValue} with arr[${j + 1}] = ${rightValue} → ${needSwap ? 'SWAP NEEDED' : 'NO SWAP'}`,
          ['arr'], [j, j + 1]);

        if (needSwap) {
          // Store in temp
          this.variables['temp'] = leftValue;
          this.addStep(0, 'assignment',
            `📥 Store arr[${j}] = ${leftValue} in temp variable`,
            ['temp', 'arr'], [j]);

          // arr[j] = arr[j+1]
          arr[j] = rightValue;
          this.addStep(0, 'assignment',
            `🔄 Move arr[${j + 1}] = ${rightValue} to position ${j}`,
            ['arr'], [j]);

          // arr[j+1] = temp
          arr[j + 1] = leftValue;
          this.addStep(0, 'assignment',
            `🔄 Move temp = ${leftValue} to position ${j + 1}`,
            ['arr'], [j + 1]);

          // Add the actual swap step with animation trigger
          this.addStep(0, 'swap',
            `✅ Swap completed! Elements ${leftValue} and ${rightValue} exchanged positions`,
            ['arr'], [], [j, j + 1]);
        }
      }

      this.addStep(0, 'loop',
        `✅ Pass ${i + 1} completed. Largest element (${arr[n - 1 - i]}) is now in position ${n - 1 - i}`,
        ['arr'], [n - 1 - i]);
    }

    this.addStep(0, 'completion',
      `🎉 Bubble Sort completed! Final sorted array: [${arr.join(', ')}]`,
      ['arr'], []);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private executeArrayReversal(lines: string[]) {
    const arr = this.variables['arr'];
    if (!arr) return;

    let start = 0;
    let end = arr.length - 1;
    
    this.pointers['start'] = start;
    this.pointers['end'] = end;
    this.variables['start'] = start;
    this.variables['end'] = end;

    this.addStep(0, 'loop', 
      `🔄 Starting Array Reversal. Initial: [${arr.join(', ')}]`, 
      ['arr', 'start', 'end'], [start, end]);

    let iteration = 1;
    while (start < end) {
      this.addStep(0, 'comparison',
        `🔍 Check condition: start(${start}) < end(${end}) → TRUE (Continue)`,
        ['start', 'end'], [start, end]);

      // Store arr[start] in temp
      const temp = arr[start];
      this.variables['temp'] = temp;
      this.addStep(0, 'assignment',
        `📥 Store arr[start] = arr[${start}] = ${temp} in temp`,
        ['temp', 'arr'], [start]);

      // arr[start] = arr[end]
      arr[start] = arr[end];
      this.addStep(0, 'assignment',
        `🔄 Copy arr[end] = arr[${end}] = ${arr[start]} to arr[${start}]`,
        ['arr'], [start]);

      // arr[end] = temp
      arr[end] = temp;
      this.addStep(0, 'assignment',
        `🔄 Copy temp = ${temp} to arr[${end}]`,
        ['arr'], [end]);

      // Add the actual swap step with animation trigger
      this.addStep(0, 'swap',
        `✅ Iteration ${iteration}: Swapped positions ${start} and ${end}`,
        ['arr'], [], [start, end]);

      // Move pointers
      start++;
      end--;
      this.pointers['start'] = start;
      this.pointers['end'] = end;
      this.variables['start'] = start;
      this.variables['end'] = end;

      this.addStep(0, 'assignment',
        `➡️ Move start pointer forward to ${start}`,
        ['start'], []);

      this.addStep(0, 'assignment',
        `⬅️ Move end pointer backward to ${end}`,
        ['end'], []);

      iteration++;
    }

    this.addStep(0, 'comparison',
      `🔍 Check condition: start(${start}) < end(${end}) → FALSE (Stop)`,
      ['start', 'end'], [start, end]);

    this.addStep(0, 'completion',
      `🎉 Array Reversal completed! Final array: [${arr.join(', ')}]`,
      ['arr'], []);
  }

  private executeLinearSearch(lines: string[]) {
    const arr = this.variables['arr'];
    const target = this.variables['target'];
    if (!arr || target === undefined) return;

    this.addStep(0, 'loop',
      `🔍 Starting Linear Search for target = ${target} in array [${arr.join(', ')}]`,
      ['arr', 'target'], []);

    let found = false;
    let foundIndex = -1;

    for (let i = 0; i < arr.length; i++) {
      this.pointers['i'] = i;
      this.variables['i'] = i;
      
      this.addStep(0, 'loop',
        `🔄 Checking position ${i} (i = ${i})`,
        ['i'], [i]);

      const currentValue = arr[i];
      const isMatch = currentValue === target;
      
      this.addStep(0, 'comparison',
        `🔍 Compare arr[${i}] = ${currentValue} with target = ${target} → ${isMatch ? 'FOUND!' : 'NOT FOUND'}`,
        ['arr', 'target'], [i]);

      if (isMatch) {
        found = true;
        foundIndex = i;
        this.addStep(0, 'completion',
          `🎉 Target ${target} found at index ${i}!`,
          ['arr'], [i]);
        break;
      }
    }

    if (!found) {
      this.addStep(0, 'completion',
        `❌ Target ${target} not found in the array`,
        ['arr'], []);
    }
  }

  private executeGeneric(lines: string[]) {
    // Fallback for other algorithms - basic line-by-line execution
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('++')) {
        const varName = line.replace('++', '').replace(';', '').trim();
        if (this.pointers[varName] !== undefined) {
          this.pointers[varName]++;
          this.variables[varName] = this.pointers[varName];
          this.addStep(i + 1, 'assignment',
            `➡️ Increment ${varName} to ${this.pointers[varName]}`,
            [varName], []);
        }
      }
    }
  }

  private addStep(line: number, type: string, description: string, highlights: string[], highlightedIndices: number[], swapIndices?: [number, number]) {
    this.steps.push({
      id: `step-${this.stepId++}`,
      line,
      type: type as any,
      description,
      variables: this.deepCopyVariables(this.variables),
      pointers: { ...this.pointers },
      highlights,
      highlightedIndices,
      swapIndices
    });
  }

  private deepCopyVariables(variables: { [key: string]: any }): { [key: string]: any } {
    const copy: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(variables)) {
      if (Array.isArray(value)) {
        copy[key] = [...value];
      } else {
        copy[key] = value;
      }
    }
    return copy;
  }

  private extractVariableName(line: string): string {
    const parts = line.split('=')[0].trim().split(' ');
    return parts[parts.length - 1].replace('[]', '');
  }

  private extractArrayValues(line: string): number[] {
    const valuesStr = line.split('{')[1].split('}')[0];
    return valuesStr.split(',').map(v => parseInt(v.trim()));
  }

  private extractAndEvaluateValue(line: string, variables: { [key: string]: any }, pointers: { [key: string]: number }): number {
    const valueStr = line.split('=')[1].replace(';', '').trim();
    return this.evaluateExpression(valueStr, variables, pointers);
  }

  private evaluateExpression(expr: string, variables: { [key: string]: any }, pointers: { [key: string]: number }): number {
    expr = expr.trim();
    
    if (expr.includes('.length')) {
      const arrayName = expr.split('.length')[0].trim();
      const remaining = expr.split('.length')[1].trim();
      
      if (variables[arrayName] && Array.isArray(variables[arrayName])) {
        const length = variables[arrayName].length;
        
        if (remaining.startsWith(' - ')) {
          const subtractValue = parseInt(remaining.substring(3).trim());
          return length - subtractValue;
        } else if (remaining.startsWith(' + ')) {
          const addValue = parseInt(remaining.substring(3).trim());
          return length + addValue;
        } else if (remaining === '') {
          return length;
        }
      }
    }
    
    if (expr.includes('+')) {
      const parts = expr.split('+');
      if (parts.length === 2) {
        const left = this.evaluateSimpleExpression(parts[0].trim(), variables, pointers);
        const right = this.evaluateSimpleExpression(parts[1].trim(), variables, pointers);
        return left + right;
      }
    }
    
    if (expr.includes('-')) {
      const parts = expr.split('-');
      if (parts.length === 2) {
        const left = this.evaluateSimpleExpression(parts[0].trim(), variables, pointers);
        const right = this.evaluateSimpleExpression(parts[1].trim(), variables, pointers);
        return left - right;
      }
    }
    
    return this.evaluateSimpleExpression(expr, variables, pointers);
  }

  private evaluateSimpleExpression(expr: string, variables: { [key: string]: any }, pointers: { [key: string]: number }): number {
    if (pointers[expr] !== undefined) {
      return pointers[expr];
    }
    
    if (variables[expr] !== undefined && typeof variables[expr] === 'number') {
      return variables[expr];
    }
    
    const num = parseInt(expr);
    if (!isNaN(num)) {
      return num;
    }
    
    return 0;
  }

  getSteps(): CodeStep[] {
    return this.steps;
  }
}

// Enhanced sample Java code templates with more realistic algorithms
export const sampleCodes = {
  bubbleSort: `int[] arr = {64, 34, 25, 12, 22, 11, 90};
int n = arr.length;
for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
        if (arr[j] > arr[j+1]) {
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
        }
    }
}`,

  linearSearch: `int[] arr = {2, 3, 4, 10, 40, 15, 25};
int target = 10;
int i = 0;
for (i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
        break;
    }
}`,

  reverseArray: `int[] arr = {1, 2, 3, 4, 5, 6, 7};
int start = 0;
int end = arr.length - 1;
while (start < end) {
    int temp = arr[start];
    arr[start] = arr[end];
    arr[end] = temp;
    start++;
    end--;
}`,

  binaryTreeTraversal: `// Binary Tree Inorder Traversal
TreeNode root = new TreeNode(50);
root.left = new TreeNode(30);
root.right = new TreeNode(70);
root.left.left = new TreeNode(20);
root.left.right = new TreeNode(40);
root.right.left = new TreeNode(60);
root.right.right = new TreeNode(80);

// Inorder: Left -> Root -> Right
void inorderTraversal(TreeNode node) {
    if (node != null) {
        inorderTraversal(node.left);
        visit(node.val);
        inorderTraversal(node.right);
    }
}`,

  binarySearchTree: `// Binary Search Tree Operations
TreeNode root = null;
int[] values = {50, 30, 70, 20, 40, 60, 80};

for (int val : values) {
    root = insert(root, val);
}

TreeNode insert(TreeNode root, int val) {
    if (root == null) {
        return new TreeNode(val);
    }
    if (val < root.val) {
        root.left = insert(root.left, val);
    } else {
        root.right = insert(root.right, val);
    }
    return root;
}`,

  graphDFS: `// Graph Depth-First Search
Graph graph = new Graph(7);
graph.addEdge(0, 1);
graph.addEdge(0, 2);
graph.addEdge(1, 3);
graph.addEdge(1, 4);
graph.addEdge(2, 5);
graph.addEdge(2, 6);

boolean[] visited = new boolean[7];

void dfs(int vertex) {
    visited[vertex] = true;
    visit(vertex);
    
    for (int neighbor : graph.getNeighbors(vertex)) {
        if (!visited[neighbor]) {
            dfs(neighbor);
        }
    }
}`,

  graphBFS: `// Graph Breadth-First Search
Graph graph = new Graph(6);
graph.addEdge(0, 1);
graph.addEdge(0, 2);
graph.addEdge(1, 3);
graph.addEdge(2, 4);
graph.addEdge(3, 5);
graph.addEdge(4, 5);

Queue<Integer> queue = new LinkedList<>();
boolean[] visited = new boolean[6];

void bfs(int start) {
    queue.offer(start);
    visited[start] = true;
    
    while (!queue.isEmpty()) {
        int vertex = queue.poll();
        visit(vertex);
        
        for (int neighbor : graph.getNeighbors(vertex)) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                queue.offer(neighbor);
            }
        }
    }
}`,

  dijkstraAlgorithm: `// Dijkstra's Shortest Path Algorithm
int[][] graph = {
    {0, 4, 0, 0, 0, 0, 0, 8, 0},
    {4, 0, 8, 0, 0, 0, 0, 11, 0},
    {0, 8, 0, 7, 0, 4, 0, 0, 2},
    {0, 0, 7, 0, 9, 14, 0, 0, 0},
    {0, 0, 0, 9, 0, 10, 0, 0, 0},
    {0, 0, 4, 14, 10, 0, 2, 0, 0},
    {0, 0, 0, 0, 0, 2, 0, 1, 6},
    {8, 11, 0, 0, 0, 0, 1, 0, 7},
    {0, 0, 2, 0, 0, 0, 6, 7, 0}
};

int[] dist = new int[9];
boolean[] visited = new boolean[9];

for (int i = 0; i < 9; i++) {
    dist[i] = Integer.MAX_VALUE;
}
dist[0] = 0;

for (int count = 0; count < 8; count++) {
    int u = minDistance(dist, visited);
    visited[u] = true;
    
    for (int v = 0; v < 9; v++) {
        if (!visited[v] && graph[u][v] != 0 && 
            dist[u] != Integer.MAX_VALUE && 
            dist[u] + graph[u][v] < dist[v]) {
            dist[v] = dist[u] + graph[u][v];
        }
    }
}`,

  avlTree: `// AVL Tree (Self-Balancing Binary Search Tree)
AVLNode root = null;
int[] values = {10, 20, 30, 40, 50, 25};

for (int val : values) {
    root = insert(root, val);
}

AVLNode insert(AVLNode node, int key) {
    if (node == null) {
        return new AVLNode(key);
    }
    
    if (key < node.key) {
        node.left = insert(node.left, key);
    } else if (key > node.key) {
        node.right = insert(node.right, key);
    } else {
        return node;
    }
    
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    
    int balance = getBalance(node);
    
    // Left Left Case
    if (balance > 1 && key < node.left.key) {
        return rightRotate(node);
    }
    
    // Right Right Case
    if (balance < -1 && key > node.right.key) {
        return leftRotate(node);
    }
    
    // Left Right Case
    if (balance > 1 && key > node.left.key) {
        node.left = leftRotate(node.left);
        return rightRotate(node);
    }
    
    // Right Left Case
    if (balance < -1 && key < node.right.key) {
        node.right = rightRotate(node.right);
        return leftRotate(node);
    }
    
    return node;
}`
};