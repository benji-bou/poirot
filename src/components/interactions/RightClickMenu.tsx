import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Typography } from "@mui/material";
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';
import { RightClick } from "./RightClick";
import { useState } from "react";
import { useNewCardNode } from "../../hooks/NodesState";

interface RightClickMenuProp {
  children?: React.ReactNode

}

export function RightClickMenu({ children }: RightClickMenuProp) {
  const addNode = useNewCardNode()


  return <>
    <RightClick onClick={(event) => {
      return (
        <>
          <Paper sx={{ width: 320, maxWidth: '100%', top: event.pageY, left: event.pageX, position: 'absolute' }} >
            <MenuList>
              <MenuItem onClick={(event: React.MouseEvent) => {
                addNode({ x: event.pageX, y: event.pageY })
              }}>
                <ListItemText>New Intel</ListItemText>
              </MenuItem>
            </MenuList>
          </Paper>
        </>)
    }}
    >
      {children}
    </RightClick>
  </>
}