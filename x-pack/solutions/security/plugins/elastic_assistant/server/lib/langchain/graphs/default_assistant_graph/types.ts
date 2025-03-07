/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/logging';
import { PublicMethodsOf } from '@kbn/utility-types';
import { ActionsClient } from '@kbn/actions-plugin/server';
import { SavedObjectsClientContract } from '@kbn/core-saved-objects-api-server';
import { DefaultAssistantGraphState } from './state';

export type GraphInputs = Required<Pick<Partial<typeof DefaultAssistantGraphState.State>, 'connectorId' | 'provider' | 'messages'>> & Partial<typeof DefaultAssistantGraphState.State>;

export interface NodeParamsBase {
  actionsClient: PublicMethodsOf<ActionsClient>;
  logger: Logger;
  savedObjectsClient: SavedObjectsClientContract;
}
