# Installation & Setup Guide: E-Commerce Portal & DevOps Stack

This guide will walk you through installing the necessary tools and setting up the Jenkins pipeline for your project.

## 1. Install Prerequisites

### Step A: Install Docker Desktop
Since Docker is not currently detected on your system, you must install it to run the application and the ELK stack.
1. Download **Docker Desktop for Windows** from [docker.com](https://www.docker.com/products/docker-desktop/).
2. Run the installer and ensure "Use WSL 2 instead of Hyper-V" is checked (recommended).
3. Restart your computer if prompted.
4. Open Docker Desktop and wait until the status icon in the bottom left turns **green**.

### Step B: Install Git
If you haven't already:
1. Download Git from [git-scm.com](https://git-scm.com/).
2. Install with default settings.
3. Verify by opening PowerShell and typing `git --version`.

---

## 2. Setup Jenkins (in Docker)

The easiest way to run Jenkins with Docker access on Windows is to run it as a container that can talk to the host's Docker socket.

1. Create a network for Jenkins:
   ```powershell
   docker network create jenkins
   ```
2. Run the Jenkins Blue Ocean container:
   ```powershell
   docker run --name jenkins-blueocean --restart=always --detach `
     --network jenkins --env DOCKER_HOST=tcp://docker:2376 `
     --env DOCKER_CERT_PATH=/certs/client --env DOCKER_TLS_VERIFY=1 `
     --publish 8080:8080 --publish 50000:50000 `
     --volume jenkins-data:/var/jenkins_home `
     --volume jenkins-docker-certs:/certs/client:ro `
     jenkins/jenkins:lts
   ```
3. **Get Initial Password**:
   Run this command to see the lock code:
   ```powershell
   docker logs jenkins-blueocean
   ```
4. Go to `http://localhost:8080` in your browser and paste the code.
5. Select **"Install Suggested Plugins"**.

---

## 3. Configure Jenkins for the Portal

### Step A: Install Docker Plugins
1. Inside Jenkins, go to **Manage Jenkins** > **Plugins** > **Available Plugins**.
2. Search and install:
   - `Docker`
   - `Docker Pipeline`
   - `Blue Ocean`
3. Restart Jenkins if prompted.

### Step B: Create the Pipeline
1. Click **New Item**.
2. Enter Name: `Ecommerce-Pipeline`.
3. Select **Pipeline** and click OK.
4. Scroll down to the **Pipeline** section:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/prabin982/devopslab.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**.

---

## 4. Deploy the Stack Manually

While Jenkins is setting up, you can run the portal and ELK stack immediately:

1. Open PowerShell in the `ecommerce-portal` folder.
2. Run the deployment script I created for you:
   ```powershell
   .\scripts\deploy.ps1
   ```
   *Note: If you get a script execution error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.*

---

## 5. View Your Results

| Service | URL | Purpose |
| :--- | :--- | :--- |
| **Ecommerce Web** | `http://localhost:5000` | Browse, buy, and track orders. |
| **Kibana Logs** | `http://localhost:5601` | Monitor server logs and errors. |
| **Jenkins** | `http://localhost:8080` | View CI/CD build status. |
| **Health Check** | `http://localhost:5000/api/health` | Diagnostic endpoint for health. |

---

**Note**: Docker Desktop on Windows may need at least 4GB of RAM allocated to run Elasticsearch smoothly. Adjust this in **Docker Settings > Resources**.
