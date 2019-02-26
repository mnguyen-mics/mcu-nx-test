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
import { IDealsListService } from '../../../../services/Library/DealListsService';
import { lazyInject } from '../../../../config/inversify.config';
import { IDealListFormService } from './DealListFormService';

const messages = defineMessages({
  editKeywordList: {
    id: 'edit.dealList.form.button.save',
    defaultMessage: 'Edit {name}',
  },
  dealList: {
    id: 'edit.dealList.form.default.name.dealList',
    defaultMessage: 'Deal List',
  },
  newDealList: {
    id: 'edit.dealList.form.button.new.dealList.',
    defaultMessage: 'New Deal List',
  },
  dealLists: {
    id: 'edit.dealList.form.breadcrumb.dealLists',
    defaultMessage: 'Deal Lists',
  },
  dealListSaved: {
    id: 'edit.dealList.form.save.success',
    defaultMessage: 'Deal List successfully saved.',
  },
  savingInProgress: {
    id: 'form.saving.in.progress',
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
  @lazyInject(TYPES.IDealsListService)
  private _dealsListService: IDealsListService;

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
      const keywordListName =
        dealListId && dealListFormData
          ? intl.formatMessage(messages.editKeywordList, {
              name: dealListFormData.name
                ? dealListFormData.name
                : intl.formatMessage(messages.dealList),
            })
          : intl.formatMessage(messages.newDealList);
      const breadcrumbPaths = [
        {
          name: intl.formatMessage(messages.dealLists),
          url: `/v2/o/${organisationId}/library/deallist`,
        },
        {
          name: keywordListName,
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
