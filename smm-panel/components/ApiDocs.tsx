const ACTIONS: { action: string; title: string; params: [string, string][]; example: string }[] = [
  {
    action: "services",
    title: "Service list",
    params: [],
    example: `[
  {
    "service": 1,
    "name": "Instagram Followers",
    "type": "Default",
    "category": "Instagram Followers",
    "rate": "0.9000",
    "min": "50",
    "max": "10000",
    "refill": true,
    "cancel": false
  }
]`,
  },
  {
    action: "add",
    title: "Add order",
    params: [
      ["service", "Service ID"],
      ["link", "Link to page or post"],
      ["quantity", "Needed quantity (Default services)"],
      ["comments", "Comments, one per line (Custom Comments services)"],
    ],
    example: `{ "order": 23501 }`,
  },
  {
    action: "status",
    title: "Order status",
    params: [
      ["order", "Order ID"],
      ["orders", "Or up to 100 order IDs, comma separated"],
    ],
    example: `{
  "charge": "0.27819",
  "start_count": "3572",
  "status": "Partial",
  "remains": "157",
  "currency": "USD"
}`,
  },
  {
    action: "refill",
    title: "Request refill",
    params: [
      ["order", "Order ID"],
      ["orders", "Or up to 100 order IDs, comma separated"],
    ],
    example: `{ "refill": "1" }`,
  },
  {
    action: "refill_status",
    title: "Refill status",
    params: [
      ["refill", "Refill ID"],
      ["refills", "Or up to 100 refill IDs, comma separated"],
    ],
    example: `{ "status": "Completed" }`,
  },
  {
    action: "cancel",
    title: "Cancel orders",
    params: [["orders", "Up to 100 order IDs, comma separated"]],
    example: `[
  { "order": 9, "cancel": 1 },
  { "order": 2, "cancel": { "error": "This service doesn't support cancellation." } }
]`,
  },
  {
    action: "balance",
    title: "User balance",
    params: [],
    example: `{ "balance": "100.84292", "currency": "USD" }`,
  },
];

export function ApiDocs({ endpoint, apiKey }: { endpoint: string; apiKey?: string }) {
  return (
    <div className="stack">
      <div className="card">
        <div className="card-body stack-sm">
          <table className="table">
            <tbody>
              <tr>
                <td className="muted" style={{ width: 180 }}>API URL</td>
                <td className="mono break">{endpoint}</td>
              </tr>
              <tr>
                <td className="muted">HTTP method</td>
                <td>POST (form fields or JSON)</td>
              </tr>
              <tr>
                <td className="muted">Response format</td>
                <td>JSON — failures return {`{"error": "..."}`}</td>
              </tr>
              <tr>
                <td className="muted">API key</td>
                <td>{apiKey ? <span className="mono break">{apiKey}</span> : "Sign in and open the API page in your dashboard"}</td>
              </tr>
            </tbody>
          </table>
          <pre>{`curl -X POST ${endpoint} \\
  -d key=${apiKey || "YOUR_API_KEY"} \\
  -d action=add -d service=1 -d link=https://instagram.com/yourpage -d quantity=1000`}</pre>
        </div>
      </div>
      {ACTIONS.map((a) => (
        <div className="card" key={a.action} id={a.action}>
          <div className="card-head">
            <h2>{a.title}</h2>
            <code className="badge badge-primary">action={a.action}</code>
          </div>
          <div className="card-body grid-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono">key</td>
                  <td>Your API key</td>
                </tr>
                <tr>
                  <td className="mono">action</td>
                  <td>{a.action}</td>
                </tr>
                {a.params.map(([k, d]) => (
                  <tr key={k}>
                    <td className="mono">{k}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="stack-sm">
              <span className="muted small" style={{ fontWeight: 600 }}>
                Example response
              </span>
              <pre>{a.example}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
