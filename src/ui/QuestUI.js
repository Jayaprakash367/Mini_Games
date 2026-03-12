export class QuestUI {
    constructor(questSystem) {
        this.quests = questSystem;
        this.container = document.getElementById('quest-notifications');
        this.activeNotifications = [];
    }

    update() {
        if (!this.container) return;

        const notifications = this.quests.notifications;

        // Build notification HTML
        if (notifications.length === 0) {
            if (this.activeNotifications.length > 0) {
                this.container.innerHTML = '';
                this.activeNotifications = [];
            }
            return;
        }

        this.container.innerHTML = notifications.map((n, i) => {
            const opacity = Math.min(1, n.timer / 0.5); // fade out last 0.5s
            return `<div class="quest-notification" style="opacity: ${opacity}; transform: translateX(${n.timer < 0.5 ? (1 - n.timer / 0.5) * 50 : 0}px)">${n.text}</div>`;
        }).join('');

        this.activeNotifications = notifications;
    }
}
