# Production Hardening Checklist

## Required Gates

- [ ] `npm ci` in remote CI after push
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test -- --run`
- [x] `npm run test:coverage`
- [x] `npm run build`
- [x] `npm audit --omit=dev`
- [x] Secret scan for service-role markers, Supabase platform-key prefixes, JWT-looking keys, and known leaked project refs

## Security

- [ ] Supabase anon key rotated after leak - external dashboard action
- [ ] Supabase service-role key rotated after leak - external dashboard action
- [ ] Git history scrubbed and rescanned - destructive history rewrite requires explicit operator action
- [ ] RLS policies verified with negative tests
- [ ] No service-role variable exposed through `VITE_`

## Accessibility

- [ ] Keyboard can start game, pause, resume, navigate settings, and close dialogs
- [ ] Focus is visible and not obscured
- [ ] Touch targets are at least WCAG 2.2 AA minimum where practical
- [ ] Auth does not depend on cognitive puzzles
- [ ] Buttons and icon controls have accessible names

## Performance

- [x] Main JS chunks under current Vite warning budget
- [ ] No unnecessary libraries in first-load path
- [ ] Canvas loop avoids avoidable allocations in hot paths
- [ ] Core Web Vitals measured on deployment

## Operations

- [ ] Rollback path documented
- [ ] Cloud-save failure mode documented
- [ ] Auth failure telemetry event planned
- [ ] Leaderboard write failures do not break local play
