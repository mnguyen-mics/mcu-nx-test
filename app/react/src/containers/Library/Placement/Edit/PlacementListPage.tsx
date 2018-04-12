import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { message } from 'antd';

import {
  INITIAL_PLACECMENT_LIST_FORM_DATA,
  PlacementListFormData,
} from './domain';

import PlacementListService from '../../../../services/Library/PlacementListsService';

import PlacementListForm from './PlacementListForm';
import { injectDrawer } from '../../../../components/Drawer/index';
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { notifyError } from '../../../../state/Notifications/actions';
import { Loading } from '../../../../components/index';
import { createFieldArrayModel } from '../../../../utils/FormHelper';
import PlacementListFormService from './PlacementListFormService';

const messages = defineMessages({
  newPlacementList: {
    id: 'new.placement.list',
    defaultMessage: 'New Placement List',
  },
  placementList: {
    id: 'placement.list',
    defaultMessage: 'Placement List',
  },
  placements: {
    id: 'edit.placement.list.placements',
    defaultMessage: 'Placements',
  },
  editPlacementList: {
    id: 'edit.placement.list',
    defaultMessage: 'Edit {name}',
  },
  updateSuccess: {
    id: 'edit.placement.list.success.message',
    defaultMessage: 'Placement List successfully saved ',
  },
  updateError: {
    id: 'edit.placement.list.error.message',
    defaultMessage: 'Placement List update failed ',
  },
  savingInProgress: {
    id: 'form.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },
});

interface PlacementListPageProps {}

interface PlacementListPageState {
  placementList: PlacementListFormData;
  loading: boolean;
}

type Props = InjectDrawerProps &
  PlacementListPageProps &
  RouteComponentProps<{ organisationId: string; placementListId: string }> &
  InjectedIntlProps;

class PlacementListPage extends React.Component<Props, PlacementListPageState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      placementList: INITIAL_PLACECMENT_LIST_FORM_DATA,
      loading: false,
    };
  }

  componentDidMount() {
    const { match: { params: { placementListId } } } = this.props;
    if (placementListId) {
      PlacementListService.getPlacementList(placementListId)
        .then(placementListData => placementListData.data)
        .then(placementList => {
          PlacementListService.getPlacementDescriptors(placementListId)
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
              });
            });
        });
    }
  }

  close = () => {
    const { history, match: { params: { organisationId } } } = this.props;

    const url = `/v2/o/${organisationId}/library/placements`;

    return history.push(url);
  };

  save = (formData: PlacementListFormData) => {
    const {
      match: { params: { placementListId, organisationId } },
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
        : message.success(intl.formatMessage(messages.updateError));
    };
    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    PlacementListFormService.savePlacementList(
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
      match: { params: { organisationId, placementListId } },
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
        name: formatMessage(messages.placements),
        url: `/v2/o/${organisationId}/library/placements`,
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
