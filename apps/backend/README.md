# Backend

This is the backend for SchoolTalk. The main packages used are [Typescript](https://www.typescriptlang.org/), [Express](https://expressjs.com/), [tRPC](https://trpc.io/), [Prisma](https://www.prisma.io/) and [Socket.io](https://socket.io/).

## Run

First generate the prisma types:

```bash
yarn prisma generate
```

Now you can run it

```bash
yarn dev:backend
```

## Deploy

To deploy, first create the docker image. Run this command from the root directory.

```bash
docker build -t ghcr.io/psnehanshu/schooltalk_backend:latest -f ./Dockerfile.backend .
```

Then push it to the registry.

```bash
docker push ghcr.io/psnehanshu/schooltalk_backend:latest
```

To run it:

```bash
docker run \
  -p 5080:5080 \
  -e DATABASE_URL="postgresql://user:password@hostname:5432/dbname?schema=public" \
  --name schooltalk -d \
  ghcr.io/psnehanshu/schooltalk_backend:latest
```

## Deploy to Fly.io

First, authenticate with GitHub registry using [personal access token](https://github.com/settings/tokens). Required permission is `read:packages`.

The pull the image locally:

```bash
docker pull ghcr.io/psnehanshu/schooltalk_backend:main
```

Then,

- [Install flyctl](https://fly.io/docs/hands-on/install-flyctl/)
- [login to flyctl](https://fly.io/docs/getting-started/log-in-to-fly/).
- Push to Fly.io using:

```bash
fly deploy --local-only
```
