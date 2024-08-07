import { Edge, MarkerType, useReactFlow, type Node } from "@xyflow/react"
import { IntelNode, NewIntelNode, NodeIntelData } from "../flow/nodes/IntelNode"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import IntelForm from "./IntelForm"
import { Intel, IntelTypeValidator, IntelTypeIndex, IntelTypeStore, NewIntel, IntelInput } from "../../models/Intel"
import { Box, Button, CircularProgress, Divider, Link, List, ListItem, Stack, Typography } from "@mui/material"


import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useCrudEdge, useCrudNode, useNode } from "../../hooks/NodesState"
import { ExecuteTool, Tool } from "../../models/tooling"
import { log } from "console"
import isURL from "validator/lib/isURL"
import { useTool, useToolsStore } from "../../hooks/SecPipeline"
import { useAsync, useMountEffect, useToggle } from "@react-hookz/web"
import { NewToolNode } from "../flow/nodes/ToolNode"



interface IntelCardProps extends IntelNode {

}



export function IntelCard({ id }: IntelCardProps) {
  const { screenToFlowPosition } = useReactFlow()
  const { upsertNode } = useCrudNode()
  const { upsertEdge } = useCrudEdge()
  const toolNodeCreated = useRef<{ [toolName: string]: Node }>({})
  const toolStore = useToolsStore()
  const [node, updateNode] = useNode<IntelNode>(id)
  const options = useMemo<string[]>(
    () => {
      const keys = Object.keys(IntelTypeStore.all)
      return keys
    },
    [IntelTypeStore.all],
  );
  const toolListName: string[] = useMemo(() => {
    const tools = node?.data?.intel?.type.reduce<Set<string>>((res, current) => {
      const tools = new Set<string>(toolStore.getToolsName(current))
      return res.union(tools)
    }, new Set<string>()) ?? new Set<string>()
    return Array.from(tools)
  }, [node?.data?.intel?.type])
  console.log("intelCard toolNodeCreated" + JSON.stringify(toolNodeCreated.current))
  const onExecute = useCallback((t: string) => {
    const toolNode = NewToolNode(screenToFlowPosition({ x: node.position.x + (node.width ?? 300) + 200, y: node.position.y }), t)
    upsertNode(toolNode)
    upsertEdge({
      id: "e-" + node.id + "-" + toolNode.id, source: node.id, target: toolNode.id, type: 'floating', markerEnd: { type: MarkerType.Arrow }
    })
    toolNodeCreated.current = { ...toolNodeCreated.current, [t]: toolNode }
    console.log("intelCard onExecute toolNodeCreated" + JSON.stringify(toolNodeCreated.current))
  }, [toolNodeCreated, upsertNode, upsertEdge])



  const onResultChanged = useCallback((t: string, values: string[]) => {
    const newNodes = values.map((value) =>
      NewIntelNode(screenToFlowPosition({ x: node.position.x - 200, y: node.position.y - 200 }), NewIntel(value), false, false)
    )
    const tNode = toolNodeCreated.current[t]
    const newEdges = newNodes.map((n): Edge => {
      return {
        id: "e-" + tNode.id + "-" + n.id, source: tNode.id, target: n.id, type: 'floating', markerEnd: { type: MarkerType.Arrow }
      }
    })
    upsertNode(...newNodes)
    upsertEdge(...newEdges)
    delete toolNodeCreated.current[t]
  }, [upsertNode, upsertEdge, toolNodeCreated])

  const content = node?.data?.intel?.content ?? node?.data?.intel?.name ?? ""

  if (!node) {
    return <></>
  }

  return <Card variant="outlined" style={{ width: '100%' }}>
    <CardHeader title={node.data.intel?.name ?? content ?? "New intel"} >
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
            <ToolCard name={t}
              onExecute={() => { onExecute(t) }}
              onResultChanged={(values) => {
                onResultChanged(t, values)
              }} pipeline={toolStore.getPipeline(t)} value={content}></ToolCard>
          </ListItem>)}

        </List>

      </Stack>
    </CardContent>
  </Card >
}


export interface ToolCardProps {
  name: string
  pipeline: ExecuteTool & Tool<any>
  value?: string
  onResultChanged?: (res: string[]) => void
  onExecute?: () => void
}

export function ToolCard({ name, pipeline, value, onResultChanged, onExecute }: ToolCardProps) {
  const [isExec, toggleExec] = useToggle()
  const [toolState, toolActions] = useTool()
  useEffect(() => {
    if (toolState.status === "success") {
      onResultChanged?.(toolState.result ?? [])
    }
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
      <Box sx={{ m: 1, position: 'relative' }}>
        <Button variant="contained" disabled={isExec} onClick={async () => {
          onExecute?.()
          toggleExec()
          const paramsLen = pipeline.availableParamsKey.length
          if (paramsLen == 0) {
            await toolActions.execute(pipeline, {})
          } else if (paramsLen == 1 && value) {
            await toolActions.execute(pipeline, { [pipeline.availableParamsKey[0]]: value })
          } else {
            console.log("calling tools failed due to undefine value or to many params. Multiple params is not yet handled")
          }
          toggleExec()
        }}>Execute</Button>   {isExec && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}


      </Box>
    </Stack>
  );

}