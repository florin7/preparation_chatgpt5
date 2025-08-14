import { useEffect, useState } from "react";
import { api, type Plan, type User } from "@/api/client";

export function AdminPage() {
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

  async function handleAssign(userId: string, planId: string | null) {
    try {
      const updated = await api.assignPlanToUser(userId, planId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="stack-lg">
      <h1>Admin</h1>
      {error && (
        <div className="card" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <h2>Assign user to plan</h2>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Current plan</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.planId ?? "—"}</td>
                <td>
                  <select
                    value={u.planId ?? ""}
                    onChange={(e) => handleAssign(u.id, e.target.value || null)}
                  >
                    <option value="">No plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
