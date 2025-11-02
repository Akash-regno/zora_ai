-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create canvases table
create table public.canvases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nodes jsonb default '[]'::jsonb not null,
  edges jsonb default '[]'::jsonb not null
);

-- Enable Row Level Security
alter table public.canvases enable row level security;

-- Create policies
create policy "Users can view their own canvases"
  on public.canvases for select
  using (auth.uid() = user_id);

create policy "Users can insert their own canvases"
  on public.canvases for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own canvases"
  on public.canvases for update
  using (auth.uid() = user_id);

create policy "Users can delete their own canvases"
  on public.canvases for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index canvases_user_id_idx on public.canvases(user_id);
create index canvases_created_at_idx on public.canvases(created_at desc);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger on_canvas_updated
  before update on public.canvases
  for each row
  execute procedure public.handle_updated_at();
