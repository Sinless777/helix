# Cloudflare deployment notes

This folder contains the Wrangler configuration, Worker entry-point, and
container scaffolding needed to deploy Helix to Cloudflare Workers.

- `wrangler.toml` defines the `helix-worker` script, binds the
  `helix-events` queue, and exposes a `HELIX_EVENTS` queue binding for
  producing messages from the Worker.
- `src/index.ts` implements the Worker `fetch` handler (with a basic health
  probe) and a queue consumer that acknowledges messages. Replace the console
  output with production logic when ready.
- `container.ts` wires up the Grafana Alloy container using the snippet
  provided in the requirements. Set the `MY_CONTAINER` binding in Wrangler to
  point at your container resource.

### Queue provisioning

Create the queue once via Wrangler:

```bash
pnpm wrangler queues create helix-events --config cloudflare/wrangler.toml
```

### Grafana Alloy container

Use the supplied install script when you have network access:

```bash
GCLOUD_HOSTED_METRICS_ID="2320471" \
GCLOUD_HOSTED_METRICS_URL="https://prometheus-prod-36-prod-us-west-0.grafana.net/api/prom/push" \
GCLOUD_HOSTED_LOGS_ID="1155913" \
GCLOUD_HOSTED_LOGS_URL="https://logs-prod-021.grafana.net/loki/api/v1/push" \
GCLOUD_FM_URL="https://fleet-management-prod-014.grafana.net" \
GCLOUD_FM_POLL_FREQUENCY="60s" \
GCLOUD_FM_HOSTED_ID="1198114" \
ARCH="amd64" \
GCLOUD_RW_API_KEY="<API KEY HERE>" \
/bin/sh -c "$(curl -fsSL https://storage.googleapis.com/cloud-onboarding/alloy/scripts/install-linux.sh)"
```

Remember to substitute the sensitive API key before running the script.
