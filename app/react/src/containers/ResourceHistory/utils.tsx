import * as React from 'react';
import moment from 'moment';
import { formatMetric } from '../../utils/MetricHelper';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

export type HistoryKeys = 'history_title' | 'history_resource_type';

export type ValueFormat = 'STRING' | 'INTEGER' | 'FLOAT' | 'DATE' | 'TIMESTAMP' | 'MESSAGE';

export function formatToFormattingFunction(
  value: string,
  format: ValueFormat,
  messageMap?: { [key: string]: MessageDescriptor },
) {
  switch (format) {
    case 'STRING':
      return value;

    case 'FLOAT':
      return formatMetric(value, '0.00');
    case 'INTEGER':
      return formatMetric(value, '0');

    case 'DATE':
      return moment(value, 'x').format('DD-MM-YYYY');
    case 'TIMESTAMP':
      return moment(value, 'x').format('DD-MM-YYYY HH:mm:ss');

    case 'MESSAGE':
      return messageMap ? <FormattedMessage {...messageMap[value]} /> : value;
  }
}
