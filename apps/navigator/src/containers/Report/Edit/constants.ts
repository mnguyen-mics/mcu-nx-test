export const typeOptions = [
  { title: 'Display Campaign Performance Report', value: 'display_campaign_performance_report' },
  { title: 'Email Delivery Report', value: 'email_delivery_report' },
  { title: 'Conversion Performance Report', value: 'conversion_performance_report' },
  { title: 'Audience Segment Report', value: 'audience_segment_report' },
  { title: 'Conversion Attribution Performance', value: 'conversion_attribution_performance' },
];

export const linkedSelectOptions = [
  { label: 'Delivery ID', value: 'delivery_id' },
  { label: 'Channel', value: 'channel' },
  { label: 'Scenario ID', value: 'scenario_id' },
  { label: 'Campaign ID', value: 'campaign_id' },
  { label: 'Campaign Type', value: 'campaign_type' },
  { label: 'Sub campaign ID', value: 'sub_campaign_id' },
  { label: 'Ad group ID', value: 'ad_group_id' },
  { label: 'Message ID', value: 'message_id' },
  { label: 'Ad ID', value: 'ad_id' },
  { label: 'Creative ID', value: 'creative_id' },
  { label: 'Format', value: 'format' },
  { label: 'Media ID', value: 'media_id' },
  { label: 'Placement ID', value: 'placement_id' },
  { label: 'Display network ID', value: 'display_network_id' },
  { label: 'Publisher ID', value: 'publisher_id' },
  { label: 'Ad slot visibility', value: 'ad_slot_visibility' },
  { label: 'Context', value: 'context' },
  { label: 'User point ID', value: 'user_point_id' },
  { label: 'Vector ID', value: 'vector_id' },
  { label: 'Email hash', value: 'email_hash' },
  { label: 'Form factor', value: 'form_factor' },
  { label: 'OS', value: 'os' },
  { label: 'Browser', value: 'browser' },
  { label: 'Country', value: 'country' },
  { label: 'Admin1', value: 'admin1' },
  { label: 'Admin2', value: 'admin2' },
  { label: 'Targeted segments', value: 'targeted_segments' },
  { label: 'Exposed segments', value: 'exposed_segments' },
];

export const availableDimensions = [
  { label: 'Year', value: 'year' },
  { label: 'Month', value: 'month' },
  { label: 'Day of month', value: 'day_of_month' },
  { label: 'Hour', value: 'hour' },
  { label: 'Minute', value: 'minute' },
  { label: 'Second', value: 'second' },
  { label: 'Day', value: 'day' },
].concat(linkedSelectOptions);

export const selectPropsMetrics = {
  options: [
    { label: 'Count all', value: 'count_all' },
    { label: 'Avg duration', value: 'avg_duration' },
    { label: 'Min duration', value: 'min_duration' },
    { label: 'Max duration', value: 'max_duration' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Impressions', value: 'impressions' },
    { label: 'Clicks', value: 'clicks' },
    { label: 'Impressions cost', value: 'impressions_cost' },
    { label: 'Inventory cost', value: 'inventory_cost' },
    { label: 'Targeting cost', value: 'targeting_cost' },
    { label: 'Technical cost', value: 'technical_cost' },
    { label: 'Click price', value: 'click_price' },
    { label: 'Engagement duration sec', value: 'engagement_duration_sec' },
    { label: 'Engagement price', value: 'engagement_price' },
    { label: 'Email sent', value: 'email_sent' },
    { label: 'Email unsubscribed', value: 'email_unsubscribed' },
    { label: 'Email hard bounced', value: 'email_hard_bounced' },
    { label: 'Email soft bounced', value: 'email_soft_bounced' },
    { label: 'Email complaints', value: 'email_complaints' },
    { label: 'Uniq impressions', value: 'uniq_impressions' },
    { label: 'Uniq clicks', value: 'uniq_clicks' },
    { label: 'Uniq email sent', value: 'uniq_email_sent' },
    { label: 'Uniq email unsubscribed', value: 'uniq_email_unsubscribed' },
    { label: 'Uniq email hard bounced', value: 'uniq_email_hard_bounced' },
    { label: 'Uniq email soft bounced', value: 'uniq_email_soft_bounced' },
    { label: 'Uniq email complaints', value: 'uniq_email_complaints' },
    { label: 'CPM', value: 'cpm' },
    { label: 'CPC', value: 'cpc' },
    { label: 'CTR', value: 'ctr' },
    { label: 'Losing bids', value: 'losing_bids' },
    { label: 'Winning bid price', value: 'winning_bid_price' },
    { label: 'Avg winning bid price', value: 'avg_winning_bid_price' },
  ],
};
