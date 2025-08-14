import { useEffect, useMemo, useState } from "react";
import { api, type User, type Plan } from "@/api/client";

export function BillingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listUsers(), api.listPlans()])
      .then(([u, p]) => {
        setUsers(u);
        setPlans(p);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handlePay(userId: string, euros: number) {
    try {
      const cents = Math.round(euros * 100);
      const updated = await api.payBalance(userId, cents);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (e: any) {
      setError(e.message);
    }
  }

  const usersWithPlan = useMemo(() => {
    const planMap = new Map(plans.map((p) => [p.id, p] as const));
    return users.map((u) => ({
      ...u,
      plan: u.planId ? planMap.get(u.planId) ?? null : null,
    }));
  }, [users, plans]);

  return (
    <div className="stack-lg">
      <h1>Billing</h1>
      {error && (
        <div className="card" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Balance (€)</th>
              <th>Pay</th>
            </tr>
          </thead>
          <tbody>
            {usersWithPlan.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.plan?.name ?? "—"}</td>
                <td>{(u.balanceCents / 100).toFixed(2)}</td>
                <td>
                  <PayInlineForm onPay={(euros) => handlePay(u.id, euros)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PayInlineForm({ onPay }: { onPay: (euros: number) => void }) {
  const [amount, setAmount] = useState(10);
  return (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        onPay(amount);
      }}
    >
      <input
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button className="primary" type="submit">
        Pay
      </button>
    </form>
  );
}
