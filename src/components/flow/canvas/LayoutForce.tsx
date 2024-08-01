import {

  Edge,
  type Node,
  useNodesInitialized,
  useReactFlow,
  XYPosition,
} from '@xyflow/react';

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  Force,
  SimulationNodeDatum,
  forceCollide,
  forceRadial,
} from 'd3-force';

// import { quadtree } from 'd3-quadtree';

import { useCallback, useEffect, useMemo } from 'react';
import {
  useCrudNode,
  useEdgesState,
  useNodesState,
} from '../../../hooks/NodesState'
import { useDeepCompareMemo, useToggle } from '@react-hookz/web';
// import { quadtree } from 'd3-quadtree';
// export function RectCollide() {
//   let nodes: LayoutNode[] = [];
//   let force = (alpha: number) => {
//     const tree = quadtree<LayoutNode>(
//       nodes,
//       (d) => d.x ?? 0,
//       (d) => d.y ?? 0,
//     );

//     for (const node of nodes) {
//       const r = node.measured.width / 2;
//       const nx1 = node.x - r;
//       const nx2 = node.x + r;
//       const ny1 = node.y - r;
//       const ny2 = node.y + r;

//       tree.visit((quad, x1, y1, x2, y2) => {
//         if (!quad.length) {
//           do {
//             if (quad.data !== node) {
//               const r = node.measured.width / 2 + quad.data.width / 2;
//               let x = node.x - quad.data.x;
//               let y = node.y - quad.data.y;
//               let l = Math.hypot(x, y);

//               if (l < r) {
//                 l = ((l - r) / l) * alpha;
//                 node.x -= x *= l;
//                 node.y -= y *= l;
//                 quad.data.x += x;
//                 quad.data.y += y;
//               }
//             }
//           } while ((quad = quad.next));
//         }

//         return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
//       });
//     }
//   };

//   force.initialize = (newNodes) => (nodes = newNodes);

//   return force;
// }

type LayoutNode = XYPosition & Node






export function useLayoutedElementsForce() {

  const [start, runLayout] = useToggle()
  const [nodes] = useNodesState()
  const [edges] = useEdgesState()

  const { upsertNode } = useCrudNode()
  const simulation = useMemo(() => {
    return forceSimulation<LayoutNode, Edge>()
      .force('charge', forceManyBody().strength(-1000))
      .alphaTarget(0.05)
      .on('tick', () => {
        const layoutNodes = simulation.nodes()
        const updatedFlowNodes = layoutNodes.map((ln): Node => { return { ...ln, position: { x: ln.x, y: ln.y } } })
        upsertNode(...updatedFlowNodes)
      }).stop()

  }, [])

  const layoutEdges = useMemo(() => {
    return edges.map((e) => { return { ...e } })
  }, [edges])


  const startSimulation = useCallback(() => {
    const layoutNodes = nodes.map((n): LayoutNode => { return { ...n, x: n.position.x, y: n.position.y } })
    simulation.nodes(layoutNodes)
      .force('links',
        forceLink<LayoutNode, Edge>(layoutEdges)
          .id((e) => e.id)
          .strength(0.01)
          .distance(100)
      )
      .restart()

  }, [nodes, edges, upsertNode, simulation])


  useEffect(() => {
    if (start) {
      startSimulation()
    } else {
      simulation.stop()
    }
  }, [start])

  return { runLayout: runLayout }
};
