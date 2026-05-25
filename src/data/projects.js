// ── Project data — architecture, API docs, highlights ──────────────────
// Each entry drives ProjectCard, ArchFlowDiagram, and ApiDocBlock.

export const PROJECTS = [
  /* ─────────────────────────────── 01: The Placement Route ─────────── */
  {
    id: 1,
    index: '01',
    name: 'The Placement Route',
    tagline: 'Scalable Placement Management Platform',
    period: 'Jan 2026 – May 2026',
    affiliation: 'IIT Madras — MADII CS2006',
    github: 'https://github.com/25dp1000031/mad2-ppa-v2',
    live: null,
    stack: ['Flask', 'PostgreSQL', 'Redis', 'Celery', 'JWT', 'Vue.js', 'Docker', 'SQLAlchemy'],
    highlights: [
      {
        icon: 'fas fa-shield-alt', color: 'green',
        title: 'Multirole RBAC',
        desc: 'JWT-based auth with isolated role permissions for Students, Companies & Admins',
      },
      {
        icon: 'fas fa-layer-group', color: 'blue',
        title: 'Service Layer Architecture',
        desc: 'Clean handler → service → repository separation for testability and scalability',
      },
      {
        icon: 'fas fa-tasks', color: 'purple',
        title: 'Async Celery Workflows',
        desc: 'Report generation & email dispatch offloaded to background Celery task queues',
      },
      {
        icon: 'fas fa-bolt', color: 'yellow',
        title: 'Redis Caching',
        desc: 'API response caching reduces repeated DB reads on high-traffic listing endpoints',
      },
    ],

    // SVG architecture flow — nodes + animated connector paths
    archFlow: {
      viewBox: '0 0 860 180',
      nodes: [
        { id: 'client',  label: 'Vue.js Client',    x: 10,  y: 25, w: 115, h: 36, color: 'blue'   },
        { id: 'api',     label: 'Flask REST API',   x: 175, y: 25, w: 120, h: 36, color: 'green'  },
        { id: 'jwt',     label: 'JWT Auth Guard',   x: 350, y: 25, w: 115, h: 36, color: 'yellow' },
        { id: 'redis',   label: 'Redis Cache',      x: 520, y: 25, w: 100, h: 36, color: 'red'    },
        { id: 'pg',      label: 'PostgreSQL',       x: 675, y: 25, w: 100, h: 36, color: 'green'  },
        { id: 'celery',  label: 'Celery Worker',    x: 350, y: 115, w: 115, h: 36, color: 'purple' },
        { id: 'pg2',     label: 'PostgreSQL',       x: 675, y: 115, w: 100, h: 36, color: 'green', ghost: true },
      ],
      paths: [
        { id: 'p1', d: 'M 125,43 L 175,43',                    label: 'HTTP'    },
        { id: 'p2', d: 'M 295,43 L 350,43',                    label: 'route'   },
        { id: 'p3', d: 'M 465,43 L 520,43',                    label: 'cache?'  },
        { id: 'p4', d: 'M 620,43 L 675,43',                    label: 'query'   },
        { id: 'p5', d: 'M 407,61 L 407,115',                   label: 'async'   },
        { id: 'p6', d: 'M 465,133 Q 570,133 675,133',          label: 'persist' },
      ],
    },

    // Tabbed API documentation mock data
    apiDocs: {
      endpoints: [
        { method: 'POST', path: '/api/v1/auth/login',             desc: 'Authenticate user → signed JWT with RBAC claims' },
        { method: 'GET',  path: '/api/v1/placements',             desc: 'List job postings (Redis-cached, TTL 300s)' },
        { method: 'POST', path: '/api/v1/placements/{id}/apply',  desc: 'Submit application → Celery task queued' },
        { method: 'GET',  path: '/api/v1/reports/{id}',           desc: 'Download async-generated placement report' },
      ],
      curl: `# Authenticate and receive a signed JWT
curl -X POST https://api.placement-route.dev/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "student@iitm.ac.in",
    "password": "••••••••"
  }'`,
      response: `HTTP/1.1 200 OK
Content-Type: application/json
X-Response-Time: 14ms
X-Cache-Status: MISS

{
  "status": "ok",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0MiwiZXhwIjoxNzE2MDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "token_type": "Bearer",
    "expires_in": 3600,
    "claims": {
      "user_id": 42,
      "role": "STUDENT",
      "institution": "IITM",
      "permissions": [
        "placement.read",
        "profile.write",
        "application.create"
      ]
    }
  },
  "meta": {
    "cache": "MISS",
    "response_time_ms": 14,
    "served_by": "celery@worker-01"
  }
}`,
      schema: `// ── POST /api/v1/auth/login ─────────────────────────────────
Request {
  email:    string   // required — registered email
  password: string   // required — min 8 characters
}

Response 200 {
  status: "ok" | "error"
  data: {
    access_token:  string   // HS256-signed JWT
    token_type:    "Bearer"
    expires_in:    number   // TTL in seconds
    claims: {
      user_id:      number
      role:         "STUDENT" | "COMPANY" | "ADMIN"
      institution:  string
      permissions:  string[]   // fine-grained RBAC scopes
    }
  }
  meta: {
    cache:            "HIT" | "MISS"
    response_time_ms: number
    served_by:        string   // worker node ID
  }
}

Response 401 {
  status: "error"
  message: "Invalid credentials"
  code: "AUTH_FAILED"
}`,
    },
  },

  /* ─────────────────────────────── 02: V-Park ──────────────────────── */
  {
    id: 2,
    index: '02',
    name: 'V-Park',
    tagline: 'Full-Stack Vehicle Parking Management System',
    period: 'May 2025 – Sep 2025',
    affiliation: 'IIT Madras — MAD I',
    github: 'https://github.com/25dp1000031/vehicle-parking-system',
    live: null,
    stack: ['Flask', 'SQLAlchemy', 'JavaScript', 'HTML/CSS', 'Python', 'SQLite'],
    highlights: [
      {
        icon: 'fas fa-parking', color: 'green',
        title: 'Real-Time Slot Booking',
        desc: 'Transactional reservation with conflict prevention at the database level',
      },
      {
        icon: 'fas fa-money-bill-wave', color: 'blue',
        title: 'Payment Workflows',
        desc: 'End-to-end booking + payment lifecycle with atomic rollback on failure',
      },
      {
        icon: 'fas fa-tachometer-alt', color: 'purple',
        title: 'Query Optimization',
        desc: 'Indexed ORM queries cut slot availability lookups from full-scan to O(log n)',
      },
      {
        icon: 'fas fa-layer-group', color: 'yellow',
        title: 'Layered Architecture',
        desc: 'Route → Business Logic → Repository separation for clean testability',
      },
    ],

    archFlow: {
      viewBox: '0 0 860 120',
      nodes: [
        { id: 'browser',  label: 'Browser / JS',     x: 10,  y: 35, w: 110, h: 36, color: 'blue'   },
        { id: 'routes',   label: 'Flask Routes',     x: 175, y: 35, w: 110, h: 36, color: 'green'  },
        { id: 'auth',     label: 'Auth Layer',       x: 340, y: 35, w: 100, h: 36, color: 'yellow' },
        { id: 'logic',    label: 'Business Logic',   x: 498, y: 35, w: 115, h: 36, color: 'purple' },
        { id: 'orm',      label: 'SQLAlchemy ORM',   x: 670, y: 35, w: 125, h: 36, color: 'green'  },
      ],
      paths: [
        { id: 'p1', d: 'M 120,53 L 175,53', label: 'fetch'  },
        { id: 'p2', d: 'M 285,53 L 340,53', label: 'guard'  },
        { id: 'p3', d: 'M 440,53 L 498,53', label: 'process'},
        { id: 'p4', d: 'M 613,53 L 670,53', label: 'query'  },
      ],
    },

    apiDocs: {
      endpoints: [
        { method: 'GET',  path: '/api/v1/slots/availability', desc: 'List available parking slots by floor' },
        { method: 'POST', path: '/api/v1/booking',            desc: 'Reserve a slot — atomic transaction' },
        { method: 'POST', path: '/api/v1/payment/confirm',    desc: 'Confirm payment, finalize booking' },
        { method: 'DELETE', path: '/api/v1/booking/{id}',     desc: 'Cancel booking — release slot' },
      ],
      curl: `# Check slot availability for floor 2
curl -X GET https://api.v-park.dev/api/v1/slots/availability?floor=2 \\
  -H "Authorization: Bearer <token>"`,
      response: `HTTP/1.1 200 OK
Content-Type: application/json
X-Response-Time: 5ms

{
  "status": "ok",
  "data": {
    "floor": 2,
    "total_slots": 50,
    "available": 12,
    "slots": [
      { "id": "2A-04", "status": "free",   "type": "regular" },
      { "id": "2A-07", "status": "free",   "type": "compact" },
      { "id": "2B-01", "status": "booked", "type": "regular" }
    ]
  },
  "meta": {
    "query_time_ms": 3,
    "index_used": "idx_slots_floor_status"
  }
}`,
      schema: `// ── POST /api/v1/booking ────────────────────────────────────
Request {
  slot_id:    string   // required — e.g. "2A-04"
  vehicle_no: string   // required — license plate
  duration_h: number   // required — booking hours
  user_id:    number   // from JWT claims
}

Response 201 {
  status: "created"
  data: {
    booking_id:  string
    slot_id:     string
    vehicle_no:  string
    starts_at:   string   // ISO 8601
    ends_at:     string
    amount:      number   // INR
    status:      "pending_payment"
  }
}

// Transaction guarantee: slot locked via DB-level constraint.
// On payment failure → automatic rollback, slot released.`,
    },
  },

  /* ─────────────────────────────── 03: Film Fiesta ─────────────────── */
  {
    id: 3,
    index: '03',
    name: 'Film Fiesta',
    tagline: 'Spring Boot MVC Movie Booking Platform',
    period: '2024',
    affiliation: 'Personal Project',
    github: 'https://github.com/its-tsukii',
    live: null,
    stack: ['Spring Boot', 'Java', 'MySQL', 'JPA', 'Hibernate', 'REST APIs', 'MVC'],
    highlights: [
      {
        icon: 'fas fa-film', color: 'green',
        title: 'MVC Architecture',
        desc: 'Controller → Service → Repository layering with Spring Boot conventions',
      },
      {
        icon: 'fas fa-lock', color: 'blue',
        title: 'Seat Locking & Rollback',
        desc: 'ACID-compliant @Transactional seat locks prevent double-booking under concurrency',
      },
      {
        icon: 'fas fa-database', color: 'purple',
        title: 'JPA / Hibernate ORM',
        desc: 'Entity relationships and lazy/eager fetch strategies tuned per query pattern',
      },
      {
        icon: 'fas fa-check-circle', color: 'yellow',
        title: 'Transactional Consistency',
        desc: 'MySQL transactions ensure consistent state across concurrent booking requests',
      },
    ],

    archFlow: {
      viewBox: '0 0 860 120',
      nodes: [
        { id: 'client',   label: 'HTTP Client',      x: 10,  y: 35, w: 105, h: 36, color: 'blue'   },
        { id: 'mvc',      label: 'Spring MVC',       x: 170, y: 35, w: 110, h: 36, color: 'green'  },
        { id: 'service',  label: '@Service Layer',   x: 338, y: 35, w: 125, h: 36, color: 'yellow' },
        { id: 'jpa',      label: 'JPA Repository',  x: 522, y: 35, w: 120, h: 36, color: 'purple' },
        { id: 'mysql',    label: 'MySQL (ACID)',     x: 702, y: 35, w: 115, h: 36, color: 'green'  },
      ],
      paths: [
        { id: 'p1', d: 'M 115,53 L 170,53', label: 'REST'        },
        { id: 'p2', d: 'M 280,53 L 338,53', label: '@Transact.'  },
        { id: 'p3', d: 'M 463,53 L 522,53', label: 'persist'     },
        { id: 'p4', d: 'M 642,53 L 702,53', label: 'ACID write'  },
      ],
    },

    apiDocs: {
      endpoints: [
        { method: 'GET',  path: '/api/v1/movies/{id}/seats', desc: 'Fetch seat map with availability status' },
        { method: 'POST', path: '/api/v1/booking/reserve',   desc: 'Lock seat — opens @Transactional block' },
        { method: 'POST', path: '/api/v1/booking/confirm',   desc: 'Finalize booking, commit transaction' },
        { method: 'GET',  path: '/api/v1/booking/{id}',      desc: 'Retrieve booking confirmation' },
      ],
      curl: `# Reserve a seat — triggers @Transactional lock
curl -X POST https://api.film-fiesta.dev/api/v1/booking/reserve \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "showtime_id": 101,
    "seat_ids": ["D4", "D5"],
    "user_id": 77
  }'`,
      response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "reserved",
  "data": {
    "reservation_id": "RSV-2024-0042",
    "showtime_id": 101,
    "seats": [
      { "id": "D4", "row": "D", "number": 4, "type": "standard" },
      { "id": "D5", "row": "D", "number": 5, "type": "standard" }
    ],
    "locked_until": "2024-11-15T19:10:00Z",
    "amount": 520.00,
    "currency": "INR"
  },
  "meta": {
    "transaction_id": "txn_a1b2c3",
    "lock_timeout_s": 300
  }
}`,
      schema: `// ── POST /api/v1/booking/reserve ────────────────────────────
Request {
  showtime_id: number    // required
  seat_ids:    string[]  // required — e.g. ["D4","D5"]
  user_id:     number    // from JWT
}

// Spring @Transactional behaviour:
// 1. SELECT seats WHERE id IN (?) FOR UPDATE  ← DB-level row lock
// 2. Validate status == 'AVAILABLE'
// 3. UPDATE seats SET status = 'RESERVED', locked_by = ?
// 4. INSERT INTO reservations …
// 5. COMMIT  (or ROLLBACK on any constraint violation)

Response 200 {
  status: "reserved"
  data: {
    reservation_id: string
    seats: Seat[]
    locked_until:   string   // ISO 8601 — expires in 5 min
    amount:         number
  }
}

Response 409 {
  status: "conflict"
  message: "Seat D4 already booked"
  code: "SEAT_UNAVAILABLE"
}`,
    },
  },
]
