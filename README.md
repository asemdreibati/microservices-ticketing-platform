# 🎟️ Event-Driven Ticketing System (NATS + Kubernetes)

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technical Stack](#2-technical-stack)
3. [Core Workflows](#3-core-workflows)
4. [Folder Structure Of Shared Library](#4-shared-library)
5. [Event Specifications](#5-event-specifications)
6. [Key Architecture Features](#6-key-architecture-features)
7. [Service Responsibilities](#7-service-responsibilities)
8. [CI Pipeline](#8-ci-pipeline)

<a id="1-architecture-overview"></a>

## 🌐 Architecture Overview

```mermaid
graph TD
    subgraph User
        A[Client] -->|Next.js| B[Browser]
    end

    subgraph Kubernetes
        B --> C[auth]
        B --> D[tickets]
        B --> E[orders]
        B --> F[payments]
        B --> L[expiration]

        C --> G[(AuthDB)]
        D --> H[(TicketsDB)]
        E --> I[(OrdersDB)]
        F --> J[(PaymentsDB)]

        C <--> K[NATS]
        D <--> K
        E <--> K
        F <--> K
        L <--> K
    end

    F --> M[Stripe API]
    L --> N[(Redis)]

    style K fill:#2d3748,stroke:#4a5568
    style N fill:#742a2a,stroke:#4a5568
```

<a id="2-technical-stack"></a>

## 🛠️ Technical Stack

| Component         | Technology            | Purpose                          |
| ----------------- | --------------------- | -------------------------------- |
| **Backend**       | Node.js + TypeScript  | Service implementation           |
| **Event Bus**     | NATS Streaming        | Service-to-service communication |
| **Database**      | MongoDB               | Persistent data storage          |
| **Frontend**      | Next.js               | User interface                   |
| **Orchestration** | Kubernetes + Skaffold | Container management             |
| **Shared Lib**    | `@aaticketsaa/common` | Reusable components              |

<a id="3-core-workflows"></a>
🔄 Core Event Flow

```mermaid
sequenceDiagram
    box Client-Side
        participant Client
    end

    box Backend Services
        participant TS as TicketService
        participant OS as OrderService
        participant ES as ExpirationService
        participant PS as PaymentService
    end

    %% 1. Ticket Creation
    Client->>TS: POST /tickets {title,price}
    TS->>TS: DB: Create(ticket)
    TS->>NATS: ticket:created{ticketId,version,title,price}
    NATS->>OS: ticket:created
    OS->>OS: DB: CreateTicket(ticketData)

    %% 2. Order Initiation
    Client->>OS: POST /orders {ticketId}
    OS->>NATS: order:created{orderId,ticketId,userId}

    %% Parallel Processing
    par Ticket Reservation
        NATS->>TS: order:created
        TS->>TS: DB: ReserveTicket(ticketId, orderId)
        TS->>NATS: ticket:updated{newVersion}
        NATS->>OS: ticket:updated
        OS->>OS: DB: UpdateTicket(version-1)
    and Expiration Setup
        NATS->>ES: order:created
        ES->>Redis: AddJob(orderId, 15min)
    and Payment Setup
        NATS->>PS: order:created
        PS->>PS: DB: CreateOrderRecord
    end

    %% 3. Payment Path
    alt Successful Payment
        Client->>PS: POST /payments {token,orderId}
        PS->>Stripe: Charge(token)
        Stripe-->>PS: Success
        PS->>NATS: payment:created{orderId}
        NATS->>OS: payment:created
        OS->>OS: DB: CompleteOrder
    else Expiration
        Redis->>ES: JobComplete
        ES->>NATS: expiration:complete{orderId}
        NATS->>OS: expiration:complete
        OS->>OS: DB: CancelOrder
        OS->>NATS: order:cancelled
        NATS->>TS: order:cancelled
        TS->>TS: DB: ReleaseTicket
        TS->>NATS: ticket:updated
    end
```

<a id="4-shared-library"></a>

## 🔄 Shared Library (@aaticketsaa/common) Folder Structure

Shared library for Ticketing Microservices System containing events, errors, and middlewares.

```
├── build/ # Compiled output
├── src/
│ ├── errors/ # Custom error classes
│ │ ├── bad-request-error.ts
│ │ ├── custom-error.ts
│ │ ├── database-connection-error.ts
│ │ ├── not-authorized-error.ts
│ │ ├── not-found-error.ts
│ │ └── request-validation-error.ts
│ │
│ ├── events/ # NATS event system
│ │ ├── types/
│ │ │ └── order-status.ts
│ │ │
│ │ ├── base-listener.ts
│ │ ├── base-publisher.ts
│ │ ├── expiration-complete-event.ts
│ │ ├── order-cancelled-event.ts
│ │ ├── order-created-event.ts
│ │ ├── payment-created-event.ts
│ │ ├── subjects.ts
│ │ ├── ticket-created-event.ts
│ │ └── ticket-updated-event.ts
│ │
│ ├── middlewares/ # Express middlewares
│ │ ├── current-user.ts
│ │ ├── error-handler.ts
│ │ ├── require-auth.ts
│ │ ├── validate-request.ts
│ │ └── index.ts
│ │
│ └── index.ts # Main exports
└── .gitignore
```

<a id="5-event-specifications"></a>

## 📜 Event Specifications

| Event Type            | Publisher         | Consumers                                        | Data Structure                        |
| --------------------- | ----------------- | ------------------------------------------------ | ------------------------------------- |
| `ticket:created`      | TicketService     | OrderService                                     | `{id, title, price, version, userId}` |
| `ticket:updated`      | TicketService     | OrderService                                     | `{id, orderId?, version, status}`     |
| `order:created`       | OrderService      | TicketService, PaymentService, ExpirationService | `{id, ticketId, userId, status}`      |
| `order:cancelled`     | OrderService      | TicketService, PaymentService                    | `{id, version, reason}`               |
| `payment:created`     | PaymentService    | OrderService                                     | `{orderId, chargeId}`                 |
| `expiration:complete` | ExpirationService | OrderService                                     | `{orderId}`                           |

<a id="6-key-architecture-features"></a>

## 🧩 Key Architecture Features

1. Optimistic Concurrency Control

```mermaid
flowchart TD
    A[Receive ticket:updated] --> B{version == localVersion+1?}
    B -->|Yes| C[Apply Update]
    B -->|No| D[Fetch Latest Ticket]
    D --> E[Reconcile Changes]
    E --> C
```

2. Event Processing Flow

```mermaid
graph TD
    A[ticket:created] --> B[OrderService]
    C[order:created] --> D[TicketService]
    C --> E[ExpirationService]
    C --> F[PaymentService]
    D --> G[ticket:updated]
    E --> H[expiration:complete]
    F --> I[payment:created]
```

3. Expiration Handling

```mermaid
journey
    title Your Expiration Flow
    section Order Created
      Register Job: 5: ExpirationService
    section Timer Elapsed
      Check Status: 4: OrderService
    section Conditional Action
      Cancel Order: 3: if not completed
      Release Ticket: 3: TicketService
```

<a id="7-service-responsibilities"></a>

### 🏗 Service Responsibilities

1. Ticket Service

```mermaid
flowchart LR
    A[Create Ticket] --> B[Emit created]
    C[Reserve Ticket] --> D[Emit updated]
    E[Release Ticket] --> D
```

2. Order Service

```mermaid
flowchart LR
    A[Initiate Order] --> B[Emit created]
    B --> C[Handle Updates]
    C --> D[Version Validation]
```

3. Payment Service

```mermaid
flowchart LR
    A[Receive Order] --> B[Create Record]
    B --> C[Process Payment]
    C --> D[Emit completed]
```

4. Payment Service

```mermaid
flowchart LR
    A[Receive Order] --> B[Start Timer]
    B --> C[Emit complete]
```

<a id="8-ci-pipeline"></a>

## 🧪 CI Pipeline Flow

```mermaid
graph TD
    A[Code Push/PR] --> B[Parallel Test Execution]
    B --> C[tests-auth.yml]
    B --> D[tests-orders.yml]
    B --> E[tests-payments.yml]
    B --> F[tests-tickets.yml]
    C & D & E & F --> G[Consolidated Results]
```
