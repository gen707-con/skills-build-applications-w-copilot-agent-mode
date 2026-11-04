# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the React app thin and UI-focused; it should render data from the shared API client, surface loading and error states, and never bypass the `/api` contract.
- Logic tier decision: Build the Express API around typed services and route handlers that validate request data, avoid raw cast exceptions, and return deliberate 4xx responses for invalid IDs or missing users/teams.
- Data tier decision: Define Mongoose schemas and seed data first so the backend and frontend both operate on the same persisted model contract for users, teams, activities, and workouts.
- Activity tracking approach: Store each activity with user/team references, minutes, computed points, and occurredAt; validate the references and reject invalid input before persisting.
- Team management approach: Ensure teams always include a required name and mascot, default members to an empty array, and keep member references consistent with the seeded users.
- Leaderboard approach: Aggregate activity points by team, sort descending, and assign ranks from 1 upward so the leaderboard reflects total contribution from the same data model.
- Workout suggestions approach: Match a user by email, derive the most relevant workout from the user’s goal or recent activity focus, and include a reason explaining the recommendation.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — validates the Mongoose schemas and seed data contract; failures here mean the persisted model or fixture data is not yet aligned with the exercise requirements.
- API command: `npm run test:api --prefix octofit-tracker/backend` — validates the Express route behavior and contracts for activity creation, team creation, leaderboard sorting, and workout suggestions; failures here mean the logic tier is still incomplete or returning the wrong status/shape.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — validates that the UI renders real data, shows loading/empty/error states, and uses the shared API client correctly; failures here mean presentation state handling is incomplete or the component contract is not met.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — confirms the TypeScript server compiles cleanly after the data and API layers are implemented.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — confirms the React app compiles cleanly after the UI contract is implemented.
