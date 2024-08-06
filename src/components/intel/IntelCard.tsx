import { Edge, MarkerType, useReactFlow } from "@xyflow/react"
import { CardNode, NewCardNode, NodeIntelData } from "../flow/nodes/BaseNode"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import IntelForm from "./IntelForm"
import { Intel, IntelTypeValidator, IntelTypeIndex, IntelTypeStore, NewIntel, IntelInput } from "../../models/Intel"
import { Box, Button, CircularProgress, Divider, Link, List, ListItem, Stack, Typography } from "@mui/material"


import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useCallback, useEffect, useMemo } from "react"
import { useCrudEdge, useCrudNode, useNode } from "../../hooks/NodesState"
import { SecPipeline } from "../../models/tooling"
import { log } from "console"
import isURL from "validator/lib/isURL"
import { useSecpipeline, useToolsStore } from "../../hooks/SecPipeline"
import { useAsync, useMountEffect, useToggle } from "@react-hookz/web"



interface IntelCardProps extends CardNode {

}



export function IntelCard({ id }: IntelCardProps) {
  const { screenToFlowPosition } = useReactFlow()
  const { upsertNode } = useCrudNode()
  const { upsertEdge } = useCrudEdge()
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
    const tools = node?.data?.intel?.type.reduce<Set<string>>((res, current) => {
      const tools = new Set<string>(toolStore.getToolsName(current))
      return res.union(tools)
    }, new Set<string>()) ?? new Set<string>()
    return Array.from(tools)
  }, [node?.data?.intel?.type])



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
            <ToolCard name={t} onResultChanged={(values) => {
              const newNodes = values.map((value) =>
                NewCardNode(screenToFlowPosition({ x: node.position.x - 200, y: node.position.y - 200 }), NewIntel(value), false, false)
              )
              const newEdges = newNodes.map((n): Edge => {
                return {
                  id: "e-" + node.id + "-" + n.id, source: node.id, target: n.id, type: 'floating', markerEnd: { type: MarkerType.Arrow }
                }
              })
              upsertNode(...newNodes)
              upsertEdge(...newEdges)
            }} pipeline={toolStore.getPipeline(t)} value={content}></ToolCard>
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
  const [isExec, toggleExec] = useToggle()
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
      <Box sx={{ m: 1, position: 'relative' }}>
        <Button variant="contained" disabled={isExec} onClick={async () => {
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