import React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Field } from 'redux-form';
import { FormCodeSnippetProps } from '../../../../../../components/Form/FormCodeSnippet';
import { FieldCtor,FormCodeSnippet} from '../../../../../../components/Form';
import messages from '../../messages';

export interface PixelFormProps {
  datamartToken:string,
  userListTechName?:string
}

export interface PixelFormState {
}

type Props = PixelFormProps & InjectedIntlProps ;

class PixelSegmentSection extends React.Component<Props,PixelFormState>  {

  constructor(props:Props) {
    super(props);
    this.state =  {technicalName:''};
  }

  render() {

    const {
      intl: { formatMessage },
      datamartToken,
      userListTechName
    } = this.props;

    const CodeSnippetField  : FieldCtor<FormCodeSnippetProps> = Field;

    const codeSnippetFieldProps: FormCodeSnippetProps = {
      language: 'html',
      codeSnippet: '<img height="1" width="1" style="display:none"'+
      'src="https://api.mediarithmics.com/v1/user_lists/pixel?'+
      'dat_token='+datamartToken+'&'+
      'user_list_tech_name='+userListTechName+
      '">',
      formItemProps: {
        label: formatMessage(messages.contentSectionPropertiesPartRow1Label),
      },
      helpToolTipProps: {
        title: formatMessage(messages.contentSectionPropertiesPartRow1Tooltip),
      },
    };

    return(
      <div>
        <CodeSnippetField
          name={`pixel-snipet`}
          component={FormCodeSnippet}
          {...codeSnippetFieldProps}
        />
      </div>
    )
  }

}

export default injectIntl(PixelSegmentSection);