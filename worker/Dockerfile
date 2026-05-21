FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# kindlegen Linux binary — download at build time or mount locally.
# Place kindlegen binary at worker/kindlegen before docker build, or set KINDLEGEN_URL build arg.
ARG KINDLEGEN_URL=https://github.com/knopp/kindlegen/releases/download/v2.9/kindlegen_linux_2.9.tar.gz
RUN curl -fsSL "$KINDLEGEN_URL" -o /tmp/kindlegen.tar.gz \
    && tar -xzf /tmp/kindlegen.tar.gz -C /usr/local/bin kindlegen \
    && chmod +x /usr/local/bin/kindlegen \
    && rm /tmp/kindlegen.tar.gz

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
