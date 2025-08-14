import { useEffect, useMemo, useState } from "react";
import { api, type Plan, type User } from "@/api/client";

type Stats = {
  totalUsers: number;
  onAPlan: number;
  avgRenewablePercent: number;
};

export function DashboardPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.listUsers(), api.listPlans()])
      .then(([u, p]) => {
        if (!isMounted) return;
        setUsers(u);
        setPlans(p);
      })
      .catch((e) => setError(e.message));
    return () => {
      isMounted = false;
    };
  }, []);

  const stats: Stats | null = useMemo(() => {
    if (!users || !plans) return null;
    const onPlanUsers = users.filter((u) => u.planId !== null);
    const avgRenew = onPlanUsers.length
      ? onPlanUsers
          .map(
            (u) => plans.find((p) => p.id === u.planId)?.renewablePercent ?? 0
          )
          .reduce((a, b) => a + b, 0) / onPlanUsers.length
      : 0;
    return {
      totalUsers: users.length,
      onAPlan: onPlanUsers.length,
      avgRenewablePercent: Math.round(avgRenew),
    };
  }, [users, plans]);

  return (
    <div className="stack-lg">
      <div className="row">
        <h1>Energy Dashboard</h1>
      </div>
      {error && (
        <div className="card" role="alert">
          {error}
        </div>
      )}
      <div className="row">
        <div className="card" style={{ flex: 1 }}>
          <h2>Users</h2>
          <div style={{ fontSize: 28 }}>{stats?.totalUsers ?? "—"}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h2>On a plan</h2>
          <div style={{ fontSize: 28 }}>{stats?.onAPlan ?? "—"}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h2>Avg renewable %</h2>
          <div style={{ fontSize: 28 }}>
            {stats?.avgRenewablePercent ?? "—"}%
          </div>
        </div>
      </div>
      <div className="card">
        <h2>Featured Plan</h2>
        <FeaturedPlan plans={plans ?? []} />
      </div>
    </div>
  );
}

function FeaturedPlan({ plans }: { plans: Plan[] }) {
  const plan = plans.find((p) => p.isFeatured) ?? plans[0];
  if (!plan) return <div>No plans available.</div>;
  return (
    <div className="row" style={{ justifyContent: "space-between" }}>
      <div className="col">
        <div style={{ fontSize: 18, fontWeight: 600 }}>{plan.name}</div>
        <div className="row" style={{ gap: 8, color: "var(--muted)" }}>
          <span>{plan.renewablePercent}% renewable</span>
          <span>•</span>
          <span>{(plan.priceCentsPerKwh / 100).toFixed(2)} €/kWh</span>
        </div>
      </div>
      <button className="primary">Choose plan</button>
    </div>
  );
}
