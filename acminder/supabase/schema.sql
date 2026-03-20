-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Create schedule_items table
CREATE TABLE schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text CHECK (type IN ('shift', 'class', 'assignment')),
  title text NOT NULL,
  date date,
  start_time time,
  end_time time,
  location text,
  role text,
  repeats_weekly boolean DEFAULT false,
  due_date date,
  due_time time,
  course text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on schedule_items
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedule_items
CREATE POLICY "Users can view their own items" ON schedule_items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own items" ON schedule_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own items" ON schedule_items
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own items" ON schedule_items
  FOR DELETE USING (user_id = auth.uid());