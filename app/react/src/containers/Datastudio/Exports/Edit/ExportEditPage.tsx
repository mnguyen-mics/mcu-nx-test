import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { message } from 'antd';

import { INITIAL_EXPORTS_FORM_DATA, ExportFormData } from './domain';

import ExportsService from '../../../../services/Library/ExportService';
import QueryService from '../../../../services/QueryService';

import ExportEditForm from './ExportEditForm';
import { injectDatamart } from '../../../Datamart/index';
import { injectDrawer } from '../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { notifyError } from '../../../../state/Notifications/actions';
import { Loading } from '../../../../components/index';
import {
  QueryResource,
  DatamartResource,
} from '../../../../models/datamart/DatamartResource';
import DatamartService from '../../../../services/DatamartService';
import { EditContentLayout } from '../../../../components/Layout';
import DatamartSelector from '../../../Audience/Common/DatamartSelector';
import { Export } from '../../../../models/exports/exports';
import { DataResponse } from '../../../../services/ApiService';

const messages = defineMessages({
  newExports: {
    id: 'form.new.export',
    defaultMessage: 'New Export',
  },
  exports: {
    id: 'edit.exports.title',
    defaultMessage: 'Exports',
  },
  editExports: {
    id: 'edit.exports',
    defaultMessage: 'Edit {name}',
  },
  updateSuccess: {
    id: 'edit.exports.success.message',
    defaultMessage: 'Exports successfully saved ',
  },
  updateError: {
    id: 'edit.exports.list.error.message',
    defaultMessage: 'Exports update failed ',
  },
  savingInProgress: {
    id: 'form.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },
});

interface ExportEditPageState {
  export: ExportFormData;
  loading: boolean;
  selectedDatamart?: DatamartResource;
  queryContainer?: any;
  shouldDisplayDatamartSelection: boolean;
}

type Props = InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string; exportId: string }> &
  InjectedIntlProps;

class ExportEditPage extends React.Component<Props, ExportEditPageState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      export: INITIAL_EXPORTS_FORM_DATA,
      loading: true,
      selectedDatamart: undefined,
      shouldDisplayDatamartSelection: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { exportId },
      },
    } = this.props;

    if (exportId) {
      this.loadInitialValues(exportId);
    } else {
      this.setState({
        loading: false,
      });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { exportId },
      },
    } = this.props;
    const {
      match: {
        params: { exportId: nextExportId },
      },
    } = nextProps;

    if (exportId !== nextExportId) {
      this.setState({
        loading: true,
      });
      this.loadInitialValues(nextExportId);
    }
  }

  loadInitialValues = (exportId: string) => {
    ExportsService.getExport(exportId)
      .then(exportData => exportData.data)
      .then(res => {
        return Promise.all([
          QueryService.getQuery(res.datamart_id, res.query_id),
          DatamartService.getDatamart(res.datamart_id),
        ]).then(q => {
          this.setState({
            export: {
              export: res,
              query:
                q[1].data.storage_model_version === 'v201506'
                  ? this.generateV1Query(q[1].data.id, q[0].data.id)
                  : q[0].data,
            },
            selectedDatamart: q[1].data,
            shouldDisplayDatamartSelection: false,
            loading: false,
          });
        });
      });
  };

  generateV1Query = (datamartId: string, queryId?: string) => {
    const QueryContainer = (window as any).angular
      .element(document.body)
      .injector()
      .get('core/datamart/queries/QueryContainer');
    const MyQueryContainer = queryId
      ? new QueryContainer(datamartId, queryId)
      : new QueryContainer(datamartId);
    if (queryId) MyQueryContainer.load();
    return MyQueryContainer;
  };

  close = () => {
    const {
      history,
      match: {
        params: { organisationId, exportId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/datastudio/exports/${exportId}`;

    return history.push(url);
  };

  save = (formData: ExportFormData) => {
    const {
      history,
      match: {
        params: { exportId, organisationId },
      },
      intl,
    } = this.props;

    const { selectedDatamart } = this.state;

    this.setState({
      loading: true,
    });
    const redirectAndNotify = (id?: string, success: boolean = false) => {
      if (success) {
        hideSaveInProgress();
        return history.push(`/v2/o/${organisationId}/datastudio/exports/${id}`);
      }

      this.setState({
        loading: false,
      });
      hideSaveInProgress();
      success
        ? message.success(intl.formatMessage(messages.updateSuccess))
        : message.error(intl.formatMessage(messages.updateError));
    };

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    const generatesSaveMethod = (): Promise<DataResponse<Export>> => {
      if (exportId) {
        const generateQuerySaveMethod = () => {
          return selectedDatamart!.storage_model_version === 'v201506'
            ? this.state.export.query.saveOrUpdate()
            : QueryService.updateQuery(
                selectedDatamart!.id,
                this.state.export.query.id,
                formData.query,
              ).then(res => res.data);
        };

        return generateQuerySaveMethod().then((res: QueryResource) => {
          return ExportsService.updateExport(exportId, formData.export);
        });
      } else {
        const generateQuerySaveMethod = () => {
          return selectedDatamart!.storage_model_version === 'v201506'
            ? this.state.export.query.saveOrUpdate()
            : QueryService.createQuery(selectedDatamart!.id, {
                ...formData.query,
                datamart_id: selectedDatamart!.id,
                query_language: 'OTQL',
              }).then(res => res.data);
        };
        return generateQuerySaveMethod().then((res: QueryResource) => {
          return ExportsService.createExport(organisationId, {
            ...formData.export,
            query_id: res.id,
          });
        });
      }
    };

    generatesSaveMethod()
      .then(res => {
        redirectAndNotify(res.data.id, true);
      })
      .catch((err: any) => {
        redirectAndNotify();
        notifyError(err);
      });
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamart: datamart,
      export: {
        ...this.state.export,
        query:
          datamart.storage_model_version === 'v201506'
            ? this.generateV1Query(datamart.id)
            : null,
      },
      shouldDisplayDatamartSelection: false,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, exportId },
      },
    } = this.props;
    const { loading, selectedDatamart } = this.state;

    const exportName = exportId
      ? formatMessage(messages.editExports, {
          name: this.state.export.export.name
            ? this.state.export.export.name
            : formatMessage(messages.exports),
        })
      : formatMessage(messages.newExports);
    const breadcrumbPaths = [
      {
        name: formatMessage(messages.exports),
        url: `/v2/o/${organisationId}/datastudio/exports`,
      },
      {
        name: exportName,
      },
    ];

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    if (exportId) {
      return (
        <ExportEditForm
          initialValues={this.state.export}
          onSave={this.save}
          onClose={this.close}
          breadCrumbPaths={breadcrumbPaths}
          datamart={selectedDatamart}
        />
      );
    }

    return selectedDatamart ? (
      <ExportEditForm
        initialValues={this.state.export}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
        datamart={selectedDatamart}
      />
    ) : (
      <EditContentLayout
        paths={breadcrumbPaths}
        formId="EXPORT"
        onClose={this.close}
      >
        <DatamartSelector onSelect={this.onDatamartSelect} />
      </EditContentLayout>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectDatamart,
)(ExportEditPage);
