# Backend

This is the backend for SchoolTalk. The main packages used are [Typescript](https://www.typescriptlang.org/), [Express](https://expressjs.com/), [tRPC](https://trpc.io/), [Prisma](https://www.prisma.io/) and [Socket.io](https://socket.io/).

## Run

First generate the prisma types:

```bash
yarn prisma generate
```

Now you can run it

```bash
yarn dev:b
```

## Deploy

To deploy, first create the docker image. Run this command from the root directory.

```bash
docker build -t ghcr.io/psnehanshu/schooltalk_backend:latest .
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
