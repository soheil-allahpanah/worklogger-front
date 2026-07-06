import { z } from "zod";
import { createWorklogInputSchema } from "@/src/entities/worklog/create.schema";

export const editWorklogInputSchema = createWorklogInputSchema;
export type EditWorklogInput = z.infer<typeof editWorklogInputSchema>;
