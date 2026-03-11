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

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.advance());
        }
        // Also allow clicking the dialogue box itself to advance
        if (this.box) {
            this.box.addEventListener('click', (e) => {
                if (this.nextBtn && e.target !== this.nextBtn && !this.nextBtn.contains(e.target)) {
                    this.advance();
                } else if (!this.nextBtn) {
                    this.advance();
                }
            });
        }
    }

    start(dialogues, onComplete) {
        this.dialogues = dialogues;
        this.currentIndex = 0;
        this.isActive = true;
        this.onComplete = onComplete || null;

        if (this.box) {
            this.box.classList.remove('hidden');
            this.box.classList.add('active');
        }

        this.showCurrentDialogue();
    }

    showCurrentDialogue() {
        if (this.currentIndex >= this.dialogues.length) {
            this.close();
            return;
        }

        const dialogue = this.dialogues[this.currentIndex];
        if (this.nameEl) this.nameEl.textContent = dialogue.name;
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
                if (this.textEl) this.textEl.textContent = this.displayedText;
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
            if (this.textEl) this.textEl.textContent = this.currentText;
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
        if (this.box) this.box.classList.remove('active');

        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
        }

        setTimeout(() => {
            if (this.box) this.box.classList.add('hidden');
            if (this.onComplete) {
                this.onComplete();
                this.onComplete = null;
            }
        }, 400);
    }
}
