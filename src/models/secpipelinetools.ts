import { Node } from 'yaml'

export declare interface Template {
  name: string;
  description: string;
  version: string;
  author: string;
  stages: { [key: string]: Stage };
}

export declare interface Stage {
  parents?: string[];
  pluginPath?: string;
  plugin: string;
  config?: { [key: string]: any };
  pipe?: { [key: string]: any }[];
}