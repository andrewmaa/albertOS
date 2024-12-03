# AlbertOS

A modern web-based learning platform built with Next.js and Convex. A live version is available [here](https://albertos.andrewma.io).

## Tech Stack

- **Frontend**: Next.js, Shadcn UI
- **Backend**: Convex
- **Authentication**: Built-in auth system
- **Styling**: Tailwind CSS
- **Animations**: Anime.js, Typed.js
- **Data**: Schedge API

## Features

- User authentication and authorization
- Course management system
- Interactive learning interface
- File handling capabilities
- Real-time updates with Convex
- Responsive design with modern UI components

## Project Structure

```
├── app/ # Pages and components
├── convex/ # Backend Convex functions and schema
│ ├── auth.ts # Authentication logic
│ ├── courses.ts # Course management
│ ├── schema.ts # Database schema
│ ├── users.ts # User management
│ └── types.ts # TypeScript types
├── public/ # Static assets
├── ui/ # UI components
└── types/ # TypeScript type definitions
```
