import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type PressRangerConfig = { ownerUid?: string; token?: string };
type Probe = (token: string) => Promise<void>;

class PressRangerProbeError extends Error {
  constructor(readonly diagnosis: string) {
    super("Press Ranger connection check failed");
  }
}

export async function inspectCapabilities(token: string, request: typeof fetch = fetch) {
  const client = new Client({ name: "MyUSA Sage PR", version: "1.0.0" });
  let lastStatus: number | undefined;
  let step: "initialization" | "capability lookup" = "initialization";
  const transport = new StreamableHTTPClientTransport(new URL("https://pressranger.com/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${token}` }, redirect: "manual" },
    fetch: async (input, init) => {
      // Use the SDK's abort signal. The request timeout below covers each MCP call.
      const response = await request(input, { ...init, redirect: "manual" });
      if (init?.method === "POST") lastStatus = response.status;
      if (response.status >= 300 && response.status < 400) {
        await response.body?.cancel();
        throw new Error("Press Ranger redirected the request");
      }
      return response;
    },
  });
  try {
    await client.connect(transport, { timeout: 8_000 });
    step = "capability lookup";
    lastStatus = undefined;
    await client.listTools(undefined, { timeout: 8_000 });
  } catch (error) {
    const status = lastStatus !== undefined ? `HTTP ${lastStatus}` : "no HTTP response";
    const timedOut = error instanceof Error && /timed?\s*out|timeout/i.test(error.message);
    const transportError = error instanceof TypeError && lastStatus === undefined;
    const detail = timedOut ? "timeout" : transportError ? "network error" : status;
    throw new PressRangerProbeError(`Press Ranger ${step}: ${detail}.`);
  } finally {
    await client.close().catch(() => {});
  }
}

export async function probePressRanger(
  userId: string,
  config: PressRangerConfig,
  audit: () => Promise<void>,
  probe: Probe = inspectCapabilities,
) {
  if (!config.ownerUid || userId !== config.ownerUid) return "restricted";
  const token = config.token?.trim();
  if (!token) return "unconfigured";
  try {
    await audit();
    await probe(token);
    return "connected";
  } catch (error) {
    return error instanceof PressRangerProbeError ? error.diagnosis : "unavailable";
  }
}
