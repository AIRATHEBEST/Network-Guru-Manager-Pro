import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

// Advanced Search Router
export const searchRouter = router({
  advancedSearch: protectedProcedure
    .input(z.object({
      query: z.string(),
      workspaceId: z.number(),
      filters: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Implement actual search logic across networks and devices
      console.log("Backend search query:", input.query, "filters:", input.filters);
      // Mock data for now
      const mockResults = [
        { id: '101', name: 'Server Rack 1', type: 'Server', network: 'Data Center' },
        { id: '102', name: 'Wireless AP 5G', type: 'Access Point', network: 'Office Network' },
        { id: '103', name: 'IoT Camera', type: 'Camera', network: 'Security Network' },
      ];
      return mockResults.filter(result => 
        result.name.toLowerCase().includes(input.query.toLowerCase()) ||
        result.type.toLowerCase().includes(input.query.toLowerCase()) ||
        result.network.toLowerCase().includes(input.query.toLowerCase())
      );
    }),
});
