import { DATE_SEARCH_SETTINGS, parseSearch } from '../../utils/LocationSearchHelper';
import { formatMcsDate, McsRange } from "../../utils/McsMoment";
import { FunnelDateRange } from "../../models/datamart/UserActivitiesFunnel";

interface FormattedDates {
  from: string,
  to: string
}
export const extractDatesFromProps = (search: string): FunnelDateRange => {
  const dateFilter: McsRange = parseSearch(search, DATE_SEARCH_SETTINGS);
  const formattedDates: FormattedDates = formatMcsDate(dateFilter, true);
  const timeRange = {
    type: "DATES",
    start_date: formattedDates.from,
    end_date: formattedDates.to
  }
  return timeRange;
}