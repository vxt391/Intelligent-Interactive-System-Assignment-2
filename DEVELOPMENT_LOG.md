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
- **Partial confirmation:** Users can confirm only the attributes they have rated, without being required to provide feedback on every selected attribute.
- **Draft preservation:** Attributes that have not yet received feedback remain in the draft after other preferences are confirmed.
- **Current Intentions updates:** Confirmed preferences are displayed in the appropriate categories: Liked Attributes, Attributes to Avoid and Still Exploring.
- **Conversation feedback:** The system adds a confirmation message to the conversation history to acknowledge which preferences have been recorded.
- **Preference conflict handling:** If users subsequently confirm a different status for the same attribute, the latest confirmed status replaces the previous one.
- **Duplicate prevention:** Each design attribute maintains only one active preference status within a project.
- **Project-specific intention state:** Confirmed preferences remain associated with their respective projects when users switch between projects or interaction modes.

The implementation preserves the previously developed conversation interface, prompt-assistance workflow, visual design recommendations and attribute-selection functionality.

### 2. Design and Technical Decisions

**Explicit preference confirmation:** Users must deliberately confirm their feedback before it becomes part of their recorded creative intentions. This prevents the system from silently interpreting exploratory interactions as established preferences.

**Separation of draft and confirmed feedback:** Draft selections are maintained separately from confirmed preferences. This allows users to experiment with different design attributes without immediately influencing the system's stored intention state.

**Partial confirmation:** Users are not required to rate every selected attribute. This supports flexible exploration, particularly when users remain uncertain about some design characteristics.

**Uncertainty representation:** The Not Sure status is preserved under Still Exploring rather than being interpreted as a positive or negative preference. This enables the system to distinguish between established decisions and unresolved creative intentions.

**Transparent system feedback:** Confirmed preferences are displayed both in the Current Intentions panel and through confirmation messages in the conversation. This provides visibility into what the system has recorded.

**Conflict resolution:** When an attribute receives a newly confirmed status, its previous active status is replaced. Earlier confirmation messages remain in the conversation history, preserving the progression of the user's decisions.

**Incremental development:** Preference confirmation was implemented separately from editing previously confirmed preferences and generating subsequent recommendations, reducing implementation complexity and allowing individual interactions to be tested.

### 3. AI Assistance and Student Contributions

ChatGPT assisted with:

- Translating the approved preference-confirmation interaction into React functionality.
- Extending the project-specific state management.
- Implementing logic for confirming preferences and handling conflicting feedback.
- Integrating confirmed preferences with the Current Intentions panel.
- Implementing confirmation messages within the conversation history.
- Providing implementation instructions and a manual testing checklist.

The student:

- Selected the structured cross-concept feedback approach during the interaction-design discussions.
- Approved explicit confirmation before feedback influences recorded intentions.
- Integrated the new functionality into the existing React application.
- Conducted manual testing in Google Chrome.
- Verified that preference confirmation, intention updates and existing features behaved as expected.
- Confirmed satisfaction with the implementation before proceeding.

### 4. Manual Testing

**Environment:** React + Vite application running locally in Google Chrome.

| Test Case                                                                          | Result |
| ---------------------------------------------------------------------------------- | ------ |
| Verify existing recommendations, attribute chips and scrollbar layout              | Passed |
| Confirm multiple liked attributes from different design concepts                   | Passed |
| Display confirmed liked attributes in Current Intentions                           | Passed |
| Record preference confirmation in conversation history                             | Passed |
| Confirm an Avoid attribute and display it under Attributes to Avoid                | Passed |
| Confirm a Not Sure attribute and display it under Still Exploring                  | Passed |
| Preserve unrated draft attributes when confirming other preferences                | Passed |
| Replace an existing preference status without creating duplicates                  | Passed |
| Preserve confirmed preferences independently across projects and interaction modes | Passed |
| Verify compatibility with prompt assistance and the original design brief          | Passed |

**Result:** All 10 manual test cases passed, as confirmed by the student.

No automated browser-based end-to-end testing was conducted during this milestone.

### 5. Known Limitations

- Users cannot yet directly edit or remove previously confirmed preferences through the Current Intentions panel.
- Preference-aware generation of additional design recommendations is not yet implemented.
- Confirmed preferences are recorded but do not yet influence subsequent design generation.
- Recommendation behaviour remains rule-based rather than using a trained generative AI model.
- Project information is stored in React state and does not persist after a browser refresh.
- Formal usability and accessibility testing has not yet been conducted.

### 6. Next Steps

## Phase 2 — Milestone 4.3: Editing Confirmed Preferences

**Date:** 14 November 2026  
**Status:** Implemented and manually tested

### 1. Implementation

Extended the Current Intentions panel to allow users to edit and remove previously confirmed design preferences.

The following functionality was implemented:

- **Edit Preferences mode:** Users can enter an editing mode within the Current Intentions panel to review and modify confirmed preferences.
- **Preference status modification:** Existing preferences can be changed between Like, Avoid and Not Sure.
- **Preference removal:** Users can mark confirmed attributes for removal.
- **Undo removal:** Users can restore attributes marked for removal before saving.
- **Save Changes:** Multiple preference modifications can be applied together through an explicit save action.
- **Cancel editing:** Users can discard unsaved modifications without affecting their previously confirmed intentions.
- **Change detection:** The Save Changes action is disabled when no modifications have been made.
- **Conversation feedback:** Successfully saved changes are recorded in the conversation history.
- **Project-specific editing state:** Unfinished edits remain associated with their respective projects when users switch between projects or interaction modes.

The implementation preserves the existing prompt-assistance workflow, visual design recommendations, attribute selection and preference confirmation functionality.

### 2. Design and Technical Decisions

**Explicit editing confirmation:** Users must select Save Changes before modifications affect their confirmed preferences. This follows the review-and-confirm approach introduced in earlier milestones, maintaining consistency throughout the application.

**Separation of editing drafts and confirmed intentions:** Changes are maintained in a temporary editing state until saved. This prevents accidental modifications to the user's established creative intentions.

**Reversible actions:** Users can undo a pending removal or cancel the entire editing process. These controls support user agency and reduce the consequences of accidental interactions.

**Batch editing:** Users can modify or remove multiple preferences before saving, reducing the need for repeated confirmation actions.

**Visible system feedback:** After saving changes, the Current Intentions panel displays the updated preferences, and a conversation message records the modification. This helps users understand what the system currently remembers.

**Preservation of historical decisions:** Updating a preference changes its active status but does not remove earlier conversation records. This maintains a history of how the user's creative intentions evolved.

**Project-specific state management:** Editing state is maintained separately for each project, preventing accidental changes to another project's preferences.

### 3. Relevance to Intelligent Interactive Systems

This milestone contributes to the research objective of supporting users in expressing and refining creative intentions.

The implementation demonstrates several relevant interaction-design principles:

- **User agency:** Users determine which preferences are recorded, revised or removed.
- **Visibility of system state:** Confirmed preferences remain accessible through the Current Intentions panel.
- **Reversibility:** Users can discard pending changes and undo removals before saving.
- **Gulf of execution:** Explicit editing controls help users communicate intended changes without rewriting lengthy prompts.
- **Gulf of evaluation:** Updated preference summaries and conversation messages help users understand the outcome of their actions.

These interactions establish the foundation for preference-aware iterative recommendations in the next milestone.

### 4. AI Assistance and Student Contributions

**ChatGPT assisted with:**

- Translating the approved editing workflow into React components.
- Extending the Current Intentions panel with editing controls.
- Implementing preference modification, removal and restoration logic.
- Maintaining separation between editing drafts and confirmed preferences.
- Integrating saved changes with conversation history.
- Providing code-level validation and a manual testing checklist.

**The student:**

- Selected the Save Changes / Cancel interaction approach during the design discussions.
- Approved the separation of confirmed preferences and unsaved edits.
- Integrated the updated implementation into the existing React application.
- Conducted manual testing in Google Chrome.
- Verified the preference-editing interactions and compatibility with previously implemented features.
- Confirmed that the functionality worked as expected before proceeding.

### 5. Manual Testing

**Environment:** React + Vite application running locally in Google Chrome.

| Test Case                                                                                                                | Result |
| ------------------------------------------------------------------------------------------------------------------------ | ------ |
| Open Edit Preferences from the Current Intentions panel                                                                  | Passed |
| Modify a preference without immediately changing its confirmed status                                                    | Passed |
| Cancel editing and restore the previously confirmed preferences                                                          | Passed |
| Modify one preference while marking another for removal                                                                  | Passed |
| Undo a pending preference removal                                                                                        | Passed |
| Save Changes and verify that Current Intentions updates                                                                  | Passed |
| Record saved preference modifications in conversation history                                                            | Passed |
| Disable Save Changes when no modifications are present                                                                   | Passed |
| Preserve independent editing states when switching projects                                                              | Passed |
| Verify compatibility with prompt assistance, design recommendations, attribute feedback and the updated scrollbar layout | Passed |

**Result:** All 10 manual test cases passed, as confirmed by the student.

The application was tested manually in Google Chrome. No automated browser-based end-to-end testing was conducted during this milestone.

### 6. Known Limitations

- Confirmed preferences are stored in React state and are not preserved after a browser refresh.
- Preference editing is limited to attributes supported by the predefined design system.
- Users cannot yet freely define arbitrary new design attributes through the editing panel.
- Confirmed preferences do not yet influence subsequent recommendation rounds.
- The recommendation mechanism remains a rule-based simulation rather than a trained generative AI model.
- Formal accessibility and usability evaluations have not yet been conducted.

### 7. Milestone Outcome

Phase 2 — Milestone 4 is now functionally complete.

The implemented workflow allows users to:

1. Select design attributes across multiple recommendations.
2. Provide Like, Avoid or Not Sure feedback.
3. Review and confirm their preferences.
4. View confirmed preferences in Current Intentions.
5. Modify or remove previously confirmed preferences.
6. Explicitly save or cancel changes.

This provides a structured and reversible mechanism for expressing evolving creative intentions.

### 8. Next Steps

**Phase 2 — Milestone 5: Preference-Aware Iterative Exploration**

The next milestone will connect confirmed preferences with subsequent design recommendations.

Planned functionality includes:

- Exploring new design directions using previously confirmed preferences.
- Generating variations of a selected concept.
- Applying positive and negative preferences to simulated recommendations.
- Preserving uncertainty without treating it as a design constraint.
- Explaining how recorded preferences influence recommendations.
- Supporting continued exploration without losing earlier intentions.

This milestone will demonstrate how Intenta adapts its recommendations as users' creative intentions evolve.

## Phase 2 — Milestone 5.1: Preference-Aware Exploration of New Design Directions

**Date:** 14 November 2026  
**Status:** Implemented; responsive layout improvements visually reviewed

### 1. Objective

The objective of this milestone was to extend Intenta from providing initial design recommendations to supporting iterative, preference-aware exploration.

Previously, the application could generate an initial set of business-card concepts and collect structured user preferences. However, confirmed preferences did not yet influence subsequent recommendations.

Milestone 5.1 connects the preference-management functionality developed in Milestone 4 with the recommendation mechanism, enabling users to explore new design directions based on their evolving creative intentions.

### 2. Implementation

The following features were implemented:

**Explore New Directions**

- Added an Explore New Directions action that allows users to request another round of three design recommendations.
- Extended the existing rule-based recommendation mechanism to consider the original design brief and currently confirmed preferences.
- Implemented a balanced exploration strategy, aiming to generate two preference-led concepts and one exploratory concept.
- Used confirmed Like preferences to prioritise relevant design attributes.
- Used confirmed Avoid preferences to exclude unwanted attributes where supported by the available design catalogue.
- Treated Not Sure preferences as unresolved rather than positive or negative constraints.
- Preserved the existing deterministic, CSS-rendered business-card preview approach.

**Multiple Recommendation Rounds**

- Added support for multiple recommendation rounds within the same conversation.
- Preserved earlier recommendation messages and their associated design concepts.
- Introduced round-specific concept identification to distinguish concepts from different recommendation rounds.
- Maintained project-specific recommendation and interaction state.

**Unfinished Feedback Management**

- Preserved unfinished attribute-feedback drafts independently for each recommendation round.
- Added a warning when users attempt to generate new recommendations while feedback remains unfinished.
- Provided two actions: Review Feedback and Continue Without Applying.
- Ensured that unconfirmed feedback does not silently influence subsequent recommendations.
- Allowed users to revisit previous recommendation rounds and continue working with their feedback.

### 3. Responsive UI Refinements

During visual testing on a laptop, two usability issues were identified and addressed.

**Issue 1: Excessive prompt-composer height**

The original prompt input occupied a substantial portion of the vertical screen space on a laptop. Combined with the Explore New Directions controls, this reduced the visible area available for reviewing previous conversation messages and design recommendations.

**Improvement:**

- Introduced a compact prompt-composer layout for shorter display heights.
- Reduced unnecessary vertical spacing around the composer and exploration controls.
- Allowed the prompt input to expand when users need additional writing space.
- Preserved the more spacious initial interface and large-monitor presentation.

**Issue 2: Crowded Prompt Assistance interface**

When Prompt Assistance was enabled, the prompt-review interface appeared inside the bottom composer, directly beneath the separately scrollable conversation history.

Although the components did not technically overlap, the adjacent scrollable regions and limited vertical space made the interface appear crowded and visually confusing.

**Improvement:**

- Moved the prompt-review interface into a separate dialog.
- Maintained the comparison between the original prompt and editable suggested prompt.
- Preserved the existing submission actions.
- Added clearer visual separation between prompt review and conversation history.
- Prevented the review interface from permanently reducing the available conversation space.

The student reviewed the updated interface and confirmed that its visual presentation was improved.

### 4. Design and Technical Decisions

**Balanced exploration strategy**

The student selected a strategy that aims to generate two recommendations prioritising confirmed positive preferences and one more exploratory alternative.

This balances personalisation with creative diversity, helping users discover new possibilities without ignoring their existing intentions.

The two-to-one balance is an interaction-design decision for this prototype rather than a scientifically validated recommendation ratio.

**Explicit feedback confirmation**

Only confirmed preferences influence new recommendations. Draft feedback remains separate, maintaining the user's control over which intentions the system applies.

**Preservation of conversation history**

Previous recommendation rounds remain available so users can compare concepts, revisit earlier decisions and understand the progression of their creative intentions.

**Round-specific feedback**

Feedback drafts are associated with their respective recommendation rounds. This prevents unfinished feedback from one round from being unintentionally replaced when users explore another.

**Rule-based recommendation simulation**

The recommendation system remains deterministic and catalogue-based. It simulates preference-aware AI-assisted design exploration without requiring integration with a generative image model.

**Responsive design as an ongoing requirement**

The student identified that the application must support different screen sizes and heights, particularly laptops and larger desktop monitors.

Responsive testing will therefore be incorporated into subsequent implementation milestones rather than postponed until final UI polishing.

### 5. Relevance to Intelligent Interactive Systems

This milestone advances the project's research objective:

_How do structured and visual interaction techniques support users in expressing and refining their intentions during generative AI-assisted visual content creation?_

The implementation demonstrates:

- **Adaptive interaction:** Subsequent recommendations respond to users' explicitly confirmed preferences.
- **User agency:** Users control which feedback becomes part of their active intentions.
- **Transparency:** The interface communicates how confirmed preferences are considered.
- **Exploratory interaction:** Users can discover alternatives without requiring a fully specified design brief.
- **Interaction continuity:** Previous recommendations and unfinished feedback remain accessible.
- **Responsive usability:** Interface adaptations support reviewing and comparing design alternatives across different display sizes.

Together, these features support an iterative process in which users can express, evaluate and progressively refine their creative intentions.

### 6. AI Assistance and Student Contributions

**ChatGPT assisted with:**

- Extending the existing React recommendation workflow.
- Implementing rule-based preference-aware recommendation logic.
- Adding multiple recommendation rounds and round-specific state management.
- Preserving unfinished feedback across recommendation rounds.
- Integrating new exploration controls into the conversation interface.
- Developing responsive CSS adjustments for shorter laptop displays.
- Refactoring the Prompt Assistance review into a separate dialog.
- Conducting code-level syntax and logic checks.
- Providing installation instructions and manual testing guidance.

**The student:**

- Selected the balanced exploration strategy after comparing alternative recommendation behaviours.
- Approved the rule that only confirmed preferences influence subsequent recommendations.
- Required unfinished feedback and previous recommendation rounds to be preserved.
- Integrated the implementation into the existing application.
- Tested the interface in Google Chrome.
- Identified insufficient conversation-history space when viewing the application on a laptop.
- Requested a more compact input layout to improve visibility of earlier recommendations.
- Identified visual crowding between Prompt Assistance and the conversation history.
- Reviewed the revised responsive layout and prompt-review dialog and confirmed that the visual presentation was improved.

### 7. Testing and Validation

**Development environment:** React, Vite, JavaScript and CSS.

**Browser:** Google Chrome.

Code-level checks conducted during implementation included JavaScript/JSX syntax validation, CSS parsing and lightweight tests of preference-aware recommendation behaviour and state handling.

Manual visual review identified and led to corrections for two responsive layout problems.

| Area                                            | Recorded outcome                        |
| ----------------------------------------------- | --------------------------------------- |
| New recommendation-round logic                  | Code-level checks passed                |
| Preference handling and round-specific feedback | Code-level checks passed                |
| JavaScript/JSX and CSS validation               | Passed                                  |
| Laptop composer layout                          | Improved following visual review        |
| Prompt Assistance layout                        | Improved and visually approved          |
| Full Chrome functional regression checklist     | Not separately recorded as fully passed |

The revised interface was considered visually improved by the student. The full end-to-end functional checklist should be recorded separately if completed.

### 8. Known Limitations

- The recommendation system uses a predefined design catalogue rather than a trained generative AI model.
- The two preference-led / one exploratory approach is heuristic and may be constrained by available design combinations.
- Some complex or contradictory requirements may not be fully handled by the current recommendation rules.
- Project information is maintained in React state and does not persist after a browser refresh.
- Explore Variations and Use This Design are not yet implemented.
- Formal accessibility testing and structured usability evaluation remain outstanding.
- Additional responsive testing is needed across smaller viewport widths and different browser zoom levels.

### 9. Next Steps

**Phase 2 — Milestone 5.2: Explore Variations**

The next milestone will enable users to generate variations of a selected design concept.

The student has approved optional attribute selection: users may specify which characteristics to vary, including colour, typography, layout and decorative details, or leave the selection empty for general variations.

Before implementation, the remaining interaction rules must be finalised, including which characteristics should be preserved, how confirmed preferences affect variations and how differences between concepts are communicated.

**Future development consideration:** Responsive behaviour must continue to be reviewed on different screen sizes throughout subsequent milestones.

## Phase 2 — Milestone 5.2: Explore Variations and Interaction Simplification

**Date:** 15 November 2026  
**Status:** Implemented and iteratively reviewed through manual testing

### 1. Objective

The objective of Milestone 5.2 was to enable users to generate variations of a preferred design concept while preserving its overall identity.

Whereas Milestone 5.1 introduced preference-aware exploration of new design directions, Milestone 5.2 supports more focused creative refinement.

The milestone also addressed usability issues identified during testing, particularly the increasing complexity of the exploration controls and the amount of screen space occupied by the prompt composer.

### 2. Implementation — Explore Variations

**2.1 Reference-based variation generation**

- Implemented Explore Variations using a selected design concept as the reference.
- Allowed users to select a reference concept from any previous recommendation round.
- Preserved the reference concept rather than replacing it when variations were generated.
- Recorded the source round and reference concept for each variation request.
- Integrated variation results into the existing conversation history.
- Maintained the existing rule-based, CSS-rendered recommendation approach.

**2.2 Optional attribute selection**

Users can optionally specify which design attributes they want to vary:

- Colour
- Typography
- Layout
- Decorations

If no attributes are selected, Intenta generates general variations that aim to preserve the reference concept's overall character.

When multiple attributes are selected, the system explores combinations of those attributes rather than requiring every variation to change all of them.

For example, when Colour and Typography are selected, the system may produce a colour-focused variation, a typography-focused variation and a variation changing both characteristics.

**2.3 Attribute preservation**

The variation mechanism aims to preserve attributes that users did not explicitly select for modification.

Minor supporting changes may be necessary because design characteristics can interact. However, the system should avoid unnecessary changes outside the selected variation scope.

**2.4 Preference-aware variations**

The system considers the user's confirmed intentions when producing variations:

- Confirmed Like preferences are prioritised where compatible with the variation request.
- Confirmed Avoid preferences are treated as attributes to exclude where feasible.
- Not Sure preferences do not impose positive or negative restrictions.
- Unconfirmed feedback does not influence variation generation.

**2.5 Conflict handling**

Implemented an explicit conflict-resolution workflow for situations where the selected reference concept conflicts with confirmed preferences.

The user can choose to:

- **Respect Current Preferences:** Adjust conflicting attributes when generating variations.
- **Keep Reference for This Round:** Preserve the conflicting reference attribute as a temporary exception.
- **Cancel:** Return without generating variations.

These decisions affect the current variation request rather than silently modifying the user's saved intentions.

**2.6 Recommendation explanations and limitations**

Variation rounds include information identifying the reference concept and describing the intended changes.

The system also accounts for limitations of the predefined design catalogue.

For example, where only one distinct typography alternative is available, the system can return fewer than three variations rather than deliberately presenting duplicate designs.

### 3. Interaction Design Refinement

During manual testing, the student identified that the interface was becoming visually crowded and cognitively demanding.

The original Milestone 5.2 interface displayed several competing actions, including:

- Confirm Preferences
- Explore New Directions
- Explore Variations
- Review Prompt

The attribute-feedback area was also visually prominent even when users did not intend to provide detailed feedback.

This created uncertainty about which action users should perform next and could make structured feedback appear mandatory.

**3.1 Simplified Continue Exploring workflow**

Replaced the two separate exploration buttons with a single primary action:

**Continue Exploring**

This opens a dialog allowing users to choose between:

- **Explore New Directions:** Generate different design concepts using confirmed preferences.
- **Explore Variations:** Generate alternatives based on a selected reference concept.

The interface suggests Explore Variations when a concept has been selected. Without a selected concept, users can continue exploring new directions.

This redesign establishes a clearer interaction hierarchy and reduces competing primary actions.

**3.2 Optional design feedback**

Refactored the structured attribute-feedback interface using progressive disclosure.

Instead of displaying attribute chips and a large feedback area beneath every recommendation by default:

- Recommendation cards focus on displaying and selecting design concepts.
- An optional Give Design Feedback control reveals the attribute-feedback interface.
- Users can select design attributes across different concepts when they want to provide feedback.
- Users can rate selected attributes using Like, Avoid or Not Sure.
- Draft feedback remains separate from confirmed preferences.
- Unfinished feedback is preserved when the feedback area is closed.
- The confirmation action is not displayed unnecessarily when no attributes have been rated.

The underlying structured preference-confirmation mechanism remains available.

This redesign makes detailed feedback optional rather than appearing to be a required part of every exploration round.

**3.3 Maintaining separate interaction purposes**

The revised interface distinguishes between three user intentions:

1. **Selecting a concept:** Identifying a preferred design direction.
2. **Giving feedback:** Communicating attribute-level preferences for future recommendations.
3. **Continuing exploration:** Requesting new directions or variations.

These actions are not unnecessarily dependent on one another.

### 4. Responsive UI Refinement — Auto-Expanding Composer

Following the exploration-interface redesign, the student identified another opportunity to improve usability.

Although the prompt composer had already been made more compact during Milestone 5.1, it still occupied more space than necessary when users were entering short prompts.

**4.1 Content-based textarea resizing**

Implemented a ChatGPT-style auto-expanding prompt input.

The updated composer:

- Starts at a compact single-line height.
- Expands automatically as entered text wraps or includes additional lines.
- Does not expand simply because the input receives focus.
- Shrinks again when text is removed.
- Uses a maximum height for long prompts, allowing internal scrolling.
- Maintains access to the Prompt Assistance toggle and submission controls.

This allows users to write longer prompts when necessary without permanently reducing the conversation-history area.

**4.2 Composer width and alignment**

The initial auto-expanding composer was narrower than the Continue Exploring section.

The student identified the inconsistency during visual testing and requested that both sections share the same horizontal boundaries.

The CSS was subsequently adjusted to align the composer with the Continue Exploring section while preserving the content-based height behaviour.

**4.3 Responsive design considerations**

The updated interaction design was developed with attention to different viewport sizes, including laptop screens and larger monitors.

The implementation prioritises retaining visible conversation history, preventing unnecessary vertical expansion and keeping controls accessible.

Responsive design will continue to be considered throughout subsequent milestones.

### 5. Design Rationale and HCI Relevance

**Progressive disclosure**

Optional feedback controls remain hidden until required, reducing the amount of information and interaction complexity presented simultaneously.

**Reduced cognitive load**

A single Continue Exploring action provides a clearer starting point than multiple competing primary buttons.

**User agency**

Users decide whether to explore new directions, develop an existing concept or provide structured preference feedback.

**Visibility of system state**

Variation dialogs and recommendation explanations identify the reference concept, variation scope and relevant preference conflicts.

**Error prevention and reversibility**

Conflict resolution requires explicit user decisions, while temporary exceptions do not silently change saved intentions.

**Interaction continuity**

Earlier recommendation rounds, selected reference concepts and unfinished feedback remain accessible during continued exploration.

**Responsive usability**

The auto-expanding composer gives conversation history more space while still accommodating longer user inputs.

Together, these design decisions support the project's research objective of helping users express and refine creative intentions through structured and visual interactions.

### 6. AI Assistance and Student Contributions

**ChatGPT assisted with:**

- Translating the approved variation-generation behaviour into React functionality.
- Implementing reference-based design variations.
- Developing optional attribute-selection and combination rules.
- Integrating preference conflict detection and resolution.
- Preserving recommendation and feedback history.
- Creating the variation dialog and related UI components.
- Refactoring exploration controls into a simplified Continue Exploring workflow.
- Making detailed attribute feedback optional and collapsible.
- Implementing the auto-expanding prompt composer.
- Providing CSS adjustments for responsive layout and component alignment.
- Performing code-level validation and preparing manual testing instructions.

**The student:**

- Selected the optional attribute-selection approach.
- Chose explicit conflict explanation and confirmation rather than automatic preference overrides.
- Approved the combination-based variation strategy.
- Integrated the implementation into the existing React application.
- Tested Explore Variations and identified usability issues.
- Observed that multiple prominent actions made the next interaction unclear.
- Requested simplification of the exploration controls.
- Approved a single Continue Exploring action with a subsequent choice of exploration mode.
- Requested that detailed attribute feedback become optional and less visually prominent.
- Reviewed the simplified interface and confirmed that it was an improvement.
- Requested a ChatGPT-style input that automatically grows and shrinks according to text length.
- Tested the auto-expanding composer and confirmed that it worked.
- Identified a width mismatch between the composer and the Continue Exploring section.
- Applied the final CSS alignment adjustment and confirmed that it worked.

The implementation therefore involved several iterations of design, integration, testing and refinement rather than a single development step.

### 7. Testing and Validation

**Development environment:** React, Vite, JavaScript and CSS.

**Browser:** Google Chrome.

Code-level validation was carried out during implementation, including JavaScript/JSX syntax checks, CSS parsing and lightweight tests of variation-generation behaviour.

Manual testing and visual review were conducted by the student.

| Test Area                                                      | Recorded Outcome                          |
| -------------------------------------------------------------- | ----------------------------------------- |
| Explore Variations control appears after component integration | Confirmed                                 |
| Explore Variations interaction                                 | Manually tested                           |
| Simplified Continue Exploring interface                        | Visually reviewed and approved            |
| Optional design-feedback interface                             | Reviewed as part of the simplified layout |
| Auto-expanding prompt composer                                 | Confirmed working                         |
| Composer and Continue Exploring width alignment                | Confirmed working                         |
| Responsive layout improvements                                 | Visually reviewed                         |
| Full variation-engine edge-case regression                     | Not separately confirmed as fully passed  |
| Formal accessibility testing                                   | Not yet conducted                         |

The student confirmed that the redesigned interface was easier to use and that the subsequent composer improvements worked as intended.

A complete end-to-end regression test should still be performed before the final prototype evaluation.

### 8. Known Limitations

- Variations use a predefined, rule-based design catalogue rather than an actual generative image model.
- Some attribute combinations cannot produce three sufficiently distinct alternatives.
- The available typography, colour and layout options are limited.
- Complex or ambiguous natural-language requirements may not be fully represented by the rule-based system.
- Project and feedback state are stored in React memory and do not persist after a browser refresh.
- The interface has not yet undergone a formal accessibility audit.
- The prototype has not yet been evaluated through a structured usability study.
- The Use This Design confirmation workflow has not yet been implemented.

### 9. Milestone Outcome

Milestone 5.2 extends Intenta's iterative exploration capabilities from broad design discovery to targeted variation of a preferred concept.

It also improves the overall exploration experience through simplified navigation, optional structured feedback and a responsive prompt composer.

The most significant outcome is that users can now choose between broad exploration and focused variation without being required to complete a complex preference-feedback workflow first.

### 10. Next Steps

**Phase 2 — Milestone 5.3: Use This Design**

Implement a distinct action allowing users to confirm that they are satisfied with a recommended design.

The planned workflow includes:

- Separating provisional concept selection from final design approval.
- Providing a Use This Design action for a selected concept.
- Displaying a final confirmation step.
- Recording the approved concept within project state.
- Allowing users to finish exploration without requiring further recommendations or object-level refinement.
- Keeping the project editable so users can return to exploration or refinement later.

Persistent saving and exporting will not be implied unless those features are separately implemented.

Future milestones will continue to include responsive layout checks on different screen sizes.

## Phase 2 — Milestone 5.3: Design Approval and Exploration Completion

**Date:** 15 November 2026  
**Status:** Implemented; code-level validation completed; final manual testing pending confirmation

### 1. Objective

The objective of Milestone 5.3 was to introduce a clear completion pathway for users who are satisfied with a recommended design.

Previous milestones focused on generating design concepts, collecting preferences and supporting iterative exploration. However, users also need a way to indicate that a design meets their intentions without being required to continue generating alternatives or modifying individual elements.

Milestone 5.3 addresses this requirement by introducing a **Use This Design** workflow that allows users to explicitly approve a concept and finish the exploration process.

The implementation maintains the flexibility to return to exploration later without losing the approved design.

### 2. Implementation

#### 2.1 Unified Choose Next Step workflow

Extended the simplified exploration interface introduced in Milestone 5.2.

The existing Continue Exploring action was replaced with **Choose Next Step**, which presents three possible pathways:

- **Explore New Directions:** Generate different design concepts using confirmed preferences.
- **Explore Variations:** Generate alternatives based on a selected concept.
- **Use This Design:** Approve a selected concept and finish exploration.

Explore New Directions remains available without a selected concept.

Explore Variations and Use This Design require users to select a reference concept.

This approach maintains a single primary action rather than introducing additional competing buttons into the conversation interface.

#### 2.2 Explicit design-confirmation dialog

Implemented a separate confirmation dialog for the Use This Design pathway.

The dialog:

- Displays the selected concept using the existing business-card preview.
- Identifies the source recommendation round and concept.
- Explains that the user is approving the design for the current project.
- Provides a Confirm Design action.
- Allows users to return or close the dialog without approving the concept.
- Explains that approval does not permanently lock the project.

The confirmation step prevents a provisional concept selection from being interpreted as final approval.

#### 2.3 Separation of selected and approved concepts

Extended project state to distinguish between:

**Selected Concept**

A provisional design selection that can be used as a reference for further exploration or variation generation.

**Approved Concept**

A design that the user has explicitly confirmed as satisfactory.

Selecting a different concept does not automatically replace the approved design.

The approved concept changes only when the user completes another explicit confirmation.

This separation supports continued exploration without accidentally losing an earlier satisfactory result.

#### 2.4 Design approval state

Implemented project-specific approval records.

The approval information identifies:

- The approved concept.
- The source recommendation round.
- The associated design attributes.
- The design information required to preserve the approved concept independently of later exploration.

Approval does not automatically convert every attribute belonging to the chosen design into a confirmed Like preference.

Existing confirmed preferences and unfinished feedback drafts remain independent of the design approval process.

#### 2.5 Exploration completion state

After confirming a design, Intenta displays a completion message within the existing conversation.

The completion interface includes:

- A Design Approved confirmation.
- A preview of the approved business-card concept.
- Information identifying the chosen design.
- A Return to Exploration action.

While exploration is marked complete, the normal exploration controls and prompt composer are replaced with Return to Exploration.

This creates a meaningful stopping point and avoids immediately encouraging users to generate additional recommendations.

#### 2.6 Returning to exploration

Users can return to exploration after approving a design.

When exploration resumes:

- The normal exploration controls become available again.
- The previously approved concept remains recorded.
- Earlier recommendation rounds remain accessible.
- Previously confirmed preferences remain unchanged.
- Unfinished feedback drafts are preserved.
- Selecting a different concept does not automatically overwrite the approved concept.

If the user later approves a different design, the new approval becomes the active approved concept while earlier approval events remain in conversation history.

#### 2.7 Conversation and recommendation continuity

Integrated approval information into the existing conversation-based interaction structure.

The implementation:

- Records approval events in conversation history.
- Preserves previous recommendation rounds.
- Displays an Approved indicator for the currently approved concept.
- Supports concept approval from earlier recommendation rounds.
- Maintains independent approval states across projects.

The existing design-preview and recommendation mechanisms were reused rather than replaced.

### 3. Design and Technical Decisions

**3.1 Progressive disclosure**

The student selected a unified Choose Next Step interaction instead of adding a separate prominent Use This Design button.

This decision followed usability concerns identified during Milestone 5.2, where multiple competing actions made the interface difficult to navigate.

Grouping the three pathways within one dialog reduces visual clutter while retaining functionality.

**3.2 Explicit user confirmation**

Approving a design requires a deliberate confirmation action.

This prevents the system from treating provisional exploration decisions as final user intentions.

**3.3 Distinguishing design approval from attribute preferences**

A user may approve a design as a whole without necessarily liking every individual attribute in isolation.

Therefore, design approval and structured attribute preferences are maintained separately.

**3.4 Reversible completion**

Exploration completion is not permanent.

Users can return to exploration without removing their existing approved concept.

This accommodates changing intentions and supports iterative creative work.

**3.5 Preservation of interaction history**

Previous recommendations and approval events remain in conversation history, allowing users to revisit earlier decisions.

The active approved design can change, but the historical record of prior decisions is preserved.

**3.6 Project-specific state**

Approved designs are associated with individual projects to prevent decisions from one project affecting another.

**3.7 Incremental implementation**

The milestone reused the existing recommendation engine, design previews and preference-management functionality.

The implementation focused on design approval and completion rather than introducing unrelated functionality such as exporting, persistent storage or object-level refinement.

### 4. Relevance to Intelligent Interactive Systems

This milestone contributes to Intenta's research question:

_How do structured and visual interaction techniques support users in expressing and refining their intentions during generative AI-assisted visual content creation?_

The implementation demonstrates several relevant interaction-design principles.

**User agency**

Users explicitly decide when a design satisfies their intentions. The system does not require further exploration once the user is satisfied.

**Recognition over recall**

The design-confirmation dialog displays the actual selected concept, allowing users to visually verify their decision instead of relying on a concept name alone.

**Visibility of system state**

The interface distinguishes between a selected concept, an approved concept and a completed exploration session.

**Error prevention**

A separate confirmation step reduces the likelihood of accidentally approving an unintended design.

**User control and freedom**

Users can cancel approval, return to exploration and approve a different design later.

**Progressive disclosure**

The Choose Next Step dialog provides access to multiple pathways without displaying all actions simultaneously.

**Support for task completion**

The system recognises that successful creative exploration may end when the user identifies a satisfactory design, rather than always requiring further iteration.

Together, these features establish a clearer relationship between intention exploration, design selection and final approval.

### 5. AI Assistance and Student Contributions

**ChatGPT assisted with:**

- Translating the approved design-confirmation workflow into React functionality.
- Extending the Choose Next Step dialog to support design approval.
- Implementing the confirmation dialog and selected-design preview.
- Developing project-specific approval-state management.
- Separating provisional concept selection from confirmed design approval.
- Adding conversation approval events and completion-state presentation.
- Implementing Return to Exploration behaviour.
- Preserving recommendation history, confirmed preferences and feedback drafts.
- Preparing responsive CSS updates that retain previous composer improvements.
- Performing syntax and data-layer validation.
- Providing installation and manual testing instructions.

**The student:**

- Identified the need for users to finish exploration when a satisfactory design is found.
- Approved a separate Use This Design action with an explicit confirmation step.
- Selected the unified Choose Next Step interface to avoid reintroducing competing primary buttons.
- Approved the separation between selected and approved concepts.
- Chose a completion-focused interface that temporarily replaces exploration controls with Return to Exploration.
- Required approval to remain reversible rather than permanently locking the project.
- Approved preservation of earlier recommendation rounds, unfinished feedback and confirmed preferences.
- Required responsive design to remain a consideration during implementation.
- Directed the incremental implementation approach.

### 6. Testing and Validation

**Development environment:** React, Vite, JavaScript and CSS.

**Browser for manual verification:** Google Chrome.

Code-level validation conducted during implementation included:

- JavaScript and JSX syntax checks.
- CSS parsing.
- Data-layer checks of approval records.
- Checks of source-round and concept identification.
- Checks of preservation of unfinished feedback.
- Checks of approval replacement and historical records.

These code-level checks passed during implementation.

The following browser-level checks are required to confirm the complete interaction:

| Test Area                                                      | Status                      |
| -------------------------------------------------------------- | --------------------------- |
| Choose Next Step displays all three pathways                   | Pending manual confirmation |
| Use This Design requires a selected concept                    | Pending manual confirmation |
| Confirmation dialog displays the correct concept               | Pending manual confirmation |
| Back and Escape cancel without approval                        | Pending manual confirmation |
| Confirm Design creates a completion event                      | Pending manual confirmation |
| Approved indicator appears on the correct concept              | Pending manual confirmation |
| Return to Exploration restores normal controls                 | Pending manual confirmation |
| Approved concept remains unchanged during further exploration  | Pending manual confirmation |
| Re-approval updates the active approved concept                | Pending manual confirmation |
| Previous recommendations and unfinished feedback remain intact | Pending manual confirmation |
| Project-specific approval state remains independent            | Pending manual confirmation |
| Responsive layout works on laptop and large-monitor screens    | Pending manual confirmation |

The milestone should be marked as fully manually tested once these browser interactions have been verified.

### 7. Known Limitations

- The approved concept is maintained in React application state rather than persistent storage.
- Approval does not export, download or permanently save the design.
- The design previews remain CSS-rendered simulations based on predefined attributes.
- No trained generative image model is integrated.
- Object-level visual refinement is not implemented within this milestone.
- Formal accessibility testing remains outstanding.
- A structured usability evaluation with participants has not yet been conducted.
- Project information may be lost when the application is refreshed.

### 8. Milestone Outcome

Milestone 5.3 introduces a clear endpoint to Intenta's design-exploration workflow.

Users can now move from receiving recommendations to selecting a concept, explicitly approving it and completing exploration without additional mandatory steps.

The approval process also remains reversible, allowing users to continue exploring while retaining their previously approved design.

This extends Intenta from an interface focused exclusively on iterative recommendation generation to one that also supports users in recognising and confirming satisfactory outcomes.

### 9. Next Steps

The next development stage should review the remaining continuity and conflict-handling requirements within Phase 2, including consistency between the original prompt, confirmed preferences and iterative recommendation behaviour.

Further implementation should preserve the existing simplified interface, approval workflow and responsive design improvements.

After the remaining Phase 2 requirements are completed and tested, subsequent development can address community inspiration and object-level refinement according to the project plan.

## Phase 2 — Milestone 5.4: Conversational Continuity and Conflict Handling

**Date:** 15 November 2026  
**Status:** Implemented and manually tested

### 1. Objective

The objective of this milestone was to improve consistency between users' natural-language instructions, confirmed design preferences and subsequent recommendations.

During a review of the existing Phase 2 implementation, two important limitations were identified:

1. Follow-up conversational prompts were displayed in conversation history but did not update the requirements used by the recommendation engine.
2. Conflicting instructions were not handled consistently across initial recommendations, Explore New Directions and Explore Variations.

These limitations could lead to situations where users communicated new creative intentions but the generated recommendations continued to follow outdated instructions.

Milestone 5.4 addresses these issues while preserving the simplified interaction interface developed in previous milestones.

### 2. Implementation

#### 2.1 Original Brief and Active Design Brief

Introduced a distinction between two forms of design-brief information:

**Original Brief**

- Preserves the user's initial wording.
- Provides a historical record of the original creative request.
- Is not overwritten by subsequent changes.

**Active Design Brief**

- Represents the currently accepted design requirements.
- Is initialised using the prompt actually submitted by the user, including any explicitly selected Prompt Assistance wording.
- Can be updated through reviewed and confirmed follow-up instructions.
- Is used by subsequent recommendation generation.

This separation allows users to revise their requirements without losing the original context.

#### 2.2 Natural-language follow-up interpretation

Extended the conversation workflow to support structured interpretation of follow-up design instructions.

The rule-based interpretation mechanism identifies supported changes involving:

- Colour palettes.
- Typography.
- Layout.
- Decorative details.

For example, a follow-up such as "Actually, make it navy blue and use sans-serif typography" can be interpreted as proposed changes to the active colour and typography requirements.

The mechanism uses predefined design categories rather than a general-purpose natural-language understanding model.

#### 2.3 Explicit review and confirmation

Implemented a review workflow for proposed changes to the Active Design Brief.

When a follow-up instruction contains recognised design changes:

- The system identifies the supported modifications.
- A review dialog displays the proposed changes.
- Users can review individual modifications.
- Users can exclude changes they do not want to apply.
- The active requirements are updated only after explicit confirmation.
- Cancelling the review leaves the existing requirements unchanged.

Submitting a message therefore does not automatically modify the user's active design requirements.

#### 2.4 Incremental brief updates

Implemented incremental updating rather than replacing the entire brief after every follow-up message.

For example:

**Existing Active Design Brief:**

- Green palette.
- Structured layout.
- Professional appearance.

**Confirmed follow-up:** Change the palette to navy.

**Updated Active Design Brief:**

- Navy palette.
- Structured layout.
- Professional appearance.

Previously accepted requirements that are unrelated to the proposed changes are preserved.

This allows users to refine individual aspects of a design without repeatedly restating their full brief.

#### 2.5 Handling unsupported instructions

Added transparent handling for instructions outside the predefined rule-based vocabulary.

When the system cannot reliably interpret part of a follow-up request:

- The unsupported wording is identified.
- The system does not silently invent an interpretation.
- Recognised changes can still be reviewed individually.
- Unsupported instructions are not applied as structured design constraints.
- The user's message remains visible in conversation history.

This prevents the prototype from presenting limited natural-language processing as unrestricted AI understanding.

#### 2.6 Preference conflict handling

Extended conflict-handling behaviour to improve consistency between active requirements and confirmed preferences.

Potential conflicts can arise when:

- An active brief explicitly requires an attribute.
- The same attribute has been marked Avoid in Current Intentions.

For example, the Active Design Brief may require a green palette while the user has confirmed an Avoid preference for green.

The revised workflow requires an explicit decision where such conflicts are detected.

Conflict resolution can allow a temporary, round-specific exception without silently overwriting stored preferences or requirements.

This extends the transparent conflict-resolution approach already introduced in Explore Variations.

#### 2.7 Recommendation consistency

Updated recommendation utilities so that subsequent design-generation requests use the latest confirmed Active Design Brief.

The changes address:

- Using active rather than outdated design instructions.
- Considering confirmed preferences during recommendation generation.
- Handling supported exclusions more consistently.
- Maintaining compatibility with existing Explore Variations behaviour.
- Preserving the original recommendation templates where possible.

An additional backward-compatibility issue was identified during code-level validation: an early version of the changes altered the initial concept-selection behaviour unnecessarily.

This was corrected so that familiar initial design styles remain available while supported exclusions are enforced.

#### 2.8 No automatic recommendation generation

The student selected an explicit user-controlled workflow.

After confirming a follow-up update:

- The Active Design Brief is updated.
- The system communicates the accepted changes.
- No new recommendation round is generated automatically.
- Users decide whether to continue through Choose Next Step.

This preserves the distinction between updating intentions and requesting new design recommendations.

#### 2.9 Conversation and project continuity

The implementation preserves existing Phase 2 functionality, including:

- Earlier recommendation rounds.
- Unfinished attribute-feedback drafts.
- Confirmed Like, Avoid and Not Sure preferences.
- Previously approved designs.
- Project-specific design state.
- Explore New Directions.
- Explore Variations.
- Use This Design and Return to Exploration.

The continuity changes were designed to integrate with these existing features rather than introduce another complex primary workflow.

### 3. Design and Technical Decisions

**3.1 Explicit user control**

Changes to active requirements must be reviewed and confirmed before being applied.

This prevents the system from treating every conversational statement as a permanent design constraint.

**3.2 Preservation of the original request**

The original wording is maintained independently from revised instructions, allowing users to understand how their intentions have evolved.

**3.3 Incremental intention refinement**

Users can revise individual design attributes without having to rewrite the complete design brief.

**3.4 Separation of information types**

The application distinguishes between:

- Original instructions.
- Active requirements.
- Confirmed attribute preferences.
- Unconfirmed feedback.
- Provisional concept selection.
- Approved design selection.

Each type of information serves a different purpose in the interaction workflow.

**3.5 Transparent limitations**

The rule-based interpretation mechanism should only claim to recognise attributes supported by the prototype.

Unsupported or ambiguous instructions must not be silently treated as successfully understood.

**3.6 Consistent conflict resolution**

Where supported design requirements contradict confirmed Avoid preferences, the system asks users to resolve the conflict instead of silently deciding which instruction takes priority.

**3.7 Controlled recommendation generation**

Updating the Active Design Brief does not automatically trigger generation. Users retain control over whether and when to explore additional designs.

**3.8 Maintaining interface simplicity**

The implementation reuses existing dialog patterns and the Choose Next Step interface, avoiding the introduction of additional prominent controls.

Responsive design and the previously approved auto-expanding composer were preserved.

### 4. Relevance to Intelligent Interactive Systems

This milestone directly supports Intenta's research question:

_How do structured and visual interaction techniques support users in expressing and refining their intentions during generative AI-assisted visual content creation?_

The implementation demonstrates several relevant interaction principles.

**Mixed-initiative interaction**

Users express design intentions through natural-language messages, while the system proposes structured interpretations for review.

The system contributes by identifying possible changes, but the user determines which changes are accepted.

**User agency**

Design requirements are not silently modified. Users can confirm, reject or selectively apply proposed changes.

**Transparency and explainability**

The interface communicates what the system has recognised, which changes it proposes and when a conflict requires attention.

**Interaction continuity**

The Active Design Brief maintains the latest accepted requirements while preserving earlier instructions and recommendation history.

**Error prevention**

Explicit review helps reduce the risk of unintended changes caused by ambiguous instructions or imperfect rule-based interpretation.

**Progressive intention refinement**

Users can gradually clarify design requirements through conversation and structured feedback rather than specifying every detail at the beginning.

These capabilities help the system support evolving creative intentions instead of relying exclusively on the initial prompt.

### 5. AI Assistance and Student Contributions

**ChatGPT assisted with:**

- Reviewing the existing Phase 2 implementation to identify continuity gaps.
- Designing the Original Brief and Active Design Brief separation.
- Implementing rule-based interpretation of follow-up instructions.
- Creating the review-and-confirmation workflow.
- Implementing incremental updates to active design requirements.
- Adding transparent handling for unsupported instructions.
- Extending conflict-resolution behaviour.
- Updating recommendation utilities to use current accepted requirements.
- Checking compatibility with Explore New Directions and Explore Variations.
- Performing code-level syntax and regression testing.
- Preparing installation instructions and manual testing guidance.

**The student:**

- Approved explicit review and confirmation of conversational follow-up instructions.
- Selected incremental brief updates rather than rewriting the original request.
- Required the original brief, confirmed preferences and unfinished feedback to remain separate.
- Approved transparent handling of unsupported instructions.
- Selected explicit conflict resolution rather than silent preference overrides.
- Chose not to automatically generate recommendations after confirming brief updates.
- Required the changes to preserve the simplified interface and responsive layout.
- Integrated the updated files into the existing React application.
- Encountered and resolved an issue that initially caused the localhost interface to appear blank.
- Tested the corrected application in Google Chrome.
- Confirmed that the updated functionality worked as expected.

### 6. Testing and Validation

**Development environment:** React, Vite, JavaScript and CSS.

**Browser:** Google Chrome.

Code-level validation was conducted during implementation.

This included JavaScript/JSX syntax validation, CSS parsing and 23 targeted data-layer tests covering:

- Initial and active design requirements.
- Incremental brief modifications.
- Selective confirmation of proposed updates.
- Preservation of unrelated requirements.
- Handling of conflicting Avoid preferences.
- Recommendation generation using updated instructions.
- Compatibility with variation generation.
- Preservation of existing project and feedback state.

The targeted code-level checks passed.

**Manual integration testing**

During installation, the student encountered an issue in which the application displayed a blank localhost page.

The student subsequently identified and resolved the issue locally. The specific cause was not recorded.

After resolving the issue, the student tested the application and confirmed that the updated functionality worked as expected.

The following areas were included in the provided manual testing guidance:

| Test Area                       | Expected Behaviour                               |
| ------------------------------- | ------------------------------------------------ |
| Original and Active Brief       | Displayed as separate information                |
| Follow-up instructions          | Supported changes are recognised                 |
| Proposed change review          | Changes require confirmation                     |
| Cancel                          | Does not update active requirements              |
| Selective confirmation          | Applies only accepted changes                    |
| Unsupported instructions        | Identified without silent application            |
| Recommendation generation       | Uses confirmed active requirements               |
| Conflict resolution             | Requires explicit user decisions                 |
| Existing feedback and approvals | Preserved during updates                         |
| Responsive interface            | Maintains previous composer and dialog behaviour |

**Recorded result:** The student reported that the corrected application worked after manual testing.

Formal automated browser-based end-to-end testing and a structured usability evaluation have not yet been conducted.

### 7. Known Limitations

- Natural-language interpretation supports only predefined design categories and expressions.
- More complex requests may require additional interpretation rules.
- Ambiguous or abstract design descriptions may not be fully understood.
- Recommendation generation remains deterministic and rule-based.
- The available design catalogue limits the possible recommendation combinations.
- Project and conversation state are maintained in React memory rather than persistent storage.
- The prototype does not yet provide permanent design saving or exporting.
- Formal accessibility and usability evaluations remain outstanding.

### 8. Milestone Outcome

Milestone 5.4 improved the consistency and continuity of Intenta's iterative design workflow.

Users can now communicate supported design revisions through follow-up messages, review the system's interpretation and explicitly update their active requirements.

These changes influence subsequent recommendations while preserving the original design brief, previously confirmed preferences and interaction history.

The milestone also strengthens conflict handling and maintains the user's control over when new design recommendations are generated.

Together, these improvements provide a more coherent connection between conversational interaction, structured preference feedback and visual design exploration.

### 9. Next Steps

Following Milestone 5.4, the remaining Phase 2 functionality should be reviewed through an integrated regression test.

The review should examine whether the complete workflow behaves consistently from initial prompt submission through iterative exploration, preference refinement and final design approval.

Further development can then proceed to the remaining planned phases, including Community Inspiration and object-level refinement.

Responsive behaviour should continue to be tested across laptop and larger-monitor display sizes.

## Phase 2 — Final Integration Testing

**Date:** 15 November 2026  
**Status:** Completed — All planned integration tests passed  
**Testing approach:** Manual functional and integration testing in Google Chrome  
**Environment:** React/Vite prototype, Windows, Google Chrome

### Objective

The purpose of this testing stage was to verify that the features implemented throughout Phase 2 work together consistently and support the complete design-exploration workflow.

Testing focused on interaction continuity, explicit user control, structured preference management, conversational intention updates, design recommendation generation, conflict resolution, design approval, project independence and responsive interface behaviour.

### Test Results

A total of **15 test scenarios containing 148 individual checks** were completed.

| Test      | Area tested                                                  | Result             |
| --------- | ------------------------------------------------------------ | ------------------ |
| 1.1       | Initial prompt submission and recommendation generation      | 7/7 passed         |
| 2.1       | Prompt Assistance — Submit Suggestion                        | 8/8 passed         |
| 2.2       | Prompt Assistance — Submit Original                          | 7/7 passed         |
| 3.1       | Structured attribute feedback and confirmation               | 8/8 passed         |
| 3.2       | Editing confirmed preferences                                | 10/10 passed       |
| 4.1       | Explore New Directions and unfinished feedback               | 10/10 passed       |
| 4.2       | Revisiting feedback from earlier recommendation rounds       | 10/10 passed       |
| 5.1       | Explore Variations from earlier concepts                     | 10/10 passed       |
| 5.2       | Variation preference conflicts and resolution                | 10/10 passed       |
| 6.1       | Conversational follow-up instructions                        | 11/11 passed       |
| 6.2       | Unsupported instructions and preference conflicts            | 11/11 passed       |
| 6.3       | Active Design Brief conflicts during Explore New Directions  | 10/10 passed       |
| 7.1       | Design approval and completion                               | 10/10 passed       |
| 7.2       | Returning to exploration and changing an approved design     | 12/12 passed       |
| 8         | Project independence, responsive design and final regression | 14/14 passed       |
| **Total** | **15 test scenarios**                                        | **148/148 passed** |

### Key Findings

**1. Intention management and explicit confirmation**

The prototype successfully maintains a distinction between the Original Brief, Active Design Brief, confirmed attribute preferences and unfinished feedback drafts. Users can review, confirm, edit, cancel or remove preferences without unintentionally modifying other project information.

**2. Conversation and recommendation continuity**

Multiple recommendation rounds remain accessible in conversation history. Users can revisit earlier rounds, confirm previously unfinished feedback and generate new recommendations using their latest confirmed intentions. Existing recommendations are preserved rather than retroactively regenerated.

**3. Controlled design exploration**

Explore New Directions and Explore Variations support different exploration goals. The former considers the Active Design Brief and confirmed preferences, while the latter uses a selected concept as a reference and supports optional attribute-specific variation. The prototype also communicates limitations when its predefined design catalogue cannot provide every requested variation.

**4. Conflict handling and transparency**

Tests confirmed that the prototype identifies supported conflicts between design requirements, confirmed Avoid preferences and selected reference concepts. Users can explicitly choose how to proceed without silently overwriting saved intentions. Unsupported natural-language instructions are identified rather than treated as successfully interpreted.

**5. Design approval and reversibility**

Selecting a concept does not automatically approve it. Users must explicitly confirm a design before entering the exploration-completion state. They can subsequently return to exploration, generate additional recommendations and approve a different concept while preserving the earlier history.

**6. Project independence and responsive design**

Project-specific conversations, recommendations, preferences and approvals remained independent when switching between projects during the same running session.

Responsive behaviour was manually checked at the following viewport sizes:

- 1366 × 768 — laptop
- 1920 × 1080 — desktop
- 2560 × 1440 — large monitor

The interface remained usable across the tested sizes. The conversation composer expanded and contracted with text input, maintained a maximum height and did not obstruct essential interface controls.

### Issues Identified

No failures or blocking issues remained unresolved during the final integration-testing stage. All reported checks passed, and no additional implementation fixes were required as a result of these tests.

### Scope and Limitations

These results reflect manual testing of the implemented prototype under the specified test scenarios. They do not establish exhaustive test coverage or guarantee the absence of bugs.

The recommendation functionality is a deterministic, rule-based simulation using a predefined design catalogue, rather than an integrated generative AI model. Consequently, design coverage and natural-language interpretation remain constrained by the implemented rules and supported attributes.

Project information is maintained in React application memory. Project independence was verified within an active session; persistence after browser refresh, application restart, or across devices was not tested and should not be assumed.

Responsive testing covered three laptop/desktop viewport sizes. Comprehensive accessibility conformance and usability testing with external participants are outside the scope of these integration checks.

### Conclusion

Phase 2 successfully passed all 15 planned integration scenarios, with **148 checks passed, 0 failed and 0 pending**.

The results provide evidence that the implemented interaction mechanisms work together consistently, particularly in supporting the expression, review, refinement and confirmation of users' design intentions.

**Phase 2 is considered complete for its planned implementation and integration-testing scope.**

The project can now progress to Phase 3 — Community Inspiration, followed by further prototype development and subsequent usability and accessibility evaluation.

## Phase 3 — Milestone 3.1: Community Inspiration Gallery

**Date:** 15 November 2026  
**Status:** Completed — Implementation and manual integration testing passed

### 1. Objective

The objective of Milestone 3.1 was to introduce a Community Inspiration Gallery that supports users in exploring creative ideas beyond their existing business-card design projects.

The gallery was designed to encourage open-ended visual discovery across multiple creative disciplines, rather than limiting inspiration to business-card templates.

The interface follows a Behance-inspired browsing approach, using visual project cards, category navigation, search and filtering.

### 2. Implementation

The following functionality was implemented:

**Community Gallery**

- Added a curated gallery containing 16 original sample artworks.
- Included creative categories such as Graphic Design, Photography, Illustration, Branding, UI/UX, 3D Art, Architecture and Typography.
- Implemented a responsive grid of project thumbnails with titles and descriptive metadata.
- Added text-based search, category filtering, style filtering, sorting and an empty-results state.
- Used local SVG assets and predefined project metadata to keep the prototype manageable and independent of external services.

**Navigation and Accessibility**

- Integrated Community Inspiration into the existing left sidebar.
- Enabled the previously inactive Community navigation item.
- Removed the redundant top-level Community navigation introduced during initial integration.
- Added active-navigation highlighting for Home and Community.
- Enabled access to the gallery without creating or selecting a project.
- Retained the existing project navigation and Design Workspace.
- Checked that primary navigation, search and filtering controls were reachable through keyboard Tab navigation.

**Project State and Integration**

- Preserved existing project conversations, recommendations, preferences and design approvals when switching between Community Inspiration and the Design Workspace.
- Kept gallery browsing independent of the currently selected project.
- Ensured that viewing gallery content does not automatically change the Active Design Brief or confirmed preferences.

### 3. Main Files

| File or directory                     | Purpose                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `src/App.jsx`                         | Integrates Community Gallery into the application navigation and workspace |
| `src/components/Sidebar.jsx`          | Enables Community navigation and active-page highlighting                  |
| `src/components/CommunityGallery.jsx` | Implements the gallery interface and browsing interactions                 |
| `src/data/communityProjects.js`       | Defines the curated sample project data                                    |
| `src/Phase3.css`                      | Provides gallery styling and responsive behaviour                          |
| `public/community-images/`            | Contains the sample SVG artwork                                            |

### 4. Integration Adjustments

During initial integration, Vite reported unresolved imports for `CommunityGallery.jsx` and `communityProjects.js`. The required files were placed in their expected project directories, resolving the import errors.

The gallery navigation was also revised following visual inspection. The initial implementation introduced a separate top navigation bar, but this duplicated the existing Community item in the sidebar.

The final implementation uses the existing sidebar Community button instead, maintaining consistency with the original Intenta layout.

All 16 artwork thumbnails subsequently loaded successfully during testing.

### 5. Testing

Manual functional and integration testing was conducted in Google Chrome.

| Test      | Scope                                                                                                | Result           |
| --------- | ---------------------------------------------------------------------------------------------------- | ---------------- |
| 3.1A      | Gallery browsing, artwork loading, search, category filters, style filters and sorting               | 8/8 passed       |
| 3.1B      | Sidebar navigation, project independence, responsiveness, keyboard navigation and Phase 2 regression | 11/11 passed     |
| **Total** | **19 checks**                                                                                        | **19/19 passed** |

**Responsive testing**

The gallery was tested at three viewport sizes:

- 1366 × 768 — Laptop
- 1920 × 1080 — Desktop
- 2560 × 1440 — Large monitor

The interface remained usable across all three tested viewport sizes without reported overlapping or clipped controls.

**Integration verification**

Testing confirmed that users could switch between Community Inspiration and the Design Workspace while retaining project-specific conversation history, confirmed preferences and previously approved designs.

Existing Phase 2 recommendation generation and Choose Next Step functionality also remained operational.

### 6. Limitations

The gallery currently uses curated mock data rather than a live community database. It does not support real community accounts, project uploads or dynamic content retrieval.

Detailed artwork views and selecting inspiration attributes are not included in this milestone.

Browsing inspiration is currently independent of the design workflow. Transferring inspiration into a business-card project will be implemented in a subsequent milestone, with explicit user confirmation.

The accessibility checks performed in this milestone covered basic keyboard Tab navigation. They do not constitute a comprehensive accessibility audit.

Project information continues to be held in React application memory. Persistent storage across browser refreshes is not part of the current implementation.

### 7. Outcome and Next Steps

Milestone 3.1 successfully introduced an independent, Behance-inspired creative gallery with functional browsing and responsive layouts.

All 19 planned integration checks passed, with no unresolved failures reported.

The milestone is considered complete for its planned implementation and testing scope.

**Next milestone: Phase 3.2 — Inspiration Project Details**, focusing on detailed artwork viewing and allowing users to identify design characteristics that inspire them, without automatically modifying existing projects.

## Phase 3 — Milestone 3.2: Inspiration Project Details and Saved Inspiration

**Date:** 16 November 2026  
**Status:** Completed — Implementation and integration testing passed

### 1. Objective

The objective of Milestone 3.2 was to extend the Community Inspiration Gallery developed in Milestone 3.1 by enabling users to explore individual creative projects, identify inspiring design characteristics and explicitly save their selections.

This milestone supports the project's broader aim of helping users recognise and express their creative intentions through structured and visual interaction.

The implementation maintains a clear separation between exploring inspiration, saving inspiration and applying inspiration to a design project.

### 2. Implementation

#### 2.1 Dedicated Project Detail View

Implemented a dedicated Behance-inspired project detail view that opens when users select an artwork from the Community Gallery.

The detail view includes:

- A larger artwork preview.
- Project title, category, style and description.
- Curated design characteristics relevant to the artwork.
- Navigation back to Explore or Saved Inspiration.

The interface preserves browsing context, including search queries, category filters, style filters and sorting preferences.

Users can access project details independently of any existing design project.

#### 2.2 Structured Inspiration Attribute Selection

Implemented interactive attribute selection within the project detail view.

Each artwork provides a curated set of transferable design characteristics relating to the supported dimensions:

- Colour
- Typography
- Layout
- Decorations

Users can select or deselect individual characteristics and view a counter showing the number of selected attributes.

Selections are initially stored as unconfirmed drafts.

This enables users to explore what they find appealing without immediately committing to those preferences.

#### 2.3 Review and Confirmation

Implemented a Review Inspiration dialog that allows users to inspect their selected attributes before saving.

The review workflow supports:

- Displaying selected attributes and their categories.
- Removing individual attributes during review.
- Returning to attribute selection without saving.
- Explicitly confirming inspiration.

Confirmed inspiration is stored separately from project-specific design preferences.

No changes are made to a project's Original Brief, Active Design Brief or Current Intentions.

#### 2.4 Saved Inspiration Collection

Implemented a Saved Inspiration collection within the Community section.

Users can:

- View artworks they have explicitly saved.
- Review confirmed design characteristics associated with each artwork.
- Revisit saved artworks through their detail pages.
- Modify previously saved attributes.
- Remove saved inspiration through a confirmation dialog.

Changes to existing inspiration require explicit confirmation. Unsaved edits do not overwrite previously confirmed selections.

Removing an artwork from Saved Inspiration does not remove it from the Explore gallery.

The collection also provides an appropriate empty state when no saved inspiration remains.

#### 2.5 Community Navigation Refinement

Following interface inspection, the Explore and Saved Inspiration views were refined to share a common Community page layout.

Both sections now appear as adjacent tabs beneath the Community Inspiration heading.

The revised implementation:

- Maintains a consistent page heading and navigation structure.
- Switches content within the Community interface.
- Highlights the active tab.
- Preserves Explore search and filtering state.
- Retains dedicated detail pages for individual artworks.
- Restores the appropriate Community tab when returning from a detail page.

This refinement improved navigation consistency without changing the underlying inspiration-management functionality.

#### 2.6 Project Independence and State Management

Community inspiration state is maintained separately from design-project state.

Saved artwork selections are stored in the current React application session and remain available when users switch between Community and the Design Workspace.

Browsing, selecting, updating or removing inspiration does not automatically modify existing design requirements, confirmed preferences, recommendation rounds or approved designs.

Connecting saved inspiration to a specific design project is reserved for Milestone 3.3.

### 3. Main Files

| File                                  | Responsibility                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/App.jsx`                         | Integrates Community state with application-level navigation and state management                   |
| `src/components/CommunityGallery.jsx` | Implements artwork details, attribute selection, review, Saved Inspiration and Community navigation |
| `src/data/inspirationAttributes.js`   | Defines curated transferable design characteristics                                                 |
| `src/data/communityProjects.js`       | Provides existing gallery project metadata                                                          |
| `src/Phase3.css`                      | Styles detail pages, attribute controls, review dialogs and responsive Community layouts            |

The existing Phase 2 components and design-exploration workflows were preserved.

### 4. Testing and Evaluation

Manual functional and integration testing was conducted in Google Chrome.

Three test scenarios were completed.

| Test      | Functionality                                                                        | Result           |
| --------- | ------------------------------------------------------------------------------------ | ---------------- |
| 3.2A      | Project details, attribute selection, review, confirmation and tab navigation        | 13/13 passed     |
| 3.2B      | Editing saved inspiration, removal, empty states and project independence            | 15/15 passed     |
| 3.2C      | End-to-end workflow, responsive layouts, keyboard interaction and Phase 2 regression | 12/12 passed     |
| **Total** | **40 individual checks**                                                             | **40/40 passed** |

#### 4.1 Functional Testing

Testing confirmed that users could open an artwork's detail page, select relevant characteristics, review their selections and explicitly confirm inspiration.

The implementation correctly distinguished between unsaved drafts and confirmed selections.

Users could revisit existing saved artwork, modify attributes and remove inspiration without affecting other saved projects.

#### 4.2 Navigation and Interaction Continuity

The revised Explore and Saved Inspiration tabs functioned correctly.

The gallery preserved existing search and filtering state when users navigated between Community sections and artwork detail pages.

Returning from an artwork detail page restored the appropriate tab.

#### 4.3 Responsive and Keyboard Testing

The gallery, project detail page and review dialog were tested at:

- 1366 × 768 — Laptop
- 1920 × 1080 — Desktop

The interface remained usable at both tested viewport sizes.

Essential Community controls were reachable through keyboard navigation, and the Escape key successfully closed the inspiration review dialog.

#### 4.4 Integration and Regression Testing

The complete workflow was tested:

**Explore → Project Details → Select Attributes → Review Inspiration → Confirm → Saved Inspiration**

The workflow completed without reported blocking errors.

Returning to the Design Workspace preserved existing project information, including:

- Conversation history.
- Original Brief.
- Active Design Brief.
- Confirmed Current Intentions.
- Previously approved designs.

The existing Phase 2 Choose Next Step workflow also remained functional.

### 5. Issues and Refinements

A navigation inconsistency was identified during visual inspection: Saved Inspiration initially opened using a separate page layout rather than appearing alongside Explore within the Community interface.

This was addressed by introducing a shared Community heading and adjacent Explore / Saved Inspiration tabs.

The updated layout was subsequently verified through manual testing.

No unresolved functional failures were reported after the final integration tests.

### 6. Limitations

**Curated content:** Community projects and their associated attributes use predefined sample data rather than dynamically retrieved community content.

**Rule-based attribute descriptions:** The available inspiration characteristics are manually curated. The prototype does not use an AI model to automatically analyse artworks or infer their visual characteristics.

**Session-only storage:** Saved inspiration is maintained in React memory. It is not persistently stored across browser refreshes or application restarts.

**No project transfer yet:** Confirmed inspiration remains independent of design projects. Applying or transferring inspiration to a business-card project is reserved for Milestone 3.3.

**Limited accessibility testing:** Keyboard navigation and Escape-key handling were manually checked, but comprehensive screen-reader testing and formal accessibility conformance evaluation have not yet been completed.

**Limited usability evidence:** These tests establish functional behaviour under defined scenarios. They do not replace usability evaluation involving external participants.

### 7. Outcome and Next Steps

Milestone 3.2 successfully extended Community Inspiration from a visual browsing gallery into an interactive inspiration-discovery and management workflow.

All **40 planned checks passed**, with no outstanding failures reported.

The implementation provides users with greater control over identifying, reviewing and retaining design characteristics while maintaining separation from existing project intentions.

**Milestone 3.2 is considered complete for its planned scope.**

The next development stage is **Milestone 3.3 — Connecting Saved Inspiration to Design Projects**, which will focus on transferring selected inspiration into a project through an explicit review and confirmation process.

### Phase 3 — Milestone 3.3.1: Inspiration Project Selection

**Status:** Completed — 10/10 manual integration checks passed.

**Objective:** Enable users to explicitly select a destination business-card project when connecting saved Community inspiration.

**Implementation:**

- Added a Connect to Project action for saved inspiration.
- Implemented an explicit project-selection dialog displaying existing projects.
- Required users to select a destination rather than automatically choosing the active project.
- Supported creating a new project from Community without automatically selecting it or leaving Community.
- Added a provisional selection summary and the ability to change the destination.
- Preserved existing Community inspiration and project data without performing any attribute transfer.

**Testing:** All 10 checks in Test 3.3.1A passed in Google Chrome. Testing covered project selection, cancellation, Escape-key behaviour, changing destinations, creating projects and project-state preservation.

**Limitations:** Selecting a project does not yet connect inspiration or update confirmed preferences. Attribute transfer, conflict resolution and final confirmation are reserved for Milestone 3.3.2.

**Outcome:** Project selection is operational and ready for integration with the attribute-transfer workflow.

### Phase 3 — Milestone 3.3.2: Inspiration Attribute Transfer and Conflict Resolution

**Status:** Completed — 47/47 manual integration checks passed.

#### Objective

Implement a user-controlled workflow for connecting saved Community inspiration to business-card design projects. Users should be able to transfer supported design attributes into existing confirmed preferences, resolve conflicts explicitly, or connect an artwork as a visual reference without changing project preferences.

#### Implementation

**1. Attribute Transfer Review**

- Integrated the existing project-selection workflow with a dedicated attribute-transfer review.
- Displayed the selected artwork and destination project.
- Introduced curated mappings between Community inspiration attributes and the existing business-card preference catalogue.
- Distinguished supported actionable attributes from descriptive-only characteristics.
- Allowed users to individually select supported attributes for transfer.

**2. Preference Conflict Resolution**

- Detected conflicts between selected inspiration attributes and existing confirmed project preferences.
- Provided explicit per-attribute options:
  - **Keep Existing:** Retain the existing confirmed preference.
  - **Replace Existing:** Replace the conflicting preference with the transferred preference.
  - **Skip Attribute:** Exclude the conflicting attribute from the transfer.
- Prevented confirmation while selected conflicts remained unresolved.
- Preserved unrelated confirmed preferences and allowed non-conflicting attributes to transfer independently.

**3. Explicit Confirmation and State Integration**

- Applied selected preference changes only after final confirmation.
- Reused the existing project preference structure rather than introducing a separate preference system.
- Recorded connected artwork references within the selected project's state.
- Prevented duplicate confirmed preferences and project-reference records.
- Supported connecting the same saved artwork to multiple projects independently.
- Preserved the original Community saved inspiration without modification.
- Kept users in Community after confirmation and provided an optional View Project action.
- Prevented automatic recommendation generation.

**4. Reference-Only Connection UX Refinement**

An additional usability issue was identified during manual testing: the original implementation allowed users to confirm a connection without selecting any attributes, implicitly creating a reference-only connection.

Although technically valid, this behaviour made the purpose and outcome of the confirmation unclear.

The workflow was refined to:

- Disable confirmation when no attributes or reference-only choice are selected.
- Provide an explicit **Connect as visual reference only** option.
- Enable **Connect Reference Only** only when users deliberately choose this option.
- Keep normal attribute-transfer confirmation separate from reference-only confirmation.
- Display a specific success message explaining that the artwork was connected without changing confirmed preferences.
- Preserve cancellation, duplicate prevention and existing conflict-resolution behaviour.

This refinement makes the system's actions more transparent and gives users clearer control over their intended outcome.

**5. Continuity and Project Independence**

- Preserved the Original Brief and Active Design Brief.
- Preserved previously generated recommendation rounds.
- Confirmed that new recommendation rounds can consider newly transferred confirmed preferences where supported.
- Ensured each connection affects only the explicitly selected destination project.
- Continued using session-only React state without persistent backend storage.

#### Testing and Evaluation

Manual integration testing was conducted in Google Chrome.

| Test      | Focus                                                             | Result           |
| --------- | ----------------------------------------------------------------- | ---------------- |
| 3.3.2A    | Attribute transfer, review and confirmation                       | 12/12 passed     |
| 3.3.2B    | Conflict detection and resolution                                 | 13/13 passed     |
| 3.3.2C    | Repeated connections, project independence and regression testing | 12/12 passed     |
| 3.3.2D    | Explicit reference-only connection UX refinement                  | 10/10 passed     |
| **Total** | **Manual integration checks**                                     | **47/47 passed** |

**Results:** All reported checks passed with no outstanding failures. The tests confirmed explicit preference transfer, conflict resolution, project independence, duplicate prevention, reference-only behaviour and preservation of existing design state.

#### Limitations

- Attribute mappings are curated and rule-based rather than generated through automated visual analysis.
- All project and inspiration data remain session-only.
- Linked artwork references are not yet displayed in a dedicated Project Inspiration section within Current Intentions.

#### Outcome

Milestone 3.3.2 successfully connects Community Inspiration with the existing design-preference system through transparent, user-confirmed attribute transfer and conflict resolution.

The additional reference-only UX refinement strengthens user control by distinguishing the intention to transfer design characteristics from the intention to retain an artwork solely as a visual reference.

**Next milestone:** Phase 3 — Milestone 3.3.3: Project Inspiration Display and Final Integration.
