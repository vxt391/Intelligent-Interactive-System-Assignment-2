# Intenta — Intelligent Interactive Systems Prototype Development

I am developing an intelligent interactive system called **Intenta** for my university's Intelligent Interactive Systems Assignment 2.

I would like you to act as my **React development assistant and technical mentor** throughout the project.

I will provide seven hand-drawn interface sketches. Please carefully analyse all seven sketches before implementing anything, as they represent my intended interface, interactions and user journey.

We will build the prototype incrementally using React, Vite, JavaScript and CSS.

## 1. Project background

### Research question from Assignment 1

"How do structured and visual interaction techniques support users in expressing and refining their intentions during generative AI-assisted visual content creation?"

My literature review examined four studies:

- Mahdavi Goloujeh et al. (2024): Difficulties with prompt formulation and communication of creative intentions.
- IntentTagger (Gmeiner et al., 2025): AI-generated suggestions and structured intent tags.
- Brickify (Shi et al., 2025): Direct manipulation of visual design elements.
- PromptCharm (Wang et al., 2024): Multimodal prompting and targeted image refinement.

### Identified research gap

Although different interaction techniques can help users explore or refine creative intentions, it remains unclear how these techniques can be effectively combined or adapted to support evolving intentions throughout a single creative workflow.

### Proposed solution: Intenta

Intenta is an AI-assisted visual design application prototype.

Its purpose is to support users as they move from **vague creative intentions to increasingly specific design decisions**.

The system combines three core features:

1. AI-assisted idea exploration.
2. Community-based design inspiration.
3. Object-linked visual refinement.

It also provides optional prompt assistance and maintains the user's creative preferences throughout the workflow.

The emphasis is on interaction design, user control and intelligent system behaviour rather than developing a production-ready image-generation platform.

## 2. Existing development environment

I have already:

- Created a GitHub repository named `Intelligent-Interactive-System-Assignment-2`.
- Connected the repository to VS Code.
- Created `README.md` and `DEVELOPMENT_LOG.md` in the repository root.
- Created a React + Vite application inside the `app` folder.
- Installed dependencies and selected ESLint.
- Successfully launched the Vite development server.
- Opened the application in Google Chrome.

My project structure is:

```
Intelligent-Interactive-System-Assignment-2/
├── README.md
├── DEVELOPMENT_LOG.md
└── app/
    ├── public/
    ├── src/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── eslint.config.js
```

**Do not initialise another React or Vite application.**

We will modify the existing application.

### Technical requirements

- React + Vite
- JavaScript and CSS
- Desktop-first interface
- Lightweight, suitable for a laptop with 8 GB RAM
- Minimal additional dependencies
- Reusable React components
- Clear state management
- No backend or database required initially
- No paid AI APIs
- Simulated AI responses where necessary

Do not implement unnecessary technical complexity.

## 3. Complete application structure

Please use my hand-drawn sketches as the primary visual reference.

### Main navigation

Left sidebar:

- Intenta logo and application name
- New Project
- Home
- Running Tasks
- Projects
- Community
- Library
- Recent Projects
- User Account
- Settings

Not every navigation item needs to be functional in the prototype. Prioritise the features needed to demonstrate the main research idea.

### Top navigation

Project tabs allowing users to access different projects.

### Main workspace

Two principal interaction modes:

**Idea Exploration:** Users communicate creative goals, explore possibilities and clarify their design intentions.

**Direct Object Refinement:** Users select individual objects within a design and communicate precise editing instructions.

Users should be able to switch between modes without losing previously recorded intentions.

The main prototype scenario will involve designing a business card.

## 4. Feature A — AI-assisted idea exploration

This is the first major interaction stage.

### A1. Initial design request

Users can enter a creative goal, such as:

"I want to design a business card for my small business. I want it to look professional but creative, although I'm not sure about the style yet."

Users should be able to communicate both specific requirements and vague preferences.

### A2. Optional prompt assistance

Include an optional toggle for AI-assisted prompt preparation.

When enabled, the system helps users clarify or improve their initial prompt before submission.

Users should be able to:

- View the original prompt.
- View the suggested improvement.
- Edit the suggested prompt.
- Accept or reject the suggestion.
- Submit their original prompt instead.

The AI should not silently change the user's intention.

If the user's intention is unclear, the system may offer clarification questions instead of assuming missing requirements.

### A3. AI-generated design recommendations

After submitting the prompt, users receive three distinct design concepts.

Each concept includes:

- A visual design preview.
- A short explanation of its style or characteristics.
- A selection option.

Users can select a preferred concept or indicate that they are not sure yet.

The system should allow users to identify specific aspects they like or dislike, such as:

- Colour palette
- Typography
- Layout
- Design style

These preferences should inform subsequent recommendations.

### A4. Iterative exploration

Users may continue requesting recommendations.

The system should use previously expressed preferences rather than treating every request as an entirely new conversation.

If users repeatedly reject suggestions, the system can offer alternative exploration methods.

However, users should not be forced to complete a fixed number of iterations before accessing community inspiration.

## 5. Feature B — Community inspiration

This feature supports users who are uncertain about their preferred creative direction or want to explore ideas independently.

### B1. Accessing community inspiration

Users can access the community directly through the sidebar.

The AI may also suggest exploring community inspiration when the user is struggling to identify a preferred design direction.

The user should remain in control of whether to follow this suggestion.

### B2. Community gallery

Display a simulated gallery of visual designs contributed by fictional community users.

Users can:

- Browse design examples.
- View details of a selected design.
- Choose a design as inspiration.
- Click "Use as Inspiration".
- Select which existing project they want to continue.

Do not build real community accounts, uploads or publishing functionality.

### B3. Returning to the project

After selecting inspiration, users return to their existing design conversation.

The system should:

1. Summarise the user's previously expressed intentions.
2. Allow users to review and modify them.
3. Display the selected inspiration reference.
4. Ask which characteristics the user wants to incorporate.
5. Present several selectable design attributes.
6. Allow multiple selections.
7. Transfer the confirmed preferences into the current design context.

The system should not simply copy the reference design.

Instead, it should help users identify design characteristics they want to explore.

### B4. Updated concept

After receiving the user's confirmation, the system presents an updated design concept reflecting the selected inspiration attributes and earlier preferences.

The user can continue exploring or move to refinement.

## 6. Feature C — Direct object-linked refinement

This feature supports users who already have clearer design intentions and want to communicate precise changes.

### C1. Design canvas

Users can view a generated business-card design on a canvas.

The canvas should contain individually selectable design elements, such as:

- Background
- Logo
- Text
- Decorative shapes

### C2. Visual object markers

Users can activate a pointer or object-selection tool.

When they select a design element:

1. The selected element becomes visually highlighted.
2. A numbered marker or reference appears on the canvas.
3. A corresponding reference tag appears in the prompt input area.

For example:

The user selects a decorative shape.

The system creates the reference `[Object 1]`.

The user then types:

"Change [Object 1] to blue."

This allows the user to identify what they want changed without describing its position in the image.

### C3. Targeted editing

After submission, the system demonstrates the requested edit.

The user should be able to:

- Review the proposed change.
- Accept or reject it.
- Continue refining.
- Undo accepted changes where feasible.

Use simulated editing and predefined selectable objects.

Do not attempt complex AI object detection, image segmentation or real generative image editing.

## 7. Shared creative intention management

The system should preserve user intentions across the different interaction stages.

For example:

A user may have selected:

- Professional appearance
- Muted green colour palette
- Elegant serif typography

These preferences should remain available when the user:

- Requests additional design concepts.
- Explores community inspiration.
- Returns to their project.
- Switches to targeted refinement.

Users should be able to review, remove or modify preferences.

The system should never silently discard earlier choices.

## 8. Complete user journey

The application should eventually demonstrate the following scenario:

1. User creates a business-card design project.
2. User enters a vague creative idea.
3. User optionally receives prompt assistance.
4. AI presents three different concepts.
5. User provides preference feedback.
6. User remains uncertain.
7. AI suggests community inspiration.
8. User explores the community gallery.
9. User selects a design as inspiration.
10. User returns to the original project.
11. System summarises previous intentions.
12. User selects characteristics from the reference.
13. System presents an updated concept.
14. User switches to direct object refinement.
15. User selects an object on the design.
16. System creates a reference marker.
17. User enters a targeted editing instruction.
18. System demonstrates the change.
19. User accepts or rejects the result.

The community route is optional, and users should be able to return to earlier exploration stages.

## 9. Interaction design priorities

The interface should emphasise:

- User control and sense of agency.
- Clear system feedback.
- Visibility of selected preferences.
- Reduced ambiguity in user instructions.
- Reversible decisions.
- Continuity across interaction methods.
- Clear distinction between exploration and refinement.
- Accessible controls.
- Consistent navigation.

Relevant module concepts include the gulf of execution, gulf of evaluation, feedback and user agency.

## 10. Development phases

We will implement Intenta in five phases.

### Phase 1 — Application foundation

Build:

- Intenta application branding.
- Sidebar and navigation.
- Project tabs.
- Main workspace.
- Initial prompt input.
- Prompt-assistance toggle.
- Explore Ideas / Refine Design mode controls.
- Basic responsive styling.

The interface should resemble the first uploaded sketch.

### Phase 2 — AI-assisted idea exploration

Implement:

- Simulated prompt assistance.
- Three visual design recommendations.
- Design selection.
- Preference feedback.
- Iterative recommendations.
- Shared intention summary.

### Phase 3 — Community inspiration

Implement:

- Simulated community gallery.
- Design-detail viewing.
- "Use as Inspiration" interaction.
- Return to a selected project.
- Existing intention confirmation.
- Inspiration attribute selection.
- Preference transfer.
- Updated design preview.

### Phase 4 — Object-linked refinement

Implement:

- Design canvas.
- Selectable visual elements.
- Object markers.
- Prompt reference tags.
- Simulated targeted editing.
- Accept/reject controls.
- Basic undo functionality.

### Phase 5 — Testing and documentation

Complete:

- End-to-end interaction testing.
- UI improvements.
- Bug fixes.
- Accessibility checks.
- Development documentation.
- Screenshots demonstrating the prototype.

## 11. Important implementation rules

Although I have explained all five phases, **DO NOT implement the entire application at once**.

Implement one phase at a time.

The reason for providing the complete specification is to ensure that architectural and design decisions in earlier phases are compatible with later functionality.

Before modifying code, understand the current project structure.

When implementing a phase:

1. Explain what will be built.
2. Identify files that need to change.
3. Provide complete code for each file, with the exact file path.
4. Guide me through copying the code into VS Code.
5. Explain how to run and test the implementation.
6. Help me debug errors.
7. Preserve existing working functionality.
8. Recommend documentation and Git commits after testing.

Do not claim a feature is implemented if it is only simulated.

Do not automatically change my existing design without explaining the reason.

If you believe an interaction could be improved, explain the problem and proposed alternative before making significant changes.

## 12. GitHub and development evidence

My university assignment requires evidence of development decisions and AI assistance.

I have an existing `DEVELOPMENT_LOG.md` file in the repository root.

After each meaningful implementation stage, help me document:

- What was implemented.
- Why certain technical or interaction decisions were made.
- How ChatGPT contributed.
- What I changed or approved.
- How the feature was tested.
- Known limitations.
- Suggested Git commit messages.

Do not overwrite my development log.

Do not invent test results or claim that code has been executed unless it actually has.

## 13. Current task — Phase 1 ONLY

We are now ready to implement **Phase 1: Application Foundation**.

Please first review my seven uploaded sketches and the complete specification above.

Then explain your proposed React component structure briefly.

After that, help me replace the default Vite starter interface with the initial Intenta application.

The Phase 1 implementation should include:

- Intenta branding.
- Sidebar navigation.
- Project-tab interface.
- Main creative prompt input.
- Optional prompt-assistance toggle.
- Explore Ideas and Refine Design mode controls.
- Placeholder areas for later features.

Please provide the exact file paths and complete code needed for Phase 1.

Do not implement Phase 2, Phase 3 or Phase 4 yet.

I want to review and test the interface before proceeding.

**Begin with Phase 1.**
