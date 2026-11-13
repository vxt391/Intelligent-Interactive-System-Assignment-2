# Development Log — Intelligent Interactive Systems Assignment 2

## Stage 1: Project Setup

**Project:** Intelligent Interactive System for Creative Intention Exploration and Refinement

**Development status:** Planning and initial setup

### Project goal

Develop a prototype that supports users in expressing, exploring and refining creative intentions during AI-assisted visual content creation.

### Proposed features

1. AI-assisted idea exploration with optional prompt refinement.
2. Community inspiration with preference selection.
3. Object-linked visual refinement.
4. Shared editable intent summary across the workflow.

### AI assistance

ChatGPT was used to discuss the project scope, evaluate interaction ideas and plan the prototype.

### Development decisions

The prototype will focus on demonstrating user interactions rather than implementing a complete AI image-generation system.

### Next steps

- Plan the user journey.
- Create the initial interface.
- Implement and test core interactions.

## Stage 2: React + Vite Project Setup

**Development status:** Initial application setup completed.

### Technology decisions

- React: Used to build interactive interface components.
- Vite: Used for the development environment.
- JavaScript and CSS: Used for application functionality and styling.
- ESLint: Selected for code quality checks.

### AI assistance

ChatGPT provided guidance on setting up React + Vite and selecting the development tools.

### Implementation

- Created the React + Vite application in the `app` folder.
- Installed project dependencies.
- Started the local development server.

### Testing

- Ran the development server successfully.
- Opened the default React + Vite page in the browser.
- Confirmed the starter application displays correctly.

### Next steps

Replace the default React interface with the initial Intenta application layout.

## Phase 1 — Application Foundation

**Date:** 13 November 2026

### 1. Implementation

Developed the initial Intenta interface using React, Vite, JavaScript and CSS, based on the hand-drawn wireframes created during the design stage.

The implementation includes:

- Sidebar navigation with Intenta branding, project creation and recent projects.
- Project tabs for switching between multiple design projects.
- Two interaction modes: Explore Ideas and Refine Design.
- A creative prompt input area.
- An optional prompt-assistance toggle.
- Example design prompts accessible through suggestion buttons.
- Placeholder interfaces for features planned in later development phases.

Reusable React components were created to separate different interface responsibilities.

### 2. Design and Technical Decisions

**Component-based architecture:** The application was divided into reusable React components to improve code organisation and facilitate future feature development.

**Project-specific state:** React's `useState` was used to maintain each project's draft prompt, selected interaction mode and prompt-assistance setting. This allows users to switch between projects and interaction modes without losing their current input during the session.

**Clearly labelled interaction modes:** The original wireframe used small icons to represent the two interaction modes. These were adapted into labelled controls to improve their discoverability and reduce ambiguity.

**Simulated functionality:** AI generation and direct visual refinement were intentionally excluded from Phase 1. This allows the application foundation to be evaluated before implementing the more complex interaction techniques.

### 3. AI Assistance

ChatGPT was used as a development assistant to:

- Propose a React component structure based on the supplied wireframes and project requirements.
- Generate the initial JSX and CSS implementation.
- Explain component responsibilities and state management.
- Assist in debugging React rendering problems.
- Recommend manual testing procedures.

The student supplied the original interface sketches, research direction, functional requirements and interaction design. The student integrated the generated code, inspected the resulting interface and performed manual testing.

### 4. Debugging

During the initial implementation, the application displayed a blank page.

Investigation using Chrome Developer Tools revealed that the React root element was empty. The application code had accidentally been placed in `main.jsx` instead of `App.jsx`.

The issue was resolved by restoring the React entry-point code in `main.jsx` and moving the application component into `App.jsx`.

The application subsequently displayed the default Vite interface until `App.jsx` was replaced with the Intenta implementation.

### 5. Testing

The application was launched using the Vite development server and tested manually in Google Chrome.

The following interactions were successfully tested:

| Test                                                           | Result |
| -------------------------------------------------------------- | ------ |
| Creating a new project tab                                     | Passed |
| Entering text into the creative prompt                         | Passed |
| Switching between Explore Ideas and Refine Design              | Passed |
| Preserving prompt text when switching modes                    | Passed |
| Enabling and disabling prompt assistance                       | Passed |
| Inserting an example prompt using the Business Card suggestion | Passed |

The interface was also visually inspected against the initial wireframe.

### 6. Known Limitations

- Prompt assistance currently operates as a toggle without AI-generated prompt improvements.
- AI-generated design recommendations are not yet implemented.
- Community inspiration and direct object-linked refinement are not yet implemented.
- Project information is stored in React state and is not preserved after refreshing the browser.
- Some navigation items are currently placeholders.
- The interface requires further accessibility and responsive-layout testing.

### 7. Next Steps

Phase 2 will focus on AI-assisted idea exploration, including simulated prompt assistance, visual design recommendations, preference selection and iterative creative exploration.
