import type { User } from "@/types";

const STORAGE_KEY = "class2ppt_user";

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    plan: "pro",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "u2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    plan: "free",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function login(email: string, _password: string): User | null {
  const user = mockUsers.find((u) => u.email === email);
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  // Create new user for demo
  const newUser: User = {
    id: `u_${Date.now()}`,
    name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

export function register(name: string, email: string, _password: string): User {
  const newUser: User = {
    id: `u_${Date.now()}`,
    name,
    email,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
