# CodeDoc API Service

**Version:** 1.0.0
**Date:** May 30, 2025

## Description

CodeDoc is a Node.js Express application designed to automate code documentation generation and potentially integrate with services like GitHub, Confluence, and Google's Gemini AI. It appears to handle GitHub webhooks and aims to streamline the process of creating and managing documentation for software projects.

## Features

- **Webhook Handling**: Listens for GitHub webhook events (specifically POST requests to `/saas/github/webhook`).
- **Modular Configuration**: Loads configuration from environment variables (`.env` file) for settings like port, GitHub base URL, Confluence credentials, and Gemini API Key.
- **Service Integrations (Potential)**: Includes client and configuration setup for:
  - GitHub API
  - Confluence API
  - Google Gemini AI
- **Middleware**: Uses standard middleware like `body-parser` for request parsing, `cookie-parser`, and `cors` for handling Cross-Origin Resource Sharing.
- **Custom Logging**: Includes a custom logger middleware (`src/middleware/logger.js`).
- **Structured Routing**: API routes are organized, with GitHub-specific routes under `/saas/github/`.

## Prerequisites

- Node.js (version specified by project, likely v16+)
- npm (Node Package Manager) or yarn
- A `.env` file in the root directory to store environment variables (see **Configuration** section).

## Setup and Installation

1.  **Clone the Repository (if applicable):**

    ```bash
    git clone <repository-url>
    cd codedoc
    ```

2.  **Install Dependencies:**
    Navigate to the `codedoc` directory and run:

    ```bash
    npm install
    ```

    This will install the packages listed in `package.json`, including `express`, `@google/genai`, `axios`, `mongoose` (though MongoDB usage is not apparent in the provided `index.js`), etc.

3.  **Create `.env` File:**
    Create a `.env` file in the root of the `codedoc` directory. This file will store your sensitive credentials and environment-specific configurations. Add the following variables, replacing the placeholder values with your actual credentials and settings:

    ```env
    NODE_ENV=local
    PORT=9000

    # GitHub Configuration
    GITHUB_BASE_URL=https://api.github.com
    # Add any other GitHub related tokens or secrets if needed by github.js client

    # Confluence Configuration
    CONFLUENCE_CLIENT_ID=your_confluence_client_id
    CONFLUENCE_CLIENT_SECRET=your_confluence_client_secret

    # Gemini AI Configuration
    GEMINI_API_KEY=your_gemini_api_key

    # CORS Whitelist (example, adjust as needed)
    # ORIGIN_WHITELIST=http://localhost:3000,https://your-frontend-domain.com
    ```

    _Note: The `config.originWhitelist` used in `corsOptions` in `index.js` implies an `ORIGIN_WHITELIST` environment variable might be expected. Add it if you need to restrict CORS origins._

## Running the Application

1.  **Start the Server:**
    Once the setup is complete, run the following command from the `codedoc` directory:
    ```bash
    npm start
    ```
    This command, as defined in `package.json` (`node -r dotenv/config ./src/index.js`), starts the Node.js server using `nodemon` (if `nodemon` was intended, the script should be `./node_modules/.bin/nodemon -r dotenv/config ./src/index.js`) which also preloads environment variables from the `.env` file.
    The server will typically start on port 9000 (or the port specified in your `.env` file).

## API Endpoints

Based on the provided files:

- **GitHub Webhook Listener:**
  - `POST /saas/github/webhook`: This endpoint is designed to receive webhook events from GitHub. The actual processing logic resides in `src/controller/github.js` (`githubController.webhookEvents`).

Further endpoints would be defined in `src/routes/` and its subdirectories.

## How It Works

1.  **Initialization (`src/index.js`):**

    - The main Express application is initialized.
    - Middleware for request parsing (JSON, URL-encoded), cookie parsing, and CORS is set up.
    - The custom logger middleware is applied to log incoming requests.
    - Application routes (defined in `src/routes/index.js`) are mounted under the `/saas` prefix.
    - Error handling routes are set up.
    - The application starts listening on the configured port.

2.  **Configuration (`src/config/index.js`):**

    - Loads environment variables using `dotenv`.
    - Provides a utility `load` function to access these variables with default fallbacks.
    - Exports configuration objects for different parts of the application (port, GitHub, Confluence, Gemini).

3.  **Routing (`src/routes/index.js` and `src/routes/api/githubRoutes.js`):**

    - The main router (`src/routes/index.js`) delegates GitHub-specific routes to `githubRoutes.js` under the `/github` path.
    - `githubRoutes.js` defines the `POST /webhook` endpoint, which is handled by the `webhookEvents` function in `src/controller/github.js`.

4.  **Webhook Processing (Conceptual - `src/controller/github.js`):**
    - The `githubController.webhookEvents` function (not fully shown) would contain the logic to process incoming GitHub webhook payloads. This could involve interacting with the GitHub API client (`src/clients/github.js`), triggering documentation generation via the Gemini client (`src/gemini/index.js`), and potentially updating Confluence pages (`src/clients/confluence.js`, `src/confluence/index.js`).

## Project Structure (Key Files/Folders)

```
codedoc/
├── package.json            # Project metadata and dependencies
├── README.md               # This file
├── .env                    # Environment variables (you need to create this)
└── src/
    ├── index.js            # Main application entry point
    ├── config/
    │   └── index.js        # Configuration loader
    ├── clients/
    │   ├── confluence.js   # Client for Confluence API (presumably)
    │   └── github.js       # Client for GitHub API (presumably)
    ├── controller/
    │   └── github.js       # Controller for GitHub related logic (e.g., webhooks)
    ├── gemini/
    │   └── index.js        # Logic for interacting with Gemini AI
    ├── confluence/
    │   └── index.js        # Logic for interacting with Confluence
    ├── middleware/
    │   └── logger.js       # Custom request logger
    ├── routes/
    │   ├── index.js        # Main router
    │   ├── error.js        # Error handling routes
    │   └── api/
    │       └── githubRoutes.js # Routes for GitHub interactions
    └── services/
        └── index.js        # Business logic services (structure may vary)
```

## Customization & Further Development

- **Implement Controllers & Services**: Flesh out the logic in `src/controller/github.js` and corresponding service files in `src/services/` to handle the webhook events, interact with Gemini for documentation generation, and update Confluence.
- **GitHub Client (`src/clients/github.js`):** Implement functions to interact with the GitHub API as needed (e.g., fetch repository content).
- **Confluence Client (`src/clients/confluence.js` & `src/confluence/index.js`):** Implement functions to create/update Confluence pages.
- **Gemini Integration (`src/gemini/index.js`):** Develop the logic to send code content to Gemini and process the generated documentation.
- **Error Handling**: Enhance error handling throughout the application.
- **Security**: Ensure proper validation and sanitization of webhook payloads and any other inputs. Secure API keys and sensitive data.
- **Testing**: Add unit and integration tests.

## License

Refer to the `LICENSE` file if present, otherwise assume standard copyright unless specified.
