/* eslint-disable */

import 'brace/mode/sql';

export class CustomHighlightRules extends window.ace.acequire('ace/mode/text_highlight_rules')
  .TextHighlightRules {
  constructor() {
    super();
    var keywords = 'select|from|where|and|or';

    var builtinConstants = 'true|false';

    var builtinFunctions =
      '@count|@avg|@min|@max|@stats|@cardinality|@map|@histogram|@range|@geo|@missing|@filter';

    var dataTypes =
      'int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|' +
      'money|real|number|integer';

    var keywordMapper = this.createKeywordMapper(
      {
        'support.function': builtinFunctions,
        keyword: keywords,
        'constant.language': builtinConstants,
        'storage.type': dataTypes,
      },
      'identifier',
      true,
    );

    this.$rules = {
      start: [
        {
          token: 'comment',
          regex: '--.*$',
        },
        {
          token: 'comment',
          start: '/\\*',
          end: '\\*/',
        },
        {
          token: 'string', // " string
          regex: '".*?"',
        },
        {
          token: 'string', // ' string
          regex: "'.*?'",
        },
        {
          token: 'string', // ` string (apache drill)
          regex: '`.*?`',
        },
        {
          token: 'constant.numeric', // float
          regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b',
        },
        {
          token: keywordMapper,
          regex: '[a-zA-Z\\@_$][a-zA-Z0-9_$]*\\b',
        },
        {
          token: 'keyword.operator',
          regex: '\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|=',
        },
        {
          token: 'paren.lparen',
          regex: '[\\{]',
        },
        {
          token: 'paren.rparen',
          regex: '[\\}]',
        },
        {
          token: 'text',
          regex: '\\s+',
        },
      ],
    };
  }
}

export default class CustomSqlMode extends window.ace.acequire('ace/mode/sql').Mode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
