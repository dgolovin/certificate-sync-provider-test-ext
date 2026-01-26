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
RUN npm run build

# Final stage - minimal image with just the extension files
FROM scratch

LABEL org.opencontainers.image.title="Certificate Sync Provider Test" \
      org.opencontainers.image.description="Test extension to verify certificate sync trust model for external extensions" \
      org.opencontainers.image.vendor="Test" \
      io.podman-desktop.api.version=">= 1.10.0"

COPY --from=builder /build/dist/extension.cjs /extension/dist/extension.cjs
COPY package.json /extension/
COPY icon.png /extension/
