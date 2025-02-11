
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

export type TransactionCategory = {
  id: string;
  name: string;
  color: string;
};
