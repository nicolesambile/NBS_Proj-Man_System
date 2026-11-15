
import { Platform } from "react-native";
import { Delivery } from "../types/delivery";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    "http://10.149.125.193/truck_api/api.php";

type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const apiRequest = async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: object
): Promise<ApiResponse<T>> => {
    let response: Response;

    try {
        response = await fetch(API_URL, {
            method,
            headers: {
                Accept: "application/json",
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
    } catch (error) {
        const detail = error instanceof Error ? ` ${error.message}` : "";
        const platformGuidance =
            Platform.OS === "web"
                ? " For browser use, ensure this page's origin is allowed by the API CORS settings."
                : " On a phone, verify it can reach the server's LAN IP and is on the same network.";
        throw new Error(
            `Could not connect to the delivery API at ${API_URL}.${detail} Check that the server is running and the URL is reachable from this device.${platformGuidance}`
        );
    }

    let result: unknown;
    try {
        result = await response.json();
    } catch {
        throw new Error(
            `The delivery API returned an invalid response (HTTP ${response.status}).`
        );
    }

    if (!isRecord(result)) {
        throw new Error("The delivery API returned an invalid response.");
    }

    const apiResult = result as ApiResponse<T>;
    if (!response.ok || apiResult.success !== true) {
        throw new Error(
            typeof apiResult.message === "string" && apiResult.message
                ? apiResult.message
                : `The API request failed (HTTP ${response.status}).`
        );
    }

    return apiResult;
};

export const getDeliveries = async (): Promise<Delivery[]> => {
    const result = await apiRequest<unknown>("GET");

    if (!Array.isArray(result.data)) {
        throw new Error("The delivery API response did not contain a delivery list.");
    }

    return result.data.map((value, index) => {
        if (!isRecord(value)) {
            throw new Error(`Delivery record ${index + 1} is invalid.`);
        }

        const id =
            typeof value.id === "number" ? value.id : Number(value.id);
        const stringFields = [
            "customer_name",
            "destination",
            "truck_plate",
            "driver_name",
            "delivery_date",
            "status",
        ] as const;

        if (!Number.isSafeInteger(id) || id < 1) {
            throw new Error(`Delivery record ${index + 1} has an invalid ID.`);
        }

        const getStringField = (field: (typeof stringFields)[number]) => {
            const fieldValue = value[field];
            if (typeof fieldValue !== "string") {
                throw new Error(
                    `Delivery record ${index + 1} has an invalid ${field.replace("_", " ")}.`
                );
            }
            return fieldValue;
        };

        return {
            id,
            customer_name: getStringField("customer_name"),
            destination: getStringField("destination"),
            truck_plate: getStringField("truck_plate"),
            driver_name: getStringField("driver_name"),
            delivery_date: getStringField("delivery_date"),
            status: getStringField("status"),
        };
    });
};

export const addDelivery = async (
    delivery: Omit<Delivery, "id">
): Promise<void> => {
    await apiRequest<unknown>("POST", delivery);
};

export const updateDelivery = async (
    delivery: Delivery
): Promise<void> => {
    await apiRequest<unknown>("PUT", delivery);
};

export const deleteDelivery = async (
    id: number
): Promise<void> => {
    await apiRequest<unknown>("DELETE", { id });
};

export default API_URL;
