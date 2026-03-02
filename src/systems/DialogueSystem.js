// =============================================
// DIALOGUE SYSTEM — Character Dialogue Box
// Typewriter effect, character name label, next button
// =============================================

export class DialogueSystem {
    constructor() {
        this.box = document.getElementById('dialogue-box');
        this.nameEl = document.getElementById('dialogue-name');
        this.textEl = document.getElementById('dialogue-text');
        this.nextBtn = document.getElementById('dialogue-next');

        this.dialogues = [];
        this.currentIndex = 0;
        this.isActive = false;
        this.isTyping = false;
        this.typewriterTimer = null;
        this.currentText = '';
        this.displayedText = '';
        this.charIndex = 0;
        this.onComplete = null;
        this.typeSpeed = 30;

        this.nextBtn.addEventListener('click', () => this.advance());
        // Also allow clicking the dialogue box itself to advance
        this.box.addEventListener('click', (e) => {
            if (e.target !== this.nextBtn && !this.nextBtn.contains(e.target)) {
                this.advance();
            }
        });
    }

    start(dialogues, onComplete) {
        this.dialogues = dialogues;
        this.currentIndex = 0;
        this.isActive = true;
        this.onComplete = onComplete || null;

        this.box.classList.remove('hidden');
        this.box.classList.add('active');

        this.showCurrentDialogue();
    }

    showCurrentDialogue() {
        if (this.currentIndex >= this.dialogues.length) {
            this.close();
            return;
        }

        const dialogue = this.dialogues[this.currentIndex];
        this.nameEl.textContent = dialogue.name;
        this.currentText = dialogue.text;
        this.displayedText = '';
        this.charIndex = 0;
        this.isTyping = true;

        // Clear previous timer
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
        }

        // Typewriter effect
        this.typewriterTimer = setInterval(() => {
            if (this.charIndex < this.currentText.length) {
                this.displayedText += this.currentText[this.charIndex];
                this.textEl.textContent = this.displayedText;
                this.charIndex++;
            } else {
                clearInterval(this.typewriterTimer);
                this.isTyping = false;
            }
        }, this.typeSpeed);
    }

    advance() {
        if (this.isTyping) {
            // Skip to end of current text
            clearInterval(this.typewriterTimer);
            this.textEl.textContent = this.currentText;
            this.isTyping = false;
            return;
        }

        this.currentIndex++;
        if (this.currentIndex >= this.dialogues.length) {
            this.close();
        } else {
            this.showCurrentDialogue();
        }
    }

    close() {
        this.isActive = false;
        this.box.classList.remove('active');

        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
        }

        setTimeout(() => {
            this.box.classList.add('hidden');
            if (this.onComplete) {
                this.onComplete();
                this.onComplete = null;
            }
        }, 400);
    }
}
