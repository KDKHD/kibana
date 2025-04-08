/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IKibanaResponse, IRouter } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import { AccessToken, AccessTokenOptions, VideoGrant } from "livekit-server-sdk";

import {
    API_VERSIONS,
    INTERNAL_API_ACCESS,
} from '@kbn/elastic-assistant-common';
import { buildRouteValidationWithZod } from '@kbn/elastic-assistant-common/impl/schemas/common';
import { GET_VOICE_CONNECTION_DETAILS } from '../../../common/constants';
import { ElasticAssistantRequestHandlerContext } from '../../types';

import { buildResponse } from '../../lib/build_response';
import { z } from 'zod';

const API_KEY = "devkey"
const API_SECRET = "secret"
const LIVEKIT_URL = "http://localhost:7880"

export type GetVoiceConnectionDetails = z.infer<typeof GetVoiceConnectionDetails>;
export const GetVoiceConnectionDetails = z.any();

/**
 * Get the assistant capabilities for the requesting plugin
 *
 * @param router IRouter for registering routes
 */
export const getVoiceConnectionDetails = (router: IRouter<ElasticAssistantRequestHandlerContext>) => {
    router.versioned
        .get({
            access: INTERNAL_API_ACCESS,
            path: GET_VOICE_CONNECTION_DETAILS,
            security: {
                authz: {
                    requiredPrivileges: ['elasticAssistant'],
                },
            },
        })
        .addVersion(
            {
                version: API_VERSIONS.internal.v1,
                validate: {
                    response: {
                        200: {
                            body: { custom: buildRouteValidationWithZod(GetVoiceConnectionDetails) },
                        },
                    },
                },
            },
            async (context, request, response): Promise<IKibanaResponse<GetVoiceConnectionDetails>> => {
                const resp = buildResponse(response);

                try {

                    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
                    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;
                    const participantToken = await createParticipantToken(
                        { identity: participantIdentity },
                        roomName
                    );

                    const data = {
                        serverUrl: LIVEKIT_URL,
                        roomName,
                        participantToken: participantToken,
                        participantName: participantIdentity,
                    };

                    const assistantContext = await context.elasticAssistant;
                    const logger = assistantContext.logger;

                    logger.debug(`Voice assistant connection details: ${JSON.stringify(data)}`);

                    const headers = {
                        "Cache-Control": "no-store",
                    };

                    return response.ok({ body: data, headers });
                } catch (err) {
                    const error = transformError(err);
                    return resp.error({
                        body: error.message,
                        statusCode: error.statusCode,
                    });
                }
            }
        );
};

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
    const at = new AccessToken(API_KEY, API_SECRET, {
        ...userInfo,
        ttl: "15m",
    });
    const grant: VideoGrant = {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
    };
    at.addGrant(grant);
    return at.toJwt();
}
