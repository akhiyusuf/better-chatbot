-- Drop all tables to reset the database
DROP TABLE IF EXISTS "mcp_oauth_session" CASCADE;
DROP TABLE IF EXISTS "archive_item" CASCADE;
DROP TABLE IF EXISTS "mcp_server_tool_custom_instructions" CASCADE;
DROP TABLE IF EXISTS "mcp_server_custom_instructions" CASCADE;
DROP TABLE IF EXISTS "workflow_edge" CASCADE;
DROP TABLE IF EXISTS "workflow_node" CASCADE;
DROP TABLE IF EXISTS "chat_message" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "chat_thread" CASCADE;
DROP TABLE IF EXISTS "workflow" CASCADE;
DROP TABLE IF EXISTS "agent" CASCADE;
DROP TABLE IF EXISTS "archive" CASCADE;
DROP TABLE IF EXISTS "mcp_server" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Drop the drizzle migration table if it exists
DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;

SELECT 'All tables dropped successfully!' as status;