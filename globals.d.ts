// Global type definitions and fallback shims for local development
// This allows VS Code to work without red squiggles even if node_modules is not yet installed locally.

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
    [key: string]: any;
  }
}

declare const process: NodeJS.Process;

declare module 'express' {
  export interface Request {
    body: any;
    query: any;
    params: any;
    headers: any;
    [key: string]: any;
  }
  export interface Response {
    status(code: number): this;
    json(body: any): this;
    send(body: any): this;
    setHeader(name: string, value: any): this;
    end(chunk?: any): this;
    [key: string]: any;
  }
  export interface Express {
    use(...args: any[]): this;
    get(path: string, ...handlers: any[]): this;
    post(path: string, ...handlers: any[]): this;
    listen(port: number | string, cb?: () => void): any;
    [key: string]: any;
  }
  const express: any;
  export default express;
}

declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options?: any);
    models: any;
    chats: any;
    [key: string]: any;
  }
}

declare module 'cors' {
  const cors: any;
  export default cors;
}

