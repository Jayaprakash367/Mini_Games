// =============================================
// QUEST SYSTEM — Task Checklist
// Handwritten-style quest tracking
// =============================================

export class QuestSystem {
    constructor() {
        this.quests = [
            {
                id: 'harbor_delivery',
                title: 'Deliver to Old Tanaka',
                description: 'Sailor Kim has a package. Take it to Old Tanaka on the hilltop.',
                progress: 0,
                maxProgress: 1,
                completed: false,
            },
            {
                id: 'lost_note',
                title: 'A note lost at sea',
                description: 'Take Fisher Yuki\'s waterproof note to the lighthouse keeper.',
                progress: 0,
                maxProgress: 1,
                completed: false,
            },
            {
                id: 'lunch_delivery',
                title: 'Lunch box delivery',
                description: 'Chef Hana needs lunch boxes delivered to the construction workers.',
                progress: 0,
                maxProgress: 3,
                completed: false,
            },
            {
                id: 'letter_delivery',
                title: 'Falling off the corporate ladder',
                description: 'Deliver Artist Sora\'s letter to her sister at the lighthouse.',
                progress: 0,
                maxProgress: 1,
                completed: false,
            },
            {
                id: 'telescope',
                title: 'The telescope lens',
                description: 'Bring the telescope lens from Old Tanaka to Keeper Aoi.',
                progress: 0,
                maxProgress: 1,
                completed: false,
            },
        ];

        this.panel = document.getElementById('quest-panel');
        this.listEl = document.getElementById('quest-list');

        this.renderQuests();
    }

    renderQuests() {
        if (!this.listEl) return;
        
        this.listEl.innerHTML = '';
        this.quests.forEach(quest => {
            const item = document.createElement('div');
            item.className = `quest-item${quest.completed ? ' completed' : ''}`;
            item.innerHTML = `
        <div class="quest-checkbox"></div>
        <div class="quest-info">
          <h3>${quest.title}</h3>
          <p>${quest.description}</p>
          <div class="quest-progress">${quest.progress}/${quest.maxProgress}</div>
        </div>
      `;
            this.listEl.appendChild(item);
        });
    }

    addProgress(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && !quest.completed) {
            quest.progress = Math.min(quest.progress + 1, quest.maxProgress);
            if (quest.progress >= quest.maxProgress) {
                quest.completed = true;
            }
            this.renderQuests();
        }
    }

    isCompleted(questId) {
        const quest = this.quests.find(q => q.id === questId);
        return quest ? quest.completed : false;
    }

    getCompletedCount() {
        return this.quests.filter(q => q.completed).length;
    }

    getTotalCount() {
        return this.quests.length;
    }

    show() {
        if (this.panel) {
            this.panel.classList.add('active');
            this.renderQuests();
        }
    }

    hide() {
        if (this.panel) {
            this.panel.classList.remove('active');
        }
    }

    toggle() {
        if (!this.panel) return;
        
        if (this.panel.classList.contains('active')) {
            this.hide();
        } else {
            this.show();
        }
    }
}
