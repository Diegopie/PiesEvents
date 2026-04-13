import type { Config } from "@react-router/dev/config";

export default {
  // SSR mode — loaders/actions run on the server (Node)
  // Drizzle queries + Supabase admin ops stay server-side
  ssr: true,
} satisfies Config;
