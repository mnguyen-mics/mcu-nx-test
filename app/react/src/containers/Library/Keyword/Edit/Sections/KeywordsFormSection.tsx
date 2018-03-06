import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Tag, Input, Tooltip, Icon } from 'antd';
import cuid from 'cuid';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import { FormSection } from '../../../../../components/Form';
import { RouteComponentProps, withRouter } from 'react-router';
import { WrappedFieldArrayProps } from 'redux-form';
import {
  ReduxFormChangeProps,
  FieldArrayModel,
} from '../../../../../utils/FormHelper';

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

interface KeywordResource {
  exclude?: boolean;
  expression: string;
  id?: string;
}

const CustomTag = Tag as any;

interface KeywordsFormSectionProps extends ReduxFormChangeProps {
  keywords: KeywordResource[];
}

type Props = KeywordsFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  WrappedFieldArrayProps<FieldArrayModel<KeywordResource>> &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

interface State {
  inputVisible: boolean;
  inputValue: string;
}

class KeywordsFormSection extends React.Component<Props, State> {
  input: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      inputVisible: false,
      inputValue: '',
    };
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = (e: any) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { fields } = this.props;
    const inputValue = this.state.inputValue;
    fields.push({
      key: cuid(),
      model: {
        expression: inputValue,
        exclude: false,
      },
    });
    this.setState({
      inputVisible: false,
      inputValue: '',
    });
  };

  saveInputRef = (input: any) => (this.input = input);

  render() {
    const { inputVisible, inputValue } = this.state;
    const { fields } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleKeywords}
        />

        <div>
          {fields.getAll() &&
            fields.getAll().length > 1 &&
            fields.getAll().map((field, index) => {
              const removeField = () => fields.remove(index);
              const isLongExpression =
                field.model.expression && field.model.expression.length > 20;
              const tagElem = (
                <Tag
                  key={field.model.id}
                  closable={index !== 0}
                  afterClose={removeField}
                >
                  {isLongExpression
                    ? `${field.model.expression.slice(0, 20)}...`
                    : field.model.expression}
                </Tag>
              );
              return isLongExpression ? (
                <Tooltip title={field.model.expression} key={field.model.id}>
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
              <Icon type="plus" /> New Keyword
            </CustomTag>
          )}
        </div>
      </div>
    );
  }
}

export default compose<Props, KeywordsFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(KeywordsFormSection);
