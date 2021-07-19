import {
  NumericComparisonOperator,
  BooleanComparisonOperator,
  EnumComparisonOperator,
  TimeComparisonOperator,
  StringComparisonOperator,
} from '../../../../../../models/datamart/graphdb/QueryDocument';
import { InjectedIntl } from 'react-intl';
import messages from '../../messages';
import {
  ActivitySource,
  UserActivityType,
  OperatingSystemFamily,
  HashFunction,
  FormFactor,
  BrowserFamily,
  UserAgentType,
} from '../../../../../../models/datamart/graphdb/RuntimeSchema';

type defaultValue = { type: string; operator: string; values: any[] } | undefined;

export interface ComparisonValues<T> {
  values: Array<{
    value: T;
    title: string;
  }>;
  defaultValue: defaultValue;
}

const comparisonOperators = {
  generateNumericComparisonOperator(
    intl: InjectedIntl,
  ): ComparisonValues<NumericComparisonOperator> {
    return {
      values: [
        {
          value: 'EQUAL',
          title: intl.formatMessage(messages.EQUAL),
        },
        {
          value: 'NOT_EQUAL',
          title: intl.formatMessage(messages.NOT_EQUAL),
        },
        {
          value: 'LT',
          title: intl.formatMessage(messages.LT),
        },
        {
          value: 'LTE',
          title: intl.formatMessage(messages.LTE),
        },
        {
          value: 'GT',
          title: intl.formatMessage(messages.GT),
        },
        {
          value: 'GTE',
          title: intl.formatMessage(messages.GTE),
        },
      ],
      defaultValue: { type: 'NUMERIC', operator: 'EQUAL', values: [] },
    };
  },
  generateBooleanComparisonOperator(
    intl: InjectedIntl,
  ): ComparisonValues<BooleanComparisonOperator> {
    return {
      values: [
        {
          value: 'EQUAL',
          title: intl.formatMessage(messages.EQUAL),
        },
        {
          value: 'NOT_EQUAL',
          title: intl.formatMessage(messages.NOT_EQUAL),
        },
      ],
      defaultValue: { type: 'BOOLEAN', operator: 'EQUAL', values: [] },
    };
  },
  generateEnumComparisonOperator(intl: InjectedIntl): ComparisonValues<EnumComparisonOperator> {
    return {
      values: [
        {
          value: 'EQUAL',
          title: intl.formatMessage(messages.EQUAL),
        },
        {
          value: 'NOT_EQUAL',
          title: intl.formatMessage(messages.NOT_EQUAL),
        },
      ],
      defaultValue: { type: 'ENUM', operator: 'EQUAL', values: [] },
    };
  },
  generateTimeComparisonOperator(intl: InjectedIntl): ComparisonValues<TimeComparisonOperator> {
    return {
      values: [
        {
          value: 'BEFORE',
          title: intl.formatMessage(messages.BEFORE),
        },
        {
          value: 'BEFORE_OR_EQUAL',
          title: intl.formatMessage(messages.BEFORE_OR_EQUAL),
        },
        {
          value: 'AFTER',
          title: intl.formatMessage(messages.AFTER),
        },
        {
          value: 'AFTER_OR_EQUAL',
          title: intl.formatMessage(messages.AFTER_OR_EQUAL),
        },
      ],
      defaultValue: { type: 'TIME', operator: 'BEFORE', values: [] },
    };
  },

  generateStringComparisonOperator(
    intl: InjectedIntl,
    indexDataType: string = 'keyword',
    isEdge: boolean = false,
  ): ComparisonValues<StringComparisonOperator> {
    switch (indexDataType) {
      case 'text':
        return {
          values: [
            {
              value: 'MATCHES',
              title: intl.formatMessage(messages.MATCHES),
            },
          ],
          defaultValue: { type: 'STRING', operator: 'MATCHES', values: [] },
        };
      default: {
        if (isEdge) {
          return {
            values: [
              {
                value: 'EQ',
                title: intl.formatMessage(messages.EQ),
              },
              {
                value: 'NOT_EQ',
                title: intl.formatMessage(messages.NOT_EQ),
              },
              {
                value: 'MATCHES',
                title: intl.formatMessage(messages.MATCHES),
              },
              {
                value: 'DOES_NOT_MATCH',
                title: intl.formatMessage(messages.DOES_NOT_MATCH),
              },
              {
                value: 'STARTS_WITH',
                title: intl.formatMessage(messages.STARTS_WITH),
              },
              {
                value: 'DOES_NOT_START_WITH',
                title: intl.formatMessage(messages.DOES_NOT_START_WITH),
              },
              {
                value: 'CONTAINS',
                title: intl.formatMessage(messages.CONTAINS),
              },
              {
                value: 'DOES_NOT_CONTAIN',
                title: intl.formatMessage(messages.DOES_NOT_CONTAIN),
              },
            ],
            defaultValue: { type: 'STRING', operator: 'EQ', values: [] },
          };
        } else {
          return {
            values: [
              {
                value: 'EQ',
                title: intl.formatMessage(messages.EQ),
              },
              {
                value: 'NOT_EQ',
                title: intl.formatMessage(messages.NOT_EQ),
              },
              {
                value: 'STARTS_WITH',
                title: intl.formatMessage(messages.STARTS_WITH),
              },
            ],
            defaultValue: { type: 'STRING', operator: 'EQ', values: [] },
          };
        }
      }
    }
  },
};

export const builtinEnumTypeOptions: {
  ActivitySource: ActivitySource[];
  UserActivityType: UserActivityType[];
  OperatingSystemFamily: OperatingSystemFamily[];
  HashFunction: HashFunction[];
  FormFactor: FormFactor[];
  BrowserFamily: BrowserFamily[];
  UserAgentType: UserAgentType[];
} = {
  ActivitySource: ['PIXEL_TRACKING', 'API', 'INTERNAL', 'SESSION_AGGREGATOR', 'ACTIVITY_STORE'],
  UserActivityType: [
    'ALL',
    'USER_PLATFORM',
    'TOUCH',
    'SITE_VISIT',
    'APP_VISIT',
    'EMAIL',
    'DISPLAY_AD',
    'STOPWATCH',
    'STAGING_AREA',
    'RECOMMENDER',
    'USER_SCENARIO_START',
    'USER_SCENARIO_STOP',
    'USER_SCENARIO_NODE_ENTER',
    'USER_SCENARIO_NODE_EXIT',
  ],
  OperatingSystemFamily: ['OTHER', 'WINDOWS', 'MAC_OS', 'LINUX', 'ANDROID', 'IOS'],
  HashFunction: ['MD2', 'MD5', 'SHA_1', 'SHA_256', 'SHA_384', 'SHA_512', 'NO_HASH'],
  FormFactor: [
    'OTHER',
    'PERSONAL_COMPUTER',
    'SMART_TV',
    'GAME_CONSOLE',
    'SMARTPHONE',
    'TABLET',
    'WEARABLE_COMPUTER',
  ],
  BrowserFamily: [
    'OTHER',
    'CHROME',
    'IE',
    'FIREFOX',
    'SAFARI',
    'OPERA',
    'STOCK_ANDROID',
    'BOT',
    'EMAIL_CLIENT',
    'MICROSOFT_EDGE',
  ],
  UserAgentType: ['WEB_BROWSER', 'MOBILE_APP'],
};

export default comparisonOperators;
