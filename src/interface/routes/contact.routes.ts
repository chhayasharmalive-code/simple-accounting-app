import { Router } from "express";
import { ContactController } from "../controllers/contact.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { CreateContactSchema, UpdateContactSchema } from "../../application/dtos/contact.dto";

/**
 * Router factory configuring counterparty contacts.
 */
export function createContactRouter(
  controller: ContactController,
  authMiddleware: any
): Router {
  const router = Router();

  // All endpoints require validation of Clerk JWT context
  router.use(authMiddleware);

  router.post("/", validateBody(CreateContactSchema), controller.createContact);
  router.patch("/:id", validateBody(UpdateContactSchema), controller.updateContact);
  router.delete("/:id", controller.deleteContact);
  router.get("/", controller.getContacts);
  router.get("/:id", controller.getContact);

  return router;
}
