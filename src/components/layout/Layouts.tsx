


import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { RightPanel } from "./RightPanel";
import { MainPanel } from "./Mainpanel";
import { Box, Divider, IconButton, ThemeProvider } from "@mui/material";
import { themeOptions } from "../../themes/dynamic";
import { ReactFlowProvider } from "@xyflow/react";
import { NodeIndexProvider } from "../../hooks/NodesState";
import { Restore, Save } from "../interactions/SaveAndRestore";



import { LayoutFlow } from "../interactions/LayoutFlow";


export function Layout() {
  return (
    <>
      <ThemeProvider theme={themeOptions}>
        <ReactFlowProvider>
          <NodeIndexProvider>
            <Save keyFile="toto" />
            <Restore keyFile="toto" />
            <LayoutFlow />
            <PanelGroup direction="horizontal" >
              <Panel onPaste={(e) => console.log("panel")} minSize={40} defaultSize={70}  >
                <Box height="100vh" width={"100%"} color={"red"}>
                  <MainPanel />
                </Box>
              </Panel>
              <PanelResizeHandle >
                <Divider orientation="vertical" />
              </PanelResizeHandle>
              <Panel minSize={10}  >
                <RightPanel />
              </Panel>
            </PanelGroup>
          </NodeIndexProvider>

        </ReactFlowProvider>
      </ThemeProvider>
    </>
  )
}

