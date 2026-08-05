--- ARCHITECTURE_DOCUMENTATION.md (原始)


+++ ARCHITECTURE_DOCUMENTATION.md (修改后)
# Social Media Platform - Tech Stack & Architecture Documentation

## 📋 Executive Summary

Dokumen ini menjelaskan tech stack lengkap dan arsitektur untuk platform sosial media dengan:
- **Mobile App**: Flutter (iOS & Android)
- **Web Frontend**: React.js Custom (bukan Flutter Web)
- **Backend Server**: Polyglot Architecture (Golang + Python)
- **Message Brokers**: Kafka (event-driven) + RabbitMQ (routing complex)
- **Database**: PostgreSQL + pgVector + Redis
- **Deployment**: Modular Monolith dengan Podman
- **AI/ML**: Two-Tower Neural Network (CF + CBF) dengan TF-IDF & Cosine Similarity

---

## 🏗️ Arsitektur Sistem Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐           ┌──────────────────────────────────┐   │
│  │   Flutter Mobile │           │   React.js Web (Custom)          │   │
│  │   (iOS/Android)  │           │   (Instagram-like UI)            │   │
│  │                  │           │   - Redux/Zustand                │   │
│  │   - Dart         │           │   - TailwindCSS                  │   │
│  │   - Provider/Riverpod        │   - Framer Motion                │   │
│  │   - Dio          │           │   - React Query                  │   │
│  └────────┬─────────┘           └─────────────┬────────────────────┘   │
│           │                                    │                         │
│           └────────────────┬───────────────────┘                         │
│                            │                                             │
│                    ┌───────▼────────┐                                    │
│                    │ Load Balancer  │                                    │
│                    │    (Traefik/   │                                    │
│                    │     Nginx)     │                                    │
│                    └───────┬────────┘                                    │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────────┐
│                        API GATEWAY LAYER                                  │
│                    (Golang - High Performance)                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  - Authentication & Authorization                                 │  │
│  │  - Rate Limiting                                                  │  │
│  │  - Request Routing                                                │  │
│  │  - Circuit Breaker Pattern                                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────────┐
│                     MODULAR MONOLITH CORE                                │
│                    (Deployed with Podman Pods)                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              MODULE 1: USER SERVICE (Golang)                       │  │
│  │  - User Management                                                 │  │
│  │  - Authentication (JWT/OAuth2)                                     │  │
│  │  - Profile Management                                              │  │
│  │  - Follow/Unfollow System                                          │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              MODULE 2: CONTENT SERVICE (Golang)                    │  │
│  │  - Post CRUD Operations                                            │  │
│  │  - Media Upload (Images/Videos)                                    │  │
│  │  - Content Moderation                                              │  │
│  │  - Hashtag & Mention Processing                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              MODULE 3: INTERACTION SERVICE (Golang)                │  │
│  │  - Likes, Comments, Shares                                         │  │
│  │  - Real-time Notifications                                         │  │
│  │  - Activity Feed                                                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              MODULE 4: RECOMMENDATION ENGINE (Python)              │  │
│  │  - Two-Tower Neural Network                                        │  │
│  │  - Collaborative Filtering (CF)                                    │  │
│  │  - Content-Based Filtering (CBF)                                   │  │
│  │  - TF-IDF Vectorization                                            │  │
│  │  - Cosine Similarity Calculation                                   │  │
│  │  - Explore Page Generation                                         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              MODULE 5: ANALYTICS SERVICE (Golang)                  │  │
│  │  - Event Tracking                                                  │  │
│  │  - User Behavior Analysis                                          │  │
│  │  - Performance Metrics                                             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────────┐
│                      MESSAGE BROKER LAYER                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              APACHE KAFKA (Event-Driven Backbone)                  │  │
│  │                                                                    │  │
│  │  Topics:                                                           │  │
│  │  - user.events (user_created, user_updated, user_deleted)          │  │
│  │  - content.events (post_created, post_updated, post_deleted)       │  │
│  │  - interaction.events (like_created, comment_added, share_made)    │  │
│  │  - analytics.events (page_view, click, scroll, watch_time)         │  │
│  │                                                                    │  │
│  │  Features:                                                         │  │
│  │  - Real-time event processing                                      │  │
│  │  - Event sourcing pattern                                          │  │
│  │  - Retry mechanism dengan dead letter queue                        │  │
│  │  - Schema Registry (Avro/Protobuf)                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              RABBITMQ (Complex Routing & Task Queues)              │  │
│  │                                                                    │  │
│  │  Exchanges:                                                        │  │
│  │  - direct.exchange (priority-based routing)                        │  │
│  │  - topic.exchange (pattern-based routing)                          │  │
│  │  - fanout.exchange (broadcast notifications)                       │  │
│  │                                                                    │  │
│  │  Queues:                                                           │  │
│  │  - notification.queue (push notifications, emails)                 │  │
│  │  - media_processing.queue (image/video transcoding)                │  │
│  │  - recommendation.queue (async recommendation generation)          │  │
│  │  - moderation.queue (content review tasks)                         │  │
│  │                                                                    │  │
│  │  Features:                                                         │  │
│  │  - Guaranteed message delivery (ACK/NACK)                          │  │
│  │  - Priority queues                                                 │  │
│  │  - Delayed messages                                                │  │
│  │  - Dead letter exchanges                                           │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────────┐
│                        DATA LAYER                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              POSTGRESQL + pgVECTOR                                 │  │
│  │                                                                    │  │
│  │  Tables:                                                           │  │
│  │  - users (user_id, username, email, created_at, ...)               │  │
│  │  - posts (post_id, user_id, content, media_urls, created_at, ...)  │  │
│  │  - interactions (interaction_id, user_id, post_id, type, ...)      │  │
│  │  - embeddings (entity_id, entity_type, vector embedding[768], ...) │  │
│  │                                                                    │  │
│  │  pgVector Usage:                                                   │  │
│  │  - Store two-tower neural network embeddings                       │  │
│  │  - User embeddings (user tower output)                             │  │
│  │  - Item embeddings (item tower output)                             │  │
│  │  - HNSW index for fast similarity search                           │  │
│  │  - Cosine similarity queries                                       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              REDIS (Cache & Session Store)                         │  │
│  │                                                                    │  │
│  │  Use Cases:                                                        │  │
│  │  - Session management (JWT blacklist)                              │  │
│  │  - API response caching                                            │  │
│  │  - Rate limiting counters                                          │  │
│  │  - Real-time counters (likes, views, followers)                    │  │
│  │  - Pub/Sub for real-time notifications                             │  │
│  │  - Leaderboards (sorted sets)                                      │  │
│  │  - Feed caching (user timeline)                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Detailed Tech Stack

### 1. **Frontend Layer**

#### A. Mobile Application (Flutter)

| Component          | Technology               | Purpose                                  |
| ------------------ | ------------------------ | ---------------------------------------- |
| Framework          | Flutter 3.x              | Cross-platform mobile development        |
| Language           | Dart 3.x                 | Type-safe, performant code               |
| State Management   | Riverpod 2.x             | Scalable state management                |
| HTTP Client        | Dio 5.x                  | Advanced HTTP requests with interceptors |
| Local Storage      | Hive / Isar              | NoSQL local database                     |
| Image Caching      | CachedNetworkImage       | Efficient image loading                  |
| Navigation         | GoRouter                 | Declarative routing                      |
| Animation          | Rive / Lottie            | Complex animations                       |
| Push Notifications | Firebase Cloud Messaging | Real-time notifications                  |

**Key Features:**

- Clean Architecture (Presentation, Domain, Data layers)
- Dependency Injection with Riverpod
- Offline-first approach
- Optimistic UI updates

#### B. Web Application (React.js Custom)

| Component          | Technology                    | Purpose                          |
| ------------------ | ----------------------------- | -------------------------------- |
| Framework          | React 18.x                    | Modern UI library                |
| Language           | TypeScript 5.x                | Type safety                      |
| Build Tool         | Vite 5.x                      | Ultra-fast build tool            |
| State Management   | Zustand + TanStack Query      | Lightweight state + server state |
| Styling            | TailwindCSS 3.x + CSS Modules | Utility-first CSS                |
| Animation          | Framer Motion                 | Smooth animations                |
| UI Components      | Radix UI + Headless UI        | Accessible primitives            |
| Icons              | Lucide React / Heroicons      | Modern icon set                  |
| Forms              | React Hook Form + Zod         | Form handling & validation       |
| Charts             | Recharts / Visx               | Data visualization               |
| Virtualization     | TanStack Virtual              | Large list performance           |
| Image Optimization | Next/Image (standalone)       | Lazy loading, optimization       |

**Why React.js instead of Flutter Web?**

- Better SEO capabilities
- Superior performance for web-specific features
- Larger ecosystem of web libraries
- Instagram-like experience (as requested)
- Better browser API integration
- More futuristic UI capabilities

**Folder Structure (Web):**

```
web/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   ├── feed/         # Feed-related components
│   │   ├── explore/      # Explore page components
│   │   └── profile/      # Profile components
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── pages/            # Page components
│   ├── styles/           # Global styles
│   └── App.tsx
├── public/
└── vite.config.ts
```

---

### 2. **Backend Layer (Polyglot Architecture)**

#### A. Golang Services (Primary Backend Language)

| Module        | Technology              | Purpose                         |
| ------------- | ----------------------- | ------------------------------- |
| Web Framework | Gin / Echo              | High-performance HTTP framework |
| ORM           | GORM / sqlc             | Database operations             |
| Migration     | golang-migrate          | Database schema migrations      |
| Validation    | go-playground/validator | Request validation              |
| Configuration | Viper                   | Config management               |
| Logging       | Zap / Logrus            | Structured logging              |
| Tracing       | OpenTelemetry           | Distributed tracing             |
| Testing       | testify / gomock        | Unit & integration testing      |
| API Docs      | Swag / oapi-codegen     | OpenAPI documentation           |
| gRPC          | gRPC-Go                 | Internal service communication  |

**Key Advantages:**

- High performance & low latency
- Excellent concurrency model (goroutines)
- Strong typing & compilation
- Small binary size
- Easy deployment

#### B. Python Services (AI/ML Engine)

| Component           | Technology           | Purpose                   |
| ------------------- | -------------------- | ------------------------- |
| Framework           | FastAPI              | Async API framework       |
| ML Framework        | PyTorch / TensorFlow | Neural network training   |
| Recommendation      | Surprise / LightFM   | Collaborative filtering   |
| NLP                 | scikit-learn / spaCy | TF-IDF, text processing   |
| Vector Operations   | NumPy / SciPy        | Mathematical computations |
| Model Serving       | TorchServe / Triton  | Model deployment          |
| Feature Store       | Feast                | Feature management        |
| Experiment Tracking | MLflow               | Model versioning          |
| Data Processing     | Pandas / Polars      | Data manipulation         |

**Two-Tower Neural Network Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    TWO-TOWER ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   USER TOWER     │         │   ITEM TOWER     │          │
│  │                  │         │                  │          │
│  │  Input Features: │         │  Input Features: │          │
│  │  - User ID       │         │  - Item ID       │          │
│  │  - Demographics  │         │  - Content Text  │          │
│  │  - Behavior Hist │         │  - Media Features│          │
│  │  - Preferences   │         │  - Category Tags │          │
│  │  - Location      │         │  - Creation Time │          │
│  │                  │         │                  │          │
│  │  Embedding Layers│         │  Embedding Layers│          │
│  │  ↓               │         │  ↓               │          │
│  │  Dense Layers    │         │  Dense Layers    │          │
│  │  (ReLU/GELU)     │         │  (ReLU/GELU)     │          │
│  │  ↓               │         │  ↓               │          │
│  │  Batch Norm      │         │  Batch Norm      │          │
│  │  ↓               │         │  ↓               │          │
│  │  Dropout         │         │  Dropout         │          │
│  │  ↓               │         │  ↓               │          │
│  │  [User Embedding]│         │  [Item Embedding]│          │
│  │  (768 dim)       │         │  (768 dim)       │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
│           └─────────────┬──────────────┘                     │
│                         │                                    │
│              ┌──────────▼──────────┐                         │
│              │  Cosine Similarity  │                         │
│              │  Score Calculation  │                         │
│              └──────────┬──────────┘                         │
│                         │                                    │
│              ┌──────────▼──────────┐                         │
│              │  Ranking & Scoring  │                         │
│              │  (for Explore Page) │                         │
│              └─────────────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Hybrid Approach: CF + CBF + TF-IDF

1. Collaborative Filtering (CF):
   - Matrix Factorization
   - User-Item Interaction Matrix
   - Latent Factor Discovery

2. Content-Based Filtering (CBF):
   - TF-IDF Vectorization on post content
   - Hashtag analysis
   - Category matching

3. Combined Score:
   Final_Score = α * CF_Score + β * CBF_Score + γ * Recency_Boost

   Where:
   - α, β, γ are learned weights
   - Recency_Boost based on time decay function
```

---

### 3. **Message Broker Layer**

#### A. Apache Kafka (Event-Driven Backbone)

| Component         | Technology                | Purpose                  |
| ----------------- | ------------------------- | ------------------------ |
| Broker            | Kafka 3.x                 | Event streaming platform |
| Schema Registry   | Confluent Schema Registry | Schema management        |
| Stream Processing | Kafka Streams / ksqlDB    | Real-time processing     |
| Connect           | Kafka Connect             | Data integration         |
| UI                | Kafka UI / Akhq           | Monitoring & management  |

**Topics Structure:**

```yaml
topics:
  user-events:
    partitions: 12
    replication: 3
    retention: 7d
    events:
      - user.created
      - user.updated
      - user.deleted
      - user.followed
      - user.unfollowed

  content-events:
    partitions: 24
    replication: 3
    retention: 30d
    events:
      - post.created
      - post.updated
      - post.deleted
      - post.reported

  interaction-events:
    partitions: 36
    replication: 3
    retention: 90d
    events:
      - interaction.like
      - interaction.comment
      - interaction.share
      - interaction.save

  analytics-events:
    partitions: 48
    replication: 3
    retention: 7d
    events:
      - analytics.page_view
      - analytics.click
      - analytics.scroll
      - analytics.watch_time
      - analytics.search

  recommendation-events:
    partitions: 12
    replication: 3
    retention: 3d
    events:
      - recommendation.requested
      - recommendation.generated
      - recommendation.clicked
```

**Retry Mechanism:**

```
Producer → Topic → Consumer
                  ↓ (error)
            Dead Letter Queue
                  ↓
            Retry Topic (with delay)
                  ↓
            Original Topic (max 3 retries)
                  ↓
            Alert & Manual Review
```

#### B. RabbitMQ (Complex Routing & Task Queues)

| Component  | Technology                 | Purpose            |
| ---------- | -------------------------- | ------------------ |
| Broker     | RabbitMQ 3.x               | Message queuing    |
| Management | RabbitMQ Management Plugin | Dashboard & API    |
| Shovel     | RabbitMQ Shovel            | Message forwarding |
| Federation | RabbitMQ Federation        | Cross-datacenter   |

**Exchange Types:**

```yaml
exchanges:
  direct-exchange:
    type: direct
    purpose: Priority-based routing
    queues:
      - high-priority-notifications
      - normal-priority-notifications
      - low-priority-notifications

  topic-exchange:
    type: topic
    purpose: Pattern-based routing
    bindings:
      - pattern: "notification.email.*"
        queue: email-queue
      - pattern: "notification.push.*"
        queue: push-queue
      - pattern: "media.process.*"
        queue: media-processing-queue

  fanout-exchange:
    type: fanout
    purpose: Broadcast to all subscribers
    queues:
      - cache-invalidation
      - config-update
      - maintenance-mode
```

**Task Queue Patterns:**

```python
# Example: Media Processing Queue
queues:
  - name: media.upload
    durable: true
    max_priority: 10

  - name: media.transcode.video
    durable: true
    message_ttl: 3600000  # 1 hour

  - name: media.transcode.image
    durable: true

  - name: media.thumbnail
    durable: true

  - name: media.delete
    durable: true
    dlx: media.delete.dlx  # Dead Letter Exchange
```

---

### 4. **Data Layer**

#### A. PostgreSQL + pgVector

| Component       | Version         | Purpose                  |
| --------------- | --------------- | ------------------------ |
| Database        | PostgreSQL 16.x | Primary database         |
| Extension       | pgvector 0.5.x  | Vector similarity search |
| Connection Pool | PgBouncer       | Connection pooling       |
| Backup          | pgBackRest      | Backup & recovery        |
| Replication     | Patroni         | HA & automatic failover  |

**Schema Design:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
    post_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    content TEXT,
    media_urls JSONB,
    hashtags TEXT[],
    mentions BIGINT[],
    location GEOGRAPHY(POINT),
    visibility VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Embeddings table (Two-Tower output)
CREATE TABLE embeddings (
    entity_id BIGINT NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- 'user' or 'item'
    embedding VECTOR(768),  -- 768-dimensional vector
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (entity_id, entity_type)
);

-- Create HNSW index for fast similarity search
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Interactions table
CREATE TABLE interactions (
    interaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    post_id BIGINT REFERENCES posts(post_id),
    interaction_type VARCHAR(20) NOT NULL, -- 'like', 'comment', 'share', 'save'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create composite index for common queries
CREATE INDEX idx_interactions_user_post ON interactions(user_id, post_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_hashtags ON posts USING GIN (hashtags);
```

**Similarity Search Query:**

```sql
-- Find similar items for a user (Explore Page)
SELECT
    e.entity_id AS post_id,
    p.content,
    p.media_urls,
    1 - (e.embedding <=> $1) AS similarity_score
FROM embeddings e
JOIN posts p ON e.entity_id = p.post_id
WHERE e.entity_type = 'item'
  AND p.visibility = 'public'
ORDER BY e.embedding <=> $1  -- Cosine distance
LIMIT 50;

-- $1 is the user's embedding vector
```

#### B. Redis

| Component     | Purpose                               |
| ------------- | ------------------------------------- |
| Cache         | API responses, database query results |
| Session Store | JWT blacklist, user sessions          |
| Rate Limiter  | Sliding window counters               |
| Pub/Sub       | Real-time notifications               |
| Sorted Sets   | Leaderboards, trending posts          |
| Lists         | Feed queues, activity streams         |
| Hashes        | User profiles, post metadata          |

**Redis Data Structures:**

```redis
# Session management
SETEX session:{user_id} 3600 {session_data}

# Rate limiting (sliding window)
ZADD rate_limit:{user_id}:{endpoint} {timestamp} {request_id}
ZREMRANGEBYSCORE rate_limit:{user_id}:{endpoint} 0 {timestamp - 60000}
ZCARD rate_limit:{user_id}:{endpoint}

# Real-time counters
INCR post:{post_id}:likes
INCR post:{post_id}:views
INCR user:{user_id}:followers

# Pub/Sub for notifications
PUBLISH notifications:{user_id} {notification_payload}

# Leaderboard (trending posts)
ZADD trending:posts {score} {post_id}
ZREVRANGE trending:posts 0 49 WITHSCORES

# Feed caching
SETEX feed:{user_id}:timeline 300 {serialized_feed}

# User online status
SETEX user:{user_id}:online 180 "active"
```

---

### 5. **Load Balancer**

| Component         | Technology      | Purpose                          |
| ----------------- | --------------- | -------------------------------- |
| L7 Load Balancer  | Traefik / Nginx | Reverse proxy & load balancing   |
| Service Discovery | Consul / etcd   | Dynamic service registration     |
| SSL/TLS           | Let's Encrypt   | Automatic certificate management |
| WAF               | ModSecurity     | Web application firewall         |

**Traefik Configuration:**

```yaml
# traefik.yml
api:
  dashboard: true
  insecure: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https

  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

providers:
  docker:
    endpoint: "unix:///var/run/podman/podman.sock"
    exposedByDefault: false

  consulCatalog:
    endpoint: "http://consul:8500"
    prefix: "traefik"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /etc/traefik/acme.json
      httpChallenge:
        entryPoint: web

# Middleware for rate limiting, auth, etc.
http:
  middlewares:
    rate-limit:
      rateLimit:
        average: 100
        burst: 50

    secure-headers:
      headers:
        frameDeny: true
        browserXssFilter: true
        contentTypeNosniff: true
```

---

### 6. **Deployment Architecture (Modular Monolith with Podman)**

#### Why Modular Monolith?

- ✅ Easier to develop and test
- ✅ Single deployment unit
- ✅ No distributed transaction complexity
- ✅ Can be split into microservices later
- ✅ Better performance (no network overhead between modules)
- ✅ Simpler debugging and monitoring

#### Podman Pods Structure:

```
┌─────────────────────────────────────────────────────────────────┐
│                        POD: app-backend                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   API Gateway    │  │   User Module    │  │  Content Module│ │
│  │   (Golang)       │  │   (Golang)       │  │   (Golang)     │ │
│  │   Port: 8080     │  │   Port: 8081     │  │   Port: 8082   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ Interaction Mdl  │  │Recommendation Mdl│  │ Analytics Mdl  │ │
│  │ (Golang)         │  │ (Python/FastAPI) │  │ (Golang)       │ │
│  │ Port: 8083       │  │ Port: 8084       │  │ Port: 8085     │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                  │
│  Shared Volumes:                                                 │
│  - /app/logs (logging)                                          │
│  - /app/config (configuration)                                  │
│  - /app/models (ML models)                                      │
│                                                                  │
│  Shared Network: app-network                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        POD: infrastructure                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   pgBouncer          │  │
│  │  + pgVector  │  │              │  │   (connection pool)  │  │
│  │  Port: 5432  │  │  Port: 6379  │  │   Port: 6432         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Kafka     │  │   Zookeeper  │  │  Schema Registry     │  │
│  │  Port: 9092  │  │  Port: 2181  │  │  Port: 8081          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   RabbitMQ   │  │  Management  │  │   Traefik (LB)       │  │
│  │ Ports:       │  │   UI         │  │   Ports: 80, 443     │  │
│  │ 5672, 15672  │  │  Port: 15672 │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Podman Compose File (podman-compose.yml):**

```yaml
version: "3.8"

x-common-env: &common-env
  ENVIRONMENT: production
  LOG_LEVEL: info
  DB_HOST: postgres
  REDIS_HOST: redis
  KAFKA_BROKERS: kafka:9092
  RABBITMQ_HOST: rabbitmq

services:
  # ==================== DATABASE SERVICES ====================

  postgres:
    image: pgvector/pgvector:pg16
    container_name: postgres-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: social_media
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # ==================== MESSAGE BROKERS ====================

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
    networks:
      - app-network

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-broker
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    volumes:
      - kafka_data:/var/lib/kafka/data
    networks:
      - app-network

  schema-registry:
    image: confluentinc/cp-schema-registry:7.5.0
    container_name: schema-registry
    depends_on:
      - kafka
    ports:
      - "8081:8081"
    environment:
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: kafka:9092
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
    networks:
      - app-network

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: rabbitmq-broker
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - app-network

  # ==================== APPLICATION MODULES ====================

  api-gateway:
    build:
      context: ./backend
      dockerfile: Dockerfile.gateway
    container_name: api-gateway
    environment:
      <<: *common-env
      SERVICE_PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
      - kafka
      - rabbitmq
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config
    networks:
      - app-network
    restart: unless-stopped

  user-service:
    build:
      context: ./backend
      dockerfile: Dockerfile.user-service
    container_name: user-service
    environment:
      <<: *common-env
      SERVICE_PORT: 8081
    depends_on:
      - postgres
      - redis
      - kafka
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network
    restart: unless-stopped

  content-service:
    build:
      context: ./backend
      dockerfile: Dockerfile.content-service
    container_name: content-service
    environment:
      <<: *common-env
      SERVICE_PORT: 8082
    depends_on:
      - postgres
      - redis
      - kafka
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - app-network
    restart: unless-stopped

  interaction-service:
    build:
      context: ./backend
      dockerfile: Dockerfile.interaction-service
    container_name: interaction-service
    environment:
      <<: *common-env
      SERVICE_PORT: 8083
    depends_on:
      - postgres
      - redis
      - kafka
      - rabbitmq
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network
    restart: unless-stopped

  recommendation-service:
    build:
      context: ./backend
      dockerfile: Dockerfile.recommendation-service
    container_name: recommendation-service
    environment:
      <<: *common-env
      SERVICE_PORT: 8084
      PYTHONUNBUFFERED: 1
      MODEL_PATH: /app/models
    depends_on:
      - postgres
      - redis
      - kafka
    volumes:
      - ./logs:/app/logs
      - ./models:/app/models
      - ./ml-data:/app/ml-data
    networks:
      - app-network
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  analytics-service:
    build:
      context: ./backend
      dockerfile: Dockerfile.analytics-service
    container_name: analytics-service
    environment:
      <<: *common-env
      SERVICE_PORT: 8085
    depends_on:
      - postgres
      - redis
      - kafka
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network
    restart: unless-stopped

  # ==================== LOAD BALANCER ====================

  traefik:
    image: traefik:v2.10
    container_name: traefik-lb
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/podman/podman.sock:/var/run/docker.sock:ro
      - ./traefik:/etc/traefik
    networks:
      - app-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`traefik.localhost`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.tls=true"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  kafka_data:
  zookeeper_data:
  rabbitmq_data:

networks:
  app-network:
    driver: bridge
```

---

### 7. **Project Structure**

```
social-media-platform/
├── README.md
├── LICENSE
├── .gitignore
├── docker-compose.yml (podman-compose.yml)
├── .env.example
│
├── mobile/                      # Flutter Mobile App
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   │   ├── constants/
│   │   │   ├── errors/
│   │   │   ├── network/
│   │   │   └── utils/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── home/
│   │   │   ├── explore/
│   │   │   ├── profile/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   ├── shared/
│   │   │   ├── widgets/
│   │   │   ├── models/
│   │   │   └── providers/
│   │   └── routes/
│   ├── test/
│   ├── pubspec.yaml
│   └── README.md
│
├── web/                         # React.js Web App
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── feed/
│   │   │   ├── explore/
│   │   │   └── profile/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── pages/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── README.md
│
├── backend/                     # Modular Monolith Backend
│   ├── cmd/
│   │   ├── gateway/
│   │   ├── user-service/
│   │   ├── content-service/
│   │   ├── interaction-service/
│   │   ├── recommendation-service/
│   │   └── analytics-service/
│   ├── internal/
│   │   ├── modules/
│   │   │   ├── user/
│   │   │   ├── content/
│   │   │   ├── interaction/
│   │   │   ├── recommendation/
│   │   │   └── analytics/
│   │   ├── pkg/
│   │   │   ├── kafka/
│   │   │   ├── rabbitmq/
│   │   │   ├── postgres/
│   │   │   ├── redis/
│   │   │   └── logger/
│   │   └── middleware/
│   ├── ml/                      # Python ML Code
│   │   ├── models/
│   │   │   ├── two_tower.py
│   │   │   ├── collaborative_filtering.py
│   │   │   ├── content_based.py
│   │   │   └── tfidf_vectorizer.py
│   │   ├── training/
│   │   │   ├── train.py
│   │   │   ├── evaluate.py
│   │   │   └── hyperparams.py
│   │   ├── inference/
│   │   │   ├── predictor.py
│   │   │   └── embedding_generator.py
│   │   ├── utils/
│   │   └── requirements.txt
│   ├── configs/
│   ├── migrations/
│   ├── scripts/
│   ├── Dockerfile.*
│   ├── go.mod
│   └── Makefile
│
├── infrastructure/
│   ├── podman/
│   │   ├── pods/
│   │   └── networks/
│   ├── monitoring/
│   │   ├── prometheus/
│   │   ├── grafana/
│   │   └── alertmanager/
│   └── kubernetes/ (optional for future scaling)
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   └── ml/
│
└── scripts/
    ├── setup.sh
    ├── deploy.sh
    └── backup.sh
```

---

## 🚀 Deployment Workflow with Podman

### Setup Commands:

```bash
# 1. Install Podman
sudo dnf install podman podman-compose

# 2. Clone repository
git clone <repository-url>
cd social-media-platform

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Create Podman network
podman network create app-network

# 5. Start infrastructure pods
podman-compose up -d postgres redis zookeeper kafka rabbitmq

# 6. Wait for services to be healthy
sleep 30

# 7. Run database migrations
podman-compose run --rm api-gateway migrate up

# 8. Start application services
podman-compose up -d api-gateway user-service content-service \
                   interaction-service recommendation-service analytics-service

# 9. Start load balancer
podman-compose up -d traefik

# 10. Verify all services
podman-compose ps

# 11. View logs
podman-compose logs -f

# 12. Create persistent pods (optional)
podman pod create --name app-backend \
  -p 8080:8080 \
  -p 8081:8081 \
  -p 8082:8082 \
  -p 8083:8083 \
  -p 8084:8084 \
  -p 8085:8085

podman pod create --name infrastructure \
  -p 5432:5432 \
  -p 6379:6379 \
  -p 9092:9092 \
  -p 5672:5672 \
  -p 15672:15672
```

### Scaling Commands:

```bash
# Scale recommendation service (GPU-intensive)
podman-compose up -d --scale recommendation-service=3

# Monitor resource usage
podman stats

# Health check
podman-compose exec postgres pg_isready
podman-compose exec redis redis-cli ping
```

---

## 📊 Monitoring & Observability

```yaml
# Prometheus + Grafana Stack
monitoring:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686" # UI
      - "14268:14268" # Collector

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
```

---

## 🔒 Security Considerations

1. **Authentication**: JWT with refresh tokens
2. **Authorization**: RBAC (Role-Based Access Control)
3. **Encryption**: TLS 1.3 for all communications
4. **Secrets Management**: Podman secrets / HashiCorp Vault
5. **Rate Limiting**: Redis-based sliding window
6. **Input Validation**: All endpoints validated
7. **CORS**: Strict origin policies
8. **SQL Injection Prevention**: Parameterized queries
9. **XSS Protection**: Content Security Policy headers
10. **DDoS Protection**: Rate limiting + WAF

---

## 📈 Performance Optimization

### Backend (Golang):

- Connection pooling (PgBouncer)
- Query optimization with indexes
- Caching strategy (Redis)
- Async processing (Kafka/RabbitMQ)
- Horizontal scaling ready

### ML Service (Python):

- Batch predictions
- Model quantization
- GPU acceleration
- Embedding pre-computation
- Approximate nearest neighbor (HNSW)

### Frontend:

- Code splitting
- Lazy loading
- Image optimization
- CDN integration
- Service workers (PWA)

### Database:

- Read replicas
- Connection pooling
- Query caching
- Index optimization
- Partitioning for large tables

---

## 🎯 Key Advantages of This Architecture

1. **Modular Monolith**: Easy to develop, test, and deploy
2. **Polyglot**: Best language for each task (Golang for speed, Python for ML)
3. **Event-Driven**: Real-time processing with Kafka
4. **Flexible Routing**: Complex message routing with RabbitMQ
5. **Scalable**: Can split into microservices when needed
6. **Containerized**: Podman for lightweight, rootless containers
7. **AI-Powered**: Two-tower neural network for personalized recommendations
8. **High Performance**: Redis caching, pgVector for fast similarity search
9. **Modern Frontend**: Flutter for mobile, React.js for web
10. **Production-Ready**: Monitoring, logging, tracing included

---

## 📝 Next Steps

1. Set up development environment
2. Initialize Git repository
3. Create CI/CD pipeline
4. Implement core modules
5. Train initial ML models
6. Load testing
7. Security audit
8. Beta launch

---

**Document Version**: 1.0
**Last Updated**: 2024
**Author**: Architecture Team
