import { type Edge, type Node } from '@xyflow/react';
import { stratify, tree } from 'd3-hierarchy';
import { useCrudEdge, useCrudNode, useEdgesState, useNodesState } from '../../../hooks/NodesState';
import { useCallback } from 'react';

const g = tree<Node>();

export function useGetLayoutedElementsHierarchy() {

  const [nodes] = useNodesState()
  const [edges] = useEdgesState()

  const { upsertNode } = useCrudNode()



  return useCallback(() => {
    const { width, height } = document
      .querySelector(`[data-id="${nodes[0].id}"]`)!.getBoundingClientRect()


    const hierarchy = stratify<Node>()
      .id((node) => node.id)
      .parentId((node) => edges.find((edge) => edge.target === node.id)?.source);
    const root = hierarchy(nodes);
    const layout = g.nodeSize([width * 2, height * 2])(root);

    upsertNode(...g(root)
      .descendants()
      .map((node) => ({ ...node.data, position: { x: node.x, y: node.y } })),)

  }, [nodes, edges, upsertNode])

};