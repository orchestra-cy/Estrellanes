# Reducers & Sagas Flow (brief)

This document summarizes how data flows through the login/auth flow in this project, and which files are responsible at each step. It follows the instructor's stated order: API -> Sagas -> Reducers (but the UI triggers the flow).

High-level steps (what happens, in order)
1. UI intent (you)
   - The user interacts with the UI (Login screen) and you dispatch an action:
     - Example: `dispatch(authLogin({ username, password }))`
     - File example: `src/screens/auth/Login.js`

2. Action layer (intent)
   - Action types / creators describe the intent and payload shape:
     - `USER_LOGIN` is the trigger action
     - `USER_LOGIN_REQUEST`, `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILURE` are lifecycle actions
     - File example: `src/app/action.js`

3. Saga layer (side-effect orchestration)
   - A watcher saga listens for `USER_LOGIN` and runs the worker saga.
   - Worker saga:
     - Dispatches `USER_LOGIN_REQUEST` (so reducers set loading state)
     - Calls the API helper (`call(UserLogin, payload)`)
     - Interprets the API result and dispatches either:
       - `USER_LOGIN_SUCCESS` (payload contains token/user), or
       - `USER_LOGIN_FAILURE` (error message)
   - File example: `src/app/sagas/auth.js`

4. API layer (network)
   - Encapsulates the HTTP request and returns a normalized result so the saga can decide success/failure.
   - Should return shapes like:
     - Success: `{ ok: true, status, data, token? }`
     - Failure: `{ ok: false, status?, data?, error }`
   - File example: `src/app/api/auth.js`

5. Reducer layer (state update)
   - Reducer is a pure function that reacts to lifecycle actions:
     - `USER_LOGIN_REQUEST` -> set `isLoading: true`
     - `USER_LOGIN_SUCCESS` -> set `isLoading: false`, store `userData` and `token`
     - `USER_LOGIN_FAILURE` -> set `isLoading: false`, store `error`
   - File example: `src/app/reducers/auth.js`
   - Root reducer / persistence configured in: `src/app/reducers/index.js`

6. UI reacts
   - Components read the updated state via `useSelector`:
     - Show spinner when `auth.isLoading` is true
     - Display error when `auth.error` exists
     - Navigate to protected screens when `auth.token` (or `auth.userData`) is present

Practical notes
- Keep side effects in sagas only — reducers must stay pure.
- Normalize and document the backend response shape (where the token lives), then handle that in the API helper and reducer.
- If you want tokens persisted across app restarts, ensure `auth` is not blacklisted from persistence in `reducers/index.js`.
- Common file mapping in this repo:
  - UI: `src/screens/auth/Login.js`
  - Actions: `src/app/action.js`
  - Sagas: `src/app/sagas/auth.js` (+ `src/app/sagas/index.js` root)
  - API: `src/app/api/auth.js`
  - Reducer: `src/app/reducers/auth.js`
  - Store wiring: `src/app/reducers/index.js` and `App.tsx` (runs saga)

Quick sequence (one-line):
UI dispatch -> USER_LOGIN -> saga (USER_LOGIN_REQUEST, call API) -> API response -> saga (USER_LOGIN_SUCCESS/FAILURE) -> reducer updates store -> UI reads state.
