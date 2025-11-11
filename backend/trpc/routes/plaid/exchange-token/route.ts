import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const exchangeTokenRoute = publicProcedure
  .input(
    z.object({
      publicToken: z.string(),
      userId: z.string(),
      institutionName: z.string().optional(),
      accountId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const accessToken = `access-sandbox-${input.userId}-${Date.now()}`;
    
    console.log('Exchanging public token for access token:', {
      userId: input.userId,
      institution: input.institutionName,
      accountId: input.accountId,
    });
    
    return {
      accessToken,
      itemId: `item-${Date.now()}`,
      institutionName: input.institutionName || 'Demo Bank',
      accountId: input.accountId || `account-${Date.now()}`,
    };
  });
