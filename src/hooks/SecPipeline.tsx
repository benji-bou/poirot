import { useCallback, useMemo } from "react"
import { Tool, StoreTool, ExecuteTool } from "../models/tooling"
import { useAsync } from "@react-hookz/web"

export function useToolsStore() {
  return useMemo(() => new StoreTool(), [])
}
export function useTool() {

  return useAsync((template: ExecuteTool, params: { [key: string]: string } = {}): Promise<string[]> => {
    return template.execute(params)
  })
}