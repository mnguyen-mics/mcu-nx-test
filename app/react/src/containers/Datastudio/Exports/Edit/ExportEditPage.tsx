import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { message } from 'antd';
import { INITIAL_EXPORTS_FORM_DATA, ExportFormData } from './domain';
import { IExportService } from '../../../../services/Library/ExportService';
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
import { IDatamartService } from '../../../../services/DatamartService';
import { EditContentLayout } from '../../../../components/Layout';
import DatamartSelector from '../../../Audience/Common/DatamartSelector';
import { Export } from '../../../../models/exports/exports';
import { DataResponse } from '../../../../services/ApiService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';

const messages = defineMessages({
  newExports: {
    id: 'exports.edit.newExport',
    defaultMessage: 'New Export',
  },
  exports: {
    id: 'exports.edit.title',
    defaultMessage: 'Exports',
  },
  editExports: {
    id: 'exports.edit.actionbar.editExprot',
    defaultMessage: 'Edit {name}',
  },
  updateSuccess: {
    id: 'exports.edit.successMessage',
    defaultMessage: 'Exports successfully saved ',
  },
  updateError: {
    id: 'exports.edit.list.errorMessage',
    defaultMessage: 'Exports update failed ',
  },
  savingInProgress: {
    id: 'exports.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
});

interface ExportEditPageState {
  export: ExportFormData;
  loading: boolean;
  selectedDatamart?: DatamartResource;
  shouldDisplayDatamartSelection: boolean;
}

type Props = InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string; exportId: string }> &
  InjectedIntlProps;

class ExportEditPage extends React.Component<Props, ExportEditPageState> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IExportService)
  private _exportService: IExportService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

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

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { exportId },
      },
    } = this.props;
    const {
      match: {
        params: { exportId: previousExportId },
      },
    } = previousProps;

    if (exportId !== previousExportId) {
      this.setState({
        loading: true,
      });
      this.loadInitialValues(exportId);
    }
  }

  loadInitialValues = (exportId: string) => {
    this._exportService
      .getExport(exportId)
      .then(exportData => exportData.data)
      .then(res => {
        return Promise.all([
          this._queryService.getQuery(res.datamart_id, res.query_id),
          this._datamartService.getDatamart(res.datamart_id),
        ]).then(q => {
          this.setState({
            export: {
              export: res,
              query: q[0].data,
            },
            selectedDatamart: q[1].data,
            shouldDisplayDatamartSelection: false,
            loading: false,
          });
        });
      });
  };

  close = () => {
    const {
      history,
      match: {
        params: { organisationId, exportId },
      },
    } = this.props;

    const url = exportId
      ? `/v2/o/${organisationId}/datastudio/exports/${exportId}`
      : `/v2/o/${organisationId}/datastudio/exports`;

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
          return this._queryService
                .updateQuery(
                  selectedDatamart!.id,
                  this.state.export.query.id,
                  formData.query,
                )
                .then(res => res.data);
        };

        return generateQuerySaveMethod().then((res: QueryResource) => {
          return this._exportService.updateExport(exportId, formData.export);
        });
      } else {
        const generateQuerySaveMethod = () => {
          return this._queryService
                .createQuery(selectedDatamart!.id, {
                  ...formData.query,
                  datamart_id: selectedDatamart!.id,
                  query_language: 'OTQL',
                })
                .then(res => res.data);
        };
        return generateQuerySaveMethod().then((res: QueryResource) => {
          return this._exportService.createExport(organisationId, {
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
        export: {
          ...this.state.export.export,
          output_format: 'JSON',
        },
        query: null,
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
        path: `/v2/o/${organisationId}/datastudio/exports`,
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
