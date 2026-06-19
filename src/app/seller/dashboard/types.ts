export interface EventRow {
  event_id: string;
  title: string;
  status: string;
  thumbnail: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
}
