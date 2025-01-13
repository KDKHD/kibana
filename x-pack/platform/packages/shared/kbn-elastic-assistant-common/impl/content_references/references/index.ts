import { ReferenceTypes, ReferenceId } from "./types"

class BaseReference<t extends ReferenceTypes> {
    id: ReferenceId
    type: t

    constructor(type: t, id: ReferenceId) {
        this.type = type
        this.id = id
    }

    getReferenceElement(): string | undefined {
        return `!reference{${this.id}}`
    }
}

export class LinkReference extends BaseReference<"LinkReference"> {
    citationLink: string
    citationLable: string

    constructor(id: ReferenceId, citationLable: string, citationLink: string) {
        super('LinkReference', id)
        this.citationLink = citationLink
        this.citationLable = citationLable
    }
}

export class AlertReference extends BaseReference<"AlertReference"> {
    alertId: string

    constructor(id: ReferenceId, alertId: string) {
        super('AlertReference', id)
        this.alertId = alertId
    }

}