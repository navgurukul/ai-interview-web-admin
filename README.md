# AI Interview Web Admin

This is the admin dashboard for an AI-powered interviewing system. It allows for the management of jobs, questions, tests, users, and system settings.

## Key Features

*   **Job Management:** Create, update, delete, and view job postings.
*   **Question Bank:** Manage a repository of interview questions.
*   **Test Configuration:** Create and configure tests using questions from the bank.
*   **User Administration:** Manage users and their roles within the system.
*   **System Settings:** Configure overall application settings.

## Technology Stack

*   **Next.js:** React framework for server-side rendering and static site generation.
*   **React:** JavaScript library for building user interfaces.
*   **TypeScript:** Superset of JavaScript that adds static typing.
*   **Ant Design:** UI library for React components.

## Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd ai-interview-web-admin
    ```
    *(Replace `<repository_url>` with the actual URL of this repository)*

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    This project might require environment variables for configuration (e.g., API keys, database URLs). Create a `.env.local` file in the root of the project and add the necessary variables. If a `.env.example` file exists, you can copy it to `.env.local` and update the values.
    ```bash
    cp .env.example .env.local # If .env.example exists
    # Then edit .env.local with your specific settings
    ```
    *(Note: Since no `.env.example` was observed, you will need to identify required environment variables based on the application's needs, typically for API endpoints or database connections.)*

4.  **Run the development server:**
    Using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) (or the port specified in your environment) in your browser to see the application.

## Available Scripts

In the project directory, you can run the following scripts:

*   `npm run dev` or `yarn dev`:
    Runs the app in development mode.

*   `npm run build` or `yarn build`:
    Builds the app for production to the `.next` folder.

*   `npm run start` or `yarn start`:
    Starts the production server (requires a prior build).

*   `npm run lint` or `yarn lint`:
    Runs ESLint to identify and fix linting issues in the codebase.

## Project Structure

A brief overview of the key directories based on the project's setup:

*   `ai-interview-web-admin/`
    *   `app/`: Contains the core application code, following Next.js App Router conventions.
        *   `api/`: API route handlers for backend functionality (e.g., managing jobs, questions, tests, users, settings).
        *   `components/`: Reusable React components used throughout the application.
            *   `layout/`: Components defining the overall page structure (e.g., dashboard layout).
        *   `dashboard/`: Pages related to the admin dashboard sections (jobs, questions, tests, users, settings).
        *   `lib/`: Utility functions, API client configurations (e.g., `api.ts`, `job-api.ts`), and data definitions.
        *   `styles/`: Global styles and theme configurations (e.g., `hsbc-theme.css`).
        *   `globals.css`: Global CSS styles.
        *   `layout.tsx`: The root layout component for the application.
        *   `page.tsx`: The main entry page of the application.
    *   `package.json`: Lists project dependencies and scripts.
    *   `tsconfig.json`: TypeScript compiler configuration.
    *   `LICENSE`: Contains the license information for the project.
    *   `.gitignore`: Specifies intentionally untracked files that Git should ignore.

## License

This project is licensed under the terms specified in the `LICENSE` file.