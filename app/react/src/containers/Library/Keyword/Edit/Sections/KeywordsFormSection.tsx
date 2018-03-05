import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Tag, Input, Tooltip, Icon } from 'antd';

import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import {
  FormSection,
} from '../../../../../components/Form';
import { RouteComponentProps, withRouter } from 'react-router';
import { TagProps } from 'antd/lib/tag';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.keywordList.form.keywords.part.subtitle',
    defaultMessage: 'This is the subtitle part.',
  },
  sectionTitleKeywords: {
    id: 'edit.keywordList.form.keywords.part.title',
    defaultMessage: 'Keywords',
  },
  tootltipKeywordListName: {
    id: 'edit.keywordList.general.infos.tooltip.name',
    defaultMessage: 'Lorem Ipsum',
  },
});

const CustomTag = Tag as any;

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

interface State {
  tags: string[];
  inputVisible: boolean;
  inputValue: string;
}

class KeywordsFormSection extends React.Component<Props, State> {

  input: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      tags: ['Tag 1', 'Tag 2', 'Tag 3'],
      inputVisible: false,
      inputValue: '',
    };
  }

  handleClose = (removedTag: any) => () => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = (e: any) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = state.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
  };

  saveInputRef = (input: any) => (this.input = input);

  render() {

    const { tags, inputVisible, inputValue } = this.state;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleKeywords}
        />

        <div>
          {tags.map((tag, index) => {
            const isLongTag = tag.length > 20;
            const tagElem = (
              <Tag
                key={tag}
                closable={index !== 0}
                afterClose={this.handleClose(tag)}
              >
                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
              </Tag>
            );
            return isLongTag ? (
              <Tooltip title={tag} key={tag}>
                {tagElem}
              </Tooltip>
            ) : (
              tagElem
            );
          })}
          {inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 78 }}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
          )}
          {!inputVisible && (
            <CustomTag
              onClick={this.showInput}
              style={{ background: '#fff', borderStyle: 'dashed' }}
            >
              <Icon type="plus" /> New Tag
            </CustomTag>
          )}
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer, withRouter)(
  KeywordsFormSection,
);
