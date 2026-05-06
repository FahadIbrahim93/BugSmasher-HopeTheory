# BugSmasher Technical Standards

## Code Quality Rules

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` + type guards)
- Explicit return types on functions
- Prefer interfaces over type aliases

### React Patterns
- Functional components only
- Custom hooks for shared logic
- Context for cross-cutting concerns
- Error boundaries for all major routes

### Game Engine Architecture
- Entity Component System (ECS) pattern
- Separation of rendering from game logic
- Frame-rate independent updates
- Spatial partitioning for performance

### State Management
- Single source of truth per domain
- Immutable updates
- Versioned saves for migration
- Optimistic UI with rollback

## Performance Targets

### Frame Rate
- 60 FPS minimum on modern devices
- 30 FPS acceptable on low-end
- Frame drop monitoring via logger

### Memory
- Max 50MB heap growth during gameplay
- Object pooling for particles
- Texture atlas for sprites

### Load Times
- Initial load: < 3 seconds on 4G
- Asset load: progressive with placeholders

## Testing Matrix

| Layer | Coverage Target | Test Type |
|---|---|---|
| Game Logic | 90% | Unit |
| Renderer | 80% | Integration |
| Auth Flow | 95% | E2E |
| Save System | 90% | Unit + Integration |

## Deployment

### CI/CD Pipeline
1. Lint + Typecheck
2. Unit + Integration Tests
3. Build
4. Deploy to Vercel preview
5. Production deployment on merge to main

### Environment Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ANALYTICS_ID