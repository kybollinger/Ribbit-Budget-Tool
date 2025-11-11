import { publicProcedure } from "../../create-context";
import { z } from "zod";

export const createLinkTokenRoute = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const linkToken = `link-sandbox-${input.userId}-${Date.now()}`;
    
    console.log('Creating Plaid link token for user:', input.userId);
    
    return {
      linkToken,
      expiration: new Date(Date.now() + 3600000).toISOString(),
    };
  });
