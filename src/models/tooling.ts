import YAML, { Scalar } from "yaml"
import { IntelType } from "./Intel"
import { Template } from "./secpipelinetools"


class ToolError extends Error {
  constructor(message: string, public pipeline?: string, public missingParams?: string[]) {
    super(message)
    this.name = "ToolError"
  }
}

const secpipelinehost = "http://localhost:8080"


export interface Tool<T> {
  readonly availableParamsKey: string[]
  readonly description?: string
  readonly source?: string
  generateWithParams(params: { [key: string]: string }): T

}


export abstract class ToolStringBased implements Tool<string> {
  abstract readonly availableParamsKey: string[]

  abstract readonly description?: string
  abstract readonly source?: string
  abstract template: string
  generateWithParams(params: { [key: string]: string }): string {
    const paramsAvailabaleSet = new Set<string>(this.availableParamsKey)
    const passedParamsSet = new Set<string>(Object.keys(params))
    if (!passedParamsSet.isSupersetOf(paramsAvailabaleSet)) {
      throw new ToolError("missing some params", "", Array.from(paramsAvailabaleSet.difference(passedParamsSet)))
    }
    let finalTemplate = this.template
    for (const param of this.availableParamsKey) {
      finalTemplate = finalTemplate.replaceAll("<#" + param + "#>", params[param])
    }
    return finalTemplate
  }
}

export abstract class SecPipelineTool implements Tool<Template>, ExecuteTool {
  availableParamsKey: string[] = ["input"]
  readonly host: string = secpipelinehost
  template: Template = {
    name: "sherlock",
    description: "osint",
    author: "bbo",
    version: "0.1",
    stages:
    {
      inputRaw: {
        plugin: "rawinput",
        config: {
          data: "<#input#>"
        }
      },

    }
  }

  constructor(name: string) {
    this.template.name = name
  }
  generateWithParams(params: { [key: string]: string }): Template {
    const paramsAvailabaleSet = new Set<string>(this.availableParamsKey)
    const passedParamsSet = new Set<string>(Object.keys(params))
    if (!passedParamsSet.isSupersetOf(paramsAvailabaleSet)) {
      throw new ToolError("missing some params", "", Array.from(paramsAvailabaleSet.difference(passedParamsSet)))
    }
    const finalTemplate = { ...this.template }
    finalTemplate.stages.inputRaw.config!.data = params["input"]
    return finalTemplate
  }

  async execute(params: { [key: string]: string } = {}): Promise<string[]> {
    try {
      const pipelineRequestBody = this.generateWithParams(params)
      const rawYamlBody = YAML.stringify(pipelineRequestBody, { defaultStringType: Scalar.PLAIN, defaultKeyType: Scalar.PLAIN })
      const r = await fetch(this.host + "/run", {
        method: "POST",
        body: rawYamlBody
      })
      const response = await r.json() as pipelineResponse
      return response.data
    } catch (e) {
      throw Error("execute a pipeline request failed", { cause: e })
    }
  }
}




export abstract class DockerSecPipelineTool extends SecPipelineTool {


  constructor(name: string, image: string, command: string, output: string) {
    super(name)
    this.template.stages = {
      ...this.template.stages,
      [name]: {
        parents: [
          "inputRaw"
        ],
        plugin: "docker",
        pipe: [
          {
            "goTemplate": {
              "format": "string",
              "pattern": command,
            }
          },
        ],
        config: {
          host: "unix:///Users/benjamin/.orbstack/run/docker.sock",
          image: image
        }
      },
      transformOutput: {
        parents: [
          name
        ],
        plugin: "forward",
        pipe: [
          {
            "split": {
              "sep": "\n",
            },
            "goTemplate": {
              format: "string",
              pattern: "{{ trim . }}",
            },
            "regex": {
              pattern: output,
              select: 1
            }

          },
        ],
      }
    }
  }

}



class Sherlock extends DockerSecPipelineTool {

  description?: string | undefined = "Hunt down social media accounts by username across 400+ social networks"
  source?: string | undefined = "https://github.com/sherlock-project/sherlock"
  constructor() {
    super("sherlock", "sherlock/sherlock:latest", " --no-color  {{ . }}", "^.*\\[\\+\\].*(http.*\\..*)$")
  }


}


class Holehe extends DockerSecPipelineTool {
  source?: string = "https://github.com/megadose/holehe"
  description?: string = "Holehe checks if an email is attached to an account on sites like twitter, instagram, imgur and more than 120 others."
  availableParamsKey: string[] = ["input"]
  constructor() {
    super("holehe", "holehe:latest", "holehe --only-used --no-color --no-clear {{ . }}", "^.*\\[\\+\\].*(http.*\\..*)$")
    this.template.stages.transformOutput.pipe!.push({
      "goTemplate": {
        format: "string",
        pattern: "https://{{ trim .}}"

      }
    })
  }
}


class BlackbirdEmail extends DockerSecPipelineTool {
  source: string = "https://github.com/p1ngul1n0/blackbird"
  description: string = "Blackbird is a robust OSINT tool that facilitates rapid searches for user accounts by username or email across a wide array of platforms, enhancing digital investigations. It features WhatsMyName integration, export options in PDF, CSV, and HTTP response formats, and customizable search filters."
  availableParamsKey: string[] = ["input"]
  constructor() {
    super("blackbird", "blackbird:latest", "--email {{ . }}", '^\\s*\\[.*\\]\\s*(http.*\\..*)$')
  }
}

class BlackbirdUsername extends DockerSecPipelineTool {
  source: string = "https://github.com/p1ngul1n0/blackbird"
  description: string = "Blackbird is a robust OSINT tool that facilitates rapid searches for user accounts by username or email across a wide array of platforms, enhancing digital investigations. It features WhatsMyName integration, export options in PDF, CSV, and HTTP response formats, and customizable search filters."
  availableParamsKey: string[] = ["input"]
  constructor() {
    super("blackbird", "blackbird:latest", "--username {{ . }}", "^\\s*\\[.*\\]\\s*(http.*\\..*)$")
  }
}


export abstract class WebSiteTool extends ToolStringBased implements ExecuteTool {

  async execute(params: { [key: string]: string } = {}): Promise<string[]> {
    const openUrl = this.generateWithParams(params)
    window.open(openUrl)
    return []
  }
}


class Google extends WebSiteTool {
  availableParamsKey: string[] = ["q"]
  template: string = "https://google.com?q=<#q#>"
  description?: string | undefined = "google search engine"
  source?: string | undefined = "https://google.com"
}

class Whatmyname extends WebSiteTool {
  availableParamsKey: string[] = ["q"]
  template: string = "https://whatsmyname.app/?q=<#q#>"
  description?: string | undefined = "whatsmyname"
  source?: string | undefined = "https://whatsmyname.app"
}


type toolsIndex = { [name: string]: ExecuteTool & Tool<any> }



export class StoreTool {
  private all: toolsIndex = {
    "holehe": new Holehe(),
    "sherlock": new Sherlock(),
    "google": new Google(),
    "whatmyname": new Whatmyname(),
    "blackbird_email": new BlackbirdEmail(),
    "blackbird_username": new BlackbirdUsername()
  }
  private toolsByIntel: Map<string, toolsIndex> = new Map()
  constructor() {
    this.toolsByIntel = new Map([
      [
        IntelType.EMAIL,
        {
          "holehe": this.all["holehe"],
          "blackbird_email": this.all["blackbird_email"]

        } as toolsIndex

      ],
      [
        IntelType.LOGIN,
        {
          "sherlock": this.all["sherlock"],
          "whatmyname": this.all["whatmyname"],
          "blackbird_username": this.all["blackbird_username"]

        } as toolsIndex
      ],
      [
        IntelType.NAME,
        {
          "whatmyname": this.all["whatmyname"],
          "blackbird_username": this.all["blackbird_username"]
        } as toolsIndex
      ]
    ])
    this.toolsByIntel.forEach((value, key) => {
      const index = this.toolsByIntel.get(key)
      if (index) {
        index["google"] = this.all["google"]
        this.toolsByIntel.set(key, index)
      }
    })
  }


  getToolsName(intelType?: string): string[] {
    if (!intelType) {
      return Object.keys(this.all)
    } else {
      return Object.keys(this.toolsByIntel.get(intelType) ?? {})
    }
  }

  addTool<T>(name: string, tool: Tool<T> & ExecuteTool, category?: IntelType) {
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

  getToolRequest<T>(toolName: string, params: { [key: string]: string }): Tool<T> {
    const currentRequestedPipeline = this.all[toolName]
    if (!currentRequestedPipeline) {
      throw new Error("Unkown pipeline")
    }
    try {
      return currentRequestedPipeline.generateWithParams(params)

    } catch (e) {
      if (e instanceof ToolError) {
        e.pipeline = toolName
      }
      throw e
    }
  }

  getPipeline<T>(name: string): Tool<T> & ExecuteTool {
    return this.all[name]
  }

}



type pipelineResponse = {
  data: string[]
}



export interface ExecuteTool {
  execute(params: { [key: string]: string }): Promise<string[]>
}