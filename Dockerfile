FROM ghcr.io/puppeteer/puppeteer:22.7.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD npm run dev -- Natalie Baker && \
    npm run dev -- Joel Orion && \
    npm run dev -- Osberg Conrad && \
    npm run dev -- Mateo Sanchez && \
    npm run dev -- Nate Palmer