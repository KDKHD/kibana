import { HttpSetup } from "@kbn/core/public"
import { API_VERSIONS } from "@kbn/elastic-assistant-common";

export const getConnectionDetails = async ({ http }: {
    http: HttpSetup
}) => {
    const response = await http.fetch<{
        serverUrl: string;
        roomName: string;
        participantName: string;
        participantToken: string;
    }>(`/internal/elastic_assistant/voice/connection_details`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        version: API_VERSIONS.internal.v1,
    });

    return response
}