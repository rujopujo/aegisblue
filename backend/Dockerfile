FROM python:3.12-slim

WORKDIR /app

# Set Python environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AEGISBLUE_DB_PATH=/app/data/aegisblue.db

# Install dependencies cleanly
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create persistent data directory for SQLite
RUN mkdir -p /app/data

# Copy backend application source
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
