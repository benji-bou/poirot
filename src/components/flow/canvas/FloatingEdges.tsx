import { Position, MarkerType, type Node, InternalNode, XYPosition, ConnectionLineComponentProps, EdgeProps } from '@xyflow/react';
import { getBezierPath, useInternalNode } from '@xyflow/react';

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode: InternalNode<Node>, targetNode: InternalNode<Node>): XYPosition {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;
  if (!intersectionNodeHeight || !intersectionNodeWidth) {
    throw new Error("FloatingEdges - getNodeIntersection failed due to   intersectionNode.measured values being undefined")
  }
  if (!targetNode.measured.width || !targetNode.measured.height) {
    throw new Error("FloatingEdges - getNodeIntersection failed due to   targetNode.measured values being undefined")
  }

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: InternalNode<Node>, intersectionPoint: XYPosition) {
  const n = { ...node.internals.positionAbsolute, ...node };
  if (!n.measured.width || !n.measured.height) {
    throw new Error("FloatingEdges - getEdgePosition failed due to   node.measured values being undefined")
  }
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.measured.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

// export function createNodesAndEdges() {
//   const nodes = [];
//   const edges = [];
//   const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

//   nodes.push({ id: 'target', data: { label: 'Target' }, position: center });

//   for (let i = 0; i < 8; i++) {
//     const degrees = i * (360 / 8);
//     const radians = degrees * (Math.PI / 180);
//     const x = 250 * Math.cos(radians) + center.x;
//     const y = 250 * Math.sin(radians) + center.y;

//     nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });

//     edges.push({
//       id: `edge-${i}`,
//       target: 'target',
//       source: `${i}`,
//       type: 'floating',
//       markerEnd: {
//         type: MarkerType.Arrow,
//       },
//     });
//   }

//   return { nodes, edges };
// }



export function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
}

// export interface FloatingConnectionLineProp {
//   toX: number
//   toY: number
//   fromPosition: Position
//   toPosition: Position
//   fromNode: InternalNode<Node>
// }

export function FloatingConnectionLine({
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
}: ConnectionLineComponentProps) {
  const fromInternalNode = useInternalNode(fromNode.id)
  if (!fromInternalNode) {
    throw new Error("FloatingConnectionLine - unable to get fromNode internal Node")
  }

  const targetNode: InternalNode<Node> = {
    id: 'connection-target',
    position: { x: toX, y: toY },
    data: {},
    measured: {
      width: 1,
      height: 1,
    },
    internals: {
      positionAbsolute: { x: toX, y: toY },
      z: 0,
      userNode: {
        id: 'target',
        position: { x: 0, y: 0 },
        data: {}
      }
    },
  };


  const { sx, sy } = getEdgeParams(fromInternalNode, targetNode);
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={1.5}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke="#222"
        strokeWidth={1.5}
      />
    </g>
  );
}
