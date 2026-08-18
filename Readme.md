# Device Event API

A small TypeScript API for managing devices, storing event history, and rebuilding device state from event streams.

## Prerequisites

- Node.js 18+
- Docker
- npm

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the entire application:

```bash
npm run start:all
```

The UI runs on:

```text
http://localhost:8080
```

The API runs on:

```text
http://localhost:3000
```

The PostgreSQL database runs on:

```text
http://localhost:5432
```

## Alternative startup

Start the database:

```bash
docker compose up -d db
```

Start the API:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

## Seed data

On startup, the app checks whether any devices already exist. If the database is empty, it creates sample devices and events automatically.

## API endpoints

### Devices

- GET /devices/listDevices
- GET /devices/getDevice/:deviceId
- POST /devices/createDevice
- PUT /devices/updateDevice/:deviceId
- DELETE /devices/deleteDevice/:deviceId

### Events

- POST /events/addEvent
- GET /events/getEvents/:deviceId
- GET /events/getEventsSince/:deviceId/:since
- GET /events/getLatestEvent/:deviceId
- DELETE /events/deleteEvents/:deviceId

### Projections

- POST /projections/rebuildProjection/:deviceId

## Example: list devices

```bash
curl http://localhost:3000/devices/listDevices
```

## Example: add an event

```bash
curl -X POST http://localhost:3000/events/addEvent \
  -H "Content-Type: application/json" \
  --data '{
    "deviceId": "6ea4370a-c79d-497a-8ebd-4148c515692c",
    "eventType": "TemperatureMeasured",
    "payload": {
      "value": 30.4
    }
  }'
```

## Notes

- Always send valid JSON with the `Content-Type: application/json` header.
- If the database is reset or recreated, generated device IDs may change.
- Use the current device ID returned by `/devices/listDevices` when posting events.

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Assumptions and summary

This project implements a small slice of a wider device-management solution. The focus is on event-driven data that builds on the existing domain model and state projections. The implementation was time-boxed to approximately six hours. I created the basic UI, the simple stylesheet was added using AI. Unit tests were also added to cover the core scenarios. Ports 3000, 5432, and 8080 must be free to run the application. I kept the commit history if you are interested in the process and the iteration as I continued (some commits were more successful than others). Thank you for your consideration.

## Improvements

- Improve the data model further by adding a `Placement` table for each device. This could represent the primary address or location where that device is used.
- Create a user table and link it to placements via a `userPlacementAggregate` table, allowing many-to-many relationships.
- Add access control so only admins can perform sensitive actions, such as deleting events.
- Store all datetimes in UTC and add logic to convert them to local time in the UI.
- Add integration tests and more domain-focused tests.
- Add validation beyond event creation to cover more inputs.
- Allow multiple device fields to be updated in a single request rather than only one change at a time.
- Add Playwright tests for the UI.
- Improve error responses.
- Add logic to restrict API usage to devices linked to the current user, except for admin users.
- Add a default route or landing page description for the API service.
- Improve the frontend with a device ID picker, example payload templates, and better response formatting.
- Add retry, timeout, and user feedback handling for failed API calls in the UI.
- Add pagination and filtering for large event lists.
- Add database migrations and a proper schema versioning workflow for future changes.
- Add migration test file
