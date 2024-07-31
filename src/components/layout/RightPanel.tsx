import Box from "@mui/material/Box";
import { VList as List } from "virtua";
import AutoSizer from "react-virtualized-auto-sizer";
import { useNodes } from "@xyflow/react";
import { CardNode, NodeIntelData } from "../flow/nodes/BaseNode";
import { ListItem } from "@mui/material";
import { IntelCard } from '../intel/IntelCard'


export function RightPanel() {
  // console.log("update Right panl")
  const nodes = useNodes().filter((node) => node.selected || ((node.data) as NodeIntelData)?.interaction?.highlight)

  return (
    <>
      <Box height={'100%'}>
        <AutoSizer>
          {({ height, width }) => (

            <List style={{ height: height, width: width }}>
              {nodes.map((node) => node as CardNode).map((node) =>
                <ListItem key={node.id}>
                  <IntelCard  {...node} />
                </ListItem>
              )}

            </List>)}
        </AutoSizer>
      </Box >
    </>
  )
}
