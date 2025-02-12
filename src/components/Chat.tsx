
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Upload, History, BarChart } from "lucide-react";
import { ChatMessage, ColumnAnalysis } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [columnRange, setColumnRange] = useState("");
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const { toast } = useToast();

  const analyzeColumn = (data: any[][], columnIndex: number): ColumnAnalysis | undefined => {
    try {
      const columnValues = data.slice(1).map(row => {
        const value = row[columnIndex];
        return typeof value === 'string' ? parseFloat(value) : value;
      }).filter(value => !isNaN(value));

      if (columnValues.length === 0) return undefined;

      return {
        columnName: data[0][columnIndex],
        min: Math.min(...columnValues),
        max: Math.max(...columnValues),
        average: columnValues.reduce((a, b) => a + b, 0) / columnValues.length,
        sum: columnValues.reduce((a, b) => a + b, 0),
        count: columnValues.length
      };
    } catch (error) {
      console.error("Column analysis error:", error);
      return undefined;
    }
  };

  const convertExcelToCSV = async (file: File): Promise<[File, string[][]]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          
          // Parse the CSV data to get columns
          const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
          
          // Create a new File object with the CSV content
          const csvBlob = new Blob([csv], { type: 'text/csv' });
          const csvFile = new File([csvBlob], `${file.name.split('.')[0]}.csv`, { type: 'text/csv' });
          
          resolve([csvFile, parsedData]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleAnalyzeColumns = () => {
    if (!csvFile || !columnRange) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const workbook = XLSX.read(csv, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // Parse column range (e.g., "A,C-E" -> [0,2,3,4])
        const columns = columnRange.split(',').flatMap(range => {
          const [start, end] = range.split('-').map(col => 
            col.toUpperCase().charCodeAt(0) - 65
          );
          return end 
            ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
            : [start];
        });

        // Analyze each selected column
        const analyses = columns
          .map(colIndex => analyzeColumn(data, colIndex))
          .filter(analysis => analysis !== undefined) as ColumnAnalysis[];

        if (analyses.length > 0) {
          analyses.forEach(analysis => {
            const analysisMessage: ChatMessage = {
              id: crypto.randomUUID(),
              sender: "系統",
              content: `${analysis.columnName} 欄位分析結果：`,
              timestamp: new Date().toISOString(),
              columnAnalysis: analysis,
            };
            setMessages(prev => [...prev, analysisMessage]);
          });
        }
      } catch (error) {
        console.error("Analysis error:", error);
        toast({
          title: "分析錯誤",
          description: "處理數據時發生錯誤",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(csvFile);
  };

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
    setColumnRange("");
    setAvailableColumns([]);
    
    toast({
      title: "訊息已送出",
      description: "您的訊息已成功送出。",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (fileExtension === 'csv') {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        setAvailableColumns(data[0] || []);
        setCsvFile(file);
        toast({
          title: "CSV 檔案已附加",
          description: file.name,
        });
      } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
        toast({
          title: "正在處理 Excel 檔案",
          description: "請稍候，正在轉換檔案格式...",
        });
        
        const [csvFile, data] = await convertExcelToCSV(file);
        setAvailableColumns(data[0] || []);
        setCsvFile(csvFile);
        
        toast({
          title: "Excel 檔案已轉換",
          description: `${file.name} 已成功轉換為 CSV 格式`,
        });
      } else {
        toast({
          title: "無效的檔案類型",
          description: "請上傳 CSV、XLS 或 XLSX 檔案",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "檔案處理錯誤",
        description: "處理檔案時發生錯誤，請重試",
        variant: "destructive",
      });
      console.error("File processing error:", error);
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
          <h2 className="text-lg font-semibold">聊天與檔案協作</h2>
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
                  📎 已附加檔案
                </div>
              )}
              {message.columnAnalysis && (
                <div className="mt-2 p-2 bg-primary/10 rounded text-sm space-y-1">
                  <div className="font-medium">📊 分析結果：</div>
                  <div>最小值：{message.columnAnalysis.min?.toFixed(2)}</div>
                  <div>最大值：{message.columnAnalysis.max?.toFixed(2)}</div>
                  <div>平均值：{message.columnAnalysis.average?.toFixed(2)}</div>
                  <div>總和：{message.columnAnalysis.sum?.toFixed(2)}</div>
                  <div>資料筆數：{message.columnAnalysis.count}</div>
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
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                type="file"
                accept=".csv,.xls,.xlsx"
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
                附加檔案
              </Button>
              {csvFile && (
                <>
                  <span className="text-sm text-neutral-500">{csvFile.name}</span>
                  <Input
                    placeholder="輸入欄位範圍 (例: A,C-E)"
                    value={columnRange}
                    onChange={(e) => setColumnRange(e.target.value)}
                    className="w-40"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyzeColumns}
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    分析欄位
                  </Button>
                </>
              )}
            </div>
            <Button onClick={handleSendMessage} className="gap-2">
              <Send className="w-4 h-4" />
              送出
            </Button>
          </div>
          {availableColumns.length > 0 && (
            <div className="text-sm text-neutral-500 mt-2">
              可用欄位：{availableColumns.map((col, index) => `${String.fromCharCode(65 + index)}(${col})`).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
