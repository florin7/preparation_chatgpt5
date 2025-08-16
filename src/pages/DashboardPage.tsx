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
  const [toastMessage, setToastMessage] = useState<string>("");

  const featuredPlan = useMemo(() => plans?.find((f) => f.isFeatured), [plans]);

  // Simplified user selection logic
  const userToAssignPlan: User | null = useMemo(
    () => users?.find((u) => !u.isAdmin && !u.planId) || null,
    [users]
  );

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

  // Handle toast cleanup with useEffect
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

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

  const handleChoosePlan = async () => {
    if (!userToAssignPlan || !featuredPlan) return;

    try {
      // Clear any previous errors
      setError(null);

      // Call the API to assign the plan
      await api.assignPlanToUser(userToAssignPlan.id, featuredPlan.id);

      // Update local state optimistically
      setUsers(
        (prev) =>
          prev?.map((u) =>
            u.id === userToAssignPlan.id ? { ...u, planId: featuredPlan.id } : u
          ) || null
      );

      // Show success toast
      setToastMessage(
        `${userToAssignPlan.name} is now on ${featuredPlan.name}!`
      );
      setShowToast(true);
    } catch (error: any) {
      setError(error.message || "Failed to assign plan");
    }
  };

  return (
    <>
      <div className="stack-lg">
        <div className="row">
          <h1>Energy Dashboard</h1>
        </div>
        {error && (
          <div className="card error" role="alert">
            <div
              className="row"
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <span>{error}</span>
              <button onClick={() => setError(null)} className="small">
                ✕
              </button>
            </div>
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
          <FeaturedPlan
            plans={plans ?? []}
            handleChoosePlan={handleChoosePlan}
            planNotAssignable={!userToAssignPlan}
            userToAssignPlan={userToAssignPlan}
          />
        </div>
      </div>
      {showToast && <div className="toast success">{toastMessage}</div>}
    </>
  );
}

function FeaturedPlan({
  plans,
  handleChoosePlan,
  planNotAssignable,
  userToAssignPlan,
}: {
  plans: Plan[];
  handleChoosePlan: () => void;
  planNotAssignable: boolean;
  userToAssignPlan: User | null;
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
        <div style={{ color: "var(--muted)" }}>
          All users already have plans
        </div>
      ) : (
        <button className="primary" onClick={handleChoosePlan}>
          Choose plan for {userToAssignPlan?.name}
        </button>
      )}
    </div>
  );
}
