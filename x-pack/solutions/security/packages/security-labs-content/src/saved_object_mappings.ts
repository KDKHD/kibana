/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { SavedObjectsType } from '@kbn/core/server';

export const securityLabsContentSavedObjectType = 'security-labs-content';
export const securityLabsContentSavedObjectMappings: SavedObjectsType['mappings'] = {
  dynamic: false,
  properties: {
    title: {
      type: 'text',
    },
    slug: {
      type: 'text',
    },
    subtitle: {
      type: 'text',
    },
    date: {
      type: 'date',
    },
    description: {
      type: 'text',
    },
    author: {
      type: 'nested',
      properties:{
        slug: {
          type: 'text',
        }
      }
    },
    image: {
      type: 'text',
    },
    category: {
      type: 'nested',
      properties:{
        slug: {
          type: 'text',
        }
      }
    },
    tags: {
      type: 'text',
    },
    raw: {
      type: 'nested',
      properties: {
        document: {
          type: 'text',
        },
      },
    },
  },
};

export const securityLabsContentType: SavedObjectsType = {
  name: securityLabsContentSavedObjectType,
  hidden: false,
  management: {
    importableAndExportable: true,
    visibleInManagement: true, // <--show in management
  },
  namespaceType: 'agnostic',
  mappings: securityLabsContentSavedObjectMappings,
};
