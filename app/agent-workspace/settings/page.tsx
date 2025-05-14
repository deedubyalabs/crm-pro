import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bot, Bell, Shield, Key, Mail, Zap } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage global settings for the agent workspace</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic settings for the agent workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input id="workspace-name" defaultValue="HomePro Agent Workspace" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-description">Workspace Description</Label>
                <Textarea
                  id="workspace-description"
                  defaultValue="Agent workspace for managing and monitoring HomePro One intelligent agents"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for the workspace interface</p>
                </div>
                <Switch id="dark-mode" />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure global AI settings for all agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Default AI Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-model">Default Model</Label>
                    <Select defaultValue="gpt-4o">
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Default Temperature</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="temperature" type="number" defaultValue="0.7" min="0" max="2" step="0.1" />
                      <span className="text-sm text-muted-foreground">0 = Deterministic, 2 = Creative</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Default Max Tokens</Label>
                    <Input id="max-tokens" type="number" defaultValue="4096" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="streaming">Enable Streaming by Default</Label>
                      <p className="text-sm text-muted-foreground">
                        Stream responses token by token instead of waiting for complete responses
                      </p>
                    </div>
                    <Switch id="streaming" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Rate Limiting</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="global-rate-limit">Global Rate Limit (requests per minute)</Label>
                    <Input id="global-rate-limit" type="number" defaultValue="100" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="per-agent-rate-limit">Per-Agent Rate Limit (requests per minute)</Label>
                    <Input id="per-agent-rate-limit" type="number" defaultValue="60" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enforce-rate-limits">Enforce Rate Limits</Label>
                      <p className="text-sm text-muted-foreground">
                        Block requests that exceed the configured rate limits
                      </p>
                    </div>
                    <Switch id="enforce-rate-limits" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Notification Triggers</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-errors">Agent Errors</Label>
                      <p className="text-sm text-muted-foreground">Notify when an agent encounters an error</p>
                    </div>
                    <Switch id="notify-errors" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-approvals">Pending Approvals</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when a task requires human approval to proceed
                      </p>
                    </div>
                    <Switch id="notify-approvals" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-status">Agent Status Changes</Label>
                      <p className="text-sm text-muted-foreground">Notify when an agent is activated or deactivated</p>
                    </div>
                    <Switch id="notify-status" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-usage">Usage Thresholds</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when token usage exceeds configured thresholds
                      </p>
                    </div>
                    <Switch id="notify-usage" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Input id="email-notifications" type="email" defaultValue="admin@homepro.com" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="browser-notifications">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications in the browser when you're using the application
                      </p>
                    </div>
                    <Switch id="browser-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="slack-notifications">Slack Integration</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to a Slack channel</p>
                    </div>
                    <Switch id="slack-notifications" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security settings for the agent workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Access Control</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-approval">Require Approval for Sensitive Actions</Label>
                      <p className="text-sm text-muted-foreground">
                        Require human approval for actions that modify customer data or financial records
                      </p>
                    </div>
                    <Switch id="require-approval" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="restrict-financial">Restrict Financial Operations</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit agent access to financial operations like creating invoices or recording payments
                      </p>
                    </div>
                    <Switch id="restrict-financial" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audit-logging">Enhanced Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all agent actions with detailed context for security auditing
                      </p>
                    </div>
                    <Switch id="audit-logging" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">API Security</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key-expiration">API Key Expiration (days)</Label>
                    <Input id="api-key-expiration" type="number" defaultValue="90" />
                    <p className="text-sm text-muted-foreground">Set to 0 for non-expiring keys (not recommended)</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ip-restrictions">IP Restrictions</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict API access to specific IP addresses or ranges
                      </p>
                    </div>
                    <Switch id="ip-restrictions" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="revoke-inactive">Auto-Revoke Inactive Keys</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically revoke API keys that haven't been used in 30 days
                      </p>
                    </div>
                    <Switch id="revoke-inactive" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
