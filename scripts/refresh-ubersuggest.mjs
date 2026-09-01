#!/usr/bin/env node
/**
 * Ubersuggest has no self-serve public REST API for most accounts, so this
 * project treats Ubersuggest as a periodically-refreshed snapshot rather
 * than a live API call from the server.
 *
 * To refresh data/ubersuggest-snapshot.json:
 *   1. Open a Claude Code session with the Ubersuggest MCP connector enabled
 *      (the same one used to seed this file originally).
 *   2. Ask it to pull domain_overview, domain_keywords, domain_top_pages and
 *      backlinks_overview for the target domain and write the result into
 *      data/ubersuggest-snapshot.json in the shape described by
 *      lib/types.ts (UbersuggestData).
 *   3. Commit the updated snapshot.
 *
 * If your Ubersuggest plan is upgraded to an API-enabled tier with a
 * documented REST endpoint and API key, replace the body of this script
 * with real fetch() calls against that endpoint and it will slot into
 * `npm run refresh:ubersuggest` unchanged.
 */

console.log(
  "This project refreshes Ubersuggest data via the Ubersuggest MCP connector inside a Claude Code session, not a standalone API key.\n" +
    "See the comment at the top of this file for the refresh steps, then update data/ubersuggest-snapshot.json directly."
);
