import { apiClient } from "./client";

export const paymentApi = {
    getConfig: async () => {
        const res = await apiClient.get("/payments/config");
        return res.data;
    },

    getMethods: async () => {
        const res = await apiClient.get("/payments/methods");
        return res.data;
    },

    createPayfastPayment: async (opportunityId: string) => {
        const res = await apiClient.post("/payments/payfast/create", {
            opportunity_id: opportunityId,
        });
        return res.data;
    },
};
