import { useToggle } from '@react-hookz/web';
import dagre from 'dagre'
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCrudNode, useEdgesState, useNodesState } from '../../../hooks/NodesState';
import { Position, useReactFlow } from '@xyflow/react';


export function useGetLayoutedElementsDagre() {
  const [start, runLayout] = useToggle()
  const { getNodes, getEdges } = useReactFlow()
  const [direction, setDirection] = useState<string>('LR')
  const { upsertNode } = useCrudNode()

  const isHorizontal = useMemo(() => direction === 'LR', [direction])

  const dagreGraph = useMemo(() => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    return dagreGraph
  }, [])
  const nodeWidth = 300;
  const nodeHeight = 200;

  const runActionLayout = useCallback(() => {
    const nodes = getNodes()
    const edges = getEdges()
    dagreGraph.setGraph({ rankdir: direction });
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: node.width ?? nodeWidth, height: node.height ?? nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);
    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const newNode = {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };

      return newNode;
    });
    upsertNode(...newNodes)
  }, [isHorizontal, direction])

  useEffect(() => {
    if (start) {
      runActionLayout()
    }
  }, [start])

  return { runLayout: runLayout }
}
