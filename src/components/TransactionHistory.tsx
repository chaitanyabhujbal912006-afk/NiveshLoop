"use client";

interface Transaction {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  had_stop_loss: boolean;
  created_at: string;
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted font-body border border-dashed border-rule/30 rounded-sm">
        No transactions recorded yet. Search a symbol above to place your first trade!
      </div>
    );
  }

  return (
    <div className="border border-rule/30 rounded-sm overflow-hidden bg-paper">
      <div className="px-5 py-3 border-b border-rule/30 flex justify-between items-baseline">
        <span className="font-display text-sm font-semibold text-ink">Transaction History</span>
        <span className="font-mono text-xs text-muted">{transactions.length} trades</span>
      </div>
      <div className="divide-y divide-rule/15">
        {transactions.map((tx) => {
          const dateStr = new Date(tx.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
          const total = Number(tx.qty) * Number(tx.price);
          const isBuy = tx.side === "buy";

          return (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 text-sm">
              <span className="font-mono text-xs text-muted w-20 flex-shrink-0">{dateStr}</span>
              <div className="flex-1">
                <span className="font-medium text-ink">
                  {isBuy ? "Bought" : "Sold"} {tx.qty} × {tx.symbol}
                </span>
                {tx.had_stop_loss && (
                  <span className="ml-2 text-xs font-mono text-muted bg-rule/10 px-1.5 py-0.5 rounded-sm">
                    Stop-loss
                  </span>
                )}
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className={isBuy ? "text-loss font-medium" : "text-gain font-medium"}>
                  {isBuy ? "−" : "+"}₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-xs text-muted">
                  @ ₹{Number(tx.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
