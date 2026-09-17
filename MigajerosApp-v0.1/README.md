# Migajeros — primera vertical navegable

Mobile social storytelling prototype focused on pseudonymous relationship experiences. Built with React Native, Expo and TypeScript, featuring threaded stories, custom reactions, comments, profiles and a moderation-first 18+ product design.

# Migajeros

> **Todos hemos sido migajeros alguna vez. Aquí venimos a contarlo.**

Migajeros is an 18+ mobile social storytelling product where people can share funny, painful, or unexpected relationship experiences using a stable nickname or an anonymous identity.

The project combines product design, mobile development, accessibility considerations, community safety and social interaction patterns in a single cross-platform application.

## Project status

**Current stage:** Interactive MVP prototype
**Version:** 0.1
**Target platforms:** iOS, Android and Web
**Initial market:** Mexico
**Language:** Spanish

The current prototype uses in-memory demonstration data. Stories, comments, reactions and other changes are reset when the application restarts.

Real authentication, persistent data and server-side age validation are part of the next development milestone.

## Product concept

Migajeros introduces its own vocabulary:

| Traditional concept | Migajeros concept |
| ------------------- | ----------------- |
| User                | Migajero          |
| Post                | Migaja            |
| Thread              | Historia          |
| Publish             | Soltar una Migaja |
| Story continuation  | Nueva Migaja      |

A story can grow through multiple Migajas published by its original author. Other users can read, react, comment, follow creators and save stories.

## Current functionality

* 18+ entry confirmation.
* Interactive onboarding and demonstration account.
* Feed sections: **Para ti**, **Siguiendo** and **Recientes**.
* Text-based stories organized into categories.
* Story continuations displayed as a single chronological thread.
* Pseudonymous and anonymous publishing.
* Six custom community reactions.
* One active reaction per user and story.
* Comments.
* Follow and unfollow profiles.
* Public profiles.
* Saved stories.
* Search by text and category.
* Story completion status.
* Basic input validation.
* Accessible labels, roles and interaction states.
* Responsive execution through Expo on iOS, Android and Web.

## Custom reactions

Migajeros avoids the traditional generic “like” and uses reactions designed around the product identity:

* Migajero
* Sal de ahí
* Contexto
* Te entiendo
* No puede ser
* Continúa

A user can have only one active reaction per story. Selecting another reaction replaces the previous one.

## Technology

* React Native
* Expo
* TypeScript
* React Native Web
* Node.js
* Node Test Runner

### Planned backend

The next milestone will introduce:

* Supabase Auth.
* Email and password registration.
* Email verification.
* Google OAuth.
* Persistent sessions.
* Private date-of-birth storage.
* Server-side 18+ validation.
* PostgreSQL persistence.
* Row Level Security policies.

## Project structure

```text
MigajerosApp/
├── assets/                     # Application icons and visual assets
├── src/
│   ├── data.ts                 # Domain types and demonstration data
│   ├── domain.ts               # Testable business rules
│   ├── domain.test.mjs         # Domain unit tests
│   └── ui.tsx                  # Re
```


