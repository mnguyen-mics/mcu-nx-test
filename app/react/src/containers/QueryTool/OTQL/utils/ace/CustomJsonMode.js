/* eslint-disable */
import 'brace/mode/json';

export class CustomHighlightRules extends window.ace.acequire('ace/mode/text_highlight_rules')
  .TextHighlightRules {
  constructor() {
    super();
    this.$rules = {
      start: [
        {
          token: 'variable', // single line
          regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)',
        },
        {
          token: 'string', // single line
          regex: '"',
          next: 'string',
        },
        {
          token: 'constant.numeric', // hex
          regex: '0[xX][0-9a-fA-F]+\\b',
        },
        {
          token: 'constant.numeric', // float
          regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b',
        },
        {
          token: 'constant.language.boolean',
          regex: '(?:true|false)\\b',
        },
        {
          token: 'text', // single quoted strings are not allowed
          regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']",
        },
        {
          token: 'comment', // comments are not allowed, but who cares?
          regex: '\\/\\/.*$',
        },
        {
          token: 'comment.start', // comments are not allowed, but who cares?
          regex: '\\/\\*',
          next: 'comment',
        },
        {
          token: 'paren.lparen',
          regex: '[[({]',
        },
        {
          token: 'paren.rparen',
          regex: '[\\])}]',
        },
        {
          token: 'punctuation.operator',
          regex: /[,]/,
        },
        {
          token: 'text',
          regex: '\\s+',
        },
      ],
      string: [
        {
          token: 'constant.language.escape',
          regex: /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/,
        },
        {
          token: 'string.user_point_id',
          regex:
            /(?<=  "id": ")[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}(?=")/,
        },
        {
          token: 'string.user_agent_id',
          regex: /(?<=    "id": ")\d+(?=")/,
        },
        {
          token: 'string.user_account_id',
          regex: /(?<=    "id": ")\d+?:.+(?=")/,
        },
        {
          token: 'string.email_hash',
          regex: /(?<=    "id": ")[a-f0-9]{32}(?=")/, // MD5
        },
        {
          token: 'string.email_hash',
          regex: /(?<=    "id": ")[a-f0-9]{64}(?=")/, // SHA256
        },
        {
          token: 'string.email_hash',
          regex: /(?<=    "id": ")[a-f0-9]{128}(?=")/, // SHA512
        },
        {
          token: 'string',
          regex: '"|$',
          next: 'start',
        },
        {
          defaultToken: 'string',
        },
      ],
      comment: [
        {
          token: 'comment.end', // comments are not allowed, but who cares?
          regex: '\\*\\/',
          next: 'start',
        },
        {
          defaultToken: 'comment',
        },
      ],
    };
  }
}

export default class CustomJsonMode extends window.ace.acequire('ace/mode/json').Mode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
