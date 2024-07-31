import { IntelType } from "./Intel"


class SecPipelineError extends Error {
  constructor(message: string, public pipeline?: string, public missingParams?: string[]) {
    super(message)
    this.name = "SecPipelineError"
  }
}


export abstract class SecPipeline {
  abstract readonly availableParamsKey: string[]
  abstract readonly template: string
  abstract readonly description?: string
  abstract readonly source?: string

  generateWithParams(params: { [key: string]: string }): string {
    const paramsAvailabaleSet = new Set<string>(this.availableParamsKey)
    const passedParamsSet = new Set<string>(Object.keys(params))
    if (!passedParamsSet.isSupersetOf(paramsAvailabaleSet)) {
      throw new SecPipelineError("missing some params", "", Array.from(paramsAvailabaleSet.difference(passedParamsSet)))
    }
    let finalTemplate = this.template
    for (const param of this.availableParamsKey) {
      finalTemplate = finalTemplate.replaceAll("<#" + param + "#>", params[param])
    }
    return finalTemplate
  }
}



class Holehe extends SecPipeline {
  source?: string = "https://github.com/megadose/holehe"
  description?: string = "Holehe checks if an email is attached to an account on sites like twitter, instagram, imgur and more than 120 others."
  availableParamsKey: string[] = ["input"]
  template: string = `
name: holehe
description: osint
author: bbo
version: "0.1"
stages: 
  inputName: 
    plugin: rawinput
    config: 
      data: "<#input#>"
  holehe:
    parents: 
      - inputName
    plugin: docker
    pipe: 
      - goTemplate:
          format: string
          pattern: "holehe --only-used --no-color --no-clear {{ . }}"
    config:
      host: unix:///Users/benjamin/.orbstack/run/docker.sock
      image: "holehe:latest"
  transformResult: 
    parents: 
      - holehe
    plugin: forward
    pipe: 
      - split:
          sep: "\\n"
      - goTemplate: 
          pattern: "{{ trim . }}"
          format: string
      - regex:
          pattern: '^\\[\\+\\]\\s*(.*)$'
          select: 1
  `
}




type toolsIndex = { [name: string]: SecPipeline }



export class StoreTool {
  private all: toolsIndex = {
    "holehe": new Holehe()
  }
  private toolsByIntel: Map<string, toolsIndex> = new Map()
  constructor() {
    this.toolsByIntel = new Map([
      [
        IntelType.EMAIL, {
          "holehe": this.all["holehe"]
        }
      ]
    ])
  }


  getToolsName(intelType?: string): string[] {
    if (!intelType) {
      return Object.keys(this.all)
    } else {
      return Object.keys(this.toolsByIntel.get(intelType) ?? {})
    }
  }

  addTool(name: string, tool: SecPipeline, category?: IntelType) {
    if (this.all[name]) {
      throw new Error("a tool with this name already exists")
    }
    this.all[name] = tool

    if (category) {
      let tools = this.toolsByIntel.get(category)
      if (!tools) {
        tools = {}
      }
      tools[name] = tool
      this.toolsByIntel.set(category, tools)
    }
  }

  getToolRequest(toolName: string, params: { [key: string]: string }): string {
    const currentRequestedPipeline = this.all[toolName]
    if (!currentRequestedPipeline) {
      throw new Error("Unkown pipeline")
    }
    try {
      return currentRequestedPipeline.generateWithParams(params)

    } catch (e) {
      if (e instanceof SecPipelineError) {
        e.pipeline = toolName
      }
      throw e
    }
  }

  getPipeline(name: string): SecPipeline {
    return this.all[name]
  }

}



type pipelineResponse = {
  data: string[]
}

export class SecPipelineRequest {
  constructor(public host: string) { }


  async execute(pipeline: SecPipeline, params: { [key: string]: string } = {}): Promise<string[]> {
    try {
      const pipelineRequestBody = pipeline.generateWithParams(params)
      const r = await fetch(this.host + "/run", {
        method: "POST",
        body: pipelineRequestBody
      })
      const response = await r.json() as pipelineResponse
      return response.data
    } catch (e) {
      throw Error("execute a pipeline request failed", { cause: e })
    }

  }
}