-- Better Chatbot Database Schema Setup for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"image" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"preferences" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

-- Create chat_thread table
CREATE TABLE IF NOT EXISTS "chat_thread" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create chat_message table
CREATE TABLE IF NOT EXISTS "chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" uuid NOT NULL,
	"role" text NOT NULL,
	"parts" json[],
	"attachments" json[],
	"annotations" json[],
	"model" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create account table (for OAuth)
CREATE TABLE IF NOT EXISTS "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);

-- Create session table
CREATE TABLE IF NOT EXISTS "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

-- Create verification table
CREATE TABLE IF NOT EXISTS "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);

-- Create mcp_server table
CREATE TABLE IF NOT EXISTS "mcp_server" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"config" json NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create mcp_server_custom_instructions table
CREATE TABLE IF NOT EXISTS "mcp_server_custom_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mcp_server_id" uuid NOT NULL,
	"prompt" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "mcp_server_custom_instructions_user_id_mcp_server_id_unique" UNIQUE("user_id","mcp_server_id")
);

-- Create mcp_server_tool_custom_instructions table
CREATE TABLE IF NOT EXISTS "mcp_server_tool_custom_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tool_name" text NOT NULL,
	"mcp_server_id" uuid NOT NULL,
	"prompt" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "mcp_server_tool_custom_instructions_user_id_tool_name_mcp_server_id_unique" UNIQUE("user_id","tool_name","mcp_server_id")
);

-- Create workflow table
CREATE TABLE IF NOT EXISTS "workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text DEFAULT '0.1.0' NOT NULL,
	"name" text NOT NULL,
	"icon" json,
	"description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create workflow_node table
CREATE TABLE IF NOT EXISTS "workflow_node" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text DEFAULT '0.1.0' NOT NULL,
	"workflow_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"ui_config" json DEFAULT '{}'::json,
	"node_config" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create workflow_edge table
CREATE TABLE IF NOT EXISTS "workflow_edge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text DEFAULT '0.1.0' NOT NULL,
	"workflow_id" uuid NOT NULL,
	"source" uuid NOT NULL,
	"target" uuid NOT NULL,
	"ui_config" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create agent table
CREATE TABLE IF NOT EXISTS "agent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" json,
	"user_id" uuid NOT NULL,
	"instructions" json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create archive table
CREATE TABLE IF NOT EXISTS "archive" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create archive_item table
CREATE TABLE IF NOT EXISTS "archive_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archive_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create mcp_oauth_session table
CREATE TABLE IF NOT EXISTS "mcp_oauth_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mcp_server_id" uuid NOT NULL,
	"server_url" text NOT NULL,
	"client_info" json,
	"tokens" json,
	"code_verifier" text,
	"state" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "mcp_oauth_session_mcp_server_id_unique" UNIQUE("mcp_server_id")
);

-- Add foreign key constraints
DO $$ 
BEGIN
	-- chat_thread foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_thread_user_id_user_id_fk') THEN
		ALTER TABLE "chat_thread" ADD CONSTRAINT "chat_thread_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
	END IF;

	-- chat_message foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_message_thread_id_chat_thread_id_fk') THEN
		ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_thread_id_chat_thread_id_fk" 
		FOREIGN KEY ("thread_id") REFERENCES "public"."chat_thread"("id") ON DELETE no action ON UPDATE no action;
	END IF;

	-- account foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_user_id_user_id_fk') THEN
		ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- session foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_user_id_user_id_fk') THEN
		ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- mcp_server_custom_instructions foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mcp_server_custom_instructions_user_id_user_id_fk') THEN
		ALTER TABLE "mcp_server_custom_instructions" ADD CONSTRAINT "mcp_server_custom_instructions_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mcp_server_custom_instructions_mcp_server_id_mcp_server_id_fk') THEN
		ALTER TABLE "mcp_server_custom_instructions" ADD CONSTRAINT "mcp_server_custom_instructions_mcp_server_id_mcp_server_id_fk" 
		FOREIGN KEY ("mcp_server_id") REFERENCES "public"."mcp_server"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- mcp_server_tool_custom_instructions foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mcp_server_tool_custom_instructions_user_id_user_id_fk') THEN
		ALTER TABLE "mcp_server_tool_custom_instructions" ADD CONSTRAINT "mcp_server_tool_custom_instructions_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mcp_server_tool_custom_instructions_mcp_server_id_mcp_server_id_fk') THEN
		ALTER TABLE "mcp_server_tool_custom_instructions" ADD CONSTRAINT "mcp_server_tool_custom_instructions_mcp_server_id_mcp_server_id_fk" 
		FOREIGN KEY ("mcp_server_id") REFERENCES "public"."mcp_server"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- workflow foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_user_id_user_id_fk') THEN
		ALTER TABLE "workflow" ADD CONSTRAINT "workflow_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- workflow_node foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_node_workflow_id_workflow_id_fk') THEN
		ALTER TABLE "workflow_node" ADD CONSTRAINT "workflow_node_workflow_id_workflow_id_fk" 
		FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- workflow_edge foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_edge_workflow_id_workflow_id_fk') THEN
		ALTER TABLE "workflow_edge" ADD CONSTRAINT "workflow_edge_workflow_id_workflow_id_fk" 
		FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_edge_source_workflow_node_id_fk') THEN
		ALTER TABLE "workflow_edge" ADD CONSTRAINT "workflow_edge_source_workflow_node_id_fk" 
		FOREIGN KEY ("source") REFERENCES "public"."workflow_node"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workflow_edge_target_workflow_node_id_fk') THEN
		ALTER TABLE "workflow_edge" ADD CONSTRAINT "workflow_edge_target_workflow_node_id_fk" 
		FOREIGN KEY ("target") REFERENCES "public"."workflow_node"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- agent foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_user_id_user_id_fk') THEN
		ALTER TABLE "agent" ADD CONSTRAINT "agent_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
	END IF;

	-- archive foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'archive_user_id_user_id_fk') THEN
		ALTER TABLE "archive" ADD CONSTRAINT "archive_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- archive_item foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'archive_item_archive_id_archive_id_fk') THEN
		ALTER TABLE "archive_item" ADD CONSTRAINT "archive_item_archive_id_archive_id_fk" 
		FOREIGN KEY ("archive_id") REFERENCES "public"."archive"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'archive_item_user_id_user_id_fk') THEN
		ALTER TABLE "archive_item" ADD CONSTRAINT "archive_item_user_id_user_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
	END IF;

	-- mcp_oauth_session foreign keys
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mcp_oauth_session_mcp_server_id_mcp_server_id_fk') THEN
		ALTER TABLE "mcp_oauth_session" ADD CONSTRAINT "mcp_oauth_session_mcp_server_id_mcp_server_id_fk" 
		FOREIGN KEY ("mcp_server_id") REFERENCES "public"."mcp_server"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "workflow_node_kind_idx" ON "workflow_node" USING btree ("kind");
CREATE INDEX IF NOT EXISTS "archive_item_item_id_idx" ON "archive_item" USING btree ("item_id");
CREATE INDEX IF NOT EXISTS "mcp_oauth_data_server_id_idx" ON "mcp_oauth_session" USING btree ("mcp_server_id");
CREATE INDEX IF NOT EXISTS "mcp_oauth_data_state_idx" ON "mcp_oauth_session" USING btree ("state");

-- Success message
SELECT 'Database schema setup completed successfully!' as status;