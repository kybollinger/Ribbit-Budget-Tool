import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const getAccountsRoute = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('Fetching accounts for user:', input.userId);
    
    return {
      accounts: [
        {
          id: 'account-1',
          name: 'Checking Account',
          mask: '1234',
          type: 'depository',
          subtype: 'checking',
          balance: 2500.50,
        },
        {
          id: 'account-2',
          name: 'Savings Account',
          mask: '5678',
          type: 'depository',
          subtype: 'savings',
          balance: 10250.75,
        },
      ],
      institution: {
        name: 'Demo Bank',
        id: 'ins_demo',
      },
    };
  });
