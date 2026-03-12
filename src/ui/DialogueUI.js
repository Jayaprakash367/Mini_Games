export class DialogueUI {
    constructor(dialogueSystem) {
        this.dialogue = dialogueSystem;
        this.container = document.getElementById('dialogue-panel');
        this.isShowing = false;

        this.createElements();
    }

    createElements() {
        this.container.innerHTML = `
            <div class="dialogue-box" id="dialogue-box">
                <div class="dialogue-speaker" id="dialogue-speaker"></div>
                <div class="dialogue-text" id="dialogue-text"></div>
                <div class="dialogue-choices" id="dialogue-choices"></div>
                <div class="dialogue-hint" id="dialogue-hint">Press E to continue</div>
            </div>
        `;
    }

    update() {
        const box = document.getElementById('dialogue-box');
        if (!box) return;

        if (this.dialogue.isActive) {
            box.classList.remove('hidden');
            this.container.classList.remove('hidden');
            this.container.style.display = 'flex';

            // Speaker name
            const speaker = document.getElementById('dialogue-speaker');
            const speakerName = this.dialogue.getCurrentSpeaker();
            speaker.textContent = speakerName;
            speaker.style.display = speakerName ? 'block' : 'none';

            // Text
            const textEl = document.getElementById('dialogue-text');
            textEl.textContent = this.dialogue.displayedText;

            // Typing indicator
            if (this.dialogue.isTyping) {
                textEl.classList.add('typing');
            } else {
                textEl.classList.remove('typing');
            }

            // Choices
            const choicesEl = document.getElementById('dialogue-choices');
            if (this.dialogue.choices && !this.dialogue.isTyping) {
                choicesEl.style.display = 'block';
                choicesEl.innerHTML = this.dialogue.choices.map((choice, i) => {
                    const selected = i === this.dialogue.selectedChoice;
                    return `<div class="dialogue-choice ${selected ? 'selected' : ''}">${selected ? '▶ ' : '  '}${choice.text}</div>`;
                }).join('');
            } else {
                choicesEl.style.display = 'none';
            }

            // Hint
            const hint = document.getElementById('dialogue-hint');
            if (this.dialogue.isTyping) {
                hint.textContent = 'Press E to skip';
            } else if (this.dialogue.choices) {
                hint.textContent = 'W/S to choose, E to select';
            } else {
                hint.textContent = 'Press E to continue';
            }

            this.isShowing = true;
        } else if (this.isShowing) {
            box.classList.add('hidden');
            this.container.classList.add('hidden');
            this.isShowing = false;
        }
    }
}
