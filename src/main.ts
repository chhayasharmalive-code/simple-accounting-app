import dotenv from "dotenv";
dotenv.config();

import { PrismaConnectionManager } from "./infrastructure/database/prisma-connection-manager";
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user-repository";
import { PrismaContactRepository } from "./infrastructure/repositories/prisma-contact-repository";
import { PrismaTransactionRepository } from "./infrastructure/repositories/prisma-transaction-repository";
import { ClerkTokenVerifier } from "./infrastructure/auth/clerk-token-verifier";
import { ClerkSyncService } from "./application/services/clerk-sync.service";
import { ContactService } from "./application/services/contact.service";
import { TransactionService } from "./application/services/transaction.service";
import { DashboardService } from "./application/services/dashboard.service";
import { WebhookController } from "./interface/controllers/webhook.controller";
import { ContactController } from "./interface/controllers/contact.controller";
import { TransactionController } from "./interface/controllers/transaction.controller";
import { DashboardController } from "./interface/controllers/dashboard.controller";
import { createAuthMiddleware } from "./interface/middlewares/auth.middleware";
import { createWebhookRouter } from "./interface/routes/webhook.routes";
import { createContactRouter } from "./interface/routes/contact.routes";
import { createTransactionRouter } from "./interface/routes/transaction.routes";
import { createDashboardRouter } from "./interface/routes/dashboard.routes";
import { createApiRouter } from "./interface/routes/api.router";
import { createApp } from "./app";

/**
 * Dependency Composition Root.
 * Instantiates the object graph cleanly via manual Constructor Injection.
 */
export function bootstrap() {
  // 1. Core / Database Connection contexts
  const connectionManager = new PrismaConnectionManager();
  const tokenVerifier = new ClerkTokenVerifier();

  // 2. Concrete Database Repositories
  const userRepository = new PrismaUserRepository(connectionManager);
  const contactRepository = new PrismaContactRepository(connectionManager);
  const transactionRepository = new PrismaTransactionRepository(connectionManager);

  // 3. Application Use Cases Services
  const clerkSyncService = new ClerkSyncService(userRepository);
  const contactService = new ContactService(contactRepository, transactionRepository);
  const transactionService = new TransactionService(
    transactionRepository,
    contactRepository,
    connectionManager
  );
  const dashboardService = new DashboardService(contactRepository, transactionRepository);

  // 4. HTTP Interface Controllers & Middlewares
  const webhookController = new WebhookController(clerkSyncService);
  const contactController = new ContactController(contactService);
  const transactionController = new TransactionController(transactionService);
  const dashboardController = new DashboardController(dashboardService);

  const authMiddleware = createAuthMiddleware(tokenVerifier);

  // 5. Routers wiring
  const webhookRouter = createWebhookRouter(webhookController);
  const contactRouter = createContactRouter(contactController, authMiddleware);
  const transactionRouter = createTransactionRouter(transactionController, authMiddleware);
  const dashboardRouter = createDashboardRouter(dashboardController, authMiddleware);

  const apiRouter = createApiRouter({
    webhookRouter,
    contactRouter,
    transactionRouter,
    dashboardRouter
  });

  // 6. Return fully configured Express application
  return createApp(apiRouter);
}

// Development server execution launcher
if (require.main === module) {
  const port = process.env.PORT || 3000;
  const app = bootstrap();

  app.listen(port, () => {
    console.log(`[OK] Server running locally on http://localhost:${port}`);
  });
}
