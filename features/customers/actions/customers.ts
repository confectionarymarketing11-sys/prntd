"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/admin/data/auth";
import { addCustomerNote } from "@/features/customers/data/customers";

const noteSchema = z.object({
  customerId: z.string().uuid(),
  note: z.string().trim().min(1),
  pinned: z.coerce.boolean(),
});

export async function addCustomerNoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = noteSchema.parse({
    customerId: formData.get("customerId"),
    note: formData.get("note"),
    pinned: formData.get("pinned") === "on",
  });

  await addCustomerNote({
    customerId: parsed.customerId,
    authorEmail: admin.email,
    note: parsed.note,
    pinned: parsed.pinned,
  });

  revalidatePath(`/admin/customers/${parsed.customerId}`);
}
