import { google } from "googleapis";

const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}. See .env.example for setup.`);
  }
  return value;
}

function credentials() {
  return {
    clientId: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
    clientSecret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
  };
}

/** Client used for the interactive consent redirect + code exchange. */
function createRedirectClient(baseUrl: string) {
  const { clientId, clientSecret } = credentials();
  return new google.auth.OAuth2(clientId, clientSecret, `${baseUrl}/api/auth/google/callback`);
}

export function getAuthUrl(baseUrl: string, state: string): string {
  const client = createRedirectClient(baseUrl);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // forces Google to reissue a refresh_token every time
    scope: SCOPES,
    state,
  });
}

export async function exchangeCode(baseUrl: string, code: string) {
  const client = createRedirectClient(baseUrl);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  let email: string | undefined;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const { data } = await oauth2.userinfo.get();
    email = data.email ?? undefined;
  } catch {
    // Non-fatal — email is only used for display on the Connect page.
  }

  return { tokens, email };
}

/** Client used for actual API calls, authenticated via a stored refresh token. */
export function clientFromRefreshToken(refreshToken: string) {
  const { clientId, clientSecret } = credentials();
  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}
