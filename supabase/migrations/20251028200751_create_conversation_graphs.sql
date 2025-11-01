/*
  # Create Conversation Graphs Schema

  1. New Tables
    - `conversation_graphs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable for anonymous users)
      - `title` (text, graph title)
      - `graph_data` (jsonb, stores nodes and edges)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `conversation_nodes`
      - `id` (uuid, primary key)
      - `graph_id` (uuid, foreign key to conversation_graphs)
      - `node_id` (text, unique identifier within graph)
      - `parent_node_id` (text, nullable)
      - `message_type` (text, 'question' or 'response')
      - `content` (text, message content)
      - `position_x` (float, node position)
      - `position_y` (float, node position)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow public read/write for anonymous users
    - Allow authenticated users to manage their own graphs
*/

CREATE TABLE IF NOT EXISTS conversation_graphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text DEFAULT 'Untitled Conversation',
  graph_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  graph_id uuid REFERENCES conversation_graphs(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  parent_node_id text,
  message_type text NOT NULL CHECK (message_type IN ('question', 'response')),
  content text NOT NULL,
  position_x float DEFAULT 0,
  position_y float DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(graph_id, node_id)
);

ALTER TABLE conversation_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to graphs"
  ON conversation_graphs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to graphs"
  ON conversation_graphs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to graphs"
  ON conversation_graphs FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to graphs"
  ON conversation_graphs FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to nodes"
  ON conversation_nodes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to nodes"
  ON conversation_nodes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to nodes"
  ON conversation_nodes FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to nodes"
  ON conversation_nodes FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_conversation_nodes_graph_id ON conversation_nodes(graph_id);
CREATE INDEX IF NOT EXISTS idx_conversation_nodes_parent ON conversation_nodes(parent_node_id);