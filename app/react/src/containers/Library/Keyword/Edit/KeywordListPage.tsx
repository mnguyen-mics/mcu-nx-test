import * as React from 'react';
import { message } from 'antd';
import { compose } from 'recompose';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import KeywordListForm from './KeywordListForm';
import { withRouter, RouteComponentProps } from 'react-router';
import { KeywordListFormData } from './domain';
import { Loading } from '../../../../components/index';
import KeywordService from '../../../../services/Library/KeywordListsService';

const messages = defineMessages({
  editKeywordList: {
    id: 'edit.keywordList.form.button.save',
    defaultMessage: 'Edit Keyword List',
  },
  keywordList: {
    id: 'edit.keywordList.form.default.name.keywordList',
    defaultMessage: 'keyword list',
  },
  newKeywordList: {
    id: 'edit.keywordList.form.button.new.keywordList.',
    defaultMessage: 'New Keyword List',
  },
  keywordLists: {
    id: 'edit.keywordList.form.breadcrumb.keywordLists',
    defaultMessage: 'Keyword Lists',
  },
  keywordListSaved: {
    id: 'edit.keywordList.form.save.success',
    defaultMessage: 'Keyword List successfully saved.',
  },
});

interface KeywordListPageProps {}

interface KeywordListPageState {
  keywordListFormData: KeywordListFormData;
  isLoading: boolean;
}

type JoinedProps = KeywordListPageProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; keywordListId: string }>;

class KeywordListPage extends React.Component<
  JoinedProps,
  KeywordListPageState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      keywordListFormData: {},
      isLoading: false,
    }
  }

  componentDidMount() {
    const { match: { params: { keywordListId } } } = this.props;
    if (keywordListId) {
      KeywordService.getKeywordList(keywordListId)
        .then(resp => resp.data)
        .then(keywordListFormdata => {
          KeywordService.getKeywordListExpressions(keywordListFormdata.id)
            .then(res => res.data)
            .then(keywords => {
              this.setState({
                keywordListFormData: {
                  name: keywordListFormdata.name,
                  list_type: keywordListFormdata.list_type,
                  keywords: keywords
                },
              });
            });
        });
    }
  }

  save = (formData: KeywordListFormData) => {
    const {
      match: { params: { keywordListId, organisationId } },
      intl,
    } = this.props;
    formData.list_type = 'UNION';
    if (keywordListId) {
      KeywordService.saveKeywordList(keywordListId, formData).then(
        () => {
          this.close();
          message.success(intl.formatMessage(messages.keywordListSaved));
        },
      );
    } else {
      KeywordService.createKeywordList(organisationId, formData).then(
        () => {
          this.close();
          message.success(intl.formatMessage(messages.keywordListSaved));
        },
      );
    }
  };

  close = () => {
    const { history, match: { params: { organisationId } } } = this.props;

    const url = `/v2/o/${organisationId}/library/keywords`;

    return history.push(url);
  };

  render() {
    const {
      intl,
      match: { params: { organisationId, keywordListId } },
    } = this.props;
    const { keywordListFormData, isLoading } = this.state;
    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    } else {
      const keywordListName =
        keywordListId && keywordListFormData
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
