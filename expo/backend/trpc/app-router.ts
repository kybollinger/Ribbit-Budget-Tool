import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createLinkTokenRoute } from "./routes/plaid/create-link-token/route";
import { exchangeTokenRoute } from "./routes/plaid/exchange-token/route";
import { getAccountsRoute } from "./routes/plaid/get-accounts/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  plaid: createTRPCRouter({
    createLinkToken: createLinkTokenRoute,
    exchangeToken: exchangeTokenRoute,
    getAccounts: getAccountsRoute,
  }),
});

export type AppRouter = typeof appRouter;
