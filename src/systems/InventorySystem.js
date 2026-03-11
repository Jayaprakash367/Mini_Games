/**
 * InventorySystem - Complete inventory management
 * Handles items, stacking, categories, and item effects
 */
export class InventorySystem {
    constructor() {
        this.items = [];
        this.maxSlots = 20;
        this.selectedSlot = -1;
        this.isOpen = false;
        
        // Item categories
        this.categories = {
            quest: { name: 'Quest Items', icon: '📜' },
            delivery: { name: 'Deliveries', icon: '📦' },
            collectible: { name: 'Collectibles', icon: '⭐' },
            consumable: { name: 'Consumables', icon: '🧪' },
            equipment: { name: 'Equipment', icon: '👕' },
            key: { name: 'Key Items', icon: '🔑' }
        };
        
        // Item database
        this.itemDatabase = this.createItemDatabase();
        
        // Callbacks
        this.onItemAdded = null;
        this.onItemRemoved = null;
        this.onItemUsed = null;
        this.onInventoryChange = null;
    }
    
    createItemDatabase() {
        return {
            // Quest Items
            'harbor_package': {
                id: 'harbor_package',
                name: 'Harbor Package',
                type: 'delivery',
                icon: '📦',
                description: 'A package that needs to be delivered to the harbor master.',
                stackable: false,
                questItem: true,
                relatedQuest: 'harbor_delivery'
            },
            'lost_note': {
                id: 'lost_note',
                name: 'Lost Note',
                type: 'quest',
                icon: '📝',
                description: 'A handwritten note with faded ink. It seems important to someone.',
                stackable: false,
                questItem: true,
                relatedQuest: 'lost_note'
            },
            'lunch_box': {
                id: 'lunch_box',
                name: 'Lunch Box',
                type: 'delivery',
                icon: '🍱',
                description: 'A freshly prepared lunch box. Deliver it while it\'s still warm!',
                stackable: true,
                maxStack: 3,
                questItem: true,
                relatedQuest: 'lunch_delivery'
            },
            'letter': {
                id: 'letter',
                name: 'Sealed Letter',
                type: 'delivery',
                icon: '✉️',
                description: 'A sealed letter with an official stamp.',
                stackable: false,
                questItem: true,
                relatedQuest: 'letter_delivery'
            },
            'telescope_lens': {
                id: 'telescope_lens',
                name: 'Telescope Lens',
                type: 'quest',
                icon: '🔭',
                description: 'A precision-ground lens for the observatory telescope.',
                stackable: false,
                questItem: true,
                relatedQuest: 'telescope_lens'
            },
            
            // Collectibles
            'seashell': {
                id: 'seashell',
                name: 'Seashell',
                type: 'collectible',
                icon: '🐚',
                description: 'A beautiful spiral seashell from the harbor.',
                stackable: true,
                maxStack: 99,
                value: 5
            },
            'starfish': {
                id: 'starfish',
                name: 'Starfish',
                type: 'collectible',
                icon: '⭐',
                description: 'A rare five-pointed starfish.',
                stackable: true,
                maxStack: 99,
                value: 15
            },
            'pearl': {
                id: 'pearl',
                name: 'Pearl',
                type: 'collectible',
                icon: '⚪',
                description: 'A lustrous pearl. Very valuable!',
                stackable: true,
                maxStack: 50,
                value: 50
            },
            'coral_piece': {
                id: 'coral_piece',
                name: 'Coral Fragment',
                type: 'collectible',
                icon: '🪸',
                description: 'A colorful piece of coral.',
                stackable: true,
                maxStack: 30,
                value: 25
            },
            'lucky_coin': {
                id: 'lucky_coin',
                name: 'Lucky Coin',
                type: 'collectible',
                icon: '🪙',
                description: 'An old coin said to bring good fortune.',
                stackable: true,
                maxStack: 100,
                value: 20
            },
            
            // Consumables
            'health_potion': {
                id: 'health_potion',
                name: 'Health Potion',
                type: 'consumable',
                icon: '❤️',
                description: 'Restores vitality when consumed.',
                stackable: true,
                maxStack: 10,
                effect: 'heal',
                effectValue: 50
            },
            'speed_boost': {
                id: 'speed_boost',
                name: 'Speed Tincture',
                type: 'consumable',
                icon: '💨',
                description: 'Temporarily increases movement speed.',
                stackable: true,
                maxStack: 5,
                effect: 'speed',
                effectDuration: 30000
            },
            'energy_drink': {
                id: 'energy_drink',
                name: 'Energy Drink',
                type: 'consumable',
                icon: '⚡',
                description: 'Gives a burst of energy for faster walking.',
                stackable: true,
                maxStack: 10,
                effect: 'energy',
                effectDuration: 60000
            },
            
            // Key Items
            'messenger_badge': {
                id: 'messenger_badge',
                name: 'Messenger Badge',
                type: 'key',
                icon: '🎖️',
                description: 'Your official messenger certification badge.',
                stackable: false,
                keyItem: true
            },
            'area_map': {
                id: 'area_map',
                name: 'Town Map',
                type: 'key',
                icon: '🗺️',
                description: 'A map showing all areas of the town.',
                stackable: false,
                keyItem: true
            },
            
            // Equipment/Outfits
            'sakura_outfit': {
                id: 'sakura_outfit',
                name: 'Sakura Outfit',
                type: 'equipment',
                icon: '🌸',
                description: 'A beautiful pink outfit decorated with cherry blossoms.',
                stackable: false,
                outfit: { body: '#FFB6C1', skirt: '#FF69B4', hair: '#FFD1DC' }
            },
            'ocean_outfit': {
                id: 'ocean_outfit',
                name: 'Ocean Outfit',
                type: 'equipment',
                icon: '🌊',
                description: 'A cool blue outfit reminiscent of ocean waves.',
                stackable: false,
                outfit: { body: '#4169E1', skirt: '#000080', hair: '#87CEEB' }
            },
            
            // Pet treats
            'pet_treat': {
                id: 'pet_treat',
                name: 'Pet Treat',
                type: 'consumable',
                icon: '🦴',
                description: 'A delicious treat that makes your pet happy!',
                stackable: true,
                maxStack: 20,
                effect: 'pet_happiness',
                effectValue: 10
            }
        };
    }
    
    /**
     * Add an item to inventory
     */
    addItem(itemId, quantity = 1) {
        const itemData = this.itemDatabase[itemId];
        if (!itemData) {
            console.warn(`Item not found in database: ${itemId}`);
            return false;
        }
        
        // Check if item is stackable and already exists
        if (itemData.stackable) {
            const existingItem = this.items.find(item => 
                item.id === itemId && item.quantity < (itemData.maxStack || 99)
            );
            
            if (existingItem) {
                const maxAdd = (itemData.maxStack || 99) - existingItem.quantity;
                const toAdd = Math.min(quantity, maxAdd);
                existingItem.quantity += toAdd;
                
                if (quantity > toAdd) {
                    // Overflow to new slot
                    return this.addItem(itemId, quantity - toAdd);
                }
                
                this.triggerChange('added', existingItem, toAdd);
                return true;
            }
        }
        
        // Add as new item
        if (this.items.length >= this.maxSlots) {
            console.warn('Inventory full!');
            return false;
        }
        
        const newItem = {
            ...itemData,
            quantity: Math.min(quantity, itemData.maxStack || 1),
            slot: this.getNextFreeSlot(),
            addedAt: Date.now()
        };
        
        this.items.push(newItem);
        this.triggerChange('added', newItem, newItem.quantity);
        
        // Handle overflow for stackable items
        if (itemData.stackable && quantity > (itemData.maxStack || 99)) {
            return this.addItem(itemId, quantity - (itemData.maxStack || 99));
        }
        
        return true;
    }
    
    /**
     * Remove an item from inventory
     */
    removeItem(itemId, quantity = 1) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;
        
        const item = this.items[itemIndex];
        
        if (item.quantity <= quantity) {
            this.items.splice(itemIndex, 1);
            this.triggerChange('removed', item, item.quantity);
        } else {
            item.quantity -= quantity;
            this.triggerChange('removed', item, quantity);
        }
        
        return true;
    }
    
    /**
     * Use an item
     */
    useItem(itemId, target = null) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, message: 'Item not found' };
        
        const itemData = this.itemDatabase[itemId];
        
        // Check if item is usable
        if (itemData.type === 'quest' || itemData.type === 'key') {
            return { success: false, message: 'This item cannot be used directly.' };
        }
        
        // Handle different effects
        let result = { success: true, message: '', effect: null };
        
        switch (itemData.effect) {
            case 'heal':
                result.effect = { type: 'heal', value: itemData.effectValue };
                result.message = `Used ${item.name}. Healed ${itemData.effectValue} HP!`;
                break;
                
            case 'speed':
                result.effect = { type: 'speed', duration: itemData.effectDuration };
                result.message = `Used ${item.name}. Speed increased!`;
                break;
                
            case 'energy':
                result.effect = { type: 'energy', duration: itemData.effectDuration };
                result.message = `Used ${item.name}. Energy restored!`;
                break;
                
            case 'pet_happiness':
                if (!target) {
                    return { success: false, message: 'Select a pet to use this on.' };
                }
                result.effect = { type: 'pet_happiness', value: itemData.effectValue, target };
                result.message = `Your pet loved the treat!`;
                break;
                
            default:
                if (itemData.outfit) {
                    result.effect = { type: 'outfit', outfit: itemData.outfit };
                    result.message = `Equipped ${item.name}!`;
                } else {
                    return { success: false, message: 'This item has no effect.' };
                }
        }
        
        // Consume the item
        if (itemData.type === 'consumable') {
            this.removeItem(itemId, 1);
        }
        
        if (this.onItemUsed) {
            this.onItemUsed(item, result);
        }
        
        return result;
    }
    
    /**
     * Check if player has an item
     */
    hasItem(itemId, quantity = 1) {
        const item = this.items.find(i => i.id === itemId);
        return item && item.quantity >= quantity;
    }
    
    /**
     * Get item count
     */
    getItemCount(itemId) {
        return this.items
            .filter(item => item.id === itemId)
            .reduce((sum, item) => sum + item.quantity, 0);
    }
    
    /**
     * Get all items of a category
     */
    getItemsByCategory(category) {
        return this.items.filter(item => item.type === category);
    }
    
    /**
     * Get all quest items
     */
    getQuestItems() {
        return this.items.filter(item => item.questItem);
    }
    
    /**
     * Get next free slot
     */
    getNextFreeSlot() {
        const usedSlots = new Set(this.items.map(i => i.slot));
        for (let i = 0; i < this.maxSlots; i++) {
            if (!usedSlots.has(i)) return i;
        }
        return -1;
    }
    
    /**
     * Sort inventory
     */
    sortInventory(sortBy = 'type') {
        const sortFunctions = {
            type: (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
            name: (a, b) => a.name.localeCompare(b.name),
            recent: (a, b) => (b.addedAt || 0) - (a.addedAt || 0),
            quantity: (a, b) => b.quantity - a.quantity
        };
        
        this.items.sort(sortFunctions[sortBy] || sortFunctions.type);
        
        // Reassign slots
        this.items.forEach((item, index) => {
            item.slot = index;
        });
    }
    
    /**
     * Toggle inventory open/closed
     */
    toggle() {
        this.isOpen = !this.isOpen;
        return this.isOpen;
    }
    
    /**
     * Select a slot
     */
    selectSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.maxSlots) {
            this.selectedSlot = this.selectedSlot === slotIndex ? -1 : slotIndex;
        }
        return this.selectedSlot;
    }
    
    /**
     * Get selected item
     */
    getSelectedItem() {
        if (this.selectedSlot === -1) return null;
        return this.items.find(item => item.slot === this.selectedSlot);
    }
    
    triggerChange(action, item, quantity) {
        if (action === 'added' && this.onItemAdded) {
            this.onItemAdded(item, quantity);
        }
        if (action === 'removed' && this.onItemRemoved) {
            this.onItemRemoved(item, quantity);
        }
        if (this.onInventoryChange) {
            this.onInventoryChange(this.items);
        }
    }
    
    /**
     * Render inventory UI on canvas
     */
    render(ctx, x, y, width, height) {
        if (!this.isOpen) return;
        
        const padding = 20;
        const slotSize = 50;
        const slotGap = 8;
        const cols = 5;
        const rows = Math.ceil(this.maxSlots / cols);
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 15);
        ctx.fill();
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📦 Inventory', x + width / 2, y + 35);
        
        // Category tabs
        const tabY = y + 50;
        const tabWidth = 60;
        let tabX = x + padding;
        
        ctx.font = '14px "Inter", sans-serif';
        Object.entries(this.categories).forEach(([key, cat], i) => {
            const isActive = this.activeCategory === key;
            
            ctx.fillStyle = isActive ? '#4ECDC4' : 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.roundRect(tabX + i * (tabWidth + 5), tabY, tabWidth, 30, 5);
            ctx.fill();
            
            ctx.fillStyle = isActive ? '#000' : '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(cat.icon, tabX + i * (tabWidth + 5) + tabWidth / 2, tabY + 20);
        });
        
        // Slots grid
        const gridX = x + padding;
        const gridY = tabY + 45;
        
        for (let i = 0; i < this.maxSlots; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const slotX = gridX + col * (slotSize + slotGap);
            const slotY = gridY + row * (slotSize + slotGap);
            
            // Slot background
            const isSelected = this.selectedSlot === i;
            ctx.fillStyle = isSelected ? 'rgba(78, 205, 196, 0.5)' : 'rgba(255, 255, 255, 0.1)';
            ctx.strokeStyle = isSelected ? '#4ECDC4' : 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath();
            ctx.roundRect(slotX, slotY, slotSize, slotSize, 8);
            ctx.fill();
            ctx.stroke();
            
            // Item in slot
            const item = this.items.find(item => item.slot === i);
            if (item) {
                // Item icon
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.icon, slotX + slotSize / 2, slotY + slotSize / 2);
                
                // Stack count
                if (item.quantity > 1) {
                    ctx.font = 'bold 12px "Inter", sans-serif';
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(item.quantity.toString(), slotX + slotSize - 4, slotY + slotSize - 2);
                }
                
                // Quest item indicator
                if (item.questItem) {
                    ctx.fillStyle = '#FFD700';
                    ctx.font = '10px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText('★', slotX + 2, slotY + 12);
                }
            }
        }
        
        // Selected item info
        const selectedItem = this.getSelectedItem();
        if (selectedItem) {
            const infoY = gridY + rows * (slotSize + slotGap) + 10;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.roundRect(x + padding, infoY, width - padding * 2, 80, 8);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${selectedItem.icon} ${selectedItem.name}`, x + padding + 10, infoY + 25);
            
            ctx.font = '12px "Inter", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(selectedItem.description, x + padding + 10, infoY + 50);
            
            // Use button for consumables
            if (selectedItem.type === 'consumable') {
                ctx.fillStyle = '#4ECDC4';
                ctx.beginPath();
                ctx.roundRect(x + width - padding - 70, infoY + 45, 60, 25, 5);
                ctx.fill();
                
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Use', x + width - padding - 40, infoY + 62);
            }
        }
        
        // Close hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press [I] or [Tab] to close', x + width / 2, y + height - 15);
    }
    
    /**
     * Handle click in inventory UI
     */
    handleClick(clickX, clickY, inventoryX, inventoryY) {
        if (!this.isOpen) return false;
        
        const padding = 20;
        const slotSize = 50;
        const slotGap = 8;
        const cols = 5;
        const gridX = inventoryX + padding;
        const gridY = inventoryY + 95; // Account for title and tabs
        
        // Check slot clicks
        for (let i = 0; i < this.maxSlots; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const slotX = gridX + col * (slotSize + slotGap);
            const slotY = gridY + row * (slotSize + slotGap);
            
            if (clickX >= slotX && clickX <= slotX + slotSize &&
                clickY >= slotY && clickY <= slotY + slotSize) {
                this.selectSlot(i);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get serializable state for saving
     */
    getState() {
        return {
            items: this.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                slot: item.slot,
                addedAt: item.addedAt
            })),
            maxSlots: this.maxSlots
        };
    }
    
    /**
     * Load state from save
     */
    loadState(state) {
        if (!state) return;
        
        this.items = [];
        this.maxSlots = state.maxSlots || 20;
        
        if (state.items) {
            state.items.forEach(savedItem => {
                const itemData = this.itemDatabase[savedItem.id];
                if (itemData) {
                    this.items.push({
                        ...itemData,
                        quantity: savedItem.quantity,
                        slot: savedItem.slot,
                        addedAt: savedItem.addedAt
                    });
                }
            });
        }
    }
}

// Export singleton instance
export const inventorySystem = new InventorySystem();
