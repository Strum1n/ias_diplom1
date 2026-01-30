
FROM python:3.14

WORKDIR /origin/app/backend

COPY requirements.txt /origin/app/backend


RUN pip install --no-cache-dir --upgrade -r /origin/app/backend/requirements.txt


COPY . /origin/app/backend

WORKDIR /origin/

ENV PYTHONPATH=/origin

CMD ["fastapi", "run", "app/backend/main.py", "--port", "80"]