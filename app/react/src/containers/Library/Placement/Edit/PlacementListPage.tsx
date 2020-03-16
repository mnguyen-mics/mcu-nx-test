import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { message } from 'antd';
import {
  INITIAL_PLACEMENT_LIST_FORM_DATA,
  PlacementListFormData,
} from './domain';
import PlacementListForm from './PlacementListForm';
import { injectDrawer } from '../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { notifyError } from '../../../../redux/Notifications/actions';
import { Loading } from '../../../../components/index';
import { createFieldArrayModel } from '../../../../utils/FormHelper';
import { lazyInject } from '../../../../config/inversify.config';
import { IPlacementListService } from '../../../../services/Library/PlacementListService';
import { TYPES } from '../../../../constants/types';
import { IPlacementListFormService } from './PlacementListFormService';

const messages = defineMessages({
  newPlacementList: {
    id: 'placement.placementList.edit.actionbar.newPlacementList',
    defaultMessage: 'New Placement List',
  },
  placementList: {
    id: 'placement.placementList.edit.actionbar.breadCrumb.placementList',
    defaultMessage: 'Placement List',
  },
  placementLists: {
    id: 'placement.placementList.edit.actionbar.breadCrumb.placementLists',
    defaultMessage: 'Placement Lists',
  },
  editPlacementList: {
    id: 'placement.placementList.edit.actionbar.editPlacementList',
    defaultMessage: 'Edit {name}',
  },
  updateSuccess: {
    id: 'placement.placementList.edit.successMessage',
    defaultMessage: 'Placement List successfully saved ',
  },
  updateError: {
    id: 'placement.placementList.edit.errorMessage',
    defaultMessage: 'Placement List update failed ',
  },
  savingInProgress: {
    id: 'placement.placementList.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
});

// Can't use Number.MAX_SAFE_INTEGER as it is greater than the Max value of an Int in Scala
const MAX_RESULTS = 1000000;

interface PlacementListPageProps {
  placementListFormData: PlacementListFormData;
}

interface PlacementListPageState {
  placementList: PlacementListFormData;
  loading: boolean;
}

type Props = InjectedDrawerProps &
  PlacementListPageProps &
  RouteComponentProps<{ organisationId: string; placementListId: string }> &
  InjectedIntlProps;

class PlacementListPage extends React.Component<Props, PlacementListPageState> {
  @lazyInject(TYPES.IPlacementListService)
  private _placementListService: IPlacementListService;

  @lazyInject(TYPES.IPlacementListFormService)
  private _placementListFormService: IPlacementListFormService;

  constructor(props: Props) {
    super(props);
    this.state = {
      placementList: INITIAL_PLACEMENT_LIST_FORM_DATA,
      loading: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { placementListId },
      },
    } = this.props;
    if (placementListId) {
      this.setState({
        loading: true,
      });
      this._placementListService
        .getPlacementList(placementListId)
        .then(placementListData => placementListData.data)
        .then(placementList => {
          this._placementListService
            .getPlacementDescriptors(placementListId, {
              first_result: 0,
              max_results: MAX_RESULTS,
            })
            .then(
              placementDescriptorListData => placementDescriptorListData.data,
            )
            .then(placementDescriptorList => {
              this.setState({
                placementList: {
                  name: placementList.name,
                  placementDescriptorList: placementDescriptorList.map(
                    placementDescriptor =>
                      createFieldArrayModel(placementDescriptor),
                  ),
                },
                loading: false,
              });
            });
        });
    }
  }

  close = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/library/placementlist`;

    return history.push(url);
  };

  save = (formData: PlacementListFormData) => {
    const {
      match: {
        params: { placementListId, organisationId },
      },
      intl,
    } = this.props;
    const { placementList: initialPlacementListData } = this.state;
    this.setState({
      loading: true,
    });
    const redirectAndNotify = (success: boolean = false) => {
      this.close();
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

    this._placementListFormService
      .savePlacementList(
        organisationId,
        formData,
        initialPlacementListData,
        placementListId,
      )
      .then(() => {
        redirectAndNotify(true);
      })
      .catch((err: any) => {
        redirectAndNotify();
        notifyError(err);
      });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId, placementListId },
      },
    } = this.props;
    const { placementList, loading } = this.state;

    const placementListName = placementListId
      ? formatMessage(messages.editPlacementList, {
          name: this.state.placementList.name
            ? this.state.placementList.name
            : formatMessage(messages.placementList),
        })
      : formatMessage(messages.newPlacementList);
    const breadcrumbPaths = [
      {
        name: formatMessage(messages.placementLists),
        path: `/v2/o/${organisationId}/library/placementlist`,
      },
      {
        name: placementListName,
      },
    ];

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
      <PlacementListForm
        initialValues={placementList}
        onSave={this.save}
        onClose={this.close}
        breadCrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
)(PlacementListPage);
