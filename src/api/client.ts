// Minimal in-memory mock API simulating network latency and failure cases.
import { z } from "zod";

export type Plan = {
  id: string;
  name: string;
  priceCentsPerKwh: number;
  renewablePercent: number; // 0..100
  isFeatured?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  planId: string | null;
  balanceCents: number;
  isAdmin?: boolean;
};

export const CreatePlanSchema = z.object({
  name: z.string().min(2),
  priceCentsPerKwh: z.number().positive(),
  renewablePercent: z.number().min(0).max(100),
  isFeatured: z.boolean().optional(),
});
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

let plans: Plan[] = [
  {
    id: "basic",
    name: "Basic Saver",
    priceCentsPerKwh: 22,
    renewablePercent: 25,
  },
  {
    id: "green",
    name: "Green Plus",
    priceCentsPerKwh: 26,
    renewablePercent: 100,
    isFeatured: true,
  },
  {
    id: "night",
    name: "Night Owl",
    priceCentsPerKwh: 18,
    renewablePercent: 40,
  },
];

let users: User[] = [
  {
    id: "u_1",
    name: "Ava Patel",
    email: "ava@example.com",
    planId: "green",
    balanceCents: 1245,
    isAdmin: true,
  },
  {
    id: "u_2",
    name: "Liam Chen",
    email: "liam@example.com",
    planId: "basic",
    balanceCents: -320,
  },
  {
    id: "u_3",
    name: "Noah Smith",
    email: "noah@example.com",
    planId: null,
    balanceCents: 0,
  },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulate<T>(
  value: T,
  {
    min = 200,
    max = 700,
    failRate = 0.05,
  }: { min?: number; max?: number; failRate?: number } = {}
) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await wait(delay);
  if (Math.random() < failRate) {
    throw new Error("Network error, please retry");
  }
  return value;
}

export const api = {
  async listPlans() {
    return simulate([...plans]);
  },
  async createPlan(input: CreatePlanInput) {
    const parsed = CreatePlanSchema.parse(input);
    const newPlan: Plan = { id: crypto.randomUUID(), ...parsed };
    plans = [newPlan, ...plans];
    return simulate(newPlan);
  },
  async deletePlan(id: string) {
    plans = plans.filter((p) => p.id !== id);
    users = users.map((u) => (u.planId === id ? { ...u, planId: null } : u));
    return simulate({ ok: true });
  },
  async listUsers() {
    return simulate([...users]);
  },
  async assignPlanToUser(userId: string, planId: string | null) {
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    user.planId = planId;
    return simulate(user);
  },
  async payBalance(userId: string, cents: number) {
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    user.balanceCents -= cents;
    return simulate(user);
  },
};
