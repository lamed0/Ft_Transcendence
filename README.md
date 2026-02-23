This project has been created as part of the 42 curriculum by mlamrani, ziel-hac, rbenmakh, and aech-chi.
🕹️ Description

Project Name: 27ft_transcendence

The goal of this project is to build a high-end, real-time multiplayer Pong platform. Unlike traditional web apps, this project focuses on a Microservices architecture to ensure scalability, security, and low-latency gameplay. It features a retro "Pixel-Art" aesthetic powered by modern web technologies.

Key Features:

    Microservices Architecture: Decoupled services for game logic, user management, and chat.

    Real-time Pong: Competitive matches with live data synchronization.

    Social Integration: OAuth 42 login, friend management, and instant messaging.

    Security First: Integrated Vault for secrets, WAF for protection, and GDPR compliance.

🛠 Instructions
Prerequisites

    Docker & Docker Compose (Required for containerization)

    Node.js v20+

    Environment Variables: Create a .env file in all services, for more details contact the admin.
    

Installation & Execution

    Clone and Enter:
    Bash

    git clone https://github.com/SegfaultSec/pingpong.git
    cd ft_transcendence

    Launch via Docker:
    Bash

    make up-build

    Access: Open https://localhost

👥 Team Information

Member	Role	Responsibilities
mlamrani	Tech Lead / Backend	NestJS Architecture, Microservices orchestration, Database design (Prisma), and OAuth 42 integration.
ziel-hac	Frontend Lead	React.js implementation, Tailwind CSS styling, State management, and UI/UX pixel-art design.
rbenmakh	Game Engine Dev	Game server logic, physics engine synchronization, and real-time WebSocket communication.
aech-chi	Security Engineer	2FA (TOTP), Web Application Firewall (WAF) setup, GDPR compliance, and Hashicorp Vault integration.


📅 Project Management

    Organization: We followed a Scrum framework with bi-weekly internal demos.

    Tools: GitHub Issues were used for the backlog, and Trello for visual sprint tracking.

    Communication: Discord served as our main war room for technical discussions and daily stand-ups.

💻 Technical Stack

    Frontend: React.js + Tailwind CSS (Custom pixel-font implementation).

    Backend: NestJS (Node.js framework) chosen for its modularity and first-class TypeScript support.

    Database: PostgreSQL managed via Prisma ORM. We chose Prisma for its type-safety and ease of schema migrations.

    Security: Hashicorp Vault (Secrets), 2FA, and a custom WAF layer.

    Communication: WebSockets (Socket.io) for game and chat events.

📊 Database Schema

Our relational structure is handled by Prisma:

    User: Stores profile data, OAuth tokens, and 2FA status.

    Match: Records scores, duration, and player relations.

    Relationship: Manages friend requests.

🧩 Modules & Points


- [Minor] Use a frontend framework: React, Tailwind CSS.
- [Minor] Use a backend framework: Express, Fastify, NestJS, Django, etc.
- [Major] Implement real-time features: WebSockets, real-time updates, efficient broadcasting.
- [Major] Public API: Secured API key, rate limiting, documentation, at least 5 endpoints.
- [Minor] Use an ORM: Database Object-Relational Mapping.
- [Minor] Support for additional browsers: Min 2 additional browsers (Firefox, Safari, etc.).
- [Major] Standard user management: Profile, Avatar, Friends, Status.
- [Minor] Remote authentication: OAuth 2.0 (Google, GitHub, 42, etc.).
- [Minor] Game statistics and match history: Requires a game module. Wins/Losses.
- [Major] Advanced permissions system: User/Guest roles, CRUD users.
- [Minor] 2FA system: Two-Factor Authentication.
- [Major] WAF/ModSecurity + HashiCorp Vault: Strict WAF config and secure secrets management.
- [Major] Web-based game: Real-time multiplayer (Pong, Chess, etc.).
- [Major] Remote players: Two players on separate computers.
- [Major] Advanced 3D graphics: Three.js or Babylon.js.
- [Minor] Game customization options: Power-ups.
- [Major] Backend as microservices: Loosely-coupled services.
- [Minor] GDPR compliance features: Data request, deletion, anonymization.



👤 Individual Contributions

    mlamrani: Designed the NestJS microservices architecture. Overcame the challenge of synchronizing data across services using Prisma.

    ziel-hac: Built the entire React component library. Solved the challenge of creating a responsive "game-console" feel using Tailwind.

    rbenmakh: Developed the authoritative game server. Solved latency issues by implementing client-side prediction logic.

    aech-chi: Integrated Vault for environment variables and built the 2FA flow. Ensured the project met GDPR standards for user data portability.

📚 Resources

    NestJS Documentation

    Prisma ORM Reference

    Tailwind CSS Typography

    AI Usage: AI was used to assist in generating boilerplate Prisma schemas, debugging WebSocket race conditions in the game server, and optimizing Tailwind animations for the pixel-art UI.