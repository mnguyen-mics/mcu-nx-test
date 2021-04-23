import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, StaticContext } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { message } from 'antd';
import { INITIAL_IMPORTS_FORM_DATA } from './domain';
import ImportEditForm from './ImportEditForm';
import { injectDrawer } from '../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';
import { Loading } from '../../../components/index';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import DatamartSelector from '../../Datamart/DatamartSelector';
import { Import } from '../../../models/imports/imports';
import { lazyInject } from '../../../config/inversify.config';
import { IImportService } from '../../../services/ImportService';
import { TYPES } from '../../../constants/types';
import { Link } from 'react-router-dom';

const messages = defineMessages({
  newImports: {
    id: 'imports.edit.newImport',
    defaultMessage: 'New Import',
  },
  imports: {
    id: 'imports.edit.title',
    defaultMessage: 'Imports',
  },
  editImports: {
    id: 'imports.edit.action.editImport',
    defaultMessage: 'Edit {name}',
  },
  updateSuccess: {
    id: 'imports.edit.save.successMessage',
    defaultMessage: 'Import successfully saved ',
  },
  updateError: {
    id: 'imports.edit.list.errorMessage',
    defaultMessage: 'Import update failed ',
  },
  savingInProgress: {
    id: 'imports.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
});

interface ImportEditPageState {
  importData: Partial<Import>;
  loading: boolean;
  selectedDatamart?: DatamartResource;
  shouldDisplayDatamartSelection: boolean;
}

type Props = InjectedDrawerProps &
  RouteComponentProps<{
    organisationId: string;
    datamartId: string;
    importId: string;
  }, StaticContext, { from?: string }> &
  InjectedIntlProps;

class ImportEditPage extends React.Component<Props, ImportEditPageState> {
  @lazyInject(TYPES.IImportService)
  private _importService: IImportService;
  constructor(props: Props) {
    super(props);
    this.state = {
      importData: INITIAL_IMPORTS_FORM_DATA,
      loading: true,
      selectedDatamart: undefined,
      shouldDisplayDatamartSelection: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, importId },
      },
    } = this.props;

    if (importId) {
      this.loadInitialValues(datamartId, importId);
    }
    this.setState({
      loading: false,
    });
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { datamartId, importId },
      },
    } = this.props;

    const {
      match: {
        params: { importId: previousImportId, datamartId: previousDatamartId },
      },
    } = previousProps;

    if (importId !== previousImportId || datamartId !== previousDatamartId) {
      this.setState({
        loading: true,
      });
      this.loadInitialValues(datamartId, importId);
    }
  }

  loadInitialValues = (datamartId: string, importId: string) => {
    this._importService
      .getImport(datamartId, importId)
      .then(importData => importData.data)
      .then(res => {
        this.setState({
          importData: res,
        });
      });
  };

  close = () => {
    const {
      history,
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url =
      location.state && location.state.from
        ? location.state.from
        : `/v2/o/${organisationId}/datastudio/imports`;

    return history.push(url);
  };

  save = (formData: Partial<Import>) => {
    const {
      history,
      match: {
        params: { importId, organisationId },
      },
      intl,
    } = this.props;

    const { importData, selectedDatamart } = this.state;

    this.setState({
      loading: true,
    });

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    if (importId && importData.datamart_id) {
      this._importService
        .updateImport(importData.datamart_id, importId, formData)
        .then(() => {
          redirectAndNotify(importId, importData.datamart_id);
        })
        .catch(err => {
          redirectAndNotify(undefined, undefined, err.error);
        });
    } else if (selectedDatamart) {
      this._importService
        .createImport(selectedDatamart.id, formData)
        .then(createdImport => {
          redirectAndNotify(createdImport.data.id, selectedDatamart.id);
        })
        .catch(err => {
          redirectAndNotify(undefined, undefined, err.error);
        });
    }

    const redirectAndNotify = (
      id?: string,
      selectedDatamartId?: string,
      customErrorMessage?: string,
    ) => {
      if (id) {
        hideSaveInProgress();
        message.success(intl.formatMessage(messages.updateSuccess));
        return history.push(
          `/v2/o/${organisationId}/datastudio/datamart/${selectedDatamartId}/imports/${id}`,
        );
      } else {
        hideSaveInProgress();
        this.setState({
          loading: false,
        });
        if (customErrorMessage) {
          message.error(
            `${intl.formatMessage(
              messages.updateError,
            )}: ${customErrorMessage}`,
          );
        } else {
          message.error(intl.formatMessage(messages.updateError));
        }
      }
    };
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamart: datamart,
      importData: {
        ...this.state.importData,
      },
      shouldDisplayDatamartSelection: false,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, importId },
      },
    } = this.props;
    const { loading, selectedDatamart } = this.state;

    const importName = importId
      ? formatMessage(messages.editImports, {
          name: this.state.importData.name
            ? this.state.importData.name
            : formatMessage(messages.imports),
        })
      : formatMessage(messages.newImports);
      
    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/datastudio/imports`}>{formatMessage(messages.imports)}</Link>,
      importName,
    ];

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    if (importId) {
      return (
        <ImportEditForm
          initialValues={this.state.importData}
          onSave={this.save}
          onClose={this.close}
          breadCrumbPaths={breadcrumbPaths}
        />
      );
    }

    return selectedDatamart ? (
      <ImportEditForm
        initialValues={this.state.importData}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
      />
    ) : (
      <DatamartSelector
        onSelect={this.onDatamartSelect}
        actionbarProps={{
          pathItems: breadcrumbPaths,
          formId: 'IMPORT',
          onClose: this.close,
        }}
      />
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
)(ImportEditPage);
