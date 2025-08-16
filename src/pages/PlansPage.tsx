import { useEffect, useState } from "react";
import { api, type Plan, type CreatePlanInput } from "@/api/client";

// Helper functions for price conversion
const centsToEuros = (cents: number) => cents / 100;
const eurosToCents = (euros: number) => Math.round(euros * 100);

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    api
      .listPlans()
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => {
        setLoading(false);
        setInitialized(true);
      });
  }, []);

  useEffect(() => {
    initialized && api.savePlans(plans);
  }, [plans, initialized]);

  const handleSavedEditedPlan = () => {
    setPlans((prev) =>
      prev.map((p) => (p.id !== editingPlan?.id ? p : editingPlan))
    );
    setEditingPlan(null);
  };

  const handleEditFeatured = (plan: Plan) => {
    setPlans((prev) =>
      prev.map((p) => ({
        ...p,
        isFeatured: plan.id === p.id && !plan.isFeatured,
      }))
    );
  };

  async function handleCreate(input: CreatePlanInput) {
    try {
      const created = await api.createPlan(input);
      setPlans((prev) => [created, ...prev]);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="stack-lg">
      <h1>Plans</h1>
      {error && (
        <div className="card" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <h2>Create plan</h2>
        <PlanForm
          onSubmit={handleCreate}
          featuredDisabled={!!plans.find((p) => p.isFeatured)}
        />
      </div>
      <div className="card">
        <h2>Available plans</h2>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Renewable %</th>
                <th>€/kWh</th>
                <th>Featured</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.id === editingPlan?.id ? (
                      <input
                        placeholder="Name"
                        value={editingPlan.name ?? ""}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    ) : (
                      p.name
                    )}
                  </td>
                  <td>{p.renewablePercent}%</td>
                  <td>
                    {p.id === editingPlan?.id ? (
                      <label className="row" style={{ gap: 8 }}>
                        <span>€/kWh</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={centsToEuros(
                            editingPlan.priceCentsPerKwh
                          ).toFixed(2)}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              priceCentsPerKwh: eurosToCents(
                                Number(e.target.value)
                              ),
                            })
                          }
                        />
                      </label>
                    ) : (
                      <>€{centsToEuros(p.priceCentsPerKwh).toFixed(2)}</>
                    )}
                  </td>
                  <td>
                    {
                      <input
                        type="checkbox"
                        checked={p.isFeatured}
                        onChange={() => handleEditFeatured(p)}
                      />
                    }
                  </td>
                  <td>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                  <td>
                    {editingPlan?.id === p.id ? (
                      <button
                        className="primary"
                        type="submit"
                        onClick={() => handleSavedEditedPlan()}
                      >
                        Save
                      </button>
                    ) : (
                      <button onClick={() => setEditingPlan(p)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PlanForm({
  onSubmit,
  featuredDisabled,
}: {
  onSubmit: (input: CreatePlanInput) => void;
  featuredDisabled: boolean;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0.22);
  const [renewable, setRenewable] = useState(50);
  const [featured, setFeatured] = useState(false);

  return (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name,
          priceCentsPerKwh: eurosToCents(price),
          renewablePercent: Number(renewable),
          isFeatured: featured,
        });
        setName("");
        setPrice(0.22);
        setFeatured(false);
      }}
    >
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label className="row" style={{ gap: 8 }}>
        <span>€/kWh</span>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </label>
      <label className="row" style={{ gap: 8 }}>
        <span>Renewable %</span>
        <input
          type="number"
          value={renewable}
          min={0}
          max={100}
          onChange={(e) => setRenewable(Number(e.target.value))}
        />
      </label>
      <label className="row" style={{ gap: 8 }}>
        <input
          type="checkbox"
          checked={featured}
          disabled={featuredDisabled}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        <span>Featured</span>
      </label>
      <button className="primary" type="submit">
        Create
      </button>
    </form>
  );
}
