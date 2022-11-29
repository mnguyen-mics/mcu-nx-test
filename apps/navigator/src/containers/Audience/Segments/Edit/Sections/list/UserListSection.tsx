import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Field, GenericField } from 'redux-form';
import XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { FormDragAndDropProps } from '../../../../../../components/Form/FormDragAndDrop';
import { FormDragAndDrop, FormSection } from '../../../../../../components/Form';

import messages from '../../messages';

export interface UserListProps {
  segmentId: string;
}

const maxFileSize = 100 * 1024 * 1024; // 100 mb

type Props = UserListProps & WrappedComponentProps;

class UserListSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  downloadTemplateUserList = () => {
    const data = [
      {
        OPERATION: 'UPDATE',
        USER_AGENT_ID: 'vec:89998434',
        USER_ACCOUNT_ID: '',
        COMPARTMENT_ID: '1',
        COMPARTMENT_TOKEN: '',
        EMAIL_HASH: '',
        EXPIRATION_DURATION: '0',
        EXPIRATION_TS: '',
        DATA_BAG: '',
      },
      {
        OPERATION: 'DELETE',
        USER_AGENT_ID: 'web:321:abcd',
        USER_ACCOUNT_ID: '',
        COMPARTMENT_ID: '1',
        COMPARTMENT_TOKEN: '',
        EMAIL_HASH: '',
        EXPIRATION_DURATION: '0',
        EXPIRATION_TS: '',
        DATA_BAG: '',
      },
      {
        OPERATION: 'UPDATE',
        USER_AGENT_ID: 'tech:apx:123',
        USER_ACCOUNT_ID: '',
        COMPARTMENT_ID: '',
        COMPARTMENT_TOKEN: 'my_compartment',
        EMAIL_HASH: '',
        EXPIRATION_DURATION: '',
        EXPIRATION_TS: '6516511616516',
        DATA_BAG: '',
      },
      {
        OPERATION: 'UPDATE',
        USER_AGENT_ID: '',
        USER_ACCOUNT_ID: 'my user account',
        COMPARTMENT_ID: '',
        COMPARTMENT_TOKEN: 'my_compartment',
        EMAIL_HASH: '',
        EXPIRATION_DURATION: '10',
        EXPIRATION_TS: '',
        DATA_BAG: '{"distance_to_closest_store": 123}}',
      },
      {
        OPERATION: 'DELETE',
        USER_AGENT_ID: '',
        USER_ACCOUNT_ID: '',
        COMPARTMENT_ID: '',
        COMPARTMENT_TOKEN: '',
        EMAIL_HASH: 'my email hash',
        EXPIRATION_DURATION: '',
        EXPIRATION_TS: '0',
        DATA_BAG: '{"distance_to_closest_store": 123}}',
      },
    ];

    const workSheet = XLSX.utils.json_to_sheet(data);

    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet);

    const workBookOout = XLSX.write(workBook, {
      bookType: 'csv',
      type: 'binary',
    });

    const s2ab = (s: any) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i);
      return buf;
    };

    FileSaver.saveAs(
      new Blob([s2ab(workBookOout)], { type: 'application/octet-stream' }),
      'template_import_user_segment.csv',
    );
  };

  render() {
    const FormDragAndDropField = Field as new () => GenericField<FormDragAndDropProps>;

    const formDragAndDropProps: FormDragAndDropProps = {
      maxFileSize: maxFileSize,
      uploadTitle: messages.uploadTitle,
      uploadMessage: messages.uploadMessage,
      uploadError: messages.uploadError,
      fileMasks: '.csv,.tsv',
    };

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.downloadTemplate.id,
              message: messages.downloadTemplate,
              onClick: this.downloadTemplateUserList,
            },
          ]}
          title={messages.audienceSegmentSectionImportTitle}
          subtitle={messages.audienceSegmentSectionImportSubTitle}
        />
        <FormDragAndDropField
          name='userListFiles'
          component={FormDragAndDrop}
          {...formDragAndDropProps}
        />
      </div>
    );
  }
}

export default injectIntl(UserListSection);
