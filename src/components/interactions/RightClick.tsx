import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useToggle } from "@react-hookz/web";
import React, { useState } from "react";

interface RightClickProp {
  children?: React.ReactNode
  onClick?: (event: React.MouseEvent) => JSX.Element | undefined
}

export function RightClick({ children, onClick }: RightClickProp) {
  const [elem, setElem] = useState<React.ReactNode | undefined>(undefined)
  const [isOpen, toggle] = useToggle(false)

  const menuDisplay = elem && isOpen &&

    <ClickAwayListener onClickAway={() => toggle}>
      <Box>
        {elem}
      </Box>
    </ClickAwayListener>



  return <Box width={'100%'} height={'100%'} onContextMenu={(e) => {
    e.preventDefault();
    setElem(onClick?.(e))
    toggle()
  }}>
    {children}
    {menuDisplay}
  </Box>
}