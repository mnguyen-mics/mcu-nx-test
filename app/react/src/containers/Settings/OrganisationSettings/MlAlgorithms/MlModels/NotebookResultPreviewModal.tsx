import * as React from 'react';
import { Modal } from 'antd';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from './messages';
import IframeSupport from '../../../../Plugin/ConnectedFields/FormDataFile/HtmlEditor/IframeSupport';


export interface NotebookResultPreviewModalProps {
    html: string;
    opened: boolean;
    onClose: () => void;
}

interface NotebookResultPreviewModalState {
    opened: boolean;
}

const initialState = {
    opened: false
}

type JoinedProps = NotebookResultPreviewModalProps & InjectedIntlProps

class NotebookResultPreviewModal extends React.Component<JoinedProps, NotebookResultPreviewModalState> {

    constructor(props: JoinedProps) {
        super(props);
        this.state = initialState;
    }

    render() {
        const { html, onClose, opened, intl } = this.props;
        
        return (
            <Modal
                title={intl.formatMessage(messages.previewModalTitle)}
                visible={opened}
                onOk={onClose}
                okText={intl.formatMessage(messages.closeModal)}
                width={1280}
            >
                <IframeSupport content={html} />
            </Modal>
        );
    }
}

export default injectIntl(NotebookResultPreviewModal)