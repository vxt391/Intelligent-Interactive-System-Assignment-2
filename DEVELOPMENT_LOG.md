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

## Phase 2 — Milestone 1: Conversation Interface and State Management

**Date:** 14 November 2026  
**Status:** Implemented and manually tested

### 1. Implementation

Extended the Phase 1 application foundation to support a conversational design exploration workflow.

The following functionality was implemented:

- **Conversation interface:** After submitting the first creative prompt, the initial welcome screen transitions into a scrollable conversation interface.
- **Conversation history:** User messages are displayed chronologically, allowing users to revisit previous inputs.
- **Compact prompt composer:** Once the conversation begins, the prompt input is repositioned at the bottom of the conversation workspace.
- **Current Intentions panel:** Introduced a collapsible right-side panel displaying the original design brief and current confirmed preferences.
- **Project-specific state management:** Each project maintains its own conversation messages, prompt drafts, intentions and exploration state.
- **Interaction continuity:** Users can switch between Explore Ideas and Refine Design, or between different projects, without losing their existing conversation state during the session.

New React components were introduced to separate conversation rendering and intention management from the main application component.

### 2. Design and Technical Decisions

**Conversational interaction:** The interface transitions from a centrally positioned welcome screen to a conversation-based layout after the first prompt. This supports iterative communication and allows users to refer to earlier design decisions.

**Collapsible intention summary:** A collapsible right-side panel was selected instead of an always-visible panel. This preserves space for future visual recommendations while allowing users to inspect their current creative intentions.

**Separation of conversation history and current intentions:** Conversation history preserves previous interactions, while the intention summary is designed to represent the user's latest confirmed preferences. This distinction will become important when users revise their preferences.

**Project-specific state:** React state was extended to maintain independent conversation and intention data for each project. This supports continuity when users switch between projects or interaction modes.

**Incremental implementation:** AI-generated recommendations, prompt rewriting and preference feedback were intentionally excluded from this milestone. The conversation and state-management foundation was implemented first to reduce complexity and allow individual interactions to be tested.

### 3. AI Assistance and Student Contributions

ChatGPT assisted with:

- Translating the approved interaction-design decisions into a React component structure.
- Generating the conversation interface and collapsible intention panel.
- Extending the application's state structure.
- Providing implementation instructions and manual testing procedures.

The student:

- Developed the original wireframes and interaction requirements.
- Selected a collapsible intention panel after comparing alternative layouts.
- Approved the intended interaction flow before implementation.
- Integrated the generated code into the existing React application.
- Tested the functionality in Google Chrome and confirmed the expected behaviours.

### 4. Manual Testing

**Environment:** React + Vite application running locally in Google Chrome.

| Test Case                                                                                                   | Result |
| ----------------------------------------------------------------------------------------------------------- | ------ |
| Submit an initial business-card prompt and transition from the welcome screen to the conversation interface | Passed |
| Submit a second message and verify that it appears in the conversation history                              | Passed |
| Open Current Intentions and verify that the original design brief is displayed                              | Passed |
| Close and reopen the Current Intentions panel                                                               | Passed |
| Switch between Explore Ideas and Refine Design without losing conversation history                          | Passed |
| Create a second project with an independent, initially empty conversation                                   | Passed |
| Return to the first project and verify that previous messages are preserved                                 | Passed |
| Enter an unsent prompt, switch projects and return to verify that the draft is preserved                    | Passed |

**Result:** All 8 manual test cases passed.

The results were confirmed by the student after testing the application locally. No automated testing was performed during this milestone.

### 5. Known Limitations

- Conversation responses do not yet include AI-generated design recommendations.
- Prompt assistance has not yet been implemented beyond its existing Phase 1 toggle.
- Confirmed preference management and feedback interactions are not yet functional.
- The Current Intentions panel provides the foundation for preference management, but attribute confirmation and editing will be implemented in a later milestone.
- Project state is stored in React memory and is not preserved after a browser refresh.
- The Community Gallery and direct object-linked refinement remain outside this milestone.
- Formal accessibility and usability evaluations have not yet been conducted.

### 6. Next Steps

**Phase 2 — Milestone 2: Optional Prompt Assistance**

Implement an interactive prompt-assistance workflow that allows users to:

- View their original creative prompt.
- Receive a simulated improvement suggestion.
- Edit the suggested prompt.
- Accept or reject the suggestion.
- Submit either the original or suggested prompt.

The system should preserve the user's creative intentions and avoid silently modifying their requests.

## Phase 2 — Milestone 2: Optional Prompt Assistance

**Date:** 14 November 2026  
**Status:** Implemented and manually tested

### 1. Implementation

Implemented an optional prompt-assistance workflow within the existing Intenta conversation interface.

The functionality includes:

- A prompt-assistance toggle allowing users to enable or disable assistance.
- A review-before-submission interaction when assistance is enabled.
- A comparison between the original prompt and a suggested improvement.
- An editable suggested prompt.
- Explicit options to submit either the original or suggested prompt.
- The ability to return to editing without submitting.
- Preservation of the original design brief and conversation history.
- Independent prompt-review state for different projects.

Prompt assistance uses a rule-based simulation rather than a real AI language model.

### 2. Design and Technical Decisions

**Review before submission:** The user must explicitly choose whether to submit the original or suggested prompt. This prevents the system from modifying creative intentions without user approval.

**Editable suggestions:** Users can modify the suggested wording before submission, maintaining control over how their intentions are communicated.

**Preservation of original intentions:** The system retains the original prompt even when a suggested version is submitted. This supports transparency and continuity.

**Inline assistance interface:** The prompt-review panel is integrated into the existing creative workspace rather than opening a separate page.

**Separation of concerns:** Prompt-assistance logic is organised into a utility module, separate from React interface components.

### 3. AI Assistance and Student Contributions

ChatGPT assisted with:

- Implementing the approved prompt-assistance interaction.
- Generating React components and supporting JavaScript logic.
- Integrating the feature into the existing conversation interface.
- Providing installation instructions and a manual testing checklist.

The student:

- Selected the review-before-submission interaction after discussing alternative designs.
- Integrated the implementation into the existing React project.
- Created the required utility folder.
- Conducted manual testing in Google Chrome.
- Reviewed the resulting interface and confirmed satisfaction with its appearance and functionality.

### 4. Manual Testing

**Environment:** React + Vite, Google Chrome.

| Test Case                                                        | Result |
| ---------------------------------------------------------------- | ------ |
| Submit a prompt with assistance disabled                         | Passed |
| Enable assistance and open the review panel without submitting   | Passed |
| Display the original prompt without modification                 | Passed |
| Edit the suggested prompt independently                          | Passed |
| Submit an edited suggestion and view the original wording        | Passed |
| Choose to submit the original prompt                             | Passed |
| Return to editing without submitting                             | Passed |
| Preserve unfinished prompt reviews when switching projects       | Passed |
| Preserve the original initial design brief in Current Intentions | Passed |

**Result:** All 9 manual test cases passed, as confirmed by the student.

No automated end-to-end testing was performed.

### 5. Known Limitations

- Prompt assistance is simulated using predefined rules rather than a generative AI model.
- The system cannot reliably interpret arbitrary natural-language requirements.
- AI-generated visual recommendations are not yet implemented.
- Project and conversation data are not persisted after a browser refresh.
- Further usability and accessibility testing is required.

### 6. Next Steps

**Phase 2 — Milestone 3: Visual Design Recommendations**

Implement three visually distinct business-card recommendations based on the submitted creative prompt.

Each recommendation should include a design preview, a short explanation of its visual characteristics and an option for users to select a preferred concept.

Preference feedback and subsequent recommendation strategies will be implemented incrementally in later milestones.

## Phase 2 — Milestone 3: Prompt-Aware Visual Design Recommendations

**Date:** 14 November 2026  
**Status:** Implemented and manually tested

### 1. Implementation

Extended the Intenta conversational interface to display three simulated visual design recommendations following the submission of a business-card design request.

The following functionality was implemented:

- **Visual design recommendations:** Three distinct business-card concepts are displayed side by side within the conversation interface.
- **Design previews:** Business-card mock-ups are rendered using reusable React components and CSS rather than external image-generation APIs.
- **Concept descriptions:** Each recommendation includes a concept name, visual characteristics and a short explanation of the design direction.
- **Basic prompt awareness:** A rule-based recommendation system recognises a limited set of design attributes from user prompts, such as colours, typography preferences and explicit exclusions.
- **Concept selection:** Users can select, change or deselect a preferred design concept.
- **Selection feedback:** The interface visually highlights the selected concept and provides confirmation of the user's choice.
- **Project-specific state:** Concept recommendations and selections are maintained separately for each project during the session.

The implementation also preserves the existing conversation interface, optional prompt assistance and Current Intentions panel.

### 2. Design and Technical Decisions

**Side-by-side concept comparison:** Three concepts are displayed simultaneously rather than through a carousel. This decision was made to support direct visual comparison and help users identify differences between creative directions.

**Prompt-aware simulation:** A lightweight rule-based system was selected over a fixed set of identical recommendations for every user. This allows recognised requirements from the initial prompt to influence the presented designs.

**Reusable CSS-based previews:** Business-card previews are constructed using React and CSS, avoiding the need for paid generative AI APIs or computationally expensive image-generation models. This approach also provides a foundation for configurable visual elements in later development phases.

**Reversible concept selection:** Users can change or remove their selected concept. This supports user agency and reduces the consequences of exploratory decisions.

**Separation of concept selection and confirmed preferences:** Selecting a design does not automatically save all its attributes as preferences. Explicit attribute feedback and confirmation will be implemented in Milestone 4.

**Incremental development:** The implementation focuses on initial recommendations and concept selection. Iterative exploration and preference-aware follow-up recommendations are reserved for later milestones.

### 3. Simulated Intelligent System Behaviour

The recommendation mechanism uses predefined design configurations and deterministic rules to interpret a limited set of recognised creative attributes.

For example:

- A vague business-card request produces three visually different design directions.
- A recognised colour preference influences the recommended colour palettes.
- A recognised typography preference influences the displayed typography.
- A recognised negative constraint, such as avoiding a particular colour, influences concept generation.
- Unspecified attributes remain open to exploration.

The system is not a trained natural-language understanding or image-generation model.

Its purpose is to demonstrate how an intelligent interactive interface might respond to creative requirements while maintaining a lightweight, reproducible prototype.

### 4. AI Assistance and Student Contributions

ChatGPT assisted with:

- Proposing alternative layouts for presenting design recommendations.
- Translating approved interaction requirements into React components.
- Implementing CSS-based business-card previews.
- Developing the simulated prompt-aware recommendation logic.
- Implementing reversible concept selection.
- Providing code-level checks and manual testing instructions.

The student:

- Selected the three-card comparison layout after discussing alternative interfaces.
- Chose basic prompt-aware recommendations instead of presenting identical predefined concepts to every user.
- Approved the separation between concept selection and confirmed creative preferences.
- Integrated the implementation into the existing React project.
- Conducted manual functionality testing in Google Chrome.
- Reviewed the resulting interface and confirmed that the functionality worked as expected.

### 5. Manual Testing

**Environment:** React + Vite application running locally in Google Chrome.

| Test Case                                                                                 | Result |
| ----------------------------------------------------------------------------------------- | ------ |
| Submit a business-card request and display three distinct design concepts                 | Passed |
| Recognise a green colour request and adapt the visual recommendations                     | Passed |
| Recognise a serif typography request and apply the requested typography                   | Passed |
| Recognise a negative colour constraint and avoid the specified colour                     | Passed |
| Select, change and deselect a design concept                                              | Passed |
| Verify that selecting a concept does not automatically confirm design preferences         | Passed |
| Verify compatibility with the existing prompt-assistance workflow                         | Passed |
| Preserve project-specific concept selection when switching projects and interaction modes | Passed |
| Preserve follow-up messages without unexpectedly replacing the initial recommendations    | Passed |
| Handle unsupported design types with an explanatory message                               | Passed |

**Result:** All 10 manual test cases passed, as confirmed by the student.

The implementation was also reviewed visually in Google Chrome.

No automated browser-based end-to-end testing was performed.

### 6. Known Limitations

- Recommendations are simulated using predefined design attributes and rules rather than a real generative AI model.
- Prompt interpretation supports only a limited collection of recognised requirements and cannot reliably understand arbitrary creative language.
- The initial implementation focuses on business-card designs.
- Concept previews use fictional placeholder information.
- Selecting a concept does not yet enable iterative variation generation.
- Attribute-level preference feedback and confirmation are not yet implemented.
- Project state is stored in React memory and does not persist after refreshing the browser.
- Further usability and accessibility testing is required.

### 7. Next Steps

**Phase 2 — Milestone 4: Structured Preference Feedback**

Implement attribute-level feedback to help users communicate which characteristics of the recommended designs they like, dislike or remain uncertain about.

The functionality will include:

- Feedback on colour, typography, layout and design style.
- Like, Avoid and Not Sure selections.
- A preference review stage before confirmation.
- Explicit confirmation of the preferences that should influence future recommendations.
- Updating the Current Intentions panel with confirmed preferences.
- Allowing users to revise or remove previously confirmed preferences.

The distinction between selecting a complete design and confirming individual design attributes will remain central to the interaction design.

## Phase 2 — Milestone 4.1: Attribute Selection and Draft Feedback

**Date:** 14 November 2026  
**Status:** Implemented and manually tested

### 1. Implementation

Extended the existing design recommendation interface to support structured attribute-level feedback.

The implementation includes:

- Selectable design-attribute chips displayed beneath each recommended concept.
- Attribute selection across multiple design concepts.
- A shared feedback draft area beneath the recommendations.
- Like, Avoid and Not Sure feedback controls.
- The ability to remove attributes from the feedback draft.
- Project-specific draft feedback state.
- Visual feedback indicating selected attributes.

The implementation preserves the existing concept-selection functionality, conversation interface and prompt assistance.

### 2. Design and Technical Decisions

**Cross-concept attribute selection:** Users can combine characteristics from different recommendations without selecting a complete design. This supports expressing creative intentions at a more granular level.

**Shared feedback area:** Rather than displaying multiple rating controls on every concept card, selected attributes are collected into one review area. This reduces visual clutter while supporting comparison across concepts.

**Separation of draft and confirmed preferences:** Attribute selections and feedback remain drafts during this milestone. They do not yet update Current Intentions or influence design recommendations.

**Project-specific state:** Feedback drafts are maintained separately for individual projects to prevent preferences being mixed between design sessions.

**Interface refinement:** Adjusted the conversation layout CSS to move the vertical scrollbar closer to the workspace boundary while keeping the conversation content centred.

### 3. AI Assistance and Student Contributions

ChatGPT assisted with:

- Translating the agreed interaction design into React components.
- Implementing attribute chips and the shared feedback draft interface.
- Developing reusable design-attribute identification logic.
- Integrating draft feedback with existing project state.
- Suggesting a CSS adjustment for the scrollbar positioning.
- Providing manual testing guidance.

The student:

- Selected the cross-concept attribute feedback approach.
- Approved the separation between draft and confirmed preferences.
- Integrated the implementation into the existing React application.
- Conducted manual testing in Google Chrome.
- Identified the awkward scrollbar positioning and requested an improvement.
- Applied the layout adjustment and confirmed that the result looked better.

### 4. Manual Testing

**Environment:** React + Vite application running locally in Google Chrome.

Confirmed that the Milestone 4.1 interactions worked successfully, including attribute selection, draft feedback and compatibility with previously implemented functionality.

The updated scrollbar positioning was also visually checked and approved.

No automated browser-based end-to-end testing was performed.

### 5. Known Limitations

- Draft feedback cannot yet be confirmed and saved to Current Intentions.
- Preferences do not yet influence subsequent recommendations.
- Editing and removing confirmed preferences are not implemented.
- Project data is stored in React memory and does not persist after refreshing the browser.
- Additional accessibility and usability testing is required.

### 6. Next Steps

**Phase 2 — Milestone 4.2: Preference Confirmation**

Implement explicit preference confirmation, update the Current Intentions panel and record confirmed preferences in conversation history.

## Phase 2 — Milestone 4.2: Preference Confirmation and Intention Management

**Date:** 14 November 2026  
**Status:** Implemented and manually tested

### 1. Implementation

Extended the structured attribute-feedback functionality introduced in Milestone 4.1 by implementing explicit preference confirmation and integration with the Current Intentions panel.

The implementation includes:

- **Preference confirmation:** Users can confirm their selected design attributes after assigning Like, Avoid or Not Sure feedback.
- **Partial confirmation:** Users can confirm only the attributes they have rated, without being required to provide feedback on every selected
