import { RightClickMenu } from '../interactions/RightClickMenu'
import { Canvas } from '../flow/canvas/Canvas'
import Box from '@mui/material/Box'

interface MainPanelProp {

}

export function MainPanel({ }: MainPanelProp) {

  return (

    <RightClickMenu>
      <Canvas />
    </RightClickMenu >
  )

}