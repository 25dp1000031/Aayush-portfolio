// ══════════════════════════════════════════════════════════════════════════
//  PORTFOLIO DATA — SINGLE SOURCE OF TRUTH
// ══════════════════════════════════════════════════════════════════════════
//  Edit THIS FILE to update any section of the portfolio.
//
//  Architecture:
//   · These values are loaded immediately on first paint (zero-delay, no DB).
//   · Supabase is an optional overlay — if fresher data exists in the DB it
//     is merged on top.  If the DB is down / empty / failing, these values
//     are shown directly.  Sections are NEVER blank.
//   · Static-only fields (archFlow, apiDocs, index, period) never go to the
//     DB — they live here permanently and are merged in at render time.
//
//  To add / replace a project  → edit STATIC_PROJECTS below.
//  To update skills / radar    → edit STATIC_SKILLS.
//  To change hero copy         → edit STATIC_HERO.
//  To add experience           → edit STATIC_EXPERIENCE.
// ══════════════════════════════════════════════════════════════════════════

// ─── Hero ────────────────────────────────────────────────────────────────
export const STATIC_HERO = {
  name:    'Aayush Kukade',
  title:   'Backend Engineer',
  tagline: 'Specializing in Distributed Workflows & API Design',
  summary: 'Building resilient, scalable APIs, asynchronous data pipelines, and containerised cloud architectures with Java, Spring Boot, Python, Flask, Redis, Celery, Docker, and AWS.',
  status:  'Available for opportunities',
  badges: [
    { label: "GATE CS '26",  icon: 'fas fa-shield-alt',     variant: 'green'  },
    { label: 'IITM Diploma', icon: 'fas fa-graduation-cap', variant: 'blue'   },
    { label: 'MCA SGBAU',    icon: 'fas fa-university',      variant: 'purple' },
  ],
}

// ─── Projects ────────────────────────────────────────────────────────────
//  id          — url-safe slug (used as DB primary key when committing)
//  index       — display badge ('01', '02', …) — STATIC, never goes to DB
//  archFlow    — SVG architecture diagram data  — STATIC, never goes to DB
//  apiDocs     — tabbed API mock data           — STATIC, never goes to DB
//  All other fields are editable via admin mode and sync to Supabase.
export const STATIC_PROJECTS = [

  /* ── 01: The Placement Route ──────────────────────────────────────── */
  {
    id:          'placement-route',
    index:       '01',
    name:        'The Placement Route',
    tagline:     'Role-Based Recruitment Automation Backend',
    affiliation: 'IIT Madras — MAD II CS2006',
    period:      'Jan 2026 – May 2026',
    description: 'Built a scalable Flask backend with SQLAlchemy modular architecture. Implemented JWT-based authentication with RBAC across three user roles (Student, Company, Admin), optimized database indexing reducing API response times by ~20%, and integrated Celery for asynchronous processing of reports and email dispatch.',
    github:      'https://github.com/25dp1000031/mad2-ppa-v2',
    live:        null,
    stack:       ['Flask', 'PostgreSQL', 'Redis', 'Celery', 'JWT', 'Vue.js', 'Docker', 'SQLAlchemy'],
    highlights: [
      { icon: 'fas fa-shield-alt',  color: '#10B981', title: 'Multirole RBAC',             desc: 'JWT-based auth with isolated role permissions for Students, Companies & Admins.' },
      { icon: 'fas fa-layer-group', color: '#3B82F6', title: 'Service Layer Architecture',  desc: 'Clean handler → service → repository separation for testability and scalability.' },
      { icon: 'fas fa-tasks',       color: '#8B5CF6', title: 'Async Celery Workflows',      desc: 'Report generation & email dispatch offloaded to background Celery task queues.' },
      { icon: 'fas fa-bolt',        color: '#F59E0B', title: 'Redis Caching',               desc: 'API response caching reduces repeated DB reads on high-traffic listing endpoints.' },
    ],

    // ── SVG architecture diagram (static, never leaves client) ──────
    archFlow: {
      viewBox: '0 0 860 180',
      nodes: [
        { id: 'client', label: 'Vue.js Client',  x: 10,  y: 25,  w: 115, h: 36, color: 'blue'   },
        { id: 'api',    label: 'Flask REST API', x: 175, y: 25,  w: 120, h: 36, color: 'green'  },
        { id: 'jwt',    label: 'JWT Auth Guard', x: 350, y: 25,  w: 115, h: 36, color: 'yellow' },
        { id: 'redis',  label: 'Redis Cache',    x: 520, y: 25,  w: 100, h: 36, color: 'red'    },
        { id: 'pg',     label: 'PostgreSQL',     x: 675, y: 25,  w: 100, h: 36, color: 'green'  },
        { id: 'celery', label: 'Celery Worker',  x: 350, y: 115, w: 115, h: 36, color: 'purple' },
        { id: 'pg2',    label: 'PostgreSQL',     x: 675, y: 115, w: 100, h: 36, color: 'green', ghost: true },
      ],
      paths: [
        { id: 'p1', d: 'M 125,43 L 175,43',          label: 'HTTP'    },
        { id: 'p2', d: 'M 295,43 L 350,43',          label: 'route'   },
        { id: 'p3', d: 'M 465,43 L 520,43',          label: 'cache?'  },
        { id: 'p4', d: 'M 620,43 L 675,43',          label: 'query'   },
        { id: 'p5', d: 'M 407,61 L 407,115',         label: 'async'   },
        { id: 'p6', d: 'M 465,133 Q 570,133 675,133', label: 'persist' },
      ],
    },

    // ── API documentation mock (static, never leaves client) ────────
    apiDocs: {
      endpoints: [
        { method: 'POST', path: '/api/v1/auth/login',            desc: 'Authenticate user → signed JWT with RBAC claims' },
        { method: 'GET',  path: '/api/v1/placements',            desc: 'List job postings (Redis-cached, TTL 300s)'       },
        { method: 'POST', path: '/api/v1/placements/{id}/apply', desc: 'Submit application → Celery task queued'          },
        { method: 'GET',  path: '/api/v1/reports/{id}',          desc: 'Download async-generated placement report'        },
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
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "claims": {
      "user_id": 42,
      "role": "STUDENT",
      "institution": "IITM",
      "permissions": ["placement.read","profile.write","application.create"]
    }
  },
  "meta": { "cache": "MISS", "response_time_ms": 14, "served_by": "celery@worker-01" }
}`,
      schema: `// ── POST /api/v1/auth/login ─────────────────────────────────
Request {
  email:    string   // required — registered email
  password: string   // required — min 8 characters
}

Response 200 {
  status: "ok" | "error"
  data: {
    access_token:  string        // HS256-signed JWT
    token_type:    "Bearer"
    expires_in:    number        // TTL in seconds
    claims: {
      user_id:      number
      role:         "STUDENT" | "COMPANY" | "ADMIN"
      institution:  string
      permissions:  string[]     // fine-grained RBAC scopes
    }
  }
}

Response 401 { status: "error", message: "Invalid credentials", code: "AUTH_FAILED" }`,
    },
  },

  /* ── 02: V-Park ───────────────────────────────────────────────────── */
  {
    id:          'v-park',
    index:       '02',
    name:        'V-Park',
    tagline:     'Full-Stack Vehicle Parking Management System',
    affiliation: 'IIT Madras — MAD I',
    period:      'May 2025 – Sep 2025',
    description: 'Developed a full-stack vehicle parking platform featuring real-time slot availability metrics, transactional booking workflows with conflict prevention at the DB level, payment lifecycle management, and layered service architecture, improving system query responsiveness by ~30%.',
    github:      'https://github.com/25dp1000031/vehicle-parking-system',
    live:        null,
    stack:       ['Flask', 'SQLAlchemy', 'JavaScript', 'HTML/CSS', 'Python', 'SQLite'],
    highlights: [
      { icon: 'fas fa-parking',         color: '#10B981', title: 'Real-Time Slot Booking', desc: 'Transactional reservation with conflict prevention at the database level.'       },
      { icon: 'fas fa-money-bill-wave', color: '#3B82F6', title: 'Payment Workflows',      desc: 'End-to-end booking + payment lifecycle with atomic rollback on failure.'         },
      { icon: 'fas fa-tachometer-alt',  color: '#8B5CF6', title: 'Query Optimization',     desc: 'Indexed ORM queries cut slot availability lookups from full-scan to O(log n).'  },
      { icon: 'fas fa-layer-group',     color: '#F59E0B', title: 'Layered Architecture',   desc: 'Route → Business Logic → Repository separation for clean testability.'           },
    ],

    archFlow: {
      viewBox: '0 0 860 120',
      nodes: [
        { id: 'browser', label: 'Browser / JS',   x: 10,  y: 35, w: 110, h: 36, color: 'blue'   },
        { id: 'routes',  label: 'Flask Routes',   x: 175, y: 35, w: 110, h: 36, color: 'green'  },
        { id: 'auth',    label: 'Auth Layer',     x: 340, y: 35, w: 100, h: 36, color: 'yellow' },
        { id: 'logic',   label: 'Business Logic', x: 498, y: 35, w: 115, h: 36, color: 'purple' },
        { id: 'orm',     label: 'SQLAlchemy ORM', x: 670, y: 35, w: 125, h: 36, color: 'green'  },
      ],
      paths: [
        { id: 'p1', d: 'M 120,53 L 175,53', label: 'fetch'   },
        { id: 'p2', d: 'M 285,53 L 340,53', label: 'guard'   },
        { id: 'p3', d: 'M 440,53 L 498,53', label: 'process' },
        { id: 'p4', d: 'M 613,53 L 670,53', label: 'query'   },
      ],
    },

    apiDocs: {
      endpoints: [
        { method: 'GET',    path: '/api/v1/slots/availability', desc: 'List available parking slots by floor'  },
        { method: 'POST',   path: '/api/v1/booking',            desc: 'Reserve a slot — atomic transaction'    },
        { method: 'POST',   path: '/api/v1/payment/confirm',    desc: 'Confirm payment, finalize booking'      },
        { method: 'DELETE', path: '/api/v1/booking/{id}',       desc: 'Cancel booking — release slot'          },
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
  "meta": { "query_time_ms": 3, "index_used": "idx_slots_floor_status" }
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
    booking_id: string
    slot_id:    string
    starts_at:  string   // ISO 8601
    ends_at:    string
    amount:     number   // INR
    status:     "pending_payment"
  }
}

// Transaction guarantee: slot locked via DB-level constraint.
// On payment failure → automatic rollback, slot released.`,
    },
  },

  /* ── 03: Film Fiesta ──────────────────────────────────────────────── */
  {
    id:          'film-fiesta',
    index:       '03',
    name:        'Film Fiesta',
    tagline:     'Spring Boot MVC Movie Booking Platform',
    affiliation: 'Personal Project · 2024',
    period:      '2024',
    description: 'Full-stack movie ticket booking system built on Spring Boot MVC. Implements ACID-compliant @Transactional seat locking to prevent double-booking under concurrent requests, JPA/Hibernate ORM with tuned eager/lazy fetch strategies, and a clean Controller → Service → Repository layer separation.',
    github:      'https://github.com/its-tsukii',
    live:        null,
    stack:       ['Spring Boot', 'Java', 'MySQL', 'JPA', 'Hibernate', 'REST APIs', 'MVC'],
    highlights: [
      { icon: 'fas fa-film',         color: '#10B981', title: 'MVC Architecture',        desc: 'Controller → Service → Repository layering with Spring Boot conventions.'                           },
      { icon: 'fas fa-lock',         color: '#3B82F6', title: 'Seat Locking & Rollback', desc: 'ACID-compliant @Transactional seat locks prevent double-booking under concurrency.'                  },
      { icon: 'fas fa-database',     color: '#8B5CF6', title: 'JPA / Hibernate ORM',     desc: 'Entity relationships and lazy/eager fetch strategies tuned per query pattern.'                       },
      { icon: 'fas fa-check-circle', color: '#F59E0B', title: 'Transactional Consistency', desc: 'MySQL transactions ensure consistent state across concurrent booking requests.' },
    ],

    archFlow: {
      viewBox: '0 0 860 120',
      nodes: [
        { id: 'client',  label: 'HTTP Client',    x: 10,  y: 35, w: 105, h: 36, color: 'blue'   },
        { id: 'mvc',     label: 'Spring MVC',     x: 170, y: 35, w: 110, h: 36, color: 'green'  },
        { id: 'service', label: '@Service Layer', x: 338, y: 35, w: 125, h: 36, color: 'yellow' },
        { id: 'jpa',     label: 'JPA Repository', x: 522, y: 35, w: 120, h: 36, color: 'purple' },
        { id: 'mysql',   label: 'MySQL (ACID)',   x: 702, y: 35, w: 115, h: 36, color: 'green'  },
      ],
      paths: [
        { id: 'p1', d: 'M 115,53 L 170,53', label: 'REST'       },
        { id: 'p2', d: 'M 280,53 L 338,53', label: '@Transact.' },
        { id: 'p3', d: 'M 463,53 L 522,53', label: 'persist'    },
        { id: 'p4', d: 'M 642,53 L 702,53', label: 'ACID write' },
      ],
    },

    apiDocs: {
      endpoints: [
        { method: 'GET',  path: '/api/v1/movies/{id}/seats', desc: 'Fetch seat map with availability status'    },
        { method: 'POST', path: '/api/v1/booking/reserve',   desc: 'Lock seat — opens @Transactional block'     },
        { method: 'POST', path: '/api/v1/booking/confirm',   desc: 'Finalize booking, commit transaction'        },
        { method: 'GET',  path: '/api/v1/booking/{id}',      desc: 'Retrieve booking confirmation'               },
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
    "amount": 520.00
  },
  "meta": { "transaction_id": "txn_a1b2c3", "lock_timeout_s": 300 }
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

Response 200 { status: "reserved", data: { reservation_id, seats, locked_until, amount } }
Response 409 { status: "conflict", message: "Seat D4 already booked", code: "SEAT_UNAVAILABLE" }`,
    },
  },
]

// ─── Skills ──────────────────────────────────────────────────────────────
export const STATIC_SKILLS = {
  radarLabels:    ['Java / Spring', 'Python / Flask', 'Redis & Celery', 'PostgreSQL', 'Docker / AWS', 'DSA / Algorithms', 'REST API Design', 'JWT & Auth'],
  radarValues:    [85, 82, 78, 80, 72, 88, 90, 82],
  benchmarkValue: 70,
  groups: [
    {
      id: 'sg1', icon: 'fas fa-server', title: 'Systems & Services',
      skills: [
        { id: 'sk1', label: 'Java',      icon: 'fab fa-java'   },
        { id: 'sk2', label: 'Spring Boot'                       },
        { id: 'sk3', label: 'Python',    icon: 'fab fa-python' },
        { id: 'sk4', label: 'Flask'                             },
        { id: 'sk5', label: 'REST APIs'                         },
        { id: 'sk6', label: 'JWT Auth'                          },
      ],
    },
    {
      id: 'sg2', icon: 'fas fa-bolt', title: 'Caching & Pipelines',
      skills: [
        { id: 'sk9',  label: 'Redis'         },
        { id: 'sk10', label: 'Celery'        },
        { id: 'sk11', label: 'Async Workers' },
        { id: 'sk12', label: 'Task Queues'   },
      ],
    },
    {
      id: 'sg3', icon: 'fas fa-database', title: 'Data & Storage',
      skills: [
        { id: 'sk15', label: 'PostgreSQL' },
        { id: 'sk16', label: 'MySQL'      },
        { id: 'sk17', label: 'SQLAlchemy' },
        { id: 'sk20', label: 'Supabase'   },
      ],
    },
    {
      id: 'sg4', icon: 'fas fa-cloud', title: 'Infrastructure & DevOps',
      skills: [
        { id: 'sk21', label: 'Docker'         },
        { id: 'sk22', label: 'AWS EC2'        },
        { id: 'sk23', label: 'AWS S3'         },
        { id: 'sk26', label: 'GitHub Actions' },
      ],
    },
  ],
}

// ─── DSA / Algorithms ────────────────────────────────────────────────────
export const STATIC_DSA = {
  leetcodeCount: 150,
  leetcodeUrl:   'https://leetcode.com/u/its-tsukii/',
  primaryLang:   'Java',
  repoUrl:       'https://github.com/25dp1000031/learn-java-dsa-structured',
  patterns: [
    { name: 'Sliding Window', icon: 'fas fa-window-maximize', color: '#10B981', pct: 90 },
    { name: 'Two Pointers',   icon: 'fas fa-arrows-alt-h',    color: '#10B981', pct: 88 },
  ],
}

// ─── GitHub Showcase ─────────────────────────────────────────────────────
export const STATIC_GITHUB = [
  {
    id:          'gs1',
    name:        'learn-java-dsa-structured',
    description: 'A structured software repository dedicated to mastering complex data structures and algorithms using Java. Implements pattern-based learning strategies across sorting, graph routing (BFS/DFS), matrix navigation, and dynamic programming memory-optimization maps.',
    tagline:     'Pattern-Based DSA Blueprint',
    language:    'Java',
    stars:       12, forks: 3,
    url:         'https://github.com/25dp1000031/learn-java-dsa-structured',
    topics:      ['java', 'algorithms', 'data-structures', 'design-patterns'],
  },
  {
    id:          'gs2',
    name:        'Pdsa-iitmBS-2025',
    description: 'A collection of core Programming, Data Structures, and Algorithms implementations completed as part of the IIT Madras Diploma/BS curriculum, focusing on algorithmic analysis, mathematical proofs, and complex data structures.',
    tagline:     'IIT Madras PDSA Core Frameworks',
    language:    'Python',
    stars:       6, forks: 1,
    url:         'https://github.com/25dp1000031/Pdsa-iitmBS-2025',
    topics:      ['python', 'algorithms', 'asymptotic-analysis', 'data-structures'],
  },
  {
    id:          'gs3',
    name:        'logistic-regression-from-scratch',
    description: 'A ground-up execution of logistic regression tracking models using pure mathematical gradient descent optimization loops without ML framework abstractions.',
    tagline:     'Pure Mathematical Machine Learning',
    language:    'Python',
    stars:       5, forks: 0,
    url:         'https://github.com/25dp1000031/logistic-regression-from-scratch',
    topics:      ['python', 'machine-learning', 'gradient-descent', 'math'],
  },
]

// ─── Experience ──────────────────────────────────────────────────────────
export const STATIC_EXPERIENCE = [
  {
    id:       'e1',
    company:  'Softronix Pvt. Ltd., Amravati',
    role:     'Software Trainee',
    period:   'Jan 2025 - Jun 2025',
    location: 'On-Site',
    bullets: [
      'Integrated secure REST APIs using Spring Boot, developing controllers, multithreaded services, and internal cluster endpoints.',
      'Optimized relational SQL queries and schema structures, reducing API response latency by ~15%.',
    ],
    tags: ['Spring Boot', 'Java', 'REST APIs'],
  },
]

// ─── Metrics ─────────────────────────────────────────────────────────────
export const STATIC_METRICS = {
  leetcodeCount:    150,
  gateScore:        418,
  gateRank:         4500,
  iitmCGPA:         7.45,
  sgbauGrade:       'A',
  experienceMonths: 6,
  queryEfficiency:  94,
}

// ─── Convenience bundle (consumed by portfolio.js DEFAULTS) ──────────────
export const DEFAULTS = {
  hero:           STATIC_HERO,
  projects:       STATIC_PROJECTS,
  skills:         STATIC_SKILLS,
  dsa_data:       STATIC_DSA,
  github_showcase: STATIC_GITHUB,
  experience:     STATIC_EXPERIENCE,
  metrics:        STATIC_METRICS,
}
