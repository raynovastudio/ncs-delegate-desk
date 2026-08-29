import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getSupabaseAdmin() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Supabase admin not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const setupAdmin = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string; fullName: string }) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Check if any users already exist
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    if (existingUsers && existingUsers.users.length > 0) {
      return { success: false, message: "Admin already exists. Use the sign-in page." };
    }

    // Create the admin user (bypasses email confirmation via service role)
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });

    if (createError) {
      return { success: false, message: createError.message };
    }

    // Assign admin role
    if (user?.user) {
      await supabase.from("user_roles").insert({
        user_id: user.user.id,
        role: "admin",
      });
    }

    return { success: true, message: "Admin account created! You can now sign in." };
  });
