import * as React from 'react';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Field } from 'redux-form';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FormCodeSnippetProps } from '../../../../../../components/Form/FormCodeSnippet';
import { FieldCtor, FormCodeSnippet } from '../../../../../../components/Form';
import messages from '../../messages';

export interface PixelFormProps {
  datamartToken: string;
  userListTechName?: string;
}

type Props = PixelFormProps & InjectedIntlProps;

class PixelSegmentSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state =  {technicalName:''};
  }

  render() {
    const {
      intl: { formatMessage },
      datamartToken,
      userListTechName,
    } = this.props;

    const CodeSnippetField: FieldCtor<FormCodeSnippetProps> = Field;

    const encodeSnippet = () => {
      const uri = `"https://api.mediarithmics.com/v1/user_lists/pixel?dat_token=${datamartToken}&user_list_tech_name=${encodeURIComponent(userListTechName || '')}"`;

      return uri;
    };

    const handleOnClick = (e: React.ChangeEvent<HTMLInputElement>) => {
      message.info(formatMessage(messages.contentSectionPropertiesPartRow1TooltipSnippetCopied));
    };

    const codeSnippetFieldProps: FormCodeSnippetProps = {
      language: 'html',
      codeSnippet: `<img style="display:none" src=${encodeSnippet()}>`,
      formItemProps: {
        label: formatMessage(messages.contentSectionPropertiesPartRow1Label),
      },
      helpToolTipProps: {
        title: formatMessage(messages.contentSectionPropertiesPartRow1Tooltip),
      },
      hoverToolTipProps: {
        title: formatMessage(
          messages.contentSectionPropertiesPartRow1TooltipHover,
        ),
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

export default injectIntl(PixelSegmentSection);
