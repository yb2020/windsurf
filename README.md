# Cloudflare Fullstack App

This is a fullstack application built with React (Cloudflare Pages) and Cloudflare Workers.

## Project Structure

```
/
├── public/          # Static files for Pages
├── src/            # React application source
├── workers/        # Cloudflare Workers source
└── wrangler.toml   # Cloudflare Workers configuration
```

## Prerequisites

Make sure you have [pnpm](https://pnpm.io/) installed on your system. If not, you can install it using:

```bash
npm install -g pnpm
```

## Installation

```bash
pnpm install
```

## Development

You can run both the frontend and worker in development mode:

```bash
# Run both frontend and worker
pnpm dev

# Run frontend only
pnpm start

# Run worker only
pnpm worker:dev
```

## Deployment

### Deploy Everything

To deploy both the frontend and worker:

```bash
pnpm deploy
```

### Deploy Separately

1. Deploy Pages (Frontend):

   ```bash
   pnpm build
   ```

   Then push to your GitHub repository. Cloudflare Pages will automatically deploy.

2. Deploy Worker:
   ```bash
   pnpm worker:deploy
   ```

## Configuration

### Cloudflare Pages

Configure in the Cloudflare Dashboard:

- Build command: `pnpm build`
- Build output directory: `build`
- Environment variables:
  - `NODE_VERSION`: `18`

### Cloudflare Workers

Configuration is in `wrangler.toml`. Update the following fields:

- `name`: Your worker name
- `account_id`: Your Cloudflare account ID (if needed)
- `route`: Your domain route (if needed)
