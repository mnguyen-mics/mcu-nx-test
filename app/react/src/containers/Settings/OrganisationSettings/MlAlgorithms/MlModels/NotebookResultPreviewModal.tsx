import * as React from 'react';
import StandardModal from '../../../../../components/BlurredModal/StandardModal';
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

type JoinedProps = NotebookResultPreviewModalProps

export default class NotebookResultPreviewModal extends React.Component<JoinedProps, NotebookResultPreviewModalState> {

    constructor(props: JoinedProps) {
        super(props);
        this.state = initialState;
    }

    componentDidUpdate(prevProps: JoinedProps, prevState: NotebookResultPreviewModalState) {
        /*
        const { opened } = this.props;
        this.setState({ opened });
        */
       return;
    }

    render() {
        const { html, onClose, opened } = this.props;
        console.log("opened", opened);

        
        return (
            <StandardModal opened={opened} onClose={onClose}>
                <IframeSupport content={html} />;
            </StandardModal>
        );
    }
}