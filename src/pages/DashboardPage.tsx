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
  const [showToast, setShowToast] = useState<boolean>(false);

  const featuredPlan = useMemo(() => plans?.find((f) => f.isFeatured), [plans]);
  const userToAssignPlan: User | null = useMemo(() => {
    let candidateUser = users?.find(
      (u) => !u.isAdmin && u.planId !== featuredPlan?.id
    );
    if (!candidateUser) {
      candidateUser = users?.find(
        (u) => u.planId !== featuredPlan?.id && !u.planId
      );
    }
    if (!candidateUser) {
      candidateUser = users?.find((u) => !u.planId);
    }
    if (!candidateUser) {
      return null;
    }
    return candidateUser;
  }, [users, featuredPlan]);

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

  const handleChoosePlan = () => {
    setUsers((prev) =>
      prev
        ? prev.map((u) =>
            u?.id === userToAssignPlan?.id &&
            !!featuredPlan &&
            !!userToAssignPlan
              ? { ...userToAssignPlan, planId: featuredPlan?.id }
              : u
          )
        : null
    );
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 5000);
    return () => clearTimeout(timer);
  };

  return (
    <>
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
          <h2>All users have a plan</h2>
          <FeaturedPlan
            plans={plans ?? []}
            handleChoosePlan={handleChoosePlan}
            planNotAssignable={!userToAssignPlan}
          />
        </div>
      </div>
      <div>{showToast && <div className="toast">Plan assigned</div>}</div>
    </>
  );
}

function FeaturedPlan({
  plans,
  handleChoosePlan,
  planNotAssignable,
}: {
  plans: Plan[];
  handleChoosePlan: () => void;
  planNotAssignable: boolean;
}) {
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
      {planNotAssignable ? (
        <>No candidate user</>
      ) : (
        <button className="primary" onClick={handleChoosePlan}>
          Choose plan
        </button>
      )}
    </div>
  );
}
