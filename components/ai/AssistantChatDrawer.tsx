"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Send, Brain, Loader2, PlusCircle, Trash2, Edit } from "lucide-react"
import { useAIContext } from "@/contexts/ai-context"
import { useChat, Message } from 'ai/react';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast" // Import toast

export default function AssistantChatDrawer() {
  const { isAssistantOpen, setAssistantOpen, entityType, entityId, currentConversationId, setCurrentConversationId } = useAIContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<any[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, reload, setInput } = useChat({
    api: '/api/ai/assistant-chat',
    body: {
      entityType,
      entityId,
      sessionId: currentConversationId,
    },
    onFinish: (message) => {
      console.log('Chat finished:', message);
      setEditingMessageId(null);
      fetchConversations();
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), role: "assistant", content: "Error: Could not connect to AI. Please try again." },
      ]);
      setEditingMessageId(null);
    },
  });

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/ai/conversations');
      if (!response.ok) {
        throw new Error(`Error fetching conversations: ${response.statusText}`);
      }
      const data = await response.json();
      setConversations(data);
      if (!currentConversationId && data.length > 0) {
        setCurrentConversationId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAssistantOpen) {
      fetchConversations();

      if (currentConversationId) {
        const fetchChatHistory = async () => {
          try {
            const response = await fetch(`/api/ai/chat-history?sessionId=${currentConversationId}`);
            if (!response.ok) {
              throw new Error(`Error fetching chat history: ${response.statusText}`);
            }
            const history: Message[] = await response.json();
            setMessages(history);
          } catch (error) {
            console.error("Failed to fetch chat history:", error);
            setMessages([{ id: uuidv4(), role: "assistant", content: "Error loading chat history." }]);
          }
        };
        fetchChatHistory();
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
      setCurrentConversationId(null);
      setEditingMessageId(null);
      setConversations([]);
    }
  }, [isAssistantOpen, entityType, entityId, currentConversationId, setMessages, setCurrentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setEditingMessageId(null);
    setIsRenaming(null);
    setNewTitle('');
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setMessages([]);
    setEditingMessageId(null);
    setIsRenaming(null);
    setNewTitle('');
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting conversation: ${response.statusText}`);
      }
      toast({ title: "Conversation deleted", description: "The conversation has been removed." });
      fetchConversations();
      if (currentConversationId === conversationId) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({ title: "Error", description: "Failed to delete conversation.", variant: "destructive" });
    }
  };

  const handleRenameConversation = async (conversationId: string) => {
    if (!newTitle.trim()) {
      toast({ title: "Input required", description: "Please enter a new title.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (!response.ok) {
        throw new Error(`Error renaming conversation: ${response.statusText}`);
      }
      toast({ title: "Conversation renamed", description: "The conversation title has been updated." });
      setIsRenaming(null);
      setNewTitle('');
      fetchConversations();
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      toast({ title: "Error", description: "Failed to rename conversation.", variant: "destructive" });
    }
  };

  const handleEditMessage = (messageToEdit: Message) => {
    setInput(messageToEdit.content);
    setEditingMessageId(messageToEdit.id);
    setMessages(messages.filter(msg => msg.id !== messageToEdit.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  return (
    <Sheet open={isAssistantOpen} onOpenChange={setAssistantOpen}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex flex-row items-center justify-between pr-6">
          <SheetTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" /> PROActive AI Assistant
          </SheetTitle>
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </SheetHeader>
        <div className="flex-1 flex flex-col overflow-hidden py-4">
          <div className="flex h-full">
            {/* Conversations List (Left Sidebar within the Sheet) */}
            <div className="w-1/4 border-r pr-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Conversations</h3>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No conversations yet.</p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                          conv.id === currentConversationId ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => handleSelectConversation(conv.id)}
                      >
                        {isRenaming === conv.id ? (
                          <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={() => handleRenameConversation(conv.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameConversation(conv.id);
                              }
                            }}
                            className="flex-1 mr-2"
                          />
                        ) : (
                          <span className="flex-1 truncate">{conv.title || "Untitled Chat"}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsRenaming(conv.id);
                              setNewTitle(conv.title || "");
                            }}
                          >
                            <Edit className="h-3 w-3" />
                            <span className="sr-only">Rename</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area (Right Section within the Sheet) */}
            <div className="flex-1 flex flex-col pl-4">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center text-muted-foreground text-sm">
                      {entityType && entityId
                        ? `PROActive AI is ready to assist with ${entityType} ID: ${entityId}.`
                        : "PROActive AI is ready to assist."}
                      <br />
                      Type your message below.
                    </div>
                  )}
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.role === "user" ? "/placeholder-user.jpg" : "/placeholder-logo.svg"} />
                          <AvatarFallback>{msg.role === "user" ? "You" : "AI"}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : msg.content.startsWith("Error:")
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-muted"
                          }`}
                        >
                          {msg.content}
                          <div className="flex items-center justify-between mt-1">
                            {msg.createdAt && (
                              <div className={`text-xs ${msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {format(msg.createdAt, 'p')}
                              </div>
                            )}
                            {msg.role === "user" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => handleEditMessage(msg)}
                              >
                                <Edit className="h-3 w-3" />
                                <span className="sr-only">Edit message</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && messages.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AI is typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>} disabled={isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleInputChange({ target: { value: "Suggest next steps for this opportunity." } } as React.ChangeEvent<HTMLInputElement>)}>
              Suggest next steps
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleInputChange({ target: { value: "Summarize the current conversation." } } as React.ChangeEvent<HTMLInputElement>)}>
              Summarize conversation
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleInputChange({ target: { value: "Draft an email to the client." } } as React.ChangeEvent<HTMLInputElement>)}>
              Draft email
            </Button>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-1">
          AI Connection Status: <span className="text-green-500">Connected</span>
        </div>
      </SheetContent>
    </Sheet>
  )
}
