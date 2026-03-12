export class QuestSystem {
    constructor(questData, inventorySystem) {
        this.quests = new Map();
        this.activeQuests = [];
        this.completedQuests = [];
        this.inventory = inventorySystem;
        this.notifications = [];    // { text, timer }
        this.questUpdateCallbacks = [];

        // Initialize quests from data
        for (const q of questData) {
            this.quests.set(q.id, {
                ...q,
                status: 'available',    // available | active | delivering | completed
                currentStep: 0
            });
        }
    }

    onQuestUpdate(callback) {
        this.questUpdateCallbacks.push(callback);
    }

    notify(text) {
        this.notifications.push({ text, timer: 4.0 });
    }

    activateQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest || quest.status !== 'available') return false;

        quest.status = 'active';
        quest.currentStep = 0;
        this.activeQuests.push(questId);
        this.notify(`New Quest: ${quest.title}`);

        // Only give the first step's item if the player picks it up from the quest giver directly
        // (single-step quests where giver hands the delivery item)
        if (quest.steps[0] && quest.steps[0].giveItem && quest.steps[0].giveOnAccept !== false) {
            // Only give if this step's NPC is different from the giver (pickup quests)
            // For multi-step quests, items are given by the intermediate NPC via advanceQuest
            if (quest.steps.length === 1) {
                this.inventory.addItem(quest.steps[0].giveItem);
            }
        }

        this.emitUpdate();
        return true;
    }

    advanceQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest || quest.status === 'completed') return false;

        quest.currentStep++;

        if (quest.currentStep >= quest.steps.length) {
            // Quest complete!
            quest.status = 'completed';
            this.activeQuests = this.activeQuests.filter(id => id !== questId);
            this.completedQuests.push(questId);
            this.notify(`Quest Completed: ${quest.title}!`);

            // Give reward
            if (quest.reward) {
                if (quest.reward.item) {
                    this.inventory.addItem(quest.reward.item);
                }
                this.notify(`Reward: ${quest.reward.description}`);
            }
        } else {
            const step = quest.steps[quest.currentStep];
            if (step.giveItem) {
                this.inventory.addItem(step.giveItem);
            }
            this.notify(step.description || 'Quest updated');
        }

        this.emitUpdate();
        return true;
    }

    getActiveQuests() {
        return this.activeQuests.map(id => this.quests.get(id)).filter(Boolean);
    }

    getQuestForNPC(npcId) {
        // Return quest that involves this NPC at the current step
        for (const questId of this.activeQuests) {
            const quest = this.quests.get(questId);
            if (!quest) continue;
            const currentStep = quest.steps[quest.currentStep];
            if (currentStep && currentStep.npcId === npcId) {
                return quest;
            }
        }
        return null;
    }

    getAvailableQuestForNPC(npcId) {
        for (const [, quest] of this.quests) {
            if (quest.status === 'available' && quest.giverNpcId === npcId) {
                return quest;
            }
        }
        return null;
    }

    isQuestCompleted(questId) {
        const quest = this.quests.get(questId);
        return quest && quest.status === 'completed';
    }

    update(delta) {
        // Expire notifications
        this.notifications = this.notifications.filter(n => {
            n.timer -= delta;
            return n.timer > 0;
        });
    }

    emitUpdate() {
        for (const cb of this.questUpdateCallbacks) {
            cb();
        }
    }
}
