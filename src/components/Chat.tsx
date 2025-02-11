
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Upload } from "lucide-react";
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
      sender: "User",
      content: newMessage,
      timestamp: new Date().toISOString(),
      attachedCsvData: csvFile ? URL.createObjectURL(csvFile) : undefined,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    setCsvFile(null);
    
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      toast({
        title: "CSV file attached",
        description: file.name,
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Chat & CSV Collaboration</h2>
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
                📎 CSV file attached
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
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
              Attach CSV
            </Button>
            {csvFile && (
              <span className="text-sm text-neutral-500">{csvFile.name}</span>
            )}
          </div>
          <Button onClick={handleSendMessage} className="gap-2">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
};
