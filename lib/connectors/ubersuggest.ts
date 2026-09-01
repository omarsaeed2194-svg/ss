import { readFile } from "fs/promises";
import path from "path";
import type { UbersuggestData } from "@/lib/types";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "ubersuggest-snapshot.json");

interface Snapshot {
  domain: string;
  fetchedAt: string;
  overview: UbersuggestData["overview"];
  monthlyTrend: UbersuggestData["monthlyTrend"];
  topKeywords: UbersuggestData["topKeywords"];
  topPages: UbersuggestData["topPages"];
}

/**
 * Ubersuggest has no self-serve public REST API for most accounts, so this
 * dashboard treats it as a periodically-refreshed source: `npm run
 * refresh:ubersuggest` (or the Claude Code session with Ubersuggest MCP
 * access) rewrites data/ubersuggest-snapshot.json, and this connector just
 * serves the latest snapshot on every request.
 */
export async function getUbersuggestData(): Promise<UbersuggestData> {
  try {
    const raw = await readFile(SNAPSHOT_PATH, "utf-8");
    const snapshot: Snapshot = JSON.parse(raw);

    const ageMs = Date.now() - new Date(snapshot.fetchedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    return {
      meta: {
        status: "cached",
        asOf: snapshot.fetchedAt,
        message:
          ageDays > 14
            ? `Snapshot is ${Math.round(ageDays)} days old — run "npm run refresh:ubersuggest" to update.`
            : undefined,
      },
      overview: snapshot.overview,
      monthlyTrend: snapshot.monthlyTrend,
      topKeywords: snapshot.topKeywords,
      topPages: snapshot.topPages,
    };
  } catch (err) {
    return {
      meta: {
        status: "error",
        asOf: new Date().toISOString(),
        message: err instanceof Error ? err.message : "Failed to read Ubersuggest snapshot",
      },
      overview: {
        organicTraffic: 0,
        organicKeywords: 0,
        domainAuthority: 0,
        backlinks: 0,
        referringDomains: 0,
        followBacklinks: 0,
        noFollowBacklinks: 0,
      },
      monthlyTrend: [],
      topKeywords: [],
      topPages: [],
    };
  }
}
