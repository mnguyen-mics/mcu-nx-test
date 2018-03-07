import * as React from 'react';
import { message } from 'antd';
import { compose } from 'recompose';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import KeywordListForm from './KeywordListForm';
import { withRouter, RouteComponentProps } from 'react-router';
import { KeywordListFormData, INITIAL_KEYWORD_LIST_FORM_DATA } from './domain';
import { Loading } from '../../../../components/index';
import KeywordService from '../../../../services/Library/KeywordListsService';
import { createFieldArrayModel } from '../../../../utils/FormHelper';
import KeywordListFormService from './KeywordListFormService';

const messages = defineMessages({
  editKeywordList: {
    id: 'edit.keywordList.form.button.save',
    defaultMessage: 'Edit {name}',
  },
  keywordList: {
    id: 'edit.keywordList.form.default.name.keywordList',
    defaultMessage: 'keyword list',
  },
  newKeywordList: {
    id: 'edit.keywordList.form.button.new.keywordList.',
    defaultMessage: 'New Keywords List',
  },
  keywordLists: {
    id: 'edit.keywordList.form.breadcrumb.keywordLists',
    defaultMessage: 'Keywords Lists',
  },
  keywordListSaved: {
    id: 'edit.keywordList.form.save.success',
    defaultMessage: 'Keywords List successfully saved.',
  },
  savingInProgress: {
    id: 'form.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },
});

interface KeywordListPageProps {}

interface KeywordListPageState {
  keywordListFormData: KeywordListFormData;
  isLoading: boolean;
}

type JoinedProps = KeywordListPageProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; keywordsListId: string }>;

class KeywordListPage extends React.Component<
  JoinedProps,
  KeywordListPageState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      keywordListFormData: INITIAL_KEYWORD_LIST_FORM_DATA,
      isLoading: false,
    };
  }

  componentDidMount() {
    const { match: { params: { keywordsListId } } } = this.props;
    if (keywordsListId) {
      KeywordService.getKeywordList(keywordsListId)
        .then(resp => resp.data)
        .then(keywordListFormdata => {
          KeywordService.getKeywordListExpressions(keywordListFormdata.id)
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
              });
            });
        });
    }
  }

  save = (formData: KeywordListFormData) => {
    const {
      match: { params: { keywordsListId, organisationId } },
      intl,
    } = this.props;

    const { keywordListFormData: initialFormdata } = this.state;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      isLoading: true,
    });

    KeywordListFormService.saveKeywordList(
      organisationId,
      formData,
      initialFormdata,
      keywordsListId,
    ).then(() => {
      hideSaveInProgress();
      this.close();
      message.success(intl.formatMessage(messages.keywordListSaved));
    });
  };

  close = () => {
    const { history, match: { params: { organisationId } } } = this.props;

    const url = `/v2/o/${organisationId}/library/keywordslists`;

    return history.push(url);
  };

  render() {
    const {
      intl,
      match: { params: { organisationId, keywordsListId } },
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
          url: `/v2/o/${organisationId}/audience/partitions`,
        },
        {
          name: keywordListName,
        },
      ];
      return (
        <KeywordListForm
          initialValues={this.state.keywordListFormData}
          onSubmit={this.save}
          close={this.close}
          breadCrumbPaths={breadcrumbPaths}
        />
      );
    }
  }
}

export default compose<JoinedProps, KeywordListPageProps>(
  injectIntl,
  withRouter,
)(KeywordListPage);
