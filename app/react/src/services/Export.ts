import { FormattedMessage, MessageValue } from 'react-intl';
import { funnelMessages } from '../components/Funnel/Constants';
import { FunnelSheetDescription } from '../containers/Audience/Funnel/FunnelPage';
import {
  FieldValueFunnelMultipleDimensionResource,
  FieldValueFunnelResource,
  FieldValuesFunnelResource,
  isFieldValueFunnelResource,
} from '../models/datamart/UserActivitiesFunnel';
import ExportService from './ExportService';

function castToString(x: any | undefined): string {
  return x === undefined ? '' : x.toString();
}

const exportMultipleGroupByDimensions = (
  fieldValue: FieldValueFunnelMultipleDimensionResource,
  index: number,
  dataSheet: any,
) => {
  const dataLineSplit = [];
  dataLineSplit.push('');
  fieldValue.dimension_values.forEach(x => {
    dataLineSplit.push(x);
  });
  dataLineSplit.push(
    fieldValue.funnel.steps[index].count,
    fieldValue.funnel.steps[index].conversion,
    fieldValue.funnel.steps[index].amount,
    `${fieldValue.funnel.steps[index].interaction_duration}s`,
  );
  dataSheet.push(dataLineSplit);
};

type FormatMessage = (
  messageDescriptor: FormattedMessage.MessageDescriptor,
  values?: { [key: string]: MessageValue },
) => string;

const exportSimpleGroupByDimension = (
  fieldValue: FieldValueFunnelResource,
  index: number,
  dataSheet: string[][],
) => {
  const dataLineSplit = [];
  dataLineSplit.push(
    '',
    fieldValue.dimension_value,
    fieldValue.funnel.steps[index].count,
    fieldValue.funnel.steps[index].conversion,
    fieldValue.funnel.steps[index].amount,
    `${fieldValue.funnel.steps[index].interaction_duration}s`,
  );
  dataSheet.push(dataLineSplit.map(castToString));
};

const headersForSimpleGroupByDimension = (
  fieldValueResource: FieldValueFunnelResource,
  formatMessage: FormatMessage,
  dataSheet: string[][],
) => {
  const splitByDimension = fieldValueResource.dimension_name || 'N/A';
  const headersMap = [
    {
      name: 'Step name',
      translation: formatMessage(funnelMessages.stepName),
    },
    {
      name: splitByDimension,
      translation: formatMessage(funnelMessages.channelId),
    },
    {
      name: 'User points',
      translation: formatMessage(funnelMessages.userPoints),
    },
    {
      name: '# units',
      translation: formatMessage(funnelMessages.conversion),
    },
    {
      name: 'Amount',
      translation: formatMessage(funnelMessages.amount),
    },
    {
      name: 'Interaction duration',
      translation: formatMessage(funnelMessages.duration),
    },
  ];

  const headersLine = headersMap.map(x => x.translation);

  dataSheet.push(headersLine);
};

const headersForMultipleGroupByDimension = (
  fieldValueResource: FieldValueFunnelMultipleDimensionResource,
  formatMessage: FormatMessage,
  dataSheet: string[][],
) => {
  const splitByDimensions = fieldValueResource?.dimension_names || [];
  const groupByDimensionNames = splitByDimensions.map(x => ({
    name: x,
    translation: x,
  }));

  const headersMap = [
    {
      name: 'Step name',
      translation: formatMessage(funnelMessages.stepName),
    },
    ...groupByDimensionNames,
    {
      name: 'User points',
      translation: formatMessage(funnelMessages.userPoints),
    },
    {
      name: '# units',
      translation: formatMessage(funnelMessages.conversion),
    },
    {
      name: 'Amount',
      translation: formatMessage(funnelMessages.amount),
    },
    {
      name: 'Interaction duration',
      translation: formatMessage(funnelMessages.duration),
    },
  ];

  const headersLine = headersMap.map(x => x.translation);

  dataSheet.push(headersLine);
};

export const exportFunnel = (
  funnelResources: FunnelSheetDescription[],
  datamartId: string,
  organisationId: string,
  formatMessage: (
    messageDescriptor: FormattedMessage.MessageDescriptor,
    values?: { [key: string]: MessageValue },
  ) => string,
) => {
  const sheets = funnelResources.map(funnelResource => {
    const titleLine = funnelResource.title;
    const blankLine: string[] = [];

    const dataSheet: string[][] = [];

    dataSheet.push([titleLine]);

    const headerMap = [
      {
        name: 'total user points',
        translation: formatMessage(funnelMessages.stepName),
      },
    ];
    dataSheet.push(blankLine);
    dataSheet.push(blankLine);

    const headerLine = headerMap.map(header => header.name);

    dataSheet.push(headerLine);

    dataSheet.push([funnelResource.funnelData.global.total.toString()]);
    dataSheet.push(blankLine);
    dataSheet.push(blankLine);

    if (!!funnelResource.funnelData.grouped_by?.[0]) {
      const fieldValueResource = funnelResource.funnelData
        .grouped_by[0] as FieldValuesFunnelResource;
      if (isFieldValueFunnelResource(fieldValueResource)) {
        headersForSimpleGroupByDimension(fieldValueResource, formatMessage, dataSheet);
      } else {
        headersForMultipleGroupByDimension(fieldValueResource, formatMessage, dataSheet);
      }
    }
    funnelResource.funnelData.global.steps.forEach((step, index) => {
      const dataLine = [];

      /* eslint-disable camelcase */
      const { name, count, conversion, amount, interaction_duration } = step;

      dataLine.push(name, '', count, conversion, amount, `${interaction_duration}s`);
      /* eslint-enable camelcase */
      dataSheet.push(dataLine.map(castToString));

      if (index === funnelResource.splitIndex) {
        funnelResource.funnelData.grouped_by?.forEach(fieldValueResource => {
          if (isFieldValueFunnelResource(fieldValueResource)) {
            exportSimpleGroupByDimension(fieldValueResource, index, dataSheet);
          } else {
            exportMultipleGroupByDimensions(fieldValueResource, index, dataSheet);
          }
        });
      }
    });
    return {
      name: titleLine,
      data: dataSheet,
    };
  });
  ExportService.exportData(sheets, `${organisationId}_${datamartId}_funnel`, 'xlsx');
};
