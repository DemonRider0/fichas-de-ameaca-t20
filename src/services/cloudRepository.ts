import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { normalizeThreat, type ThreatSheet } from "../domain/threat";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

let client: SupabaseClient | null = null;

export function isCloudConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getCloudClient(): SupabaseClient | null {
  if (!isCloudConfigured()) return null;
  client ??= createClient(supabaseUrl!, supabasePublishableKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export async function getCloudSession(): Promise<Session | null> {
  const cloud = getCloudClient();
  if (!cloud) return null;
  const { data, error } = await cloud.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function sendMagicLink(email: string): Promise<void> {
  const cloud = getCloudClient();
  if (!cloud) throw new Error("A sincronização ainda não foi configurada.");
  const { error } = await cloud.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOutCloud(): Promise<void> {
  const cloud = getCloudClient();
  if (!cloud) return;
  const { error } = await cloud.auth.signOut();
  if (error) throw error;
}

export async function listCloudThreats(): Promise<ThreatSheet[]> {
  const cloud = getCloudClient();
  if (!cloud) return [];
  const { data, error } = await cloud
    .from("threat_sheets")
    .select("payload")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => normalizeThreat(row.payload as ThreatSheet));
}

export async function saveCloudThreat(threat: ThreatSheet): Promise<void> {
  const cloud = getCloudClient();
  if (!cloud) return;
  const { error } = await cloud.from("threat_sheets").upsert({
    id: threat.id,
    schema_version: threat.schemaVersion,
    payload: threat,
    updated_at: threat.updatedAt,
  });
  if (error) throw error;
}

export async function deleteCloudThreat(id: string): Promise<void> {
  const cloud = getCloudClient();
  if (!cloud) return;
  const { error } = await cloud.from("threat_sheets").delete().eq("id", id);
  if (error) throw error;
}
