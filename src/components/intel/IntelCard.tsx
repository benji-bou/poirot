import { useReactFlow } from "@xyflow/react"
import { CardNode, NewCardNode, NodeIntelData } from "../flow/nodes/BaseNode"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import IntelForm from "./IntelForm"
import { Intel, IntelTypeValidator, IntelTypeIndex, IntelTypeStore, NewIntel } from "../../models/Intel"
import { Box, Button, Divider, Link, List, ListItem, Stack, Typography } from "@mui/material"


import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useCallback, useEffect, useMemo } from "react"
import { useCrudNode, useNode } from "../../hooks/NodesState"
import { SecPipeline } from "../../models/tooling"
import { log } from "console"
import isURL from "validator/lib/isURL"
import { useSecpipeline, useToolsStore } from "../../hooks/SecPipeline"



interface IntelCardProps extends CardNode {

}



export function IntelCard({ id }: IntelCardProps) {
  const { screenToFlowPosition } = useReactFlow()
  const { upsertNode } = useCrudNode()
  const toolStore = useToolsStore()
  const [node, updateNode] = useNode<CardNode>(id)
  const options = useMemo<string[]>(
    () => {
      const keys = Object.keys(IntelTypeStore.all)
      return keys
    },
    [IntelTypeStore.all],
  );
  const toolListName: string[] = useMemo(() => {
    const tools = node.data.intel?.type.reduce<Set<string>>((res, current) => {
      const tools = new Set<string>(toolStore.getToolsName(current))
      return res.union(tools)
    }, new Set<string>()) ?? new Set<string>()
    return Array.from(tools)
  }, [node?.data?.intel?.type])

  if (!node) {
    return <></>
  }

  return <Card variant="outlined" style={{ width: '100%' }}>
    <CardHeader title={node.data.intel?.name ?? node.data.intel?.content ?? "New intel"} >
    </CardHeader>
    <CardContent>
      <Stack
        direction="column"
        divider={<Divider orientation="horizontal" flexItem />}
        spacing={2}
      >
        <>
          <Autocomplete
            multiple
            options={options}
            getOptionLabel={(o: string) => o}
            isOptionEqualToValue={(option, value) => option === value}
            value={Object.values(node.data.intel?.type ?? {})}
            renderInput={
              (params) => <TextField {...params} label="Intel Type" />
            }
            onChange={(event, value) => {

              node.data.intel = node.data.intel ?? NewIntel("")
              node.data.intel.type = value
              updateNode(node)
            }}
          />

        </>
        <IntelForm initial={node.data?.intel} onChange={(intel?: Intel) => {
          updateNode({ ...node, data: { intel: intel ?? node.data.intel } })
        }}>
        </IntelForm>
        <Divider />
        <List>
          {toolListName.map((t) => <ListItem key={t}>
            <ToolCard name={t} onResultChanged={(values) => {
              const newNodes = values.map((value) =>
                NewCardNode(screenToFlowPosition({ x: node.position.x - 200, y: node.position.y - 200 }), NewIntel(value))
              )

              upsertNode(...newNodes)
            }} pipeline={toolStore.getPipeline(t)} value={node.data.intel?.content}></ToolCard>
          </ListItem>)}

        </List>

      </Stack>
    </CardContent>
  </Card >
}


export interface ToolCardProps {
  name: string
  pipeline: SecPipeline
  value?: string
  onResultChanged?: (res: string[]) => void
}

export function ToolCard({ name, pipeline, value, onResultChanged }: ToolCardProps) {
  const [toolState, toolActions] = useSecpipeline("http://localhost:8080")
  useEffect(() => {
    onResultChanged?.(toolState.result ?? [])
  }, [toolState])
  const source = useMemo(() => {
    if (!pipeline.source) {
      return <></>
    }
    if (isURL(pipeline.source)) {
      return <Link color="text.secondary" variant="caption">
        {pipeline.source}
      </Link>
    } else {
      <Typography color="text.secondary" variant="caption">
        {pipeline.source}
      </Typography>
    }
  }, [pipeline.source])


  const description = useMemo(() => {
    if (!pipeline.description) {
      return <></>
    }
    return <Typography color="text.secondary" variant="caption">
      {pipeline.description}
    </Typography>

  }, [pipeline.description])


  return (

    <Stack direction='row' justifyContent="space-between" alignItems="center">
      <Box sx={{}}>
        <Stack direction='column'>
          <Typography gutterBottom component="div">
            {name}
          </Typography>
          {description}
          {source}
        </Stack>
      </Box>
      <Box sx={{}}>
        <Button variant="contained" onClick={() => {
          const paramsLen = pipeline.availableParamsKey.length
          if (paramsLen == 0) {
            toolActions.execute(pipeline, {})
          } else if (paramsLen == 1 && value) {
            toolActions.execute(pipeline, { [pipeline.availableParamsKey[0]]: value })
          } else {
            console.log("calling tools failed due to undefine value or to many params. Multiple params is not yet handled")
          }
        }}>Execute</Button>

      </Box>
    </Stack>
  );

}