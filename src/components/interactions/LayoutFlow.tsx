import { useLayoutedElementsForce } from "../flow/canvas/LayoutForce";
import { IconButton } from "@mui/material";
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { useGetLayoutedElementsHierarchy } from "../flow/canvas/LayoutHierarchy";
import { useNodesInitialized } from "@xyflow/react";
import { useGetLayoutedElementsDagre } from "../flow/canvas/LayoutDagre";

export function LayoutFlow() {
  const initialized = useNodesInitialized()
  const { runLayout } = useGetLayoutedElementsDagre()
  // const [initialized, { toggle, isRunning }] = useLayoutedElements();
  return <>

    <IconButton disabled={!initialized} aria-label="autograph" color="secondary" onClick={runLayout} >
      <AutoGraphIcon></AutoGraphIcon>
    </IconButton >



  </>

}
