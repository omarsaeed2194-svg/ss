import { regenerateApiKey } from "@/app/actions/account";
import { ApiDocs } from "@/components/ApiDocs";
import { CopyButton } from "@/components/CopyButton";
import { RowAction } from "@/components/RowAction";
import { requireUser } from "@/lib/auth";
import { baseUrl } from "@/lib/url";

export const metadata = { title: "API" };

export default async function ApiPage() {
  const user = await requireUser();
  const endpoint = `${baseUrl()}/api/v2`;
  return (
    <>
      <div className="page-head">
        <div>
          <h1>API</h1>
          <p>Connect your own panel, bot or app. Standard SMM panel API v2.</p>
        </div>
      </div>
      <div className="card card-body row-between">
        <div className="grow">
          <div className="muted small" style={{ fontWeight: 600 }}>
            Your API key
          </div>
          <div className="mono break" style={{ fontSize: "1.05rem", marginTop: 4 }}>
            {user.api_key}
          </div>
        </div>
        <div className="row">
          <CopyButton text={user.api_key} />
          <RowAction
            action={regenerateApiKey}
            fields={{}}
            label="Generate new key"
            confirm="Generate a new key? Anything using the current key will stop working."
          />
        </div>
      </div>
      <ApiDocs endpoint={endpoint} apiKey={user.api_key} />
    </>
  );
}
