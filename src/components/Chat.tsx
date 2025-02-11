
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Upload, History } from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "使用者",
      content: newMessage,
      timestamp: new Date().toISOString(),
      attachedCsvData: csvFile ? URL.createObjectURL(csvFile) : undefined,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    setCsvFile(null);
    
    toast({
      title: "訊息已送出",
      description: "您的訊息已成功送出。",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      toast({
        title: "CSV 檔案已附加",
        description: file.name,
      });
    } else {
      toast({
        title: "無效的檔案類型",
        description: "請上傳 CSV 檔案",
        variant: "destructive",
      });
    }
  };

  const groupedMessages = messages.reduce((groups: Record<string, ChatMessage[]>, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex h-[600px] gap-4">
      {/* History Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">聊天記錄</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-2">
              <div className="text-xs font-medium text-neutral-500">{date}</div>
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-2 bg-neutral-50 rounded text-sm hover:bg-neutral-100 cursor-pointer transition-colors"
                >
                  <div className="font-medium truncate">{message.content}</div>
                  <div className="text-xs text-neutral-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">聊天與 CSV 協作</h2>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-neutral-50 p-3 rounded-lg animate-fadeIn"
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">{message.sender}</span>
                <span className="text-xs text-neutral-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-neutral-700">{message.content}</p>
              {message.attachedCsvData && (
                <div className="mt-2 p-2 bg-primary/10 rounded text-sm">
                  📎 已附加 CSV 檔案
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="輸入您的訊息..."
            className="min-h-[80px]"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("csv-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                附加 CSV
              </Button>
              {csvFile && (
                <span className="text-sm text-neutral-500">{csvFile.name}</span>
              )}
            </div>
            <Button onClick={handleSendMessage} className="gap-2">
              <Send className="w-4 h-4" />
              送出
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

