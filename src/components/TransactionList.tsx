
import { Transaction } from "@/types/transaction";
import { formatDistanceToNow } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeIn"
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-full ${
                transaction.type === "income"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {transaction.type === "income" ? (
                <ArrowUpIcon className="w-5 h-5" />
              ) : (
                <ArrowDownIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-medium text-neutral-900">
                {transaction.description}
              </p>
              <p className="text-sm text-neutral-500">
                {formatDistanceToNow(new Date(transaction.date), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <p
            className={`font-semibold ${
              transaction.type === "income"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}$
            {transaction.amount.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};
