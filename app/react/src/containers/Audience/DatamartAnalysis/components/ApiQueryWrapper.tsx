import * as React from 'react';
import FormatData from './FormatData';

export interface ApiQueryWrapperProps {
    query: string;
    charts: any;
}

const apiResponse = {
    "status": "ok",
    "data": {
        "report_view": {
            "items_per_page": 100,
            "total_items": 3,
            "columns_headers": [
                "device_name",
                "user_point_count",
            ],
            "rows": [
                [
                    "Desktop",
                    60
                ],
                [
                    "Smartphone",
                    10
                ],
                [
                    "Tablet",
                    20
                ],
            ]
        }
    }
};

class ApiQueryWrapper extends React.Component<ApiQueryWrapperProps, {}> {
    render() {
        const { charts } = this.props;
        return (<FormatData apiResponse={apiResponse.data.report_view} charts={charts} />)
    }
}

export default ApiQueryWrapper;