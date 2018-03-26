import * as React from 'react';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Field } from 'redux-form';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FormCodeSnippetProps } from '../components/Form/FormCodeSnippet';
import { FieldCtor, FormCodeSnippet } from '../components/Form';

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
    defaultMessage:
      'The code snippet to copy on your web page for custom intergration',
  },
  pixelSectionCodeSnippetTooltipHover: {
    id: 'pixel.section.codesnippet.tooltiphover',
    defaultMessage: 'Click to copy',
  },
});

export interface PixelFormProps {
  datamartToken: string;
  userListTechName?: string;
  goalId?: string;
}

type Props = PixelFormProps & InjectedIntlProps;

class PixelSection extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      datamartToken,
      userListTechName,
      goalId,
    } = this.props;

    const CodeSnippetField: FieldCtor<FormCodeSnippetProps> = Field;

    const encodeSnippet = () => {
      let uri = '';
      if (userListTechName) {
        uri = `"https://api.mediarithmics.com/v1/user_lists/pixel?dat_token=${datamartToken}&user_list_tech_name=${encodeURIComponent(
          userListTechName || '',
        )}"`;
      } else if (goalId) {
        uri = `"events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=${datamartToken}&$goal_id=${goalId}"`;
      }

      return uri;
    };

    const handleOnClick = (e: React.ChangeEvent<HTMLInputElement>) => {
      message.info(formatMessage(messages.pixelSectionCodeSnippetCopied));
    };

    const codeSnippetFieldProps: FormCodeSnippetProps = {
      language: 'html',
      codeSnippet: `<img style="display:none" src=${encodeSnippet()}>`,
      formItemProps: {
        label: formatMessage(messages.pixelSectionCodeSnippet),
      },
      helpToolTipProps: {
        title: formatMessage(messages.pixelSectionCodeSnippetIndication),
      },
      hoverToolTipProps: {
        title: formatMessage(messages.pixelSectionCodeSnippetTooltipHover),
      },
    };

    return (
      <CopyToClipboard
        onCopy={handleOnClick}
        text={codeSnippetFieldProps.codeSnippet}
      >
        <div style={{ cursor: 'pointer' }}>
          <CodeSnippetField
            name={`pixel-snipet`}
            component={FormCodeSnippet}
            {...codeSnippetFieldProps}
          />
        </div>
      </CopyToClipboard>
    );
  }
}

export default injectIntl(PixelSection);
