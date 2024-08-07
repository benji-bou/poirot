import { NodeProps, XYPosition, type Node } from "@xyflow/react"
import { Intel } from "../../../models/Intel"
import { v4 as uuidv4 } from 'uuid';
import { BaseNode } from "./BaseNode"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { IntelContent } from "./IntelContent"


export type NodeIntelData = {
  interaction?: { highlight: boolean },
  intel?: Intel
}


export type IntelNode = Node<NodeIntelData, 'card'>


export function NewIntelNode(position: XYPosition, intel?: Intel, selected: boolean = true, highlight: boolean = true): IntelNode {

  return {
    id: uuidv4(),
    data: { intel: intel, interaction: { highlight: highlight } },
    type: 'card',
    position: { x: position.x - 150, y: position.y },
    selectable: true,
    selected: selected,
    draggable: true,
    width: 300,
    height: 200,
  }
}





export function IntelBaseNode({ data, selected, id, ...rest }: NodeProps<IntelNode>) {
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
