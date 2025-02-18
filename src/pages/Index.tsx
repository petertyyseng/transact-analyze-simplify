
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TransactionList } from "@/components/TransactionList";
import { TransactionStats } from "@/components/TransactionStats";
import { TransactionChart } from "@/components/TransactionChart";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Chat } from "@/components/Chat";
import type { Transaction } from "@/types/transaction";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      date: "2024-03-10",
      amount: 1500,
      description: "薪資",
      category: "收入",
      type: "income",
    },
    {
      id: "2",
      date: "2024-03-09",
      amount: 50,
      description: "雜貨採購",
      category: "食品",
      type: "expense",
    },
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <header className="flex justify-between items-center">
          <div>
            <span className="px-3 py-1 text-xs font-medium bg-neutral-200 rounded-full">
              儀表板
            </span>
            <h1 className="text-4xl font-bold mt-2 text-neutral-900">
              交易總覽
            </h1>
          </div>
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            新增交易
          </Button>
        </header>

        <TransactionStats transactions={transactions} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">交易歷史</h2>
            <TransactionList transactions={transactions} />
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">支出分析</h2>
            <TransactionChart transactions={transactions} />
          </Card>
        </div>

        <Card className="p-6">
          <Chat />
        </Card>
      </div>
    </div>
  );
};

export default Index;

