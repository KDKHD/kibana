import { ReferenceId, Reference } from "./references/types"

export class ContentReferencesStore {
    store: Map<string, Reference>

    constructor() {
        this.store = new Map()
    }

    add<T extends Reference>(create: (params: { id: ReferenceId }) => T): T {
        const entry = create({
            id: this.generateId()
        })
        this.store.set(entry.id, entry)
        return entry
    }

    getStore(){
        return this.store
    }

    generateId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 5 }, () =>
            characters[Math.floor(Math.random() * characters.length)]
        ).join('');
    }
}