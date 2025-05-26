"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AgentService, Agent } from "@/lib/agent-service"
import { ToolService, Tool } from "@/lib/tool-service"
import { ModelService, Model } from "@/lib/model-service"


export default function ConfigurationTab() {
  const [proPilotAgent, setProPilotAgent] = useState<Agent | null>(null)
  const [allFetchedAgents, setAllFetchedAgents] = useState<Agent[]>([]) // New state for debugging
  const [models, setModels] = useState<Model[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [agentTools, setAgentTools] = useState<string[]>([]) // Stores IDs of tools assigned to the Pro-pilot agent
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const PRO_PILOT_AGENT_NAME = "Pro-pilot Assistant" // Assuming this is the name for the single Pro-pilot agent

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedAgents = await AgentService.getAgents()
        setAllFetchedAgents(fetchedAgents || []) // Store all fetched agents for debugging
        const proPilot = fetchedAgents?.find(agent => agent.name === PRO_PILOT_AGENT_NAME)
        setProPilotAgent(proPilot || null)

        const fetchedModels = await ModelService.getModels()
        setModels(fetchedModels || [])

        const fetchedTools = await ToolService.getTools()
        setTools(fetchedTools || [])

        if (proPilot) {
          const fetchedAgentTools = await AgentService.getAgentTools(proPilot.id)
          setAgentTools(fetchedAgentTools.map(tool => tool.id) || [])
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAgentUpdate = async () => {
    if (proPilotAgent) {
      setLoading(true)
      setError(null)
      try {
        const updatedAgent = await AgentService.updateAgent(proPilotAgent.id, {
          description: proPilotAgent.description,
          system_prompt: proPilotAgent.system_prompt, // Use snake_case
          model: proPilotAgent.model,
          status: proPilotAgent.status,
        })
        if (updatedAgent) {
          setProPilotAgent(updatedAgent)
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToolAccessChange = async (toolId: string, checked: boolean) => {
    if (!proPilotAgent) return

    setLoading(true)
    setError(null)
    try {
      let success: boolean
      if (checked) {
        success = await AgentService.assignToolToAgent(proPilotAgent.id, toolId)
      } else {
        success = await AgentService.removeToolFromAgent(proPilotAgent.id, toolId)
      }

      if (success) {
        setAgentTools((prev) =>
          checked ? [...prev, toolId] : prev.filter((id) => id !== toolId),
        )
      } else {
        throw new Error(`Failed to ${checked ? "assign" : "remove"} tool.`)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading configuration...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  {/* Temporary Debugging Info */}
  {!loading && !error && (
    <div className="p-4 border rounded-md bg-gray-50 text-sm text-gray-700 mb-4">
      <p><strong>Debug:</strong></p>
      <p>Fetched Agents (raw): {JSON.stringify(allFetchedAgents)}</p>
      <p>Found Pro-pilot (after find): {JSON.stringify(proPilotAgent)}</p>
      <p>PRO_PILOT_AGENT_NAME: {PRO_PILOT_AGENT_NAME}</p>
    </div>
  )}
  {/* End Temporary Debugging Info */}

  if (!proPilotAgent) {
    return <div className="text-center py-8 text-yellow-600">Pro-pilot Assistant agent not found. Please ensure it exists in the database.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pro-pilot Agent Configuration</CardTitle>
        <CardDescription>Configure the settings and behaviors of the main Pro-pilot AI Assistant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">General Settings</h3>
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input id="agent-name" value={proPilotAgent.name} onChange={(e) => setProPilotAgent({ ...proPilotAgent, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea id="agent-description" value={proPilotAgent.description} onChange={(e) => setProPilotAgent({ ...proPilotAgent, description: e.target.value })} rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="agent-status">Status</Label>
              <p className="text-sm text-muted-foreground">Toggle agent active/inactive status</p>
            </div>
            <Switch
              id="agent-status"
              checked={proPilotAgent.status === "active"}
              onCheckedChange={(checked) =>
                setProPilotAgent({ ...proPilotAgent, status: checked ? "active" : "inactive" })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">AI Model Configuration</h3>
          <div className="space-y-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select value={proPilotAgent.model} onValueChange={(value) => setProPilotAgent({ ...proPilotAgent, model: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.model_id}>
                    {model.name} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea id="system-prompt" value={proPilotAgent.system_prompt} onChange={(e) => setProPilotAgent({ ...proPilotAgent, system_prompt: e.target.value })} rows={5} />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tool Access</h3>
          <p className="text-sm text-muted-foreground">Manage which tools this agent can use.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-center space-x-2">
                <Switch
                  id={`tool-${tool.id}`}
                  checked={agentTools.includes(tool.id)}
                  onCheckedChange={(checked) => handleToolAccessChange(tool.id, checked)}
                />
                <Label htmlFor={`tool-${tool.id}`}>{tool.name} ({tool.status})</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={handleAgentUpdate}>Save Configuration</Button>
        </div>
      </CardContent>
    </Card>
  )
}
