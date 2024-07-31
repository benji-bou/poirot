import { IconButton } from "@mui/material"
import { useKeyPress, useReactFlow } from "@xyflow/react"
import { ReactNode, useCallback } from "react"
import SaveIcon from '@mui/icons-material/Save';
import { useCrudEdge, useCrudNode } from "../../hooks/NodesState";
import FileOpenIcon from '@mui/icons-material/FileOpen';
interface SaveProp {

  keyFile: string
}


export function Save({ keyFile }: SaveProp) {
  const { toObject } = useReactFlow()
  const onSave = useCallback(() => {
    if (toObject) {
      const flow = toObject();
      localStorage.setItem(keyFile, JSON.stringify(flow));
    }
  }, [toObject])

  const cmdAndSPressed = useKeyPress(['Meta+s', 'Strg+s']);
  if (cmdAndSPressed) {
    onSave()
  }
  return <>
    <IconButton aria-label="save" color="secondary" onClick={onSave}>
      <SaveIcon></SaveIcon>
    </IconButton>

  </>
}

interface RestoreProp {

  keyFile: string
}

export function Restore({ keyFile }: RestoreProp) {
  const { setViewport } = useReactFlow()
  const { upsertNode } = useCrudNode()
  const { upsertEdge } = useCrudEdge()
  const onRestore = useCallback(() => {
    const restoreFlow = async (keyFile: string) => {
      const restoredData = localStorage.getItem(keyFile)
      if (restoredData === null) {
        return
      }
      const flow = JSON.parse(restoredData);

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;

        upsertNode(...(flow.nodes || []));
        upsertEdge(...(flow.edges || []));
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow(keyFile);
  }, [upsertNode, upsertEdge, setViewport, keyFile]);
  return <>
    <IconButton aria-label="restore" color="secondary" onClick={onRestore}>
      <FileOpenIcon></FileOpenIcon>
    </IconButton>

  </>
}