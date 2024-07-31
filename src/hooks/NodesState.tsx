import {
  OnNodesChange,
  useNodesState as useRfNodesState,
  useEdgesState as useRfEdgesState,
  type Edge,
  type Node,
  OnEdgesChange,
  useNodes,
  useEdges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  applyEdgeChanges,
  XYPosition,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { createContext } from "react";
import { idText } from "typescript";
import { NewCardNode } from "../components/flow/nodes/BaseNode";
type NodesIndex = {
  [id: string]: Node
}

type EdgesIndex = {
  [id: string]: Edge
}
export type NodeEdgeIndex = {
  nodes: NodesIndex
  edges: EdgesIndex
}



const NodeEdgeIndexContext = createContext<[NodeEdgeIndex, React.Dispatch<React.SetStateAction<NodeEdgeIndex>>]>([{ nodes: {}, edges: {} }, () => { }])

interface NodeIndexProviderProp {
  children?: React.ReactNode
  initialNodesEdges?: NodeEdgeIndex
}
export function NodeIndexProvider({ children, initialNodesEdges = { nodes: {}, edges: {} } }: NodeIndexProviderProp) {
  const nodesEdgesIndexState = useState(initialNodesEdges)

  return <>
    <NodeEdgeIndexContext.Provider value={nodesEdgesIndexState}>
      {children}
    </NodeEdgeIndexContext.Provider>
  </>
}


export function useNodeEdgeIndexState() {
  return useContext(NodeEdgeIndexContext)
}


export function useNodesState(): [Node[], OnNodesChange<Node>] {
  const [nodesEdgesIndex, setNodeEdgesIndex] = useNodeEdgeIndexState()
  const [nodes, setNodes] = useState(Object.values(nodesEdgesIndex.nodes))

  const onNodeChanged: OnNodesChange<Node> = useCallback((changes: NodeChange<Node>[]) => {
    const newNodes = applyNodeChanges(changes, Object.values(nodesEdgesIndex.nodes))
    setNodeEdgesIndex((neI) => {
      const nodesIndexedUpdated = newNodes.reduce<NodesIndex>((indexedNodes, node) => {
        indexedNodes[node.id] = node
        return indexedNodes
      }, {})
      return { ...neI, nodes: nodesIndexedUpdated }
    })
  }, [nodesEdgesIndex.nodes, setNodeEdgesIndex])



  //Update nodes state array for reactflow, when indexed Nodes change
  useEffect(() => {
    setNodes(Object.values(nodesEdgesIndex.nodes))
  }, [nodesEdgesIndex.nodes, setNodes])




  return [nodes, onNodeChanged]
}



export function useCrudNode(): { upsertNode: (...nodes: Node[]) => void, deleteNode: (...id: string[]) => void } {
  const [_, setNodeEdgesIndex] = useNodeEdgeIndexState()
  const upsertNode = useCallback((...nodes: Node[]) => {
    setNodeEdgesIndex((nodesEdgesIndex) => {
      const nodesIndexedUpdated = nodes.reduce<NodesIndex>((indexednodes, node) => {
        indexednodes[node.id] = node
        return indexednodes
      }, {})
      return { ...nodesEdgesIndex, nodes: { ...nodesEdgesIndex.nodes, ...nodesIndexedUpdated } }
    })
  }, [setNodeEdgesIndex])

  const deleteNode = useCallback((...id: string[]) => {

    setNodeEdgesIndex((nodesEdgesIndex) => {
      const nodesIndexedUpdated = id.reduce<NodesIndex>((indexednodes, i) => {
        delete indexednodes[i]
        return indexednodes
      }, nodesEdgesIndex.nodes)
      return { ...nodesEdgesIndex, nodes: { ...nodesEdgesIndex.nodes, ...nodesIndexedUpdated } }
    })
  }, [setNodeEdgesIndex])
  return { upsertNode: upsertNode, deleteNode: deleteNode }
}

export function useNode<NodeOutput extends Node = Node>(id: string): [NodeOutput, (node: NodeOutput) => void] {
  const [nei, _] = useNodeEdgeIndexState()
  const { upsertNode } = useCrudNode()
  const current = nei.nodes[id]
  return [current as NodeOutput, useCallback((node: NodeOutput) => {
    node.id = id
    upsertNode(node)
  }, [upsertNode, id])]

}


export function useEdgesState(): [Edge[], OnEdgesChange<Edge>] {
  const [nodesEdgesIndex, setNodeEdgesIndex] = useNodeEdgeIndexState()

  const [edges, setEdges] = useState(Object.values(nodesEdgesIndex.edges))

  const onEdgesChanged: OnEdgesChange<Edge> = useCallback((changes: EdgeChange<Edge>[]) => {
    const newEdges = applyEdgeChanges(changes, Object.values(nodesEdgesIndex.edges))
    setNodeEdgesIndex((neI) => {
      const edgesIndexedUpdated = newEdges.reduce<EdgesIndex>((indexedNodes, edge) => {
        indexedNodes[edge.id] = edge
        return indexedNodes
      }, {})
      return { ...neI, edges: edgesIndexedUpdated }
    })
  }, [nodesEdgesIndex.edges, setNodeEdgesIndex])



  useEffect(() => {
    setEdges(Object.values(nodesEdgesIndex.edges))
  }, [nodesEdgesIndex.edges, setEdges])

  return [edges, onEdgesChanged]
}



// Edges


export function useCrudEdge(): { upsertEdge: (...edges: Edge[]) => void, deleteEdge: (...id: string[]) => void } {
  const [_, setNodeEdgesIndex] = useNodeEdgeIndexState()
  const upsertEdge = useCallback((...edges: Edge[]) => {
    setNodeEdgesIndex((nodesEdgesIndex) => {
      const edgesIndexedUpdated = edges.reduce<EdgesIndex>((indexedEdges, edge) => {
        indexedEdges[edge.id] = edge
        return indexedEdges
      }, {})
      return { ...nodesEdgesIndex, edges: { ...nodesEdgesIndex.edges, ...edgesIndexedUpdated } }
    })
  }, [setNodeEdgesIndex])

  const deleteEdge = useCallback((...id: string[]) => {
    setNodeEdgesIndex((nodesEdgesIndex) => {
      const edgesIndexedUpdated = id.reduce<EdgesIndex>((indexedEdges, i) => {
        delete indexedEdges[i]
        return indexedEdges
      }, nodesEdgesIndex.edges)
      return { ...nodesEdgesIndex, edges: { ...nodesEdgesIndex.edges, ...edgesIndexedUpdated } }
    })
  }, [setNodeEdgesIndex])
  return { upsertEdge: upsertEdge, deleteEdge: deleteEdge }
}




export function useNewCardNode() {
  const { screenToFlowPosition } = useReactFlow()
  const { upsertNode } = useCrudNode()
  return useCallback((position: XYPosition) => {
    const newCardNode = NewCardNode(screenToFlowPosition(position))
    upsertNode(newCardNode)

  }, [upsertNode])
}
