import { ContentReferencesStore } from "../content_references"
import { Reference } from "../content_references/references/types"
import { Message } from "../schemas"

export const buildMessageMetadata = ({
    content,
    contentReferencesStore
}: {
    content: string,
    contentReferencesStore?: ContentReferencesStore
}): Message['metadata'] => {

    const contentReferences = [...content.matchAll(/\!reference\{[0-9a-zA-Z]+\}/g)]
        .map(match => String(match[0]))
        .map(match => match.replace("!reference{", "").replace("}", ""))
        .reduce((total, next) => {
            const reference = contentReferencesStore?.getStore().get(next)
            if (reference) total[next] = reference
            return total
        }, {} as Record<string, Reference>)


    return {
        content_references: contentReferences
    }
}