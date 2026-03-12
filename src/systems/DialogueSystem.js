export class DialogueSystem {
    constructor() {
        this.isActive = false;
        this.currentDialogue = null;
        this.currentIndex = 0;
        this.displayedText = '';
        this.fullText = '';
        this.charIndex = 0;
        this.typeSpeed = 0.03; // seconds per character
        this.typeTimer = 0;
        this.isTyping = false;
        this.currentNPC = null;
        this.onDialogueEnd = null;
        this.choices = null;
        this.selectedChoice = 0;
    }

    startDialogue(npc, dialogueLines) {
        this.isActive = true;
        this.currentNPC = npc;
        this.currentDialogue = dialogueLines;
        this.currentIndex = 0;
        this.choices = null;
        this.selectedChoice = 0;
        this.showLine();

        // Exit pointer lock for dialogue
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    showLine() {
        if (this.currentIndex >= this.currentDialogue.length) {
            this.endDialogue();
            return;
        }

        const line = this.currentDialogue[this.currentIndex];

        if (line.choices) {
            // This is a choice prompt
            this.fullText = line.text || '';
            this.choices = line.choices;
            this.selectedChoice = 0;
        } else {
            this.fullText = line.text;
            this.choices = null;
        }

        this.displayedText = '';
        this.charIndex = 0;
        this.isTyping = true;
        this.typeTimer = 0;
    }

    update(delta) {
        if (!this.isActive) return;

        if (this.isTyping) {
            this.typeTimer += delta;
            while (this.typeTimer >= this.typeSpeed && this.charIndex < this.fullText.length) {
                this.displayedText += this.fullText[this.charIndex];
                this.charIndex++;
                this.typeTimer -= this.typeSpeed;
            }
            if (this.charIndex >= this.fullText.length) {
                this.isTyping = false;
            }
        }
    }

    advance() {
        if (!this.isActive) return;

        if (this.isTyping) {
            // Skip to end of current text
            this.displayedText = this.fullText;
            this.charIndex = this.fullText.length;
            this.isTyping = false;
            return;
        }

        if (this.choices) {
            // Process the chosen option
            const choice = this.choices[this.selectedChoice];
            if (choice.action) {
                choice.action();
            }
            this.choices = null;
            this.selectedChoice = 0;
        }

        this.currentIndex++;
        this.showLine();
    }

    selectChoice(direction) {
        if (!this.choices) return;
        this.selectedChoice += direction;
        if (this.selectedChoice < 0) this.selectedChoice = this.choices.length - 1;
        if (this.selectedChoice >= this.choices.length) this.selectedChoice = 0;
    }

    endDialogue() {
        const callback = this.onDialogueEnd;
        this.isActive = false;
        this.currentDialogue = null;
        this.currentNPC = null;
        this.displayedText = '';
        this.fullText = '';
        this.choices = null;
        if (callback) {
            callback();
            this.onDialogueEnd = null;
        }
    }

    getCurrentSpeaker() {
        if (!this.isActive || !this.currentDialogue || this.currentIndex >= this.currentDialogue.length) {
            return '';
        }
        return this.currentDialogue[this.currentIndex].speaker || '';
    }
}
