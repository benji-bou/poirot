import { useCallback, useMemo } from "react"
import { SecPipeline, SecPipelineRequest, StoreTool } from "../models/tooling"
import { useAsync } from "@react-hookz/web"

export function useToolsStore() {
  return useMemo(() => new StoreTool(), [])
}
export function useSecpipeline(host: string) {
  const requester = useMemo(() => new SecPipelineRequest(host), [host])
  return useAsync((template: SecPipeline, params: { [key: string]: string } = {}): Promise<string[]> => {
    return requester.execute(template, params)
  })
}