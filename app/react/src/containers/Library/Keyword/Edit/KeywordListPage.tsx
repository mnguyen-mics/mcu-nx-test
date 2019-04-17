import * as React from 'react';
import { message } from 'antd';
import { compose } from 'recompose';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import KeywordListForm from './KeywordListForm';
import { withRouter, RouteComponentProps } from 'react-router';
import { KeywordListFormData, INITIAL_KEYWORD_LIST_FORM_DATA } from './domain';
import { Loading } from '../../../../components/index';
import { IKeywordListService } from '../../../../services/Library/KeywordListsService';
import {
  lazyInject,
} from '../../../../config/inversify.config';
import {
  TYPES,
} from '../../../../constants/types';
import { createFieldArrayModel } from '../../../../utils/FormHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { IKeywordListFormService } from './KeywordListFormService';

const messages = defineMessages({
  editKeywordList: {
    id: 'keywordList.edit.actionbar.editKeywordList',
    defaultMessage: 'Edit {name}',
  },
  keywordList: {
    id: 'keywordList.edit.actionbar.breadCrumb.keywordList',
    defaultMessage: 'keyword list',
  },
  newKeywordList: {
    id: 'keywordList.edit.actionbar.newKeywordList.',
    defaultMessage: 'New Keywords List',
  },
  keywordLists: {
    id: 'keywordList.edit.actionbar.breadcrumb.keywordLists',
    defaultMessage: 'Keywords Lists',
  },
  keywordListSaved: {
    id: 'keywordList.edit.save.successMessage',
    defaultMessage: 'Keywords List successfully saved.',
  },
  savingInProgress: {
    id: 'keywordList.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
});

interface KeywordListPageState {
  keywordListFormData: KeywordListFormData;
  isLoading: boolean;
}

type JoinedProps = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; keywordsListId: string }> &
  InjectedNotificationProps;

class KeywordListPage extends React.Component<
  JoinedProps,
  KeywordListPageState
> {
  
  @lazyInject(TYPES.IKeywordListService)
  private _keywordListService: IKeywordListService;
  
  @lazyInject(TYPES.IKeywordListFormService)
  private _keywordListFormService: IKeywordListFormService;
  
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      keywordListFormData: INITIAL_KEYWORD_LIST_FORM_DATA,
      isLoading: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { keywordsListId },
      },
    } = this.props;
    if (keywordsListId) {
      this.setState({
        isLoading: true,
      });
      this._keywordListService
        .getKeywordList(keywordsListId)
        .then(resp => resp.data)
        .then(keywordListFormdata => {
          this._keywordListService
            .getKeywordListExpressions(keywordListFormdata.id)
            .then(res => res.data)
            .then(keywords => {
              this.setState({
                keywordListFormData: {
                  name: keywordListFormdata.name,
                  list_type: keywordListFormdata.list_type,
                  keywords: keywords.map(keywordResource =>
                    createFieldArrayModel(keywordResource),
                  ),
                },
                isLoading: false,
              });
            });
        })
        .catch(err => {
          this.setState({
            isLoading: false,
          });
          this.props.notifyError(err);
        });
    }
  }

  save = (formData: KeywordListFormData) => {
    const {
      match: {
        params: { keywordsListId, organisationId },
      },
      intl,
      notifyError,
    } = this.props;

    const { keywordListFormData: initialFormdata } = this.state;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      isLoading: true,
    });

    this._keywordListFormService
      .saveKeywordList(
        organisationId,
        formData,
        initialFormdata,
        keywordsListId,
      )
      .then(() => {
        hideSaveInProgress();
        this.close();
        message.success(intl.formatMessage(messages.keywordListSaved));
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

    const url = `/v2/o/${organisationId}/library/keywordslist`;

    return history.push(url);
  };

  render() {
    const {
      intl,
      match: {
        params: { organisationId, keywordsListId },
      },
    } = this.props;
    const { keywordListFormData, isLoading } = this.state;
    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    } else {
      const keywordListName =
        keywordsListId && keywordListFormData
          ? intl.formatMessage(messages.editKeywordList, {
              name: keywordListFormData.name
                ? keywordListFormData.name
                : intl.formatMessage(messages.keywordList),
            })
          : intl.formatMessage(messages.newKeywordList);
      const breadcrumbPaths = [
        {
          name: intl.formatMessage(messages.keywordLists),
          url: `/v2/o/${organisationId}/library/keywordslist`,
        },
        {
          name: keywordListName,
        },
      ];
      return (
        <KeywordListForm
          initialValues={this.state.keywordListFormData}
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
)(KeywordListPage);
