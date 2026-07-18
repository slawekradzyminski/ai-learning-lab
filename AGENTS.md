# AI Learning Lab contributor guide

## Product rule

Teach from the learner's goal outward. Primary slides should explain observable behavior, practical decisions, failure modes, and evidence. Keep agent-course equations out of the main path. Use focused mathematics in the LLM course only when it materially explains the mechanism being manipulated.

## Repository checks

Run these before handing off a change:

```bash
npm test
npm run build
```

For deployment changes, also build the image and verify both the direct and gateway-prefixed `/learn/` routes.

## Boundaries

- Guided labs must remain usable without a live model.
- Live requests go through `src/lib/api.ts`; never compile credentials into the frontend.
- Keep the public route contract at `/learn/`.
- Keep theory sources explicit and prefer primary or official documentation.
