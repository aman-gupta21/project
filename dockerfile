FROM python:3.10-slim

# Install system dependencies for building Python packages and pdfplumber
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpoppler-cpp-dev \
    pkg-config \
    poppler-utils \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Ensure flask_cors is included
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir flask_cors

# Copy your application code
COPY model.pkl .
COPY app.py .
COPY UpdatedResumeDataSet.csv .
COPY companies.csv .

# Expose port
EXPOSE 5000

# Start the app
CMD ["python", "app.py"]
