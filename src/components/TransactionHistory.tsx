"use client";

import { motion } from "framer-motion";

interface Transaction {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  had_stop_loss: boolean;
  created_at: string;
}

/**
 * Transaction ledger — the central register of the passbook.
 * Every row carries the same rhythm as LessonEntry: date, description,
 * amount. The two types interleave into one continuous record.
 */
export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="py-10 text-center border border-dashed border-rule/30 rounded-sm">
        <p className="font-body text-sm text-ink/70 mb-1">No trades yet.</p>
        <p className="font-body text-xs text-muted">
          Use the Trade tab to place your first order.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule/30 rounded-sm overflow-hidden bg-paper">
      {/* Column headers */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-2.5 border-b border-rule/25 bg-rule/[0.03]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted w-20">Date</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Entry</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted text-right">Amount</span>
      </div>

      <div className="divide-y divide-rule/15">
        {transactions.map((tx, i) => {
          const dateStr = new Date(tx.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });
          const timeStr = new Date(tx.created_at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const total = Number(tx.qty) * Number(tx.price);
          const isBuy = tx.side === "buy";

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-3.5 hover:bg-rule/[0.025] transition-colors"
            >
              {/* Date */}
              <div className="w-20 shrink-0">
                <p className="font-mono text-xs text-muted tabular-nums">{dateStr}</p>
                <p className="font-mono text-[10px] text-muted/60 tabular-nums">{timeStr}</p>
              </div>

              {/* Description */}
              <div className="min-w-0">
                <p className="font-body text-sm text-ink">
                  {isBuy ? "Bought" : "Sold"}{" "}
                  <span className="font-mono text-sm">{tx.qty} × {tx.symbol}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-muted">
                    @ ₹{Number(tx.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · market order
                  </span>
                  {tx.had_stop_loss && (
                    <span className="font-mono text-[10px] text-muted bg-rule/10 px-1.5 py-0.5 rounded-sm border border-rule/20">
                      Stop-loss
                    </span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className={`font-mono tabular-nums text-sm font-medium ${isBuy ? "text-loss" : "text-gain"}`}>
                  {isBuy ? "−" : "+"}₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Running count footer */}
      <div className="px-5 py-2.5 border-t border-rule/20 bg-rule/[0.02] flex justify-end">
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
          {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"} · simulated only
        </span>
      </div>
    </div>
  );
}
