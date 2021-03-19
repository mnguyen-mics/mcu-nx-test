import * as React from 'react';
import { Modal, Spin } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FormattedMessage } from 'react-intl';
import { DataResponse } from '../../../services/ApiService';
import { QueryResource } from '../../../models/datamart/DatamartResource';
import injectNotifications, { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import { compose } from 'recompose';
import Code from '../../../components/Renderers/Code';

export interface Convert2OtqlProps extends ModalProps {
  convertQuery: () => Promise<DataResponse<QueryResource>>;
}

type Props = Convert2OtqlProps & InjectedNotificationProps;

interface State {
  loading: boolean;
  query?: QueryResource
}

class Convert2Otql extends React.Component<Props, State> {

  constructor(props:Props) {
    super(props);
    this.state = {
      loading: true,
    }
  }
  

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    const {
      convertQuery,
      notifyError
    } = this.props;

    this.setState({ loading: true, query: undefined })
    convertQuery()
      .then((q) => {
        this.setState({ query: q.data, loading: false })
      })
      .catch((e) => {
        notifyError(e)
      })
  }

  render() {
    const { onOk, visible, ...modalProps } = this.props;
    const {query, loading} = this.state

    return (
      <Modal
        {...modalProps}
        visible={visible}
        onOk={onOk}
        title={
          <FormattedMessage
            id="queryTool.query-tool-modal-saveas-export-title"
            defaultMessage="Save As Export"
          />
        }
      >
        { loading ? <Spin size={"small"} /> : undefined }
        {query ? <Code language="otql" value={query.query_text} /> : undefined}
      </Modal>
    );
  }
}

export default compose<Props, Convert2OtqlProps>(
  injectNotifications
)(Convert2Otql);
