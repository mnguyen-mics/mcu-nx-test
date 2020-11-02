import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Card } from 'antd';
import moment from 'moment';
import { IUserActivitiesFunnelService } from '../../services/UserActivitiesFunnelService';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { FunnelFilter, FunnelTimeRange, FunnelResource } from '../../models/datamart/UserActivitiesFunnel';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { compose } from 'recompose';
import { debounce } from 'lodash';
import { EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
  updateSearch,
  parseSearch
} from '../../utils/LocationSearchHelper';
import { funnelMessages, FUNNEL_SEARCH_SETTING } from './Constants';
import { extractDatesFromProps } from './Utils';
import numeral from 'numeral';


interface StepDelta {
  step: number
  diff?: string;
  percentageOfSucceeded?: string;
}

interface State {
  isLoading: boolean;
  funnelData: FunnelResource;
  stepDelta: StepDelta[];
}

type FunnelProps = {
  datamartId: string;
  filter: FunnelFilter[];
  title: string;
}

type Props = FunnelProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<void>;

const getPercentage = (nbr: number, total: number): number => {
  return (nbr * 100) / total;
}

const valueFromPercentage = (percentage: number, drawerAreaHeight: number): number => {
  return (percentage * drawerAreaHeight) / 100;
}


class Funnel extends React.Component<Props, State> {
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;
  private _debounce = debounce;

  updateLocationSearch = (params: any) => {
    const {
      history
    } = this.props;

    const {
      location: { search: currentSearch, pathname }
    } = history;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, FUNNEL_SEARCH_SETTING),
    };
    history.push(nextLocation);
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      funnelData: {
        total: 0,
        steps: []
      },
      stepDelta: []
    }

    this.fetchData = this._debounce(this.fetchData.bind(this), 800);
  }

  componentDidMount() {
    const {
      datamartId,
      filter,
      history: { location: { search } }, } = this.props;
    const timeRange = extractDatesFromProps(search);
    if (filter.length > 0) this.fetchData(datamartId, filter, timeRange);
    window.addEventListener('resize', this.drawSteps.bind(this));
  }

  componentDidUpdate(prevProps: Props) {
    const {
      datamartId,
      location: { search }, } = this.props;
    const timeRange = extractDatesFromProps(search);
    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const funnelFilter = routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : {};
    if (prevProps.location.search !== search && funnelFilter.length > 0) {
      this.fetchData(datamartId, funnelFilter, timeRange);
    }
  }

  // listener cleanup
  componentWillUnmount() {
    window.removeEventListener('resize', this.drawSteps.bind(this))
  }

  fetchData = (datamartId: string, filter: FunnelFilter[], timeRange: FunnelTimeRange) => {
    this.setState({
      isLoading: true,
      stepDelta: [],
      funnelData: {
        total: 0,
        steps: []
      }
    });
    return this._userActivitiesFunnelService
      .getUserActivitiesFunnel(datamartId, filter, timeRange).then((response) => {

        // Enhance api data with last conversion step
        response.data.steps.push(response.data.steps[response.data.steps.length -  1]);

        this.setState({
          isLoading: false,
          funnelData: response.data
        }, () => {
          setTimeout(() => {
            this.drawSteps();
          });
        });
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          isLoading: false,
        });
      });;
  }

  drawSteps = () => {
    const { funnelData } = this.state;

    funnelData.steps.map((step, index) => {
      const start = index === 0 ? funnelData.total : funnelData.steps[index - 1].count;
      this.drawCanvas((funnelData.total - start), (funnelData.total - step.count), index + 1, funnelData.steps.length)
    });

  }

  drawCanvas = (startCount: number, endCount: number, stepNumber: number, totalSteps: number) => {
    const { funnelData } = this.state;
    const container = document.getElementById("container");
    const canvas: any = document.getElementById(`canvas_${stepNumber}`);

    const drawWidth = container && (container.offsetWidth / totalSteps);
    const drawerAreaHeight = 370;
    canvas.width = drawWidth || 0;

    const percentageStart = getPercentage(startCount, funnelData.total);
    const percentageEnd = getPercentage(endCount, funnelData.total);
    const stepStart = drawerAreaHeight && valueFromPercentage(percentageStart, drawerAreaHeight);
    const stepEnd = drawerAreaHeight && valueFromPercentage(percentageEnd, drawerAreaHeight);

    this.setStepDelta(stepNumber, percentageEnd, percentageStart);

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(0, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.strokeStyle = '#0ba6e1';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, stepStart && stepStart - 1);
    ctx.lineTo(drawWidth, stepEnd && stepEnd - 1);
    ctx.lineTo(drawWidth, 0);
    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.fill();
  }

  setStepDelta = (stepNumber: number, percentageEnd: number, percentageStart: number) => {
    const { funnelData } = this.state;
    this.setState(state => {
      state.stepDelta.push({
        step: stepNumber,
        diff: stepNumber === funnelData.steps.length ? (100 - percentageEnd).toFixed(2) : percentageEnd.toFixed(2),
        percentageOfSucceeded: stepNumber > 1 ? (100 - percentageStart).toFixed(2) : undefined
      })
      return {
        stepDelta: state.stepDelta
      }
    });
  }

  isLastStep = (stepNumber: number) => {
    const { funnelData } = this.state;
    return funnelData.steps.length === stepNumber;
  }

  render() {
    const { funnelData, stepDelta, isLoading } = this.state;
    const { title, intl } = this.props;
    if (isLoading) return (<LoadingChart />);

    return (
      <Card className="mcs-funnel">
        <div id="container" >
          <div className="mcs-funnel_header">
            <h1 className="mcs-funnel_header_title">{title}</h1>
          </div>
          {funnelData.steps.length === 0 ?
            <div className="mcs-funnel_empty">
              <EmptyChart title={intl.formatMessage(funnelMessages.noData)} icon='warning' />
            </div> :
            <div className="mcs-funnel_steps" >
              {funnelData.steps.map((step, index) => {
                return <div key={index.toString()} style={{ flex: 1 }} >
                  <div className={"mcs-funnel_stepName"}>
                    <h3 className="mcs-funnel_stepName_title">{index == 0 ? 'Total' : 'Step '+ index} </h3>
                    <p className="mcs-funnel_stepName_desc">{this.isLastStep(index + 1) ? '' : step.name}</p>
                  </div>
                  <div className={"mcs-funnel_userPoints"}>
                    <div className="mcs-funnel_userPoints_title">UserPoints</div>
                    <div className="mcs-funnel_userPoints_nbr">{numeral(index === 0 ? funnelData.total : funnelData.steps[index - 1].count).format('0,0')}</div>
                  </div>
                  <div className={"mcs-funnel_chart"}>
                    {(stepDelta[index] && stepDelta[index].percentageOfSucceeded) ? <div className="mcs-funnel_percentageOfSucceeded">
                      <div className="mcs-funnel_arrow mcs_funnel_arrowStep" />
                      <p className="mcs-funnel_stepInfo"><strong>{`${stepDelta[index].percentageOfSucceeded}%`}</strong> have succeeded in <strong>{moment.duration(funnelData.steps[index - 1].interaction_duration, "second").format("d [day] h [hour] m [minute]")}</strong></p>
                    </div> : ""}
                    {<canvas id={`canvas_${index + 1}`} className={"mcs-funnel_canvas"} height="370" />}
                    <div className="mcs-funnel_conversionInfo">
                      <div className={this.isLastStep(index + 1) ? "mcs-funnel_arrow mcs-funnel_arrow--success" : "mcs-funnel_arrow  mcs-funnel_arrow--failed"} />
                      <div className="mcs-funnel_stepInfo">
                        <b>{stepDelta[index] && `${stepDelta[index].diff}%`}</b><br />
                        <p>{this.isLastStep(index + 1) ? "Conversions" : "Dropoffs"}</p>
                      </div>
                    </div>

                  </div>
                </div>
              }
              )}
            </div>
          }
        </div>
      </Card >
    )
  }
}

export default compose<Props, FunnelProps>(
  injectNotifications,
  injectIntl,
  withRouter
)(Funnel);