import { Response, NextFunction } from "express";
import { ContactService } from "../../application/services/contact.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * Creates a new lender/borrower contact record.
   */
  createContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const contact = await this.contactService.createContact(userId, req.body);

      return res.status(201).json({
        status: "success",
        data: contact,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Updates an existing contact owned by the user.
   */
  updateContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      const contact = await this.contactService.updateContact(userId, id, req.body);

      return res.status(200).json({
        status: "success",
        data: contact,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Deletes a contact record owned by the user.
   */
  deleteContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      await this.contactService.deleteContact(userId, id);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Lists all user contacts with their net lend/borrow balances.
   */
  getContacts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const contacts = await this.contactService.getContactsWithBalances(userId);

      return res.status(200).json({
        status: "success",
        data: contacts,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Retrieves single contact details with its net balance.
   */
  getContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      const contact = await this.contactService.getContactWithBalance(userId, id);

      return res.status(200).json({
        status: "success",
        data: contact,
      });
    } catch (error) {
      return next(error);
    }
  };
}
