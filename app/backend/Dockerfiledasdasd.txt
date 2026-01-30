FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Сначала копируем только requirements (для кэша)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код
COPY . .

# CMD с корректным путём к main.py
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]