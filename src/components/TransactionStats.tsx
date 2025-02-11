
import { Card } from "@/components/ui/card";
import { Transaction } from "@/types/transaction";
import { TrendingUpIcon, TrendingDownIcon, Wallet } from "lucide-react";

interface TransactionStatsProps {
  transactions: Transaction[];
}

export const TransactionStats = ({ transactions }: TransactionStatsProps) => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <TrendingUpIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Total Income</p>
            <p className="text-2xl font-bold text-neutral-900">
              ${totalIncome.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <TrendingDownIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Total Expenses</p>
            <p className="text-2xl font-bold text-neutral-900">
              ${totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-full">
            <Wallet className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Balance</p>
            <p className="text-2xl font-bold text-neutral-900">
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
