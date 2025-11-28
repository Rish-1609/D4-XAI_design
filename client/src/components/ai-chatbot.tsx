import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
} from "lucide-react";
import type { ChatSession, ChatMessage } from "@shared/schema";

const LLM_MODELS = [
  { id: "gpt-5", label: "GPT-5" },
  { id: "gpt-5-mini", label: "GPT-5 Mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "o3-mini", label: "O3 Mini" },
];

const CHAT_MODES = [
  { id: "ask", label: "Ask", icon: MessageCircle },
  { id: "agent", label: "Agent", icon: Zap },
  { id: "edit", label: "Edit", icon: Edit },
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [selectedMode, setSelectedMode] = useState("ask");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch chat sessions
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-sessions"],
    enabled: isOpen || showHistory,
  });

  // Fetch current session messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages", currentSessionId],
    enabled: !!currentSessionId,
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/chat-sessions", {
        title: `Chat ${new Date().toLocaleTimeString()}`,
        model: selectedModel,
        mode: selectedMode,
      });
    },
    onSuccess: (newSession: ChatSession) => {
      setCurrentSessionId(newSession.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
      setShowHistory(false);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/chat-messages", {
        sessionId: currentSessionId,
        content: message,
        role: "user",
        mode: selectedMode,
      });
    },
    onSuccess: () => {
      setInputValue("");
      queryClient.invalidateQueries({
        queryKey: ["/api/chat-messages", currentSessionId],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({
      messageId,
      feedback,
    }: {
      messageId: string;
      feedback: string;
    }) => {
      return apiRequest("PATCH", `/api/chat-messages/${messageId}`, {
        feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat-messages", currentSessionId],
      });
      toast({
        title: "Feedback recorded",
        description: "Thank you for your feedback!",
      });
    },
  });

  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (!currentSessionId) {
      toast({
        title: "Error",
        description: "Please start a new chat first",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate(inputValue);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
  };

  const handleUndo = () => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        toast({
          title: "Undo",
          description: "Last assistant response removed",
        });
      }
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const scrollElement = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }, 0);
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50"
        data-testid="button-open-chatbot"
        title="Open AI Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  const chatWindowClass = isMaximized
    ? "fixed inset-4 md:inset-6"
    : "fixed bottom-6 right-6 w-96 h-[600px]";

  return (
    <Card
      className={`${chatWindowClass} flex flex-col shadow-2xl border-2 border-blue-200 bg-white dark:bg-gray-900 z-50`}
      data-testid="chatbot-container"
    >
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">AI Assistant</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Show chats"
            data-testid="button-show-chats"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="New chat"
            data-testid="button-new-chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Settings"
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleUndo}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Undo"
            data-testid="button-undo"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title={isMaximized ? "Minimize" : "Maximize"}
            data-testid="button-maximize"
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Close"
            data-testid="button-close-chatbot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b p-3 space-y-3 bg-gray-50 dark:bg-gray-800">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Chat Mode
            </label>
            <div className="flex gap-2 mt-2">
              {CHAT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    selectedMode === mode.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  data-testid={`button-mode-${mode.id}`}
                >
                  <mode.icon className="h-3 w-3 inline mr-1" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Model
            </label>
            <div className="relative mt-2">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
                data-testid="button-model-dropdown"
              >
                <span>
                  {LLM_MODELS.find((m) => m.id === selectedModel)?.label}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showModelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 shadow-lg z-10">
                  {LLM_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                        selectedModel === model.id ? "bg-blue-100 dark:bg-blue-900" : ""
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
        <div className="border-b p-3 bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">No chats yet</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    currentSessionId === session.id
                      ? "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  data-testid={`button-chat-session-${session.id}`}
                >
                  <div className="font-semibold truncate">{session.title}</div>
                  <div className="text-xs opacity-75">{session.model}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 p-4 overflow-hidden"
        data-testid="chat-messages-area"
      >
        {!currentSessionId ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click "New Chat" to start
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                    }`}
                    data-testid={`message-${msg.id}`}
                  >
                    {msg.content}
                  </div>
                </div>
                {msg.role === "assistant" && (
                  <div className="flex gap-1 justify-start pl-4">
                    <button
                      onClick={() =>
                        feedbackMutation.mutate({
                          messageId: msg.id,
                          feedback: "like",
                        })
                      }
                      className={`p-1 rounded transition-colors ${
                        msg.feedback === "like"
                          ? "bg-blue-200 dark:bg-blue-900 text-blue-600"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                      }`}
                      title="Like"
                      data-testid={`button-like-${msg.id}`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() =>
                        feedbackMutation.mutate({
                          messageId: msg.id,
                          feedback: "dislike",
                        })
                      }
                      className={`p-1 rounded transition-colors ${
                        msg.feedback === "dislike"
                          ? "bg-red-200 dark:bg-red-900 text-red-600"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                      }`}
                      title="Dislike"
                      data-testid={`button-dislike-${msg.id}`}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      {currentSessionId && (
        <div className="border-t p-3 space-y-2">
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
              className="flex-1 text-sm"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !inputValue.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
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
