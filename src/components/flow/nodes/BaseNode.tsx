

import { Handle, NodeProps, NodeResizer, Position, Node, XYPosition, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';

import React, { useCallback, useRef, useState } from "react";
import { AnimatePresence, CustomValueType, motion } from "framer-motion";

import { ReactNode } from 'react'



interface BaseNodeProps {
  borderWidth?: number
  borderRadius?: string | number
}


export function BaseNode({ children, selected, id, borderWidth = 5, width, height, borderRadius = '5px' }: { children: React.ReactNode } & NodeProps<Node> & BaseNodeProps) {
  const [dynamicHandle, onBorderDynHandle, onLeaveHandle] = useDynamicHandlerBorder(id)
  const { updateNodeData } = useReactFlow()
  const [borderW, updateBorderWidth] = useIncreaseBorder(borderWidth)
  const onBorder = useOnBorder(borderW, updateBorderWidth, onBorderDynHandle) //dynamicBorderHandler


  const updateHighligh = useCallback((isIn: boolean) => {
    updateNodeData(id, (node) => {
      const newNodeData = { ...node.data, interaction: { highlight: isIn } }
      return newNodeData
    }, { replace: false })
  }, [updateNodeData])




  return <>
    <AnimatePresence>
      <motion.div
        initial={{ height: '0%', borderRadius: borderRadius, background: '#ffffff00' }} //
        animate={{
          height: '100%',
          width: '100%'
        }}
        whileHover={{ background: ['#CCCCCC'] }}
        onMouseMove={onBorder}
        onMouseEnter={() => { updateHighligh(true) }}
        onMouseLeave={(e) => { updateBorderWidth({ x: 0, y: 0 }, Position.Top, false); updateHighligh(false); onLeaveHandle() }}
      >
        <Handle type={"target"} position={Position.Left} style={{ visibility: "hidden" }} />
        {/* <NodeResizer isVisible={selected} minWidth={100} minHeight={30} /> */}
        <motion.div
          style={{ position: 'absolute', top: borderW, right: borderW, left: borderW }}
          animate={{ top: borderW, right: borderW, bottom: borderW, left: borderW }}
        >
          {children}
        </motion.div >
        {/* <Handle type={"source"} position={Position.Right} /> */}
        {dynamicHandle}

      </motion.div >
    </AnimatePresence >
  </>

}




function useDynamicHandlerBorder(id: string): [ReactNode, (position: XYPosition, side: Position, isIn: boolean) => void, () => void] {
  const posRef = useRef<XYPosition>({ x: 0, y: 0 })
  const sideRef = useRef<Position>(Position.Left)
  const [handler, setHandler] = useState<ReactNode>(<Handle style={{ top: posRef.current.y, left: posRef.current.x, visibility: "hidden" }} type={"source"} position={sideRef.current} />)
  const updateNodeInternals = useUpdateNodeInternals();
  const onOver = useCallback((pos: XYPosition, side: Position, isIn: boolean) => {
    posRef.current = pos
    sideRef.current = side
    if (!isIn) {
      setHandler(<Handle style={{ top: pos.y, left: pos.x, visibility: "hidden" }} type={"source"} position={side} />)
      return
    }

    setHandler(<Handle style={{ top: pos.y, left: pos.x }} type={"source"} position={side} />)
    updateNodeInternals(id)
  }, [setHandler, updateNodeInternals])
  const onLeave = useCallback(() => {
    setHandler(<Handle style={{ top: posRef.current.y, left: posRef.current.x, visibility: "hidden" }} type={"source"} position={sideRef.current} />)
  }, [setHandler])
  return [handler, onOver, onLeave]
}

function useIncreaseBorder(initial: number): [number, (position: XYPosition, side: Position, isIn: boolean) => void] {
  const [borderWidth, setBorderWidth] = useState(initial)
  return [borderWidth, useCallback((pos, side, isIn) => {
    setBorderWidth(isIn ? initial + 10 : initial)
  }, [setBorderWidth])]
}



function useOnBorder(borderWidth: number, ...onBorder: ((position: XYPosition, side: Position, isInBorder: boolean) => void)[]): (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
  const { getZoom } = useReactFlow()
  return useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const zoom = getZoom()
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
  }, [borderWidth, getZoom, onBorder])
}