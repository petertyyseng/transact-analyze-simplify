
export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  attachedCsvData?: string;
  columnAnalysis?: ColumnAnalysis;
}

export interface ColumnAnalysis {
  columnName: string;
  min?: number;
  max?: number;
  average?: number;
  sum?: number;
  count: number;
}
