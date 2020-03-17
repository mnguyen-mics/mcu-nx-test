import * as React from 'react';
import { ChannelResource } from '../../models/settings/settings';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { IChannelService } from '../../services/ChannelService';

export interface ChannelNameDisplayProps {
  datamartId: string;
  channelId: string;
  onLoad?: (channel?: ChannelResource) => void;
}

interface State {
  channel?: ChannelResource;
  loading: boolean;
}

export default class ChannelNameDisplay extends React.Component<
  ChannelNameDisplayProps,
  State
> {
  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  constructor(props: ChannelNameDisplayProps) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const { channelId, datamartId } = this.props;
    this.fetchChannel(datamartId, channelId);
  }

  componentWillReceiveProps(nextProps: ChannelNameDisplayProps) {
    const { channelId, datamartId } = this.props;

    const { channelId: nextChannelId, datamartId: nextDatamartId } = nextProps;

    if (channelId !== nextChannelId || datamartId !== nextDatamartId) {
      this.fetchChannel(nextDatamartId, nextChannelId);
    }
  }

  fetchChannel = (datamartId: string, channelId: string) => {
    this.setState({ loading: true });
    return this._channelService
      .getChannel(datamartId, channelId)
      .then(res => res.data)
      .then(res =>
        this.setState(
          { loading: false, channel: res },
          () => this.props.onLoad && this.props.onLoad(res),
        ),
      )
      .catch(() => this.setState({ loading: false }));
  };

  public render() {
    if (this.state.loading) {
      return <span />;
    }

    return this.state.channel ? (
      <span>{this.state.channel.name}</span>
    ) : (
      <span>{this.props.channelId}</span>
    );
  }
}
