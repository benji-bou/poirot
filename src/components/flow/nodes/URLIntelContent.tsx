import { ReactNode, useState } from "react";
import FilterFramesOutlinedIcon from '@mui/icons-material/FilterFramesOutlined';
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import { Box, IconButton, Stack } from "@mui/material";
import { useToggle } from "@react-hookz/web";

export interface URLIntelContentProp {
  url: string
}

export function URLIntelContent({ url }: URLIntelContentProp): ReactNode {

  return (<>
    <Stack width={'100%'}>
      <Stack direction='row-reverse'>
      </Stack >
    </Stack >
  </>)
}