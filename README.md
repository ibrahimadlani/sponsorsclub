# Fibonacci
A straightforward web solution for computing and tracking Fibonacci sequences. Secure login, instant random sequence generation, and a history feature.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)

## Installation

To get started with the application, follow these steps:

1. **Clone the repository:**
   
   First, clone the repository to your local machine using Git:

   ```bash
   git clone https://github.com/ibrahimadlan/fib50.git
   cd fib50

To get started with the application, follow these steps:

2. **Environment File:**
   
   Create a `.env` file in the `./back` directory of the project. This file will store all your environment-specific variables such as database URLs, secret keys, API keys, etc.

   Example `.env` file:

   ```plaintext
      DEBUG=1
  
      DJANGO_SUPERUSER_USERNAME=admin
      DJANGO_SUPERUSER_PASSWORD=admin
      DJANGO_SUPERUSER_EMAIL=admin@deezer.com
      DJANGO_SECRET_KEY=key
      
      POSTGRES_READY=0
      POSTGRES_DB=devdb
      POSTGRES_PASSWORD=changeme
      POSTGRES_USER=devuser
      POSTGRES_HOST=database
      POSTGRES_PORT=5432
   ```

3. **Build and run with Docker:**
   
   Ensure that you have Docker and Docker Compose installed on your machine. Then, run the following command to build and start the application using Docker:

   ```bash
   docker-compose build
    ```
   
## Running the Application
Once you've installed and configured the application, follow these steps to get it up and running on your local machine.

### Starting the Application

To start the application, navigate to the root directory of the project where the `docker-compose.yml` file is located and run the following command:

```bash
docker-compose up
```

### Accessing the Application

After the containers are up and running, you can access the application through your web browser. If you're running everything with default settings, the URLs might look like this:

- **React Application:** [http://localhost:3000](http://localhost:3000)
- **Django Backend API:** [http://localhost:8001](http://localhost:8001)

### Stopping the Application

To stop the application, press `Ctrl + C` in the terminal where the containers are running. If you want to stop and remove all Docker containers, networks, and volumes created by `docker-compose up`, you can run:

```bash
docker-compose down
```
