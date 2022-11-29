import * as React from 'react';
import { injectIntl, WrappedComponentProps, defineMessages } from 'react-intl';
// TS Interface
import { message } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';
import { compose } from 'recompose';

const messages = defineMessages({
  pixelSectionCodeSnippetCopied: {
    id: 'pixel.section.codesnippetcopied',
    defaultMessage: 'Code snippet copied',
  },
  pixelSectionCodeSnippet: {
    id: 'pixel.section.codesnippet',
    defaultMessage: 'Code Snippet',
  },
  pixelSectionCodeSnippetIndication: {
    id: 'pixel.section.codesnippet.indication',
    defaultMessage: 'The code snippet to copy on your web page for custom intergration',
  },
  pixelSectionCodeSnippetTooltipHover: {
    id: 'pixel.section.codesnippet.tooltiphover',
    defaultMessage: 'Click to copy',
  },
  pixelSectionCodeSnippetCodeCopied: {
    id: 'pixel.section.codesnippet.code.copied',
    defaultMessage: 'Code snippet copied',
  },
});

export interface FormCodeSnippetProps extends FormFieldWrapperProps {
  language: string;
  codeSnippet: string;
  copyToClipboard?: boolean;
}

type Props = FormCodeSnippetProps & WrappedComponentProps;

const FormCodeSnippet: React.SFC<Props & WrappedFieldProps> = props => {
  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

  if (props.meta && props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta && props.meta.touched && props.meta.warning) validateStatus = 'warning';

  const handleOnClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    message.info(props.intl.formatMessage(messages.pixelSectionCodeSnippetCodeCopied));
  };

  const codeSnippetFieldProps = {
    formItemProps: {
      label: props.intl.formatMessage(messages.pixelSectionCodeSnippet),
    },
    helpToolTipProps: {
      title: props.intl.formatMessage(messages.pixelSectionCodeSnippetIndication),
    },
    hoverToolTipProps: {
      title: props.intl.formatMessage(messages.pixelSectionCodeSnippetTooltipHover),
    },
  };

  const content = (
    <SyntaxHighlighter language={props.language} style={docco} {...props.input}>
      {props.codeSnippet}
    </SyntaxHighlighter>
  );

  return (
    <div>
      <FormFieldWrapper
        help={props.meta && props.meta.touched && (props.meta.warning || props.meta.error)}
        helpToolTipProps={props.helpToolTipProps}
        hoverToolTipProps={props.hoverToolTipProps}
        validateStatus={validateStatus}
        {...codeSnippetFieldProps.formItemProps}
      >
        {props.copyToClipboard ? (
          <CopyToClipboard onCopy={handleOnClick} text={props.codeSnippet}>
            <div style={{ cursor: 'pointer' }}>{content}</div>
          </CopyToClipboard>
        ) : (
          content
        )}
      </FormFieldWrapper>
    </div>
  );
};

export default compose<Props, FormCodeSnippetProps>(injectIntl)(FormCodeSnippet);
