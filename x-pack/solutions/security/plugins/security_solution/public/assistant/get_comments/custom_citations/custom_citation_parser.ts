/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RemarkTokenizer } from '@elastic/eui';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

export interface CustomCitationNode extends Node {
  type: 'customCitation';
  citationId: string;
  citationNumber?: number;
}

const START_SIGNAL = '!reference';

/**
 * Parses `!{citation[citationLabel](citationLink)}` into CustomCitationNode
 */
export const CustomCitationParser: Plugin = function CustomCitationParser() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;
  let citationNumber = 1;
  const tokenizeCustomCitation: RemarkTokenizer = function tokenizeCustomCitation(
    eat,
    value,
    silent
  ) {
    if (value.startsWith(START_SIGNAL) === false) return false;

    if (value.includes('\n')) return false;

    const nextChar = value[START_SIGNAL.length];

    if (nextChar !== '{') return false;

    let index = START_SIGNAL.length;

    function readArg(open: string, close: string) {
      if (value[index] !== open) return '';
      index++;

      let body = '';
      let openBrackets = 0;

      for (; index < value.length; index++) {
        const char = value[index];
        if (char === close && openBrackets === 0) {
          index++;

          return body;
        } else if (char === close) {
          openBrackets--;
        } else if (char === open) {
          openBrackets++;
        }

        body += char;
      }

      return "";
    }

    const citationId = readArg('{', '}');

    const now = eat.now();

    if (!citationId) {
      this.file.info('No citation id found', {
        line: now.line,
        column: now.column + START_SIGNAL.length + 1,
      });
    }

    
    if (!citationId) {
      return false
    }

    if (silent) {
      return true;
    }

    now.column += START_SIGNAL.length + 1;
    now.offset += START_SIGNAL.length + 1;

    /* if (!citationLink || !citationLabel) {
      // Partial citation
      return eat(value)({
        type: 'customCitation',
        citationLink,
        citationLable: citationLabel,
        citationNumber: citationNumber++,
        incomplete: true,
      } as CustomCitationNode);
    } */

    const citationElement = `!reference{${citationId}}`;

    return eat(citationElement)({
      type: 'customCitation',
      citationId: citationId,
      citationNumber: citationNumber++,
    } as CustomCitationNode);
  };

  tokenizeCustomCitation.notInLink = true;

  tokenizeCustomCitation.locator = (value, fromIndex) => {
    return value.indexOf(START_SIGNAL, fromIndex);
  };

  tokenizers.customCitation = tokenizeCustomCitation;
  methods.splice(methods.indexOf('text'), 0, 'customCitation');
};
