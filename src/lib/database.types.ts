export type Database = {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  description: string;
  filename: string;
  status: 'pending' | 'approved' | 'rejected';
};
