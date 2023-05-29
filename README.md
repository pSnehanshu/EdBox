# schooltalk

Communication app for teachers, students, parents, and administration.

This is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces/). First, [install Yarn](https://yarnpkg.com/getting-started/install). Make sure you install version 3.3.1 or higher.

This repo is configured to use [Zero-Installs](https://yarnpkg.com/features/zero-installs). That means, all the dependecies (including Yarn) are checked into git, and the you don't need to download
packages from NPM.

## Setup

Make sure to run this first:

```bash
yarn install
```

## Apps

This project contains two apps:

1. [Backend](apps/backend/README.md)
2. [App](apps/app/README.md)
