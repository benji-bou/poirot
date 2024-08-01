import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  addEdge,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodeDrag,
  type DefaultEdgeOptions,
  useReactFlow,
  BackgroundVariant,
  Panel,
  MarkerType,
  OnConnectEnd,
  OnConnectStart,
} from '@xyflow/react';

import { CardBaseNode, NewCardNode, NodeIntelData } from '../nodes/BaseNode'
import {
  useCrudEdge,
  useCrudNode,
  useEdgesState,
  useHighlightedNodes,
  useNewCardNode,
  useNodeEdgeIndexState,
  useNodesState,
} from '../../../hooks/NodesState'
import '@xyflow/react/dist/style.css'
import { useEventListener } from '@react-hookz/web';
import { NewIntel } from '../../../models/Intel';
import { FloatingConnectionLine, FloatingEdge } from './FloatingEdges';



const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  deletable: true,
  selectable: true,
};



const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log('drag event', node);
};

interface CanvasProps {
  edgesOptions?: DefaultEdgeOptions
}


const edgeTypes = {
  floating: FloatingEdge,
};


export function Canvas({ edgesOptions = defaultEdgeOptions }: CanvasProps) {
  const [nodes, onNodesChange] = useNodesState();
  const [edges, onEdgesChange] = useEdgesState();
  const [nodeEdgesIndex] = useNodeEdgeIndexState()
  const { upsertNode } = useCrudNode()
  const { upsertEdge } = useCrudEdge()
  const addNode = useNewCardNode()
  const { screenToFlowPosition, getNodes } = useReactFlow()
  const mouseXYRef = useRef({ x: 0, y: 0 })
  const canvaRef = createRef<HTMLDivElement>()

  const handlePast = useCallback((event: ClipboardEvent) => {
    if ((event.target as HTMLElement).tagName.toUpperCase() === "INPUT") {
      return
    }
    const newData = event.clipboardData?.getData("text")
    if (newData) {
      const newCardNode = NewCardNode(screenToFlowPosition({ x: mouseXYRef.current.x, y: mouseXYRef.current.y }), NewIntel(newData))
      upsertNode(newCardNode)
    }
  }, [upsertNode, mouseXYRef])

  useEventListener(window, 'paste', handlePast)

  const currentNodeIdForNewEdge = useRef<string | null>(null)

  const onConnect: OnConnect = useCallback((connection) => {
    currentNodeIdForNewEdge.current = null;
    upsertEdge(...addEdge({ ...connection, type: 'floating', markerEnd: { type: MarkerType.Arrow } }, Object.values(nodeEdgesIndex.edges)))
  },
    [nodeEdgesIndex]
  )

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    currentNodeIdForNewEdge.current = nodeId
  }, [])


  const onConnectEnd: OnConnectEnd = useCallback((event) => {

    const highlightedNodes = getNodes().filter((node) => ((node.data) as NodeIntelData)?.interaction?.highlight)
    if (highlightedNodes.length == 0) {
      return
    }
    console.log(highlightedNodes[0].id)
    console.log(currentNodeIdForNewEdge.current)
    if (!currentNodeIdForNewEdge.current || highlightedNodes.length != 1) {
      return
    }
    upsertEdge({ id: "e-" + currentNodeIdForNewEdge.current + "-" + highlightedNodes[0].id, source: currentNodeIdForNewEdge.current, target: highlightedNodes[0].id, type: 'floating', markerEnd: { type: MarkerType.Arrow } })
  }, [getNodes])


  const nodeTypes = useMemo(() => ({ card: CardBaseNode }), []);
  const [variant, setVariant] = useState<BackgroundVariant>(BackgroundVariant.Cross)

  return (
    <ReactFlow
      id='canvas-flow'
      className='mainpanel'
      autoFocus={true}
      onFocus={(e) => console.log("focus")}
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      edgeTypes={edgeTypes}
      connectionLineComponent={FloatingConnectionLine}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onMouseMove={(event) => { mouseXYRef.current = screenToFlowPosition({ x: event.pageX, y: event.pageY }) }}
      onNodeDrag={onNodeDrag}
      onDoubleClick={(event: React.MouseEvent) => {
        addNode({ x: event.pageX, y: event.pageY })
      }}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={edgesOptions}
      zoomOnDoubleClick={false}

    >
      <Background color="#cec" variant={variant} />
      <Controls />

      {/* <MiniMap nodeStrokeWidth={3} zoomable pannable /> */}
    </ReactFlow>
  );
}

