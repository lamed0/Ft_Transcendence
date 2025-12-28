NAME = ft_transcendence

DOCKER_COMPOSE = docker compose -f ./docker-compose.yml
DATA_PATH = ./data

# Default target
all: up

# Build and start containers in the foreground
up:
	@$(DOCKER_COMPOSE) up --build

# Optional: detached mode if you still need it
up-detached:
	@$(DOCKER_COMPOSE) up -d --build

# Stop containers
down:
	@$(DOCKER_COMPOSE) down

# Full clean: stop containers, remove networks
fclean: down
	@docker network prune -f

# Clean data volumes only (PostgreSQL)
clean-volumes:
	@echo "⚠️  WARNING: This will remove ALL database data!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read dummy
	@$(DOCKER_COMPOSE) down
	@rm -rf $(DATA_PATH)
	@echo "All volume data removed!"

# Rebuild everything from scratch
re: fclean all

# Show running containers
ps:
	@$(DOCKER_COMPOSE) ps

# Show logs
logs:
	@$(DOCKER_COMPOSE) logs -f

.PHONY: all up up-detached down fclean clean-volumes re ps logs
