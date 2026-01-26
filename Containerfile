#
# Copyright (C) 2026 Red Hat, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0

# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json vite.config.js ./
COPY src/ ./src/
COPY icon.png ./
RUN npm run build

# Prepare extension directory with only required files
RUN mkdir -p /extension/dist && \
    cp dist/extension.cjs /extension/dist/ && \
    cp icon.png /extension/ && \
    node -e "const p=require('./package.json'); delete p.scripts; delete p.devDependencies; console.log(JSON.stringify(p,null,2))" > /extension/package.json

# Final stage - minimal image with just the extension files
FROM alpine:3.20 AS final

LABEL org.opencontainers.image.title="Certificate Sync Provider Test" \
      org.opencontainers.image.description="Test extension to verify certificate sync trust model for external extensions" \
      org.opencontainers.image.vendor="Test" \
      io.podman-desktop.api.version=">= 1.10.0"

COPY --from=builder /extension /extension
