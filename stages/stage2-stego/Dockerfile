FROM python:3.11-alpine

WORKDIR /app

# Copy server script
COPY server.py .

# Copy assets and guarantee passphrase.txt is completely purged from container
COPY assets/ ./assets/
RUN rm -f /app/assets/passphrase.txt /app/assets/passphrase

EXPOSE 5000

ENV PYTHONUNBUFFERED=1

CMD ["python", "server.py"]
