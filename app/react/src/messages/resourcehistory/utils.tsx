import * as React from 'react';
import { formatMetric } from "../../utils/MetricHelper";
import { FormattedMessage } from "react-intl";

export type HistoryKeys = 'history_title' | 'history_resource_name'

export type ValueFormat = 'STRING' | 'INTEGER' | 'FLOAT' | 'MESSAGE'

export function formatToFormattingFunction (
  value: string,
  format: ValueFormat,
  messageMap?: {[key: string]: FormattedMessage.MessageDescriptor}
) {
  switch (format) {
    case 'STRING': return value;
    case 'FLOAT': return formatMetric(value, '0.00');
    case 'INTEGER': return formatMetric(value, '0');
    case 'MESSAGE': return messageMap ? <FormattedMessage {...messageMap[value]}/> : value;
  }
};