"use client";
import { useState, useRef, useEffect, FormEvent } from "react";
import { FiCopy, FiVolume2, FiMic, FiStopCircle, FiMenu } from "react-icons/fi";
import { SignOut } from "./auth/signout";
import { Loader } from "./loader";

interface ChatMessage {
  role: string;
  content: string;
}

const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export default function Chatbot() {
  const [userId] = useState("87b4245c-f1a8-41ea-aec5-70cfc81b3e91");
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Speech Recognition not supported in this browser.");
    }

    loadChats();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      setPageLoading(true);
      const response = await fetch(`/api/chats`);
      const data = await response.json();
      setChats(data);

      if (data.length > 0 && !currentChatId) {
        setCurrentChatId(data[0].id);
        loadMessages(data[0].id);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title: "New Chat",
        }),
      });

      const newChat = await response.json();
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const saveMessage = async (message: ChatMessage) => {
    if (!currentChatId) return;

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: currentChatId,
          role: message.role,
          content: message.content,
        }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in your browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speak = async (text: string, index?: number) => {
    try {
      if (index) setLoadingIndex(index);
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to get audio");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Speak error:", error);
    } finally {
      if (index) setLoadingIndex(null);
    }
  };

  const autoSpeak = async (text: string) => {
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to get audio");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      return audioUrl;
    } catch (error) {
      console.error("Speak error:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRecording) toggleRecording();
    if (!input.trim() || isLoading || !currentChatId) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    await saveMessage(userMessage);

    try {
      const response = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error("API request failed");
      const aiResponseRaw = await response.json();
      const aiResponse = aiResponseRaw.correctedSentence.replace(
        /\\(?!n)/g,
        ""
      );

      const audioUrl = await autoSpeak(aiResponse);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      const audio = new Audio(audioUrl);
      audio.play();

      await saveMessage(assistantMessage);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    }
  }, [currentChatId]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="hidden md:flex md:w-64 bg-white border-r border-gray-200 p-4 flex-col">
        <button
          onClick={createNewChat}
          disabled
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors cursor-pointer text-sm md:text-base disabled:opacity-50"
        >
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`p-2 md:p-3 rounded-lg cursor-pointer mb-2 text-sm md:text-base ${
                currentChatId === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <p className="truncate">{chat.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(chat.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="cursor-pointer">
          <SignOut />
        </div>
      </div>

      <div className="md:hidden bg-white p-2 border-b border-gray-200 flex justify-between items-center">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="text-lg font-semibold">English Tutor</h1>
        <div className="w-8"></div>
      </div>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>

          <div className="relative w-64 min-h-screen h-auto bg-white p-4 flex flex-col">
            <div className="flex-1">
              <button
                onClick={createNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors cursor-pointer w-full"
              >
                New Chat
              </button>

              <div className="overflow-y-auto no-scrollbar h-[calc(100%-60px)]">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer mb-2 ${
                      currentChatId === chat.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <p className="truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="cursor-pointer">
              <SignOut />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col w-full mx-auto relative overflow-hidden">
        <header className="text-black p-3 md:p-4">
          <h1 className="text-xl md:text-2xl font-semibold">
            English Tutor Chatbot
          </h1>
          <p className="text-xs md:text-sm opacity-80">
            Practice and improve your English
          </p>
        </header>

        {pageLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto p-2 md:p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center text-gray-500">
                  <p className="text-lg md:text-xl mb-2">
                    Start a new conversation
                  </p>
                  <p className="text-sm md:text-base">
                    Type or speak an English sentence to get corrections
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 md:mb-4 p-3 md:p-4 text-sm md:text-base rounded-lg max-w-[90%] md:max-w-[80%] ${
                    message.role === "user"
                      ? "bg-blue-100 ml-auto"
                      : "bg-gray-200 mr-auto"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="whitespace-pre-line">
                      {(() => {
                        console.log(message.content.split("\n"));
                        return null;
                      })()}
                      {message.content.split("\n").map((line, i) => (
                        <p key={i}>
                          {line.split('"').map((part, index) =>
                            index % 2 === 1 ? (
                              <span className="font-semibold" key={index}>
                                {part}
                              </span>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}

                  {message.role === "assistant" && (
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                        title="Copy"
                      >
                        <FiCopy size={16} />
                      </button>

                      {loadingIndex === index ? (
                        <button className="text-gray-500" title="Loading">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => speak(message.content, index)}
                          className="text-gray-500 hover:text-gray-700 cursor-pointer"
                          title="Speak"
                        >
                          <FiVolume2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="mb-3 md:mb-4 p-3 md:p-4 rounded-lg bg-gray-100 mr-auto max-w-[90%] md:max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-sm md:text-base">
                    Analyzing your sentence...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="sticky bottom-0 left-0 right-0 p-2 md:p-4 border-t border-gray-200">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl mx-auto bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-lg flex items-center p-1 md:p-2"
          >
            <div className="flex-1 relative mx-1 md:mx-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-2 text-sm md:text-base text-gray-800 focus:outline-none"
                placeholder="Type your sentence..."
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleRecording}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full cursor-pointer ${
                  isRecording ? "text-blue-500 animate-pulse" : "text-gray-500"
                }`}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <FiStopCircle size={18} /> : <FiMic size={18} />}
              </button>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg disabled:opacity-50 transition-colors text-sm md:text-base cursor-pointer"
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
