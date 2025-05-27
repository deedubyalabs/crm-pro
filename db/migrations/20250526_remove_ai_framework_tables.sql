BEGIN;

DROP TABLE IF EXISTS public.agent_messages CASCADE;
DROP TABLE IF EXISTS public.agent_runs CASCADE;
DROP TABLE IF EXISTS public.agent_sessions CASCADE;
DROP TABLE IF EXISTS public.agent_team_members CASCADE;
DROP TABLE IF EXISTS public.team_collaboration_settings CASCADE;
DROP TABLE IF EXISTS public.team_conversation_messages CASCADE;
DROP TABLE IF EXISTS public.team_conversations CASCADE;
DROP TABLE IF EXISTS public.agent_teams CASCADE;
DROP TABLE IF EXISTS public.agent_memory_configurations CASCADE;
DROP TABLE IF EXISTS public.agent_storage_configurations CASCADE;
DROP TABLE IF EXISTS public.memory_operations CASCADE;
DROP TABLE IF EXISTS public.memory_sharing CASCADE;
DROP TABLE IF EXISTS public.memory_search_index CASCADE;
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.tool_secrets CASCADE;
DROP TABLE IF EXISTS public.tools CASCADE;
DROP TABLE IF EXISTS public.knowledge_sources CASCADE;
DROP TABLE IF EXISTS public.models CASCADE;
DROP TABLE IF EXISTS public.memory_configurations CASCADE;
DROP TABLE IF EXISTS public.storage_configurations CASCADE;
DROP TABLE IF EXISTS public.mcp_servers CASCADE;
DROP TABLE IF EXISTS public.langtrace_config CASCADE;

COMMIT;
