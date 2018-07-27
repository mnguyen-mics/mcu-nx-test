import * as React from 'react';
import cuid from 'cuid';
import { Row, Col, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

export interface ProfileInfoProps {
  profile?: any
}

interface State {
  showMore: boolean;
}

export default class ProfileInfo extends React.Component<ProfileInfoProps, State> {

  static defaultProps = {
    profile: {}
  }

  constructor(props: ProfileInfoProps) {
    super(props);
    this.state = {
      showMore: false,
    }
  }

  public render() {
    const { profile } = this.props;
    
    const convertedObjectToArray = Object.keys(profile).map(key => {
      return [key, profile[key]];
    });

    const profileFormatted =
      convertedObjectToArray.length > 5 && !this.state.showMore
        ? convertedObjectToArray.slice(0, 5)
        : convertedObjectToArray;

    const canViewMore = convertedObjectToArray.length > 5 ? true : false;

    const onViewMoreClick = (e: any) => {
      e.preventDefault();
      this.setState({ showMore: true });
    };

    const onViewLessClick = (e: any) => {
      e.preventDefault();
      this.setState({ showMore: false });
    };

    const hasItems = !!Object.keys(profile).length;

    const generateValues = (t: object) => Object.keys(t).map(k => [k, (t as any)[k]])

    const generateItems = (profileInfoSlice: [string, any], shouldSlide: boolean = false, margin: number = -5): React.ReactNode => {
      if (typeof profileInfoSlice[1] === 'string' || typeof profileInfoSlice[1] === 'number' || !profileInfoSlice[1]) {
        return (<Row gutter={10} key={cuid()} className={"table-line"} style={{ marginLeft: shouldSlide ? margin + 10 : margin }}>
        <Col className="table-left" span={12}>
          <Tooltip title={profileInfoSlice[0]}>{profileInfoSlice[0]}</Tooltip>
        </Col>
        <Col className="table-right" span={12}>
          <Tooltip title={profileInfoSlice[1] ? profileInfoSlice[1] : 'null'}>{profileInfoSlice[1] ? profileInfoSlice[1] : 'null'}</Tooltip>
        </Col>
      </Row>)
      }

      if (Array.isArray(profileInfoSlice[1])) {
        return  (<Row gutter={10} key={cuid()} className={"table-line"} style={{ marginLeft: shouldSlide ? margin + 10 : margin }}>
          <Col className="table-left" span={12}>
            <Tooltip title={profileInfoSlice[0]}>{profileInfoSlice[0]}</Tooltip>
          </Col>
          <Col className="table-right" span={12}>
            <Tooltip title={JSON.stringify(profileInfoSlice[1])}>{JSON.stringify(profileInfoSlice[1])}</Tooltip>
          </Col>
        </Row>)
      }

      return (
        <Row gutter={10} key={cuid()} className={"table-line"} style={{ marginLeft: shouldSlide ? margin + 10 : margin }}>
          <Col className="table-left" span={24}>
            <Tooltip title={profileInfoSlice[0]}>{profileInfoSlice[0]}:</Tooltip>
          </Col>
          <Col className={'p-l-10'} span={24}>
            {generateValues(profileInfoSlice[1] as any).map(item => {
              return generateItems(item as [string, any], true, margin + 10)
            })}
          </Col>
        </Row>
      )
    }

    return (
      <div>
        {profileFormatted &&
          profileFormatted.map(profil => {
            return generateItems(profil as any)
          })}
        {(profileFormatted.length === 0 || hasItems === false) && (
          <span>
            <FormattedMessage {...messages.emptyProfile} />
          </span>
        )}
        {canViewMore ? (
          !this.state.showMore ? (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
                onClick={onViewMoreClick}
              >
                <FormattedMessage {...messages.viewMore} />
              </button>
            </div>
          ) : (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
                onClick={onViewLessClick}
              >
                <FormattedMessage {...messages.viewLess} />
              </button>
            </div>
          )
        ) : null}
      </div>
    );
  }
}
