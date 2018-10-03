import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'datamart.search.placeholder',
    defaultMessage: 'Search Datamarts',
  },
  datamartId: {
    id: 'datamart.id',
    defaultMessage: 'Id',
  },
  datamartToken: {
    id: 'datamart.token',
    defaultMessage: 'Token',
  },
  datamartName: {
    id: 'datamart.name',
    defaultMessage: 'Name',
  },
  datamartCreationDate: {
    id: 'datamart.creation_date',
    defaultMessage: 'Creation Date',
  },
  editDatamart: {
    id: 'datamart.edit',
    defaultMessage: 'Edit',
  },
  emptyDatamarts: {
    id: 'datamart.empty',
    defaultMessage: 'There are no datamarts set up.',
  },
  datamartType: {
    id: 'datamart.type',
    defaultMessage: 'Type'
  },
  typeStandard: {
    id: 'datamart.type.standard',
    defaultMessage: 'Standard Datamart'
  },
  typeXDatamart: {
    id: 'datamart.type.xdatamart',
    defaultMessage: 'Cross-Datamart'
  },
  serviceUsageReport: {
    id: 'datamart.service_usage_report',
    defaultMessage: 'View Service Usage Report',
  },
  noData: {
    id: 'datamart.no.data.service_usage_report',
    defaultMessage: 'There is no service usage report for this datamart.',
  },
  viewDatamartSources: {
    id: 'datamart.datamartSources',
    defaultMessage: 'View Sources',
  },
});

export default messages;
