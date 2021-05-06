import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'datamart.search.placeholder',
    defaultMessage: 'Search Datamarts',
  },
  datamartId: {
    id: 'settings.datamart.id',
    defaultMessage: 'Id',
  },
  datamartToken: {
    id: 'settings.datamart.token',
    defaultMessage: 'Token',
  },
  datamartName: {
    id: 'settings.datamart.name',
    defaultMessage: 'Name',
  },
  datamartCreationDate: {
    id: 'settings.datamart.creation_date',
    defaultMessage: 'Creation Date',
  },
  editDatamart: {
    id: 'settings.datamart.list.action.edit',
    defaultMessage: 'Edit',
  },
  emptyDatamarts: {
    id: 'settings.datamart.empty',
    defaultMessage: 'There are no datamarts set up.',
  },
  datamartType: {
    id: 'settings.datamart.type',
    defaultMessage: 'Type',
  },
  typeStandard: {
    id: 'settings.datamart.type.standard',
    defaultMessage: 'Standard Datamart',
  },
  typeXDatamart: {
    id: 'settings.datamart.type.xdatamart',
    defaultMessage: 'Cross-Datamart',
  },
  serviceUsageReport: {
    id: 'settings.datamart.service_usage_report',
    defaultMessage: 'View Service Usage Report',
  },
  noData: {
    id: 'settings.datamart.no.data.service_usage_report',
    defaultMessage: 'There is no service usage report for this datamart.',
  },
  viewDatamartSources: {
    id: 'settings.datamart.datamartSources',
    defaultMessage: 'View Sources',
  },
});

export default messages;
