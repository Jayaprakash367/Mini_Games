export class InventorySystem {
    constructor() {
        this.items = [];       // [{ id, name, icon, description, quantity }]
        this.maxSlots = 20;
        this.onChangeCallbacks = [];
    }

    onChange(callback) {
        this.onChangeCallbacks.push(callback);
    }

    emit() {
        for (const cb of this.onChangeCallbacks) cb();
    }

    addItem(item) {
        // Check if item already exists (stack)
        const existing = this.items.find(i => i.id === item.id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        } else if (this.items.length < this.maxSlots) {
            this.items.push({ ...item, quantity: item.quantity || 1 });
        } else {
            return false; // Inventory full
        }
        this.emit();
        return true;
    }

    removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index >= 0) {
            this.items[index].quantity--;
            if (this.items[index].quantity <= 0) {
                this.items.splice(index, 1);
            }
            this.emit();
            return true;
        }
        return false;
    }

    hasItem(itemId) {
        return this.items.some(i => i.id === itemId && i.quantity > 0);
    }

    getItem(itemId) {
        return this.items.find(i => i.id === itemId);
    }

    getItems() {
        return [...this.items];
    }
}
