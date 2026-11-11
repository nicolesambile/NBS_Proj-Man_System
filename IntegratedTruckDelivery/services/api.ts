
import { Delivery } from "../types/delivery";

const API_URL = "http://10.149.125.193/truck_api/api.php";

type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

// COMMON API REQUEST
const apiRequest = async <T>(
    method: string,
    body?: object
): Promise<ApiResponse<T>> => {

    const response = await fetch(API_URL, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const result: ApiResponse<T> = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "API request failed.");
    }

    return result;
};

// READ - GET ALL DELIVERIES
export const getDeliveries = async (): Promise<Delivery[]> => {

    const result = await apiRequest<Delivery[]>("GET");

    return result.data || [];
};

// CREATE - ADD DELIVERY
export const addDelivery = async (
    delivery: Omit<Delivery, "id">
): Promise<void> => {

    await apiRequest<never>("POST", delivery);
};

// UPDATE - EDIT DELIVERY
export const updateDelivery = async (
    delivery: Delivery
): Promise<void> => {

    await apiRequest<never>("PUT", delivery);
};

// DELETE - REMOVE DELIVERY
export const deleteDelivery = async (
    id: number
): Promise<void> => {

    await apiRequest<never>("DELETE", { id });
};

export default API_URL;
