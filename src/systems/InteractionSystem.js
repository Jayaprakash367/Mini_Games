import { DIALOGUE_DATA } from '../data/DialogueData.js';

export class InteractionSystem {
    constructor(player, npcs, dialogueSystem, questSystem, inventorySystem, audioSystem) {
        this.player = player;
        this.npcs = npcs;
        this.dialogue = dialogueSystem;
        this.quests = questSystem;
        this.inventory = inventorySystem;
        this.audio = audioSystem;

        this.nearestNPC = null;
        this.interactionRadius = 3.5;
        this.promptVisible = false;
    }

    update(input) {
        if (this.dialogue.isActive) {
            // Handle dialogue input
            if (input.justPressed.e || input.justPressed.space) {
                this.dialogue.advance();
                this.audio.playClick();
            }
            if (input.justPressed.w) this.dialogue.selectChoice(-1);
            if (input.justPressed.s) this.dialogue.selectChoice(1);
            if (input.justPressed.escape) this.dialogue.endDialogue();
            return;
        }

        // Find nearest NPC
        const playerPos = this.player.mesh.position;
        let nearest = null;
        let nearestDist = Infinity;

        for (const npc of this.npcs) {
            const dist = npc.distanceTo(playerPos);
            if (dist < this.interactionRadius && dist < nearestDist) {
                nearest = npc;
                nearestDist = dist;
            }
        }

        // Update label visibility
        for (const npc of this.npcs) {
            if (npc === nearest) {
                npc.showLabel();
                npc.facePlayer(playerPos);
            } else {
                npc.hideLabel();
            }
        }

        this.nearestNPC = nearest;
        this.promptVisible = nearest !== null;

        // Show/hide interaction prompt
        const promptEl = document.getElementById('interaction-prompt');
        if (promptEl) {
            if (this.promptVisible) {
                promptEl.classList.remove('hidden');
                promptEl.textContent = `Press E to talk to ${nearest.name}`;
            } else {
                promptEl.classList.add('hidden');
            }
        }

        // Interact
        if (input.justPressed.e && nearest) {
            this.interactWithNPC(nearest);
        }
    }

    interactWithNPC(npc) {
        this.audio.playInteract();

        // Check if this NPC has an active quest delivery
        const activeQuest = this.quests.getQuestForNPC(npc.id);
        if (activeQuest) {
            const step = activeQuest.steps[activeQuest.currentStep];

            // If step requires an item, verify player has it
            if (step.requireItem && !this.inventory.hasItem(step.requireItem)) {
                // Player doesn't have the needed item — show a hint
                const hintDialogue = [
                    { speaker: npc.name, text: step.deliveryResponse || `Do you have something for me?` },
                    { speaker: 'You', text: `I don't have it yet. I'll come back.` }
                ];
                this.dialogue.startDialogue(npc, hintDialogue);
                return;
            }

            // Build delivery dialogue
            const deliveryDialogue = [
                { speaker: npc.name, text: step.deliveryResponse || `Ah, you have something for me!` },
                { speaker: 'You', text: step.playerLine || `Here's your delivery.` },
                { speaker: npc.name, text: step.thankLine || `Thank you, messenger! The city appreciates your work.` }
            ];

            // Remove item from inventory
            if (step.requireItem) {
                this.inventory.removeItem(step.requireItem);
            }

            this.dialogue.startDialogue(npc, deliveryDialogue);
            this.dialogue.onDialogueEnd = () => {
                this.quests.advanceQuest(activeQuest.id);
            };
            return;
        }

        // Check if this NPC has an available quest to give
        const availableQuest = this.quests.getAvailableQuestForNPC(npc.id);
        if (availableQuest) {
            const questDialogue = this.buildQuestDialogue(npc, availableQuest);
            this.dialogue.startDialogue(npc, questDialogue);
            return;
        }

        // Default dialogue
        const dialogueKey = npc.dialogueKey;
        const dialogueLines = DIALOGUE_DATA[dialogueKey] || DIALOGUE_DATA.default;
        this.dialogue.startDialogue(npc, dialogueLines);
    }

    buildQuestDialogue(npc, quest) {
        const lines = [
            { speaker: npc.name, text: quest.introText || `I need a favor, messenger.` },
            { speaker: npc.name, text: quest.descriptionText || quest.description },
            {
                text: 'Will you accept this task?',
                choices: [
                    {
                        text: 'Accept Quest',
                        action: () => {
                            this.quests.activateQuest(quest.id);
                        }
                    },
                    {
                        text: 'Maybe later',
                        action: () => { }
                    }
                ]
            }
        ];
        return lines;
    }
}
