FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# kindlegen Linux binary. The original GitHub mirror may disappear, so we try
# a small list of URLs and stop at the first one that works.
ARG KINDLEGEN_URL=https://github.com/knopp/kindlegen/releases/download/v2.9/kindlegen_linux_2.9.tar.gz
ARG KINDLEGEN_FALLBACK_URL=https://archive.org/download/kindlegen_linux_2_6_i386_v2_9/kindlegen_linux_2.6_i386_v2_9.tar.gz
RUN set -eux; \
    for url in "$KINDLEGEN_URL" "$KINDLEGEN_FALLBACK_URL"; do \
      if curl -fL "$url" -o /tmp/kindlegen.tar.gz; then \
        break; \
      fi; \
    done; \
    tar -xzf /tmp/kindlegen.tar.gz -C /usr/local/bin kindlegen; \
    chmod +x /usr/local/bin/kindlegen; \
    rm /tmp/kindlegen.tar.gz

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
