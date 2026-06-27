import { supabaseAdmin } from "../lib/supabase.js";

type ProductEventName =
  | "resume_uploaded"
  | "resume_analyzed"
  | "vacancy_fit_checked"
  | "resume_adapted"
  | "cover_letter_generated";

export async function saveProductEvent(params: {
  userId: string;
  name: ProductEventName;
  targetType?: string;
  targetId?: string | null;
}) {
  try {
    const { error } = await supabaseAdmin.from("app_events").insert({
      user_id: params.userId,
      event_type: params.name,
      entity_type: params.targetType ?? null,
      entity_id: params.targetId ?? null,
    });

    if (error) {
      console.warn("Product event was not saved", error);
    }
  } catch (error) {
    console.warn("Product event write failed", error);
  }
}
