FROM python:3.14-slim

# Устанавливаем uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /origin/app/backend

# Копируем зависимости
COPY pyproject.toml .

# Устанавливаем пакеты глобально (без --no-install-project)
RUN uv pip install --system .

# Копируем код
COPY app/backend/ /origin/app/backend

WORKDIR /origin/

ENV PYTHONPATH=/origin

EXPOSE 8000

# fastapi будет доступен глобально
CMD ["fastapi", "run", "app/backend/main.py", "--port", "8000"]