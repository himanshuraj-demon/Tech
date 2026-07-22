/**
 * Centralized TanStack Query hooks for all API calls.
 * All queries use 10-minute stale time (set globally in QueryProvider).
 * Import these hooks in client components instead of using raw useEffect + fetch.
 */
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const queryKeys = {
  // Hackathons
  hackathonStats: ["hackathons", "stats"] as const,
  hackathonsList: (status: string, offset: number, limit: number) =>
    ["hackathons", "list", status, offset, limit] as const,
  hackathonDetail: (id: string) => ["hackathons", "detail", id] as const,
  hackathonRegistrationStatus: (id: string) =>
    ["hackathons", "registration-status", id] as const,

  // Leaderboard
  leaderboard: ["leaderboard"] as const,

  // Clubs
  clubs: ["clubs"] as const,
  clubDetail: (id: string) => ["clubs", "detail", id] as const,

  // Achievements & Events
  achievements: ["achievements"] as const,
  interIITAchievements: ["inter-iit-achievements"] as const,
  events: ["events"] as const,
  eventDetail: (id: string) => ["events", "detail", id] as const,

  // Torque
  torque: ["torque"] as const,
  torqueLatest: ["torque", "latest"] as const,

  // Team
  team: ["team"] as const,

  // Contact Info
  contactInfo: ["contact-info"] as const,

  // Admin
  adminHackathons: ["admin", "hackathons"] as const,
  adminParticipants: (hackathonId: string) =>
    ["admin", "participants", hackathonId] as const,
};

// ─── Hackathon Hooks ──────────────────────────────────────────────────────────

export function useHackathonStats() {
  return useQuery({
    queryKey: queryKeys.hackathonStats,
    queryFn: async () => {
      const res = await api.fetch("/api/hackathons?statsOnly=true");
      if (!res.ok) throw new Error("Failed to fetch hackathon stats");
      const data = await res.json();
      return data.stats;
    },
  });
}

export function useHackathonsList(
  status: "upcoming" | "ongoing" | "completed",
  offset: number = 0,
  limit: number = 6
) {
  return useQuery({
    queryKey: queryKeys.hackathonsList(status, offset, limit),
    queryFn: async () => {
      const res = await api.fetch(
        `/api/hackathons?status=${status}&limit=${limit}&offset=${offset}`
      );
      if (!res.ok) throw new Error(`Failed to fetch ${status} hackathons`);
      return res.json() as Promise<{ hackathons: any[]; total: number }>;
    },
  });
}

export function useHackathonDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.hackathonDetail(id),
    queryFn: async () => {
      const res = await api.fetch(`/api/hackathons/${id}`);
      if (res.status === 404) throw new Error("NOT_FOUND");
      if (!res.ok) throw new Error("Failed to fetch hackathon");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useHackathonRegistrationStatus(
  id: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.hackathonRegistrationStatus(id),
    queryFn: async () => {
      const res = await api.fetch(`/api/hackathons/${id}/registration-status`);
      if (!res.ok) return { isRegistered: false };
      return res.json();
    },
    enabled: !!id && enabled,
    // Registration status changes frequently — shorter stale time
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Leaderboard Hook ─────────────────────────────────────────────────────────

export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: async () => {
      const res = await api.fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json() as Promise<any[]>;
    },
  });
}

// ─── Clubs Hooks ──────────────────────────────────────────────────────────────

export function useClubs() {
  return useQuery({
    queryKey: queryKeys.clubs,
    queryFn: async () => {
      const res = await api.fetch("/api/clubs");
      if (res.status === 404) return { clubs: [], disabled: true };
      if (!res.ok) throw new Error("Failed to fetch clubs");
      return res.json();
    },
  });
}

export function useClubDetail(clubId: string) {
  return useQuery({
    queryKey: queryKeys.clubDetail(clubId),
    queryFn: async () => {
      const res = await api.fetch(`/api/clubs/${clubId}`);
      if (res.status === 404) throw new Error("NOT_FOUND");
      if (!res.ok) throw new Error("Failed to fetch club");
      return res.json();
    },
    enabled: !!clubId,
  });
}

// ─── Achievements / Events Hooks ──────────────────────────────────────────────

export function useInterIITAchievements() {
  return useQuery({
    queryKey: queryKeys.interIITAchievements,
    queryFn: async () => {
      const res = await api.fetch("/api/inter-iit-achievements");
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: async () => {
      const res = await api.fetch("/api/events");
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
  });
}

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.eventDetail(id),
    queryFn: async () => {
      const res = await api.fetch(`/api/events/${id}`);
      if (res.status === 404) throw new Error("NOT_FOUND");
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    },
    enabled: !!id,
  });
}

// ─── Torque Hooks ─────────────────────────────────────────────────────────────

export function useTorque() {
  return useQuery({
    queryKey: queryKeys.torque,
    queryFn: async () => {
      const res = await api.fetch("/api/torque");
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to fetch torque issues");
      return res.json() as Promise<any[]>;
    },
  });
}

export function useTorqueLatest() {
  return useQuery({
    queryKey: queryKeys.torqueLatest,
    queryFn: async () => {
      const res = await api.fetch("/api/torque/latest");
      if (!res.ok) return null;
      return res.json();
    },
  });
}

// ─── Team Hook ────────────────────────────────────────────────────────────────

export function useTeam() {
  return useQuery({
    queryKey: queryKeys.team,
    queryFn: async () => {
      const res = await api.fetch("/api/team");
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
  });
}

// ─── Contact Info Hook ────────────────────────────────────────────────────────

export function useContactInfo() {
  return useQuery({
    queryKey: queryKeys.contactInfo,
    queryFn: async () => {
      const res = await api.fetch("/api/contact-info");
      if (!res.ok) return null;
      return res.json();
    },
  });
}

// ─── Admin Hooks ──────────────────────────────────────────────────────────────

export function useAdminHackathons() {
  return useQuery({
    queryKey: queryKeys.adminHackathons,
    queryFn: async () => {
      const res = await api.fetch("/api/admin/hackathons");
      if (!res.ok) throw new Error("Failed to fetch admin hackathons");
      return res.json() as Promise<any[]>;
    },
    // Admin data: shorter stale time (5 min)
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminParticipants(hackathonId: string) {
  return useQuery({
    queryKey: queryKeys.adminParticipants(hackathonId),
    queryFn: async () => {
      const res = await api.fetch(
        `/api/admin/hackathons/${hackathonId}/registrations`
      );
      if (!res.ok) throw new Error("Failed to fetch participants");
      return res.json() as Promise<any[]>;
    },
    enabled: !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });
}
