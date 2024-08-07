import { AsyncState, useAsyncAbortable } from "@react-hookz/web"
import { Intel } from "../models/Intel"
import { useEffect } from "react"

export function useIntelContent(intel: Intel): AsyncState<string | undefined> {
  // const [content, actions] = useAsyncAbortable(() => intel.content.asString())
  // useEffect(() => {
  //   actions.execute()
  //   return actions.abort
  // }, [intel])
  // return content
  if (typeof intel.content === 'string') {
    return { result: intel.content, error: undefined, status: "success" }
  }
  return { result: "", error: undefined, status: "success" }
}