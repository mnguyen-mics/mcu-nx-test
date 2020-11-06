import * as React from 'react';
import { message } from 'antd';
import { compose } from 'recompose';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import DealListForm from './DealListForm';
import { withRouter, RouteComponentProps } from 'react-router';
import { DealListFormData, INITIAL_DEAL_LIST_FORM_DATA } from './domain';
import { Loading } from '../../../../components/index';
import { createFieldArrayModel } from '../../../../utils/FormHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TYPES } from '../../../../constants/types';
import { IDealListService } from '../../../../services/Library/DealListService';
import { lazyInject } from '../../../../config/inversify.config';
import { IDealListFormService } from './DealListFormService';

const messages = defineMessages({
  editDealList: {
    id: 'dealList.edit.actionbar.editDealList',
    defaultMessage: 'Edit {name}',
  },
  dealList: {
    id: 'dealList.edit.actionbar.breadCrumb.dealList',
    defaultMessage: 'Deal List',
  },
  newDealList: {
    id: 'dealList.edit.actionbar.newDealList.',
    defaultMessage: 'New Deal List',
  },
  dealLists: {
    id: 'dealList.edit.actionbar.breadCrumb.dealLists',
    defaultMessage: 'Deal Lists',
  },
  dealListSaved: {
    id: 'dealList.edit.save.successMessage',
    defaultMessage: 'Deal List successfully saved.',
  },
  savingInProgress: {
    id: 'dealList.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
});

interface DealListPageState {
  dealListFormData: DealListFormData;
  isLoading: boolean;
}

type JoinedProps = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; dealListId: string }> &
  InjectedNotificationProps;

class DealListPage extends React.Component<JoinedProps, DealListPageState> {
  @lazyInject(TYPES.IDealListService)
  private _dealsListService: IDealListService;

  @lazyInject(TYPES.IDealListFormService)
  private _dealListFormService: IDealListFormService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      dealListFormData: INITIAL_DEAL_LIST_FORM_DATA,
      isLoading: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, dealListId },
      },
    } = this.props;
    if (dealListId) {
      this._dealsListService
        .getDealList(organisationId, dealListId)
        .then(resp => resp.data)
        .then(dealListFormdata => {
          this._dealsListService
            .getDeals(organisationId, { deal_list_id: dealListFormdata.id })
            .then(r =>
              this.setState({
                isLoading: false,
                dealListFormData: {
                  ...dealListFormdata,
                  deals: r.data.map(d => createFieldArrayModel(d)),
                },
              }),
            );
        });
    } else {
      this.setState({ isLoading: false });
    }
  }

  save = (formData: DealListFormData) => {
    const {
      match: {
        params: { dealListId, organisationId },
      },
      intl,
      notifyError,
    } = this.props;

    const { dealListFormData: initialFormdata } = this.state;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      isLoading: true,
    });

    this._dealListFormService
      .saveDealList(organisationId, formData, initialFormdata, dealListId)
      .then(() => {
        hideSaveInProgress();
        this.close();
        message.success(intl.formatMessage(messages.dealListSaved));
      })
      .catch(err => {
        this.setState({ isLoading: false });
        notifyError(err);
        hideSaveInProgress();
      });
  };

  close = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/library/deallist`;

    return history.push(url);
  };

  render() {
    const {
      intl,
      match: {
        params: { organisationId, dealListId },
      },
    } = this.props;
    const { dealListFormData, isLoading } = this.state;
    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    } else {
      const dealListName =
        dealListId && dealListFormData
          ? intl.formatMessage(messages.editDealList, {
              name: dealListFormData.name
                ? dealListFormData.name
                : intl.formatMessage(messages.dealList),
            })
          : intl.formatMessage(messages.newDealList);
      const breadcrumbPaths = [
        {
          name: intl.formatMessage(messages.dealLists),
          path: `/v2/o/${organisationId}/library/deallist`,
        },
        {
          name: dealListName,
        },
      ];
      return (
        <DealListForm
          initialValues={this.state.dealListFormData}
          save={this.save}
          close={this.close}
          breadCrumbPaths={breadcrumbPaths}
        />
      );
    }
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  injectNotifications,
  withRouter,
)(DealListPage);
