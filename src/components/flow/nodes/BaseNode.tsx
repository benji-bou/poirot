import Card from "@mui/material/Card";
import { Intel } from "../../../models/Intel"
import { Handle, NodeProps, NodeResizer, Position, Node, XYPosition, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CardContent, CardHeader } from "@mui/material";
import { ReactNode } from 'react'
import { IntelContent } from "./IntelContent";


export type NodeIntelData = {
  interaction?: { highlight: boolean },
  intel?: Intel
}


export type CardNode = Node<NodeIntelData, 'card'>

// { id: '1', type: 'card', data: { intel: new Intel("0678787878", "target", "phone of the target niahnianiah") }, , },

export function NewCardNode(position: XYPosition, intel?: Intel): CardNode {

  return {
    id: uuidv4(),
    data: { intel: intel, interaction: { highlight: true } },
    type: 'card',
    position: { x: position.x - 150, y: position.y },
    selectable: true,
    selected: false,
    draggable: true,
    width: 300,
    height: 200,
  }
}





export function CardBaseNode({ data, selected, id, ...rest }: NodeProps<CardNode>) {
  return <BaseNode selected={selected} data={data} id={id} {...rest}>
    <Card
      style={{ height: '100%' }}
      raised={true}
    >
      {data.intel ?

        <CardContent>
          <IntelContent intel={data.intel}></IntelContent>
        </CardContent> : <></>
      }
    </Card>
  </BaseNode >

}

interface BaseNodeProps {
  borderWidth?: number
}


export function BaseNode({ children, selected, id, borderWidth = 5 }: { children: React.ReactNode } & NodeProps<CardNode> & BaseNodeProps) {
  const reactFlow = useReactFlow()
  const [borderW, updateBorderWidth] = useIncreaseBorder(borderWidth)
  const onBorder = useOnBorder(borderW, updateBorderWidth) //dynamicBorderHandler


  const updateHighligh = useCallback((isIn: boolean) => {
    reactFlow.updateNodeData(id, (node) => {
      const newNodeData = { ...node.data, interaction: { highlight: isIn } }
      return newNodeData
    }, { replace: false })
  }, [reactFlow])




  return <>
    <AnimatePresence>
      <motion.div
        initial={{ height: '0%', borderRadius: '5px', background: '#ffffff00' }} //
        animate={{
          height: '100%',
          width: '100%'
        }}
        whileHover={{ background: ['#CCCCCC'] }}
        onMouseMove={onBorder}
        onMouseEnter={() => { updateHighligh(true) }}
        onMouseLeave={() => { updateBorderWidth({ x: 0, y: 0 }, Position.Top, false); updateHighligh(false) }}
      >
        <Handle type={"target"} position={Position.Left} style={{ left: 50 }} />
        <NodeResizer isVisible={selected} minWidth={100} minHeight={30} />
        <motion.div
          style={{ position: 'absolute', top: borderW, right: borderW, left: borderW }}
          animate={{ top: borderW, right: borderW, bottom: borderW, left: borderW }}
        >
          {children}
        </motion.div >
        <Handle type={"source"} position={Position.Right} />


      </motion.div >
    </AnimatePresence >
  </>

}




function useDynamicHandlerBorder(id: string, borderWidth: number): [ReactNode, (position: XYPosition, side: Position, isIn: boolean) => void] {
  const [handler, setHandler] = useState<ReactNode>()

  const updateNodeInternals = useUpdateNodeInternals();
  return [handler, useCallback((pos, side, isIn) => {
    if (!isIn) {
      setHandler(undefined)
      return
    }
    setHandler(<Handle style={{ top: pos.y, left: pos.x }} type={"source"} position={side} />)
    updateNodeInternals(id)
  }, [setHandler, updateNodeInternals])]
}

function useIncreaseBorder(initial: number): [number, (position: XYPosition, side: Position, isIn: boolean) => void] {
  const [borderWidth, setBorderWidth] = useState(initial)
  return [borderWidth, useCallback((pos, side, isIn) => {
    setBorderWidth(isIn ? initial + 10 : initial)
  }, [setBorderWidth])]
}



function useOnBorder(borderWidth: number, ...onBorder: ((position: XYPosition, side: Position, isInBorder: boolean) => void)[]): (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
  const reactFlow = useReactFlow()
  return useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const zoom = reactFlow.getZoom()
    const bond = e.currentTarget.getBoundingClientRect()
    const client = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    const h = (bond.height - borderWidth) / zoom
    const w = (bond.width - borderWidth) / zoom
    const position = { x: (client.x - bond.x) / zoom, y: (client.y - bond.y) / zoom }

    let x = Math.max(0, Math.min(position.x, w))
    let y = Math.max(0, Math.min(position.y, h))

    let posRes = Position.Top
    if (x < borderWidth) {
      posRes = Position.Left
    }
    else if (x > w - borderWidth) {
      posRes = Position.Right
    }
    else if (y < borderWidth) {
      posRes = Position.Top
    }
    else if (y > h - borderWidth) {
      posRes = Position.Bottom

    } else {
      onBorder.forEach((fn) => fn({ x: x, y: y }, posRes, false))
      return
    }
    onBorder.forEach((fn) => fn({ x: x, y: y }, posRes, true))
  }, [borderWidth, reactFlow, onBorder])
}