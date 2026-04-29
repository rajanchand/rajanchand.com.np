import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url-for-build.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key-for-build";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key-for-build";

const isServer = typeof window === "undefined";
const keyToUse = isServer && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let options: any = {
  auth: { persistSession: false },
};

if (isServer) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const WebSocket = require("ws");
    options = {
      ...options,
      realtime: {
        transport: WebSocket,
      },
    };
  } catch (err) {
    console.error("Could not load 'ws' package on the server:", err);
  }
}

export const supabase = createClient(supabaseUrl, keyToUse, options);
