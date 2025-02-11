
export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  attachedCsvData?: string;
}
