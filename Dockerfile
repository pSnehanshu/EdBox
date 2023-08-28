FROM node:18.14-slim as base
RUN corepack enable
WORKDIR /var/www

###############
# BUILD STAGE #
###############
FROM base as build

# Copy package.json and tsconfig.json files
COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/app/package.json apps/app/tsconfig.json ./apps/app/
COPY apps/backend/package.json apps/backend/tsconfig.json ./apps/backend/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/web/package.json apps/web/tsconfig.json apps/web/tsconfig.node.json ./apps/web/

# Install dependencies
RUN yarn

# Copy shared, backend, and web files
COPY . .

# Build prisma
RUN yarn prisma generate
# Build Web
RUN cd apps/web && VITE_BACKEND_URL=/api NODE_ENV=production yarn build
# Build shared
RUN yarn workspace schooltalk-shared run build
# Build backend
RUN yarn workspace schooltalk-backend run build && find packages/shared/ -type f -name "*.ts" -delete

# Install dependencies again but only production
RUN yarn workspaces focus schooltalk-backend --production

###############
# FINAL STAGE #
###############
FROM base

# Copy output files from build stage
COPY --from=build /var/www/packages/shared ./packages/shared
COPY --from=build /var/www/apps/backend/build ./apps/backend
COPY --from=build /var/www/apps/web/dist ./apps/web/dist
COPY --from=build /var/www/node_modules node_modules

# Copy yarn files and others
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins
COPY .yarnrc.yml package.json yarn.lock ./
COPY apps/backend/package.json apps/backend/
COPY apps/backend/prisma apps/backend/prisma
COPY apps/backend/assets apps/backend/assets

EXPOSE 5080
ENV NODE_ENV=production

# Migrate and start
CMD yarn workspace schooltalk-backend run migrate \
  && yarn node apps/backend/server.js
