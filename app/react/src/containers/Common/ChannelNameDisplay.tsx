import * as React from 'react';
import ChannelService from '../../services/ChannelService'
import { ChannelResource } from '../../models/settings/settings';

export interface ChannelNameDisplayProps {
  datamartId: string;
  channelId: string;
}

interface State {
  channel?: ChannelResource;
  loading: boolean;
}

export default class ChannelNameDisplay extends React.Component<ChannelNameDisplayProps, State> {

  constructor(props: ChannelNameDisplayProps) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    const {
      channelId,
      datamartId
    } = this.props;
    this.fetchChannel(datamartId, channelId)
  }

  componentWillReceiveProps(nextProps: ChannelNameDisplayProps) {
    const {
      channelId,
      datamartId
    } = this.props;

    const {
      channelId: nextChannelId,
      datamartId: nextDatamartId
    } = nextProps;

    if (channelId !== nextChannelId || datamartId !== nextDatamartId) {
      this.fetchChannel(nextDatamartId, nextChannelId)
    }
  }

  fetchChannel = (datamartId: string, channelId: string) => {
    this.setState({ loading: true });
    return ChannelService.getChannel(datamartId, channelId).then(res => res.data).then(res => this.setState({ loading: false, channel: res }))
  }

  public render() {

    if (this.state.loading) {
      return <span />
    }

    return this.state.channel ? (
      <span>
        {this.state.channel.name}
      </span>
    ): <span>{this.props.channelId}</span>;
  }
}
