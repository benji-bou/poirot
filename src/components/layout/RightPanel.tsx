import Box from "@mui/material/Box";
import { VList as List } from "virtua";
import AutoSizer from "react-virtualized-auto-sizer";
import { useNodes } from "@xyflow/react";
import { IntelNode, NodeIntelData } from "../flow/nodes/IntelNode";
import { ListItem } from "@mui/material";
import { IntelCard } from '../intel/IntelCard'
import { useMemo } from "react";


export function RightPanel() {
  console.log("update Right panl")
  const nodes = useNodes().filter((node) => node.selected || ((node.data) as NodeIntelData)?.interaction?.highlight)
  const listItem = useMemo(() => {
    return nodes.map((node) => node as IntelNode).map((node) =>
      <ListItem key={node.id}>
        <IntelCard  {...node} />
      </ListItem>
    )
  }, [nodes])
  return (
    <>
      <Box height={'100%'}>
        <AutoSizer>
          {({ height, width }) => (

            <List style={{ height: height, width: width }}>
              {listItem}

            </List>)}
        </AutoSizer>
      </Box >
    </>
  )
}
