# Repo Guide for basic-rpg

This document provides instructions for automated agents working with this repository.

## Project Overview

This project is a small browser RPG built with **Node.js** and **socket.io**. The server files live at the repository root (`Server.js`, `Overworld.js`, etc.) while client code is under `public/`. There are no automated unit tests, but the server can be started with `node index.js`.

## Environment

- Use **Node.js v20** or later (the repository currently uses v20 in this environment).

## Coding Conventions

- JavaScript files use 4-space indentation and semicolons.
- End every file with a trailing newline.
- When adding new files, place them in the appropriate folder (`public/` for client code, root for server code).
- Keep code readable and avoid large functions when possible.

## Running the Server

There is no dedicated test suite. To verify that the application starts correctly, run:

```bash
node index.js
```

The server should log lines like `App online at http://localhost:3000` to the console. You can terminate it with `Ctrl+C` once you see these messages.

## Validation Steps

When modifying JavaScript files, run the following before committing:

1. Syntax check the changed file with `node --check <file>`.
2. Start the server briefly with `node index.js` and verify it prints the startup messages, then terminate it.

If a command fails due to environment limitations, mention it in your PR summary.

## Pull Request Guidelines

- Summarize changes in English even if the original request is in another language.
- Include a brief note about the server test results in the PR body.
