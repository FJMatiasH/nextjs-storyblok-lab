import JSDOMEnvironment from "jest-environment-jsdom";

// jsdom hides the web-standard globals that Node already provides. next/cache
// (imported by the Storyblok registry in src/lib/storyblok.ts) needs some of
// them at load time, so expose Node's own implementations. Nothing is mocked.
const nodeGlobals = [
  "TextEncoder",
  "TextDecoder",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
  "Request",
  "Response",
  "Headers",
  "fetch",
  "structuredClone",
];

export default class NodeWebJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    for (const name of nodeGlobals) {
      if (this.global[name] === undefined && globalThis[name] !== undefined) {
        this.global[name] = globalThis[name];
      }
    }
  }
}
