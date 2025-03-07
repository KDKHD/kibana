/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  ConversationResponse,
  Replacements,
} from '@kbn/elastic-assistant-common';
import { NodeParamsBase } from '../types';
import { AIAssistantConversationsDataClient } from '../../../../../ai_assistant_data_clients/conversations';
import { NodeType } from '../constants';
import { DefaultAssistantGraphState } from '../state';

export interface PersistConversationChangesParams extends NodeParamsBase {
  state: typeof DefaultAssistantGraphState.State;
  conversationsDataClient?: AIAssistantConversationsDataClient;
  replacements?: Replacements;
}

export async function persistConversationChanges({
  logger,
  state,
  conversationsDataClient,
  replacements = {},
}: PersistConversationChangesParams) {
  logger.debug(
    () => `${NodeType.PERSIST_CONVERSATION_CHANGES}: Node state:\n${JSON.stringify(state, null, 2)}`
  );

  if (!state.conversation || !state.conversationId) {
    logger.debug('No need to generate chat title, conversationId is undefined');
    return {
      conversation: undefined,
      lastNode: NodeType.PERSIST_CONVERSATION_CHANGES,
    };
  }

  let tempConversation: ConversationResponse | null | undefined 

  if (state.conversation?.title !== state.chatTitle) {
    tempConversation = await conversationsDataClient?.updateConversation({
      conversationUpdateProps: {
        id: state.conversationId,
        title: state.chatTitle,
      },
    });
  }

  return {
    conversation: tempConversation,
    lastNode: NodeType.PERSIST_CONVERSATION_CHANGES,
  };
}
