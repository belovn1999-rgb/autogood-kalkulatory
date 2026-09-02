# AUTOGOOD API — mobile.de import + PartsLink24 VIN checks.
#
# Built on Microsoft's Playwright image because a VIN check drives a real
# Chromium: that image already carries the browser and the pile of system
# libraries it needs, pinned to the same Playwright version as package.json.
# Keep the tag and the dependency in step — a mismatch makes Playwright download
# a second browser at runtime, inside a container that has no business writing
# to disk.
FROM mcr.microsoft.com/playwright:v1.61.0-jammy

# Fonts the generated PDFs rely on. The base image is deliberately thin on
# these, and a missing face shows up as tofu in a customer-facing document
# rather than as an error anyone would notice in CI.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        fonts-liberation \
        fonts-dejavu \
        fonts-crosextra-carlito \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies first so a source-only change reuses this layer.
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10 --activate \
    && pnpm install --frozen-lockfile --prod

COPY server ./server
COPY tools ./tools
COPY src ./src
COPY assets ./assets
# calculators.html loads React and html2canvas from here rather than a CDN.
COPY vendor ./vendor
COPY *.html tokens.css ./

# The defaults in the code point at ~/Library/Application Support — a macOS path
# that means nothing here. Both directories are mount points: the profile holds
# the live PartsLink24 session, and losing it on every deploy would mean a fresh
# login each time, which is slower and far more conspicuous to PartsLink24 than
# a stable session.
ENV PARTSLINK24_PROFILE_DIR=/data/partslink24-profile \
    PARTSLINK24_OUTPUT_DIR=/data/partslink24-output \
    HOST=0.0.0.0 \
    PORT=8790 \
    NODE_ENV=production

RUN mkdir -p /data/partslink24-profile /data/partslink24-output \
    && chown -R pwuser:pwuser /data /app
VOLUME ["/data"]

# The base image ships this unprivileged user; Chromium should not run as root.
USER pwuser

EXPOSE 8790

# Liveness only. /health reports the PartsLink24 capability separately, so a
# missing credential shows up in the response rather than as a restart loop that
# hides the reason.
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8790)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Credentials arrive at run time (--env-file or Docker secrets), never baked in.
CMD ["node", "server/autogood-api.mjs"]
