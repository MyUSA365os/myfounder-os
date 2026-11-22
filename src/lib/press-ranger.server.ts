import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type PressRangerConfig = { ownerUid?: string; token?: string };
type Probe = (token: string) => Promise<void>;

async function inspectCapabilities(token: string) {
  const client = new Client({ name: "MyUSA Sage PR", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL("https://pressranger.com/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${token}` }, redirect: "error" },
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        signal: init?.signal
          ? AbortSignal.any([init.signal, AbortSignal.timeout(8_000)])
          : AbortSignal.timeout(8_000),
      }),
  });
  try {
    await client.connect(transport, { timeout: 8_000 });
    await client.listTools(undefined, { timeout: 8_000 });
  } finally {
    await client.close();
  }
}

export async function probePressRanger(
  userId: string,
  config: PressRangerConfig,
  audit: () => Promise<void>,
  probe: Probe = inspectCapabilities,
) {
  if (!config.ownerUid || userId !== config.ownerUid) return "restricted";
  if (!config.token?.trim()) return "unconfigured";
  try {
    await audit();
    await probe(config.token);
    return "connected";
  } catch {
    return "unavailable";
  }
}
