# ft_transcendence

ft_transcendence is a full-stack web application developed as part of the 42 Network curriculum. The project is fully containerized using Docker to ensure a consistent environment for all team members.

---

## 📦 Requirements
- Docker
- Docker Compose (v2 recommended)

### Install Docker on Linux
```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and log back in after adding yourself to the docker group.
docker --version
docker compose version
```

📥 Clone the project:
```bash
git clone git@github.com:lamed0/Ft_Transcendence.git
cd ft_transcendence
```

🚀 Start the project:
```bash
make   # foreground docker compose up --build
```

🌐 Access services:
- Backend API: http://localhost:3001

🛑 Stop the project:
```bash
make down
```

♻️ Reset everything (including database):
```bash
make clean-volumes
make
```

#### 📦 Adding a new service
1. Create the service folder (e.g., `front-end/`) with its own `Dockerfile`.
2. Add the service to `docker-compose.yml`:
```yaml
services:
  front-end:
    build: ./front-end
    container_name: frontend
    ports:
      - "8080:80"   # host:container
    depends_on:
      - back-end
```
3. Ensure the service listens on `0.0.0.0` so other containers/host can reach it.
4. Add required environment variables under `environment:` or via a referenced `.env` file.
5. Rebuild and start with logs visible:
```bash
make up
# or just rebuild that service

docker compose -f ./docker-compose.yml up --build front-end
```
6. Verify:
```bash
docker compose ps
docker compose logs <service>
```
