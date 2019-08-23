import { UserProfileWithAccountId } from "../../../../models/timeline/timeline";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Row, Col, Tooltip, Tag } from "antd";
import cuid from "cuid";
import messages from "../messages";

export interface SingleProfileInfoProps {
    profileWithAccountId: UserProfileWithAccountId
}

interface State {
    showMore: boolean;
}

export default class SingleProfileInfo extends React.Component<SingleProfileInfoProps, State> {

    static defaultProps = {
        profileWithAccountId: {}
    }

    constructor(props: SingleProfileInfoProps) {
        super(props);
        this.state = {
            showMore: false,
        }
    }

    public render() {
        const { profileWithAccountId } = this.props;
        const { profile, userAccountId } = profileWithAccountId;

        const convertedObjectToArray = Object.keys(profile).map(key => {
            return [key, profile[key]];
        });

        const canViewMore = convertedObjectToArray.length > 5 ? true : false;

        const profileFormatted =
            convertedObjectToArray.length > 5 && !this.state.showMore
                ? convertedObjectToArray.slice(0, 5)
                : convertedObjectToArray;

        const onViewMoreClick = (e: any) => {
            e.preventDefault();
            this.setState({ showMore: true });
        };

        const onViewLessClick = (e: any) => {
            e.preventDefault();
            this.setState({ showMore: false });
        };

        const hasItems = !!Object.keys(profileWithAccountId.profile).length;

        const generateValues = (t: object) => {
            return Object.keys(t).map(k => [k, (t as any)[k]])
        }

        const generateItems = (profileInfoSlice: [string, any], shouldSlide: boolean = false, margin: number = -5): React.ReactNode => {
            if (typeof profileInfoSlice[1] === 'string' || typeof profileInfoSlice[1] === 'number' || typeof profileInfoSlice[1] === 'boolean') {
                const filteredInfoValue = String(profileInfoSlice[1]) || 'empty';
                return (<Row gutter={10} key={cuid()} className={"table-line"} style={{ marginLeft: shouldSlide ? margin + 10 : margin }}>
                    <Col className="table-left" span={12}>
                        <Tooltip title={profileInfoSlice[0]}>{profileInfoSlice[0]}</Tooltip>
                    </Col>
                    <Col className="table-right" span={12}>
                        <Tooltip title={filteredInfoValue}>{filteredInfoValue}</Tooltip>
                    </Col>
                </Row>)
            }

            if (Array.isArray(profileInfoSlice[1])) {
                return (<Row gutter={10} key={cuid()} className={"table-line"} style={{ marginLeft: shouldSlide ? margin + 10 : margin }}>
                    <Col className="table-left" span={12}>
                        <Tooltip title={profileInfoSlice[0]}>{profileInfoSlice[0]}</Tooltip>
                    </Col>
                    <Col className="table-right" span={12}>
                        <Tooltip title={JSON.stringify(profileInfoSlice[1])}>{JSON.stringify(profileInfoSlice[1])}</Tooltip>
                    </Col>
                </Row>)
            }

            if (!profileInfoSlice[1]) {
                return (
                    <Row gutter={10} key={cuid()} className={"table-line"} style={{ marginLeft: shouldSlide ? margin + 10 : margin }}>
                        <Col className="table-left" span={12}>
                            <Tooltip title={profileInfoSlice[0]}>{profileInfoSlice[0]}:</Tooltip>
                        </Col>
                        <Col className={'p-l-10'} span={12}>
                            <i>{JSON.stringify(profileInfoSlice[1])}</i>
                        </Col>
                    </Row>
                )
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
            <div className="single-profile-info">
                <div className="sub-title-2">
                    User Account Id: <br />
                    <Tooltip title={userAccountId}>
                        <Tag className="card-tag alone">{userAccountId}</Tag>
                    </Tooltip>
                </div>
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