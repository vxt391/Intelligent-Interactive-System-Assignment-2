import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import CommunityGallery, { createCommunityState } from './components/CommunityGallery';
import { COMMUNITY_PROJECTS } from './data/communityProjects';
import { getInspirationAttributes } from './data/inspirationAttributes';
import { applyInspirationTransfer, makeTransferOptions, validateTransfer } from './utils/inspirationTransfer';
import { createCommunitySuggestionTracker, resetCommunityObservation, trackProjectCommunityInteraction } from './utils/communitySuggestionRules';
import ProjectTabs from './components/ProjectTabs';
import ModeSwitcher from './components/ModeSwitcher';
import PromptComposer from './components/PromptComposer';
import FeaturePlaceholder from './components/FeaturePlaceholder';
import ConversationView from './components/ConversationView';
import IntentionPanel from './components/IntentionPanel';
import PromptAssistancePanel from './components/PromptAssistancePanel';
import { suggestImprovedPrompt } from './utils/promptAssistance';
import { buildInitialRecommendations, buildNewDirectionRecommendations, getBriefPreferenceConflicts, isBusinessCardRequest } from './utils/recommendations';
import { buildVariationRecommendations, getVariationConflicts, VARIATION_DIMENSIONS } from './utils/variations';
import { mergeConfirmedPreferences, createPreferenceEdit, getPreferenceEditChanges, applyPreferenceEdits } from './utils/preferenceManagement';
import { getDesignConcept, approveDesignProject } from './utils/designApproval';
import { createActiveBrief, makeFollowUpReview, applyFollowUpReview } from './utils/followUpBrief';
import BriefUpdateDialog from './components/BriefUpdateDialog';
import NewDirectionConflictDialog from './components/NewDirectionConflictDialog';
import './App.css';
import './Phase2.css';
import './Phase3.css';

function createProject(id) {
  return {
    id,
    name: `Project ${id}`,
    mode: 'explore',
    prompt: '',
    assistance: false,
    promptReview: null, // Only exists while the user reviews a suggested prompt.
    feedbackDrafts: {}, // Each recommendation round owns an independent unfinished draft.
    activeBrief: null, // Actual submitted wording + separately confirmed structured revisions.
    briefReview: null, // Proposed follow-up revisions; no changes until approval.
    directionRequest: null, // One-round new-direction conflict resolution only.
    preferenceEdit: null, // Unsaved edits to already confirmed preferences, scoped to this project.
    inspirationReferences: [], // Confirmed Community artwork snapshots, separate from preferences.
    variationRequest: null, // Milestone 5.2: project-scoped modal decisions, never saved as preferences.
    approvalRequest: null, // Milestone 5.3: concept awaiting explicit final approval.
    approvedDesign: null, // Last explicitly approved concept, preserved while exploring.
    explorationComplete: false, // Completion is reversible, without clearing approval.
    messages: [],
    nextMessageId: 1,
    intentions: {
      initialBrief: '',
      preferences: [], // Only explicit confirmation writes to this list.
    },
    exploration: {
      strategy: 'new-directions',
      selectedConceptId: null,
      selectedConceptMessageId: null,
      round: 0,
      uncertaintyStreak: 0,
      communitySuggestionDismissed: false,
      // Phase 3.4.1: project-scoped, internal detection. Inline UI arrives in 3.4.2.
      communitySuggestionTracker: createCommunitySuggestionTracker(),
    },
    ui: { intentionsOpen: false, projectInspirationExpanded: false },
  };
}

function App() {
  const [projects, setProjects] = useState([createProject(1)]);
  const [activeId, setActiveId] = useState(1);
  // Navigation is global: Community is available even without a selected project.
  const [activeWorkspace, setActiveWorkspace] = useState('design');
  // Community browsing and explicitly saved inspiration persist when the workspace unmounts.
  // These are global session-only states, deliberately separate from any design project.
  const [communityState, setCommunityState] = useState(createCommunityState);
  const communityScrollRef = useRef(null);
  const nextProjectId = useRef(2);

  const activeProject = projects.find((project) => project.id === activeId);

  // Phase 3.4.1 diagnostic only: inspect detection in Chrome without rendering
  // a suggestion early. Available in Vite development builds, not production.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__intentaCommunitySignals = () => projects.map((project) => {
      const state = project.exploration.communitySuggestionTracker;
      return {
        projectId: project.id,
        recent: state.recent.map(({ action, signal }) => ({ action, signal })),
        observedSinceSuggestion: state.observedSinceSuggestion,
        suggestedCount: state.suggestedCount,
        pending: state.pending,
      };
    });
    return () => { delete window.__intentaCommunitySignals; };
  }, [projects]);

  function updateProject(changes) {
    setProjects((current) =>
      current.map((project) =>
        project.id === activeId ? { ...project, ...changes } : project
      )
    );
  }

  function newProject() {
    const id = nextProjectId.current++;
    setProjects((current) => [...current, createProject(id)]);
    setActiveId(id);
    setActiveWorkspace('design');
  }

  function selectProject(id) {
    setActiveId(id);
    setActiveWorkspace('design');
  }

  // Phase 3.3.1: creating a destination from Community must not navigate away,
  // select the new project automatically, or modify another project's intentions.
  // The user must still explicitly choose the destination in the picker.
  function createProjectForCommunity() {
    const id = nextProjectId.current++;
    setProjects((current) => [...current, createProject(id)]);
  }

  // Phase 3.3.2: only final confirmation writes to the selected project. The
  // original Community collection and other projects are not mutated.
  function confirmInspirationTransfer(request) {
    const artwork = COMMUNITY_PROJECTS.find((item) => item.id === request.artworkId);
    const target = projects.find((item) => item.id === request.targetProjectId);
    const savedIds = communityState.saved[request.artworkId] || [];
    const savedAttributes = artwork
      ? getInspirationAttributes(artwork.id).filter((item) => savedIds.includes(item.id)) : [];

    if (!artwork || !target || !savedAttributes.length) {
      setCommunityState((current) => ({ ...current, transferRequest: current.transferRequest
        ? { ...current.transferRequest, error: 'The artwork, saved attributes or selected project is no longer available.' } : null }));
      return;
    }
    const options = makeTransferOptions(artwork.id, savedAttributes);
    const validation = validateTransfer({
      options, selectedIds: request.selectedIds, resolutions: request.resolutions,
      referenceOnly: request.referenceOnly === true,
      projectPreferences: target.intentions.preferences,
    });
    if (validation.needsChoice || validation.mixedChoice) {
      setCommunityState((current) => ({ ...current, transferRequest: current.transferRequest
        ? { ...current.transferRequest, error: 'Select a supported attribute or explicitly choose a reference-only connection.' } : null }));
      return;
    }
    if (validation.unresolved.length) {
      setCommunityState((current) => ({ ...current, transferRequest: current.transferRequest
        ? { ...current.transferRequest, error: 'Choose how to resolve every selected Avoid conflict.' } : null }));
      return;
    }
    const transfer = applyInspirationTransfer(target, {
      artwork, savedAttributes, selectedIds: request.selectedIds, resolutions: request.resolutions,
      referenceOnly: request.referenceOnly === true,
    });
    if (transfer.error) {
      setCommunityState((current) => ({ ...current, transferRequest: current.transferRequest
        ? { ...current.transferRequest, error: transfer.error } : null }));
      return;
    }
    setProjects((current) => current.map((project) => project.id === target.id
      ? applyInspirationTransfer(project, {
          artwork, savedAttributes, selectedIds: request.selectedIds, resolutions: request.resolutions,
          referenceOnly: request.referenceOnly === true,
        }).project
      : project));
    setCommunityState((current) => ({
      ...current,
      transferRequest: null,
      connectionNotice: {
        projectId: target.id, projectName: target.name,
        artworkTitle: artwork.title, changesCount: transfer.summary.changes.length,
        referenceOnly: validation.validSelected.length === 0,
      },
    }));
    // Community remains open. View Project is always an optional action.
  }

  function viewConnectedProject(id) {
    if (!projects.some((item) => item.id === id)) return;
    setActiveId(id);
    setActiveWorkspace('design');
    setCommunityState((current) => ({ ...current, connectionNotice: null }));
    setProjects((current) => current.map((project) => project.id === id
      ? { ...project, mode: 'explore', ui: { ...project.ui, intentionsOpen: true, projectInspirationExpanded: true } } : project));
  }

  function closeProject(id) {
    const remaining = projects.filter((project) => project.id !== id);
    setProjects(remaining);
    if (activeId === id) {
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  function submitPrompt(text, originalText = text, submission = 'without-assistance') {
    const submitted = text.trim();
    const original = originalText.trim();
    if (!submitted || !original) return;

    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.briefReview) return project;
      const firstMessage = !project.messages.some((message) => message.role === 'user');
      const hasRecommendations = project.messages.some((message) => message.role === 'recommendations');
      const userMessage = {
        id: project.nextMessageId, role: 'user', text: submitted,
        promptMeta: { original, submission },
      };
      const additions = [userMessage];
      let newExploration = project.exploration;
      let newReview = null;
      let activeBrief = project.activeBrief;
      if (!hasRecommendations && isBusinessCardRequest(submitted)) {
        // First recommendations use the ACTUALLY submitted wording, including
        // an edited assistance suggestion, never the preserved original text.
        activeBrief = createActiveBrief(submitted);
        const result = buildInitialRecommendations(submitted, activeBrief);
        if (result.blockedReason) {
          additions.push({ id: project.nextMessageId + 1, role: 'prototype',
            text: `I could not create the initial designs: ${result.blockedReason}. Please revise your prompt.` });
        } else {
          additions.push({ id: project.nextMessageId + 1, role: 'recommendations',
            ...result, round: 1, source: 'initial', briefForRecommendations: submitted });
          newExploration = { ...project.exploration, round: 1,
            selectedConceptId: null, selectedConceptMessageId: null };
        }
      } else if (hasRecommendations) {
        newReview = makeFollowUpReview(submitted, project.intentions.preferences);
        if (!newReview.proposals.length) {
          additions.push({ id: project.nextMessageId + 1, role: 'prototype',
            text: `Your message is recorded, but no supported design change was confidently identified. ${newReview.unsupported.join(' ')} The Active Design Brief and recommendations remain unchanged. Try a specific colour, typography, layout or decoration instruction.` });
          newReview = null;
        }
      } else {
        additions.push({ id: project.nextMessageId + 1, role: 'prototype',
          text: 'This prototype illustrates business-card designs. Submit a business-card request to receive concepts.' });
      }
      const next = {
        ...project,
        prompt: '', promptReview: null,
        activeBrief,
        briefReview: newReview,
        messages: [...project.messages, ...additions],
        nextMessageId: project.nextMessageId + additions.length,
        exploration: newExploration,
        intentions: { ...project.intentions,
          initialBrief: project.intentions.initialBrief || (firstMessage ? original : ''),
        },
      };
      // A submitted business-card brief or a follow-up after recommendations is
      // one relevant interaction, including wording that the brief parser cannot apply.
      // Non-business-card messages before any recommendations are not tracked.
      return hasRecommendations || (!hasRecommendations && isBusinessCardRequest(submitted) &&
        additions.some((item) => item.role === 'recommendations'))
        ? trackProjectCommunityInteraction(next, {
            eventKey: `message:${userMessage.id}`, action: 'message', text: submitted,
          })
        : next;
    }));
  }

  function toggleBriefProposal(proposalId) {
    setProjects((current) => current.map((project) =>
      project.id !== activeId || !project.briefReview ? project : {
        ...project,
        briefReview: { ...project.briefReview, proposals: project.briefReview.proposals.map((item) =>
          item.id === proposalId ? { ...item, enabled: !item.enabled } : item) },
      }
    ));
  }

  function resolveBriefProposal(proposalId, resolution) {
    if (resolution !== 'remove-avoid') return;
    setProjects((current) => current.map((project) =>
      project.id !== activeId || !project.briefReview ? project : {
        ...project,
        briefReview: { ...project.briefReview, proposals: project.briefReview.proposals.map((item) =>
          item.id === proposalId ? { ...item, resolution } : item) },
      }
    ));
  }

  function confirmBriefUpdates() {
    setProjects((current) => current.map((project) =>
      project.id === activeId ? applyFollowUpReview(project) : project
    ));
  }

  function cancelBriefUpdates() {
    setProjects((current) => current.map((project) =>
      project.id !== activeId || !project.briefReview ? project : {
        ...project, briefReview: null,
        messages: [...project.messages, { id: project.nextMessageId, role: 'prototype',
          text: 'No changes were applied to the Active Design Brief.' }],
        nextMessageId: project.nextMessageId + 1,
      }
    ));
  }

  function selectConcept(conceptId, recommendationMessageId) {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== activeId) return project;
        const recommendation = project.messages.find(
          (message) => message.id === recommendationMessageId && message.role === 'recommendations'
        );
        if (!recommendation?.concepts.some((concept) => concept.id === conceptId)) return project;
        return {
          ...project,
          exploration: {
            ...project.exploration,
            selectedConceptId:
              project.exploration.selectedConceptId === conceptId &&
              project.exploration.selectedConceptMessageId === recommendationMessageId
                ? null : conceptId,
            selectedConceptMessageId:
              project.exploration.selectedConceptId === conceptId &&
              project.exploration.selectedConceptMessageId === recommendationMessageId
                ? null : recommendationMessageId,
          },
        };
      })
    );
  }

  // Each recommendation round has its own draft. Switching rounds must never
  // replace or silently confirm feedback still unfinished in an earlier round.
  function toggleDraftAttribute(recommendationMessageId, conceptId, attribute) {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId) return project;
      const recommendation = project.messages.find((message) =>
        message.id === recommendationMessageId && message.role === 'recommendations'
      );
      const sourceConcept = recommendation?.concepts.find((concept) => concept.id === conceptId);
      if (!sourceConcept) return project;

      const previous = project.feedbackDrafts[recommendationMessageId]?.items ?? [];
      const alreadySelected = previous.some((item) => item.id === attribute.id);
      const items = alreadySelected
        ? previous.filter((item) => item.id !== attribute.id)
        : [...previous, {
            ...attribute,
            sourceConceptId: conceptId,
            sourceConceptLabel: sourceConcept.name,
            sentiment: null,
          }];

      return {
        ...project,
        feedbackDrafts: {
          ...project.feedbackDrafts,
          [recommendationMessageId]: { items },
        },
      };
    }));
  }

  function rateDraftAttribute(recommendationMessageId, attributeId, sentiment) {
    if (!['like', 'avoid', 'unsure'].includes(sentiment)) return;
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId) return project;
      const draft = project.feedbackDrafts[recommendationMessageId];
      if (!draft) return project;
      return {
        ...project,
        feedbackDrafts: {
          ...project.feedbackDrafts,
          [recommendationMessageId]: {
            items: draft.items.map((item) =>
              item.id === attributeId ? { ...item, sentiment } : item
            ),
          },
        },
      };
    }));
  }

  function removeDraftAttribute(recommendationMessageId, attributeId) {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId) return project;
      const draft = project.feedbackDrafts[recommendationMessageId];
      if (!draft) return project;
      return {
        ...project,
        feedbackDrafts: {
          ...project.feedbackDrafts,
          [recommendationMessageId]: {
            items: draft.items.filter((item) => item.id !== attributeId),
          },
        },
      };
    }));
  }

  // Confirm only explicitly rated attributes from the specific source round.
  // Unrated choices and other rounds' drafts remain untouched.
  function confirmDraftPreferences(recommendationMessageId) {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId) return project;
      const draft = project.feedbackDrafts[recommendationMessageId];
      if (!draft) return project;
      const rated = draft.items.filter((item) => ['like', 'avoid', 'unsure'].includes(item.sentiment));
      if (!rated.length) return project;

      const { preferences, changes } = mergeConfirmedPreferences(
        project.intentions.preferences, rated
      );
      const next = {
        ...project,
        intentions: { ...project.intentions, preferences },
        feedbackDrafts: {
          ...project.feedbackDrafts,
          [recommendationMessageId]: {
            items: draft.items.filter((item) => item.sentiment === null),
          },
        },
        messages: [...project.messages, {
          id: project.nextMessageId,
          role: 'preferences-confirmed',
          changes,
        }],
        nextMessageId: project.nextMessageId + 1,
      };
      // Individual Like/Avoid/Not Sure chips are ordinary feedback, never broad rejection.
      return trackProjectCommunityInteraction(next, {
        eventKey: `feedback:${project.nextMessageId}`,
        action: 'feedback',
      });
    }));
  }

  // Continuity: new directions now use the current ACTIVE brief. Conflicts with
  // saved Avoids require a per-round user choice, not a hidden override.
  function generateNewDirections(project, resolution = null, conflicts = []) {
    const previousRounds = project.messages.filter((message) => message.role === 'recommendations');
    if (!previousRounds.length) return project;
    const nextRound = project.exploration.round + 1;
    const dimensions = [...new Set(conflicts.map((item) => item.dimension))];
    const roundOverrides = resolution === 'respect-brief' ? {
      ignoreAvoidPreferenceIds: conflicts.map((item) => item.preferenceId).filter(Boolean),
      ignoreBriefAvoidDimensions: conflicts.filter((item) => item.kind === 'brief-self').map((item) => item.dimension),
    } : resolution === 'respect-preferences' ? {
      ignoreRequiredDimensions: dimensions,
    } : {};
    const outcome = buildNewDirectionRecommendations({
      originalBrief: project.activeBrief?.submittedText || previousRounds[0].briefForRecommendations || project.intentions.initialBrief,
      activeBrief: project.activeBrief,
      preferences: project.intentions.preferences,
      round: nextRound,
      roundOverrides,
      previousConcepts: previousRounds.flatMap((message) => message.concepts),
    });
    const requested = {
      id: project.nextMessageId, role: 'user', text: 'Explore new directions',
      action: 'new-directions',
    };
    if (outcome.blockedReason) return {
      ...project, directionRequest: null,
      messages: [...project.messages, requested, {
        id: project.nextMessageId + 1, role: 'prototype',
        text: `I could not generate another round: ${outcome.blockedReason}. No previous design was changed.`,
      }],
      nextMessageId: project.nextMessageId + 2,
    };
    const exceptionNote = resolution
      ? resolution === 'respect-brief'
        ? ' For this round, you chose to prioritise the active brief over overlapping Avoid preferences.'
        : ' For this round, you chose to prioritise confirmed Avoid preferences over overlapping brief requirements.'
      : '';
    const next = {
      ...project, directionRequest: null,
      messages: [...project.messages, requested, {
        id: project.nextMessageId + 1, role: 'recommendations',
        ...outcome, explanation: `${outcome.explanation}${exceptionNote}`,
      }],
      nextMessageId: project.nextMessageId + 2,
      exploration: { ...project.exploration, round: nextRound, strategy: 'new-directions' },
    };
    return trackProjectCommunityInteraction(next, {
      eventKey: `new-directions:${requested.id}`, action: 'new-directions',
    });
  }

  function exploreNewDirections() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.directionRequest || project.briefReview) return project;
      const conflicts = getBriefPreferenceConflicts({
        originalBrief: project.activeBrief?.submittedText || project.intentions.initialBrief,
        activeBrief: project.activeBrief, preferences: project.intentions.preferences,
      });
      if (conflicts.length) return { ...project, directionRequest: { conflicts } };
      return generateNewDirections(project);
    }));
  }

  function resolveNewDirectionConflict(resolution) {
    if (!['respect-brief', 'respect-preferences'].includes(resolution)) return;
    setProjects((current) => current.map((project) =>
      project.id !== activeId || !project.directionRequest ? project
        : generateNewDirections(project, resolution, project.directionRequest.conflicts)
    ));
  }

  function cancelNewDirectionConflict() {
    setProjects((current) => current.map((project) =>
      project.id === activeId ? { ...project, directionRequest: null } : project
    ));
  }


  // Milestone 5.2: locate an exact concept in any historical recommendation round.
  // Don't infer a reference from the displayed A/B/C label: those repeat each round.
  function findVariationReference(project, messageId, conceptId) {
    const message = project.messages.find((item) =>
      item.role === 'recommendations' && item.id === messageId
    );
    const concept = message?.concepts.find((item) => item.id === conceptId);
    return concept ? { message, concept } : null;
  }

  function unfinishedFeedbackCount(project) {
    return Object.values(project.feedbackDrafts).reduce(
      (sum, draft) => sum + (draft?.items?.length || 0), 0
    );
  }

  function startVariations() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.variationRequest) return project;
      const { selectedConceptId, selectedConceptMessageId } = project.exploration;
      const found = findVariationReference(project, selectedConceptMessageId, selectedConceptId);
      if (!found) return project;
      return {
        ...project,
        variationRequest: {
          conceptId: selectedConceptId,
          messageId: selectedConceptMessageId,
          dimensions: [], stage: 'configure', conflicts: [], conflictResolution: null, error: null,
        },
      };
    }));
  }

  function toggleVariationDimension(dimension) {
    if (!VARIATION_DIMENSIONS.some((item) => item.id === dimension)) return;
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.variationRequest?.stage !== 'configure') return project;
      const req = project.variationRequest;
      return {
        ...project,
        variationRequest: {
          ...req,
          dimensions: req.dimensions.includes(dimension)
            ? req.dimensions.filter((item) => item !== dimension)
            : [...req.dimensions, dimension],
        },
      };
    }));
  }

  function closeVariationRequest() {
    setProjects((current) => current.map((project) =>
      project.id === activeId ? { ...project, variationRequest: null } : project
    ));
  }

  function generateVariationRound(project, request) {
    const found = findVariationReference(project, request.messageId, request.conceptId);
    if (!found) return {
      ...project,
      variationRequest: { ...request, stage: 'error', error: 'The selected reference is no longer available.' },
    };
    const rounds = project.messages.filter((item) => item.role === 'recommendations');
    const nextRound = project.exploration.round + 1;
    const outcome = buildVariationRecommendations({
      reference: found.concept,
      originalBrief: project.activeBrief?.submittedText || rounds[0]?.briefForRecommendations || project.intentions.initialBrief,
      activeBrief: project.activeBrief,
      preferences: project.intentions.preferences,
      selectedDimensions: request.dimensions,
      round: nextRound,
      referenceRound: found.message.round || 1,
      referenceMessageId: found.message.id,
      conflictResolution: request.conflictResolution,
      previousConcepts: rounds.flatMap((item) => item.concepts),
    });
    if (outcome.blockedReason) return {
      ...project,
      variationRequest: { ...request, stage: 'error', error: outcome.blockedReason },
    };
    const selectedText = request.dimensions.length ? request.dimensions.join(', ') : 'general variations';
    const next = {
      ...project,
      variationRequest: null,
      messages: [...project.messages, {
        id: project.nextMessageId,
        role: 'user',
        text: `Explore variations of Round ${found.message.round || 1} · ${found.concept.name} (${selectedText})`,
        action: 'variations',
      }, {
        id: project.nextMessageId + 1,
        role: 'recommendations',
        ...outcome,
      }],
      nextMessageId: project.nextMessageId + 2,
      exploration: {
        ...project.exploration,
        round: nextRound,
        strategy: 'variations',
        // Keep the provisional reference selection in its original round.
      },
    };
    return trackProjectCommunityInteraction(next, {
      eventKey: `variations:${project.nextMessageId}`, action: 'variations',
    });
  }

  function prepareVariations() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.variationRequest?.stage !== 'configure') return project;
      const req = project.variationRequest;
      const found = findVariationReference(project, req.messageId, req.conceptId);
      if (!found) return { ...project, variationRequest: { ...req, stage: 'error', error: 'The reference concept is unavailable.' } };
      const rounds = project.messages.filter((item) => item.role === 'recommendations');
      const check = getVariationConflicts({
        reference: found.concept,
        originalBrief: project.activeBrief?.submittedText || rounds[0]?.briefForRecommendations || project.intentions.initialBrief,
        activeBrief: project.activeBrief,
        preferences: project.intentions.preferences,
      });
      if (check.blockedReason) return {
        ...project, variationRequest: { ...req, stage: 'error', error: check.blockedReason },
      };
      if (check.conflicts.length) return {
        ...project, variationRequest: { ...req, stage: 'conflicts', conflicts: check.conflicts },
      };
      if (unfinishedFeedbackCount(project)) return {
        ...project, variationRequest: { ...req, stage: 'feedback' },
      };
      return generateVariationRound(project, req);
    }));
  }

  function resolveVariationConflict(choice) {
    if (!['respect', 'keep-reference'].includes(choice)) return;
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.variationRequest?.stage !== 'conflicts') return project;
      const req = { ...project.variationRequest, conflictResolution: choice };
      if (unfinishedFeedbackCount(project)) return {
        ...project, variationRequest: { ...req, stage: 'feedback' },
      };
      return generateVariationRound(project, req);
    }));
  }

  function continueVariationsWithoutFeedback() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.variationRequest?.stage !== 'feedback') return project;
      return generateVariationRound(project, project.variationRequest);
    }));
  }


  // Milestone 5.3: provisional selection never approves a concept. The review
  // request is scoped to the current project and to an exact historic round.
  function startDesignApproval() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.explorationComplete || project.approvalRequest) return project;
      const { selectedConceptId: conceptId, selectedConceptMessageId: messageId } = project.exploration;
      if (!getDesignConcept(project.messages, messageId, conceptId)) return project;
      return { ...project, approvalRequest: { messageId, conceptId } };
    }));
  }

  function cancelDesignApproval() {
    setProjects((current) => current.map((project) =>
      project.id === activeId ? { ...project, approvalRequest: null } : project
    ));
  }

  function confirmDesignApproval() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId) return project;
      const approved = approveDesignProject(project);
      return approved.explorationComplete
        ? { ...approved, exploration: {
            ...approved.exploration,
            communitySuggestionTracker: resetCommunityObservation(approved.exploration.communitySuggestionTracker),
          } }
        : approved;
    }));
  }

  function resumeExploration() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || !project.explorationComplete) return project;
      return {
        ...project,
        explorationComplete: false,
        messages: [...project.messages, {
          id: project.nextMessageId,
          role: 'user',
          action: 'resume-exploration',
          text: 'Return to exploration',
        }],
        nextMessageId: project.nextMessageId + 1,
      };
    }));
  }

  // Milestone 4.3: begin a separate editing transaction. Nothing confirmed changes yet.
  function beginPreferenceEdit() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || project.preferenceEdit || project.intentions.preferences.length === 0) {
        return project;
      }
      return {
        ...project,
        preferenceEdit: createPreferenceEdit(project.intentions.preferences),
        ui: { ...project.ui, intentionsOpen: true },
      };
    }));
  }

  function changePreferenceEdit(attributeId, sentiment) {
    if (!['like', 'avoid', 'unsure'].includes(sentiment)) return;
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || !project.preferenceEdit) return project;
      return {
        ...project,
        preferenceEdit: {
          ...project.preferenceEdit,
          items: project.preferenceEdit.items.map((item) =>
            item.id === attributeId ? { ...item, sentiment, removed: false } : item
          ),
        },
      };
    }));
  }

  function togglePreferenceRemoval(attributeId) {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || !project.preferenceEdit) return project;
      return {
        ...project,
        preferenceEdit: {
          ...project.preferenceEdit,
          items: project.preferenceEdit.items.map((item) =>
            item.id === attributeId ? { ...item, removed: !item.removed } : item
          ),
        },
      };
    }));
  }

  function cancelPreferenceEdit() {
    setProjects((current) => current.map((project) =>
      project.id === activeId ? { ...project, preferenceEdit: null } : project
    ));
  }

  function savePreferenceEdit() {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeId || !project.preferenceEdit) return project;
      const { preferences, changes } = applyPreferenceEdits(
        project.intentions.preferences,
        project.preferenceEdit
      );
      return {
        ...project,
        intentions: { ...project.intentions, preferences },
        preferenceEdit: null,
        // Save an immutable event in conversation history, without rewriting previous messages.
        messages: changes.length
          ? [...project.messages, {
              id: project.nextMessageId,
              role: 'preferences-edited',
              changes,
            }]
          : project.messages,
        nextMessageId: project.nextMessageId + (changes.length ? 1 : 0),
      };
    }));
  }

  function handleComposerSubmit() {
    if (!activeProject) return;
    const original = activeProject.prompt.trim();
    if (!original) return;

    if (activeProject.assistance) {
      // Don't overwrite an in-progress edit if Review is clicked again.
      if (activeProject.promptReview?.original === original) return;
      updateProject({
        promptReview: {
          original,
          suggested: suggestImprovedPrompt(original),
        },
      });
    } else {
      submitPrompt(original);
    }
  }

  function renderComposer(compact = false) {
    if (!activeProject) return null;
    const review = activeProject.promptReview;

    return (
      <div className={compact ? 'compact-composer' : ''}>
        <PromptComposer
          prompt={activeProject.prompt}
          assistance={activeProject.assistance}
          onPromptChange={(prompt) => updateProject({ prompt, promptReview: null })}
          onAssistanceChange={(assistance) =>
            updateProject({ assistance, promptReview: null })
          }
          onSubmit={handleComposerSubmit}
        />
        {review && (
          <PromptAssistancePanel
            original={review.original}
            suggested={review.suggested}
            onSuggestedChange={(suggested) =>
              updateProject({ promptReview: { ...review, suggested } })
            }
            onUseOriginal={() => submitPrompt(review.original, review.original, 'original')}
            onUseSuggested={() => submitPrompt(review.suggested, review.original, 'suggested')}
            onBack={() => updateProject({ promptReview: null })}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        activeId={activeId}
        onNewProject={newProject}
        onSelectProject={selectProject}
        onHome={() => { setActiveWorkspace('design'); updateProject({ mode: 'explore' }); }}
        onCommunity={() => setActiveWorkspace('community')}
        communityActive={activeWorkspace === 'community'}
      />

      <div className="main-area">
        {activeWorkspace === 'design' && <ProjectTabs
          projects={projects}
          activeId={activeId}
          onSelect={selectProject}
          onClose={closeProject}
          onNew={newProject}
        />}

        {activeWorkspace === 'community' ? (
          <main className="workspace phase3-workspace" ref={communityScrollRef}>
            <CommunityGallery
              state={communityState}
              onChange={setCommunityState}
              scrollContainerRef={communityScrollRef}
              projectChoices={projects.map(({ id, name, intentions }) => ({ id, name, intentions }))}
              onCreateProjectForInspiration={createProjectForCommunity}
              onConfirmInspirationTransfer={confirmInspirationTransfer}
              onViewConnectedProject={viewConnectedProject}
            />
          </main>
        ) : (
        <main className="workspace phase2-workspace">
          {activeProject ? (
            <>
              <div className="workspace-toolbar">
                <ModeSwitcher
                  mode={activeProject.mode}
                  onChange={(mode) => updateProject({ mode })}
                />
                <div className="phase2-toolbar-right">
                  <span className="workspace-status">
                    {activeProject.name} · {activeProject.explorationComplete
                      ? 'Exploration complete'
                      : activeProject.approvedDesign
                        ? 'Approved design · Exploring'
                        : 'Draft workspace'}
                  </span>
                  <button
                    type="button"
                    className="intentions-toggle"
                    aria-expanded={activeProject.ui.intentionsOpen}
                    aria-controls="current-intentions-panel"
                    onClick={() =>
                      updateProject({
                        ui: {
                          ...activeProject.ui,
                          intentionsOpen: !activeProject.ui.intentionsOpen,
                        },
                      })
                    }
                  >
                    Current Intentions ({activeProject.intentions.preferences.length})
                    <span aria-hidden="true">
                      {activeProject.ui.intentionsOpen ? ' ×' : ' ☰'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="phase2-content">
                <div className="phase2-primary">
                  {activeProject.mode === 'explore' ? (
                    activeProject.messages.length === 0 ? (
                      <section className="welcome-section">
                        <div className="eyebrow">YOUR CREATIVE SPACE</div>
                        <h1>What do you want to design today?</h1>
                        <p className="welcome-description">
                          Start with an idea, even if you're not sure about the details yet.
                        </p>
                        {renderComposer()}
                      </section>
                    ) : (
                      <ConversationView
                        key={activeProject.id}
                        messages={activeProject.messages}
                        composer={renderComposer(true)}
                        selectedConceptId={activeProject.exploration.selectedConceptId}
                        selectedConceptMessageId={activeProject.exploration.selectedConceptMessageId}
                        onSelectConcept={selectConcept}
                        feedbackDrafts={activeProject.feedbackDrafts}
                        onExploreNewDirections={exploreNewDirections}
                        onStartVariations={startVariations}
                        onToggleVariationDimension={toggleVariationDimension}
                        onPrepareVariations={prepareVariations}
                        onResolveVariationConflict={resolveVariationConflict}
                        onContinueVariationsWithoutFeedback={continueVariationsWithoutFeedback}
                        onCancelVariations={closeVariationRequest}
                        variationRequest={activeProject.variationRequest}
                        onToggleDraftAttribute={toggleDraftAttribute}
                        onRateDraftAttribute={rateDraftAttribute}
                        onRemoveDraftAttribute={removeDraftAttribute}
                        onConfirmDraftPreferences={confirmDraftPreferences}
                        approvedDesign={activeProject.approvedDesign}
                        approvalRequest={activeProject.approvalRequest}
                        explorationComplete={activeProject.explorationComplete}
                        onStartDesignApproval={startDesignApproval}
                        onCancelDesignApproval={cancelDesignApproval}
                        onConfirmDesignApproval={confirmDesignApproval}
                        onResumeExploration={resumeExploration}
                      />
                    )
                  ) : (
                    <FeaturePlaceholder
                      title="Direct Object Refinement"
                      description="This workspace will let you select design objects and request precise changes."
                      note="Interactive canvas and object markers arrive in Phase 4."
                    />
                  )}
                </div>

                {activeProject.ui.intentionsOpen && (
                  <IntentionPanel
                    intentions={activeProject.intentions}
                    activeBrief={activeProject.activeBrief}
                    inspirationReferences={activeProject.inspirationReferences || []}
                    inspirationExpanded={Boolean(activeProject.ui.projectInspirationExpanded)}
                    onToggleInspiration={() => updateProject({
                      ui: {
                        ...activeProject.ui,
                        projectInspirationExpanded: !activeProject.ui.projectInspirationExpanded,
                      },
                    })}
                    preferenceEdit={activeProject.preferenceEdit}
                    pendingChanges={activeProject.preferenceEdit
                      ? getPreferenceEditChanges(activeProject.preferenceEdit).length : 0}
                    onBeginEdit={beginPreferenceEdit}
                    onChangeEdit={changePreferenceEdit}
                    onToggleRemoval={togglePreferenceRemoval}
                    onSaveChanges={savePreferenceEdit}
                    onCancelEdit={cancelPreferenceEdit}
                    onClose={() =>
                      updateProject({
                        ui: { ...activeProject.ui, intentionsOpen: false },
                      })
                    }
                  />
                )}
              </div>
            </>
          ) : (
            <FeaturePlaceholder
              title="Your creative space is ready"
              description="Create a project to start exploring your design ideas."
              note="Select New Project in the sidebar."
            />
          )}
        </main>
        )}
      </div>
      {activeWorkspace === 'design' && activeProject?.briefReview && (
        <BriefUpdateDialog
          review={activeProject.briefReview}
          onToggle={toggleBriefProposal}
          onResolve={resolveBriefProposal}
          onApply={confirmBriefUpdates}
          onCancel={cancelBriefUpdates}
        />
      )}
      {activeWorkspace === 'design' && activeProject?.directionRequest && !activeProject.briefReview && (
        <NewDirectionConflictDialog
          conflicts={activeProject.directionRequest.conflicts}
          onResolve={resolveNewDirectionConflict}
          onCancel={cancelNewDirectionConflict}
        />
      )}
    </div>
  );
}

export default App;
