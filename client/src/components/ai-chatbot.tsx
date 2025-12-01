import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle,
  Plus,
  Settings,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
  Minimize2,
  Send,
  X,
  ChevronDown,
  Edit,
  Zap,
  Copy,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: "like" | "dislike";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  mode: "ask" | "agent" | "edit";
  model: string;
  messages: Message[];
  createdAt: Date;
}

const LLM_MODELS = [
  { id: "gpt-5", label: "GPT-5" },
  { id: "gpt-5-mini", label: "GPT-5 Mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "o3-mini", label: "O3 Mini" },
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [selectedMode, setSelectedMode] = useState<"ask" | "agent" | "edit">("ask");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get current session
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chatSessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(
          parsed.map((s: any) => ({
            ...s,
            messages: s.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
            createdAt: new Date(s.createdAt),
          }))
        );
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const scrollElement = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }, 100);
    }
  }, [currentSession?.messages]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(7),
      title: `Chat ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      mode: selectedMode,
      model: selectedModel,
      messages: [],
      createdAt: new Date(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setShowHistory(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId("");
    }
  };

  const handleUndo = () => {
    if (currentSession && currentSession.messages.length > 0) {
      const updatedSessions = sessions.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.slice(0, -1),
          };
        }
        return s;
      });
      setSessions(updatedSessions);
      toast({ title: "Undone", description: "Last message removed" });
    }
  };

  const handleFeedback = (messageId: string, feedback: "like" | "dislike") => {
    const updatedSessions = sessions.map((s) => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: s.messages.map((m) => {
            if (m.id === messageId) {
              return {
                ...m,
                feedback: m.feedback === feedback ? undefined : feedback,
              };
            }
            return m;
          }),
        };
      }
      return s;
    });
    setSessions(updatedSessions);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied", description: "Message copied to clipboard" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setInputValue("");
    setIsLoading(true);

    try {
      // Add user message
      const updatedSessions = sessions.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      });
      setSessions(updatedSessions);

      // Call OpenAI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          mode: selectedMode,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      const finalSessions = updatedSessions.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantMessage],
          };
        }
        return s;
      });
      setSessions(finalSessions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-40"
        data-testid="button-open-chatbot"
        title="Open AI Assistant"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    );
  }

  const chatWindowClass = isMaximized
    ? "fixed inset-4 md:inset-6"
    : "fixed bottom-6 right-6 w-96 h-[600px]";

  return (
    <Card
      className={`${chatWindowClass} flex flex-col shadow-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 z-40 overflow-hidden`}
      data-testid="chatbot-container"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {currentSession ? currentSession.model : "No chat selected"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Chat history"
            data-testid="button-show-chats"
          >
            <MessageCircle className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            onClick={handleNewChat}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="New chat"
            data-testid="button-new-chat"
          >
            <Plus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Settings"
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>

          {currentSession && (
            <button
              onClick={handleUndo}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
              title="Undo"
              data-testid="button-undo"
            >
              <RotateCcw className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title={isMaximized ? "Minimize" : "Maximize"}
            data-testid="button-maximize"
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Close"
            data-testid="button-close-chatbot"
          >
            <X className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-900">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
              Mode
            </label>
            <div className="flex gap-2">
              {[
                { id: "ask", label: "Ask", icon: MessageCircle },
                { id: "agent", label: "Agent", icon: Zap },
                { id: "edit", label: "Edit", icon: Edit },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    setSelectedMode(mode.id as "ask" | "agent" | "edit")
                  }
                  className={`text-xs px-3 py-1.5 rounded transition-colors font-medium flex items-center gap-1 ${
                    selectedMode === mode.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  data-testid={`button-mode-${mode.id}`}
                >
                  <mode.icon className="h-3 w-3" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
              Model
            </label>
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition"
                data-testid="button-model-dropdown"
              >
                <span>
                  {LLM_MODELS.find((m) => m.id === selectedModel)?.label}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showModelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 shadow-lg z-50">
                  {LLM_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedModel === model.id
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                      data-testid={`option-model-${model.id}`}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat History */}
      {showHistory && (
        <div className="border-b px-4 py-3 bg-gray-50 dark:bg-gray-900 max-h-48 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center py-2">
              No chats yet
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-2 rounded text-sm cursor-pointer transition-colors flex items-center justify-between group ${
                    currentSessionId === session.id
                      ? "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  data-testid={`button-chat-session-${session.id}`}
                >
                  <button
                    onClick={() => handleSelectSession(session.id)}
                    className="flex-1 text-left"
                  >
                    <div className="font-semibold truncate">{session.title}</div>
                    <div className="text-xs opacity-75">{session.model}</div>
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1 hover:bg-red-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      {!currentSession ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              No chat selected
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Click "New Chat" to start a conversation
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-4 overflow-hidden"
          data-testid="chat-messages-area"
        >
          {currentSession.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Start the conversation...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm group ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                    }`}
                    data-testid={`message-${msg.id}`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {msg.role === "assistant" && (
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() =>
                            handleFeedback(msg.id, "like")
                          }
                          className={`p-1 rounded transition-colors ${
                            msg.feedback === "like"
                              ? "bg-blue-700 text-blue-100"
                              : "hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                          }`}
                          title="Like"
                          data-testid={`button-like-${msg.id}`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() =>
                            handleFeedback(msg.id, "dislike")
                          }
                          className={`p-1 rounded transition-colors ${
                            msg.feedback === "dislike"
                              ? "bg-red-700 text-red-100"
                              : "hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                          }`}
                          title="Dislike"
                          data-testid={`button-dislike-${msg.id}`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleCopyMessage(msg.content)}
                          className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                          title="Copy"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-lg text-sm">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400 animate-bounce delay-100" />
                      <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400 animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      )}

      {/* Input Area */}
      {currentSession && (
        <div className="border-t px-4 py-3 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            <Input
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1 text-sm border-gray-300 dark:border-gray-600"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
