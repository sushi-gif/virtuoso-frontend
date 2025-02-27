# Virtuoso WebApp Frontend

## Overview
Virtuoso WebApp is an application that enables users to interact with the Kubernetes API seamlessly. It provides a user-friendly interface for handling virtual machines (VM) running within your k8s cluster with the assistance of Claude AI.

## Features
- Connects with the Kubernetes API for resource management
- Simplifies VM creation and management
- Leverages Claude AI for intelligent assistance
- Intuitive UI for efficient workflow

## Technology Stack
- **Frontend:** React (TSX)
- **State Management:** Context API / Redux (if needed)
- **API Communication:** Fetch / Axios
- **Containerization:** Docker
- **Deployment:** Kubernetes

## Environment Variables
The frontend requires the following environment variable:

- `REACT_APP_API_ENDPOINT`: The API endpoint for backend communication

## Setup and Usage
### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation
```sh
npm install
```

### Running the App
```sh
npm start
```

### Building for Production
```sh
npm run build
```

## Deployment
This frontend can be deployed using Docker and Kubernetes. Below is an example workflow:

### Docker Build
```sh
docker build -t virtuoso-frontend .
```
