import Paper from "@mui/material/Paper";
import { NodeProps, XYPosition, type Node } from "@xyflow/react";

import { v4 as uuidv4 } from 'uuid';
import { BaseNode } from "./BaseNode";
import Card from "@mui/material/Card";
import { CardContent } from "@mui/material";

export interface ToolNodeProps { }

export type NodeToolData = {
  name: string
  interaction?: { highlight: boolean },
}

export type ToolNode = Node<NodeToolData, 'tool'>


export function NewToolNode(position: XYPosition, name: string, selected: boolean = true, highlight: boolean = true): ToolNode {

  return {
    id: uuidv4(),
    data: { name: name, interaction: { highlight: highlight } },
    type: 'tool',
    position: { x: position.x - 150, y: position.y },
    selectable: true,
    selected: selected,
    draggable: true,
    width: 300,
    height: 200,
  }
}


export function ToolBaseNode({ data, selected, id, ...rest }: NodeProps<ToolNode>) {
  return (<>

    <BaseNode selected={selected} data={data} id={id} borderRadius="50%" {...rest}>
      <Card sx={{ position: "absolute", alignSelf: "center", borderRadius: "50%", width: "100%", height: "100%" }} elevation={5}>
        <div style={{ width: '100%', height: '100%', display: "flex", justifyContent: "center", alignItems: "center" }}>
          {data.name}
        </div>
      </Card>
    </BaseNode>

  </>)
}