# Un Moquer Hotelier

A comprehensive hotel booking, guest, and room management system built with React.

This repo is the front-end layer only and is not intended to be used by the public. This is simply a showcase of front-end architecture, bleeding-edge technologies, and general best practices.

![bookings](./docs/ui/Bookings.png)

<!-- [See More UI Screenshots](#ui-screenshots) -->

## Table of Contents

- [Features](#features)
- [Tooling List](#tooling-list)
- [API Layer & Data Storage](#api-layer--data-storage)
- [Finding Your Way Around](#finding-your-way-around)
- [Techniques & Decisions](#techniques--decisions)
- [API Gateway](#api-gateway)
- [Data Flow for HTTP Requests](#data-flow-for-http-requests)
- [Component Diagrams](#component-diagrams)
- [Component Hierarchy](#component-hierarchy)
- [UI Screenshots](#ui-screenshots)

## Features

#### Bookings

- Table view of hotel bookings.
- Filter table data via search functionality.
- View booking details including a calendar depicting duration of stay
- Cancel booking
- New booking
  - Select guest
  - Select checkin date and time.
  - Select checkout date and time.
  - Select a room from list of available rooms during dates of stay.
  - Confirm Booking details
- Modify Booking
  - Change room
  - Change checkout date
    - Functionality to prevent double-booking rooms
    - Option to free-up room if upcoming guest hasn't checked-in

#### Guests

- Table view of hotel guests.
- Search across all available data to filter table view.
- View guest details including a history
- Guest notes
- Modify Guest information
- New Guest
- Remove Guest

#### Rooms

- View grid of rooms
- Indication of booked rooms
- Detail view shows dates booked on calendar

#### Settings

- Room rate
- Default checkin time
- Default checkout time

#### Overview

- Statistics

## Tooling List

- [Yarn](https://yarnpkg.com/) - Package Manager
- [Vite](https://vitejs.dev/) - Front End Build Tool
- [React](https://react.dev/) - Front End Composition
- [React Router](https://github.com/remix-run/react-router#readme) - SPA Router
- [React Query](https://tanstack.com/query/v4/docs/react/overview) - Data Fetching
- [React Testing Library](https://testing-library.com/) - React Testing
- [Vitest](https://vitest.dev/) - Unit Testing
- [Ant Design](https://ant.design/) - React UI Component Library
- [Tailwind](https://tailwindcss.com/) - CSS Framework
- [DayJS](https://day.js.org/) - Date Formatting

## API Layer & Data Storage

- Next.js API Hosted on Vercel
- MongoDB Atlas for data storage

![image infrastructure diagram](./docs/UnMoquerHotelier-Infrastructure.jpg)

## Finding Your Way Around

- Prettier config is managed in package.json
- AntD Configuration Provider (overrides) in [src/main.jsx](src/main.jsx)
- `.env` file with `VITE_VERCEL_API_KEY` is required and not provided
- "Why Did You Render" is used to troubleshoot any rendering issues - to use, uncomment dependency in [src/main.jsx](src/main.jsx)
- Browser router wraps app in [src/main.jsx](src/main.jsx) white the Routes are used in [src/App.jsx](src/App.jsx)
- Global components (header, nav, etc) live in `src/components/[Component]/`
- High-level features live in `src/features/[Feature]/`

## Techniques & Decisions

### Code Style

- All function-based components (no class based)
  - Functional components have a simpler syntax, no lifecycle methods, constructors or boilerplate. You can express the same logic with less characters without losing readability.
- Avoid inline styles whenever possible.
  - Use tailwind classes, extend tailwind theme (`tailwind.config.js`), or leverage Ant Design theme provider customizations.
- Naming and structure should suffice in lieu of commenting in _most_ cases.
- To achieve consistent component naming conventions, only use named component exports, no defaults.
- Leverage React Query based custom hooks instead of kicking off HTTP requests within components.

### Patterns

- Not importing React `import React from 'react'`
  - As of React v17, you no longer have to include dependency to transform JSX
- Absolute Dependency Paths (`'src/'`)
- Spread Syntax
  - e.g. `<BookingConfirmation {...bookingDetails} />`
- Conditional Rendering
  - e.g. (`{ dataIsAvailable && <ComponentToShow /> }`)
- ContextAPI
  - Used to avoid ugly prop drilling managing New Booking modal states
- Loading State Pattern
  - Toggle `isLoading` state variables during processes.
  - Disable form fields and buttons during API calls to avoid duplicate calls.
- Destructuring with Aliasing
  - e.g. ` const { mutate: addGuest } = useCreateGuest()`
- Container Parent / Presentation Child Pattern (smart parent / dumb children)
  - All core features exhibit this pattern (Overview, Bookings, Guests, Rooms, and Settings)
- Custom Hooks
  - Only use Higher Order Components (HOC) or Render Props when absolutely necessary.
- `<ErrorBoundary />`
  - Prevent intrusive errors from affecting entire app.

## API Gateway

[src/api/API.js](src/api/API.js)

An exclusive channel for transmitting API requests.

All API requests converge here where they are processed and dispatched. The response can be captured in the returned Promise.

### Features

- Standardized method for handling requests.
- Authorization key passed for every call.
- Mechanism for assembling query strings.
- Converts response to JSON.
- Success and error handling
- DRY. No new features need dedicated api handlers.
- One declaration of a `fetch` method for all outbound requests

sample config to return all guest data

```
API.call( {
  method: 'GET',
  endpoint: '/guests'
} )
```

sample config to delete a specific guest

```
API.call( {
  method: 'DELETE',
  endpoint: '/guests',
  id: '652a002a84fd6cdd03be4d0f'
} )
```

sample config that updates a guest's information

```
API.call( {
  method: 'PUT',
  endpoint: '/guests',
  id: '656a83b7572606637953b036'
  payload: {
    firstName: "Roger",
    lastName: "Callahan",
    email: "r_callahan@yahoo.com",
    phone: "(827) 340-9834",
    dob: "1966-10-22",
    address: {
        address1: "606 Lureen Raveen",
        address2: "Apt. 3",
        city: "Trunk",
        state: "TN",
        zip: "70301"
    },
    licenseNumber: "429823409823408",
    lastUpdated: "2023-12-06T00:36:09.014Z"
  }
} )
```

Configuration objects must include, at minimum, a `method` and `endpoint`. This would presumably be a GET request for all records from the endpoint. If the aforementioned minimum required arguments are passed in alongside an `id`, it's assumed you'll be requesting or deleting a single record - depending on the method passed in.

**NOTE:** GET requests with a passed in "payload" are transformed into query strings. POST and PUT requests with payloads are sent through the body of the request as they normally would.

sample config:

```
API.call( {
  method: 'GET',
  endpoint: '/guests',
  id: '652a002a84fd6cdd03be4d0f',
  payload: {
    checkinDate: '2023-12-10T15:30:00.000Z',
    checkoutDate: '2023-12-17T15:30:00.000Z',
  }
} )
```

gets transformed into an api ready uri prior to fetch invocation

```
/guests?checkinDate=2023-12-10T15:30:00.000Z&checkoutDate=2023-12-17T15:30:00.000Z&id=652a002a84fd6cdd03be4d0f`
```

### Available API Paths

`src/api/constants.js`
these keys are used for the endpoint path property in the API Gateway configuration

```
bookings: "/bookings",
bookingsByRoom: "/bookingsByRoom",
guests: "/guests",
guest: "/getOneGuest",
autocompleteGuests: "/getGuestsForAutocomplete",
rooms: "/rooms",
occupiedRooms: "/getCurrentlyOccupiedRooms",
roomByAvailability: "/getRoomsByAvailability",
settings: "/settings",
```

## Data Flow for HTTP Requests

![http flow](./docs/UnMoquerHotelier-HTTPFlow.jpg)

## Component Diagrams

### New Booking Form

![new booking form diagram](./docs/UnMoquerHotelier-NewBooking.jpg)
![new booking flow diagram](./docs/UnMoquerHotelier-NewBookingFlow.jpg)
![new booking db diagram](./docs/UnMoquerHotelier-NewBookingDBUpdates.jpg)

## Component Hierarchy

TBD

## UI Screenshots

### Guest Table

![guests](./docs/ui/Guests.png)

### Guest Detail

![guest detail](./docs/ui/GuestDetail.png)

### New Guest Form

![new guest](./docs/ui/NewGuest.png)

### Bookings Table

![bookings](./docs/ui/Bookings.png)

### Booking Detail

![booking detail](./docs/ui/BookingDetails.png)

### New Booking Form

![new booking](./docs/ui/NewBooking.png)

### Booking Confirmation

![booking confirmation](./docs/ui/BookingConfirmation.png)

```

```
