import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";

import {
  getDeliveries,
  addDelivery,
  updateDelivery,
  deleteDelivery,
} from "../../services/api";

import { Delivery } from "../../types/delivery";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert(`${title}\n\n${message}`);
    }
    return;
  }

  Alert.alert(title, message);
};

const isValidDeliveryDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export default function Index() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [destination, setDestination] = useState("");
  const [truckPlate, setTruckPlate] = useState("");
  const [driverName, setDriverName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDeliveries = useCallback(async () => {
    setLoadingDeliveries(true);
    setLoadError(null);
    try {
      const data = await getDeliveries();
      setDeliveries(data);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoadingDeliveries(false);
    }
  }, []);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  const clearForm = () => {
    setCustomerName("");
    setDestination("");
    setTruckPlate("");
    setDriverName("");
    setDeliveryDate("");
    setStatus("Pending");
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (
      !customerName.trim() ||
      !destination.trim() ||
      !truckPlate.trim() ||
      !driverName.trim() ||
      !deliveryDate.trim()
    ) {
      showMessage("Missing Information", "Please complete all fields.");
      return;
    }

    if (!isValidDeliveryDate(deliveryDate.trim())) {
      showMessage("Invalid Date", "Enter a valid date in YYYY-MM-DD format.");
      return;
    }

    setLoading(true);

    const deliveryData = {
      customer_name: customerName.trim(),
      destination: destination.trim(),
      truck_plate: truckPlate.trim(),
      driver_name: driverName.trim(),
      delivery_date: deliveryDate.trim(),
      status,
    };

    try {
      if (editingId !== null) {
        await updateDelivery({
          id: editingId,
          ...deliveryData,
        });
        showMessage("Success", "Delivery updated successfully.");
      } else {
        await addDelivery(deliveryData);
        showMessage("Success", "Delivery added successfully.");
      }

      clearForm();
      await loadDeliveries();
    } catch (error) {
      showMessage("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Delivery) => {
    setEditingId(item.id);
    setCustomerName(item.customer_name);
    setDestination(item.destination);
    setTruckPlate(item.truck_plate);
    setDriverName(item.driver_name);
    setDeliveryDate(item.delivery_date.slice(0, 10));
    setStatus(item.status);
  };

  const confirmDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteDelivery(id);
      showMessage("Success", "Delivery deleted successfully.");
      await loadDeliveries();
    } catch (error) {
      showMessage("Error", getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (id: number) => {
    const message = "Are you sure you want to delete this delivery?";
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(message)) {
        void confirmDelete(id);
      }
      return;
    }

    Alert.alert(
      "Delete Delivery",
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void confirmDelete(id),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Truck Delivery Management</Text>

      <Text style={styles.heading}>
        {editingId !== null ? "Edit Delivery" : "Add New Delivery"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder="Truck Plate Number"
        value={truckPlate}
        onChangeText={setTruckPlate}
        autoCapitalize="characters"
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder="Driver Name"
        value={driverName}
        onChangeText={setDriverName}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder="Delivery Date (YYYY-MM-DD)"
        value={deliveryDate}
        onChangeText={setDeliveryDate}
        keyboardType="numbers-and-punctuation"
        returnKeyType="done"
      />

      <Text style={styles.label}>Delivery Status</Text>

      <View style={styles.statusRow}>
        {["Pending", "Approved", "Completed"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.statusButton,
              status === item && styles.selectedStatus,
            ]}
            onPress={() => setStatus(item)}
          >
            <Text
              style={[
                styles.statusText,
                status === item && styles.selectedStatusText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "Please wait..."
            : editingId !== null
              ? "Update Delivery"
              : "Add Delivery"}
        </Text>
      </Pressable>

      {editingId !== null && (
        <Pressable style={styles.cancelButton} onPress={clearForm}>
          <Text style={styles.buttonText}>Cancel Edit</Text>
        </Pressable>
      )}

      <View style={styles.listHeading}>
        <Text style={styles.heading}>Delivery Records</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={() => void loadDeliveries()}
          disabled={loadingDeliveries}
        >
          <Text style={styles.refreshText}>
            {loadingDeliveries ? "Loading..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      {loadingDeliveries && deliveries.length === 0 && !loadError && (
        <ActivityIndicator style={styles.loadingIndicator} color="#2457a7" />
      )}

      {loadError && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => void loadDeliveries()}
            disabled={loadingDeliveries}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loadingDeliveries && !loadError && deliveries.length === 0 ? (
        <Text style={styles.emptyText}>No delivery records found.</Text>
      ) : (
        deliveries.map((item) => (
          <View key={item.id} style={styles.deliveryCard}>
            <Text style={styles.recordTitle}>
              Delivery #{item.id}
            </Text>

            <Text>Customer: {item.customer_name}</Text>
            <Text>Destination: {item.destination}</Text>
            <Text>Truck Plate: {item.truck_plate}</Text>
            <Text>Driver: {item.driver_name}</Text>
            <Text>Date: {item.delivery_date}</Text>
            <Text>Status: {item.status}</Text>

            <View style={styles.actionRow}>
              <Pressable
                style={styles.editButton}
                onPress={() => handleEdit(item)}
                disabled={loading || deletingId !== null}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
                disabled={deletingId !== null}
              >
                <Text style={styles.buttonText}>
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 35,
    marginBottom: 20,
  },
  heading: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 12,
  },
  listHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  statusButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 6,
  },
  selectedStatus: {
    backgroundColor: "#2457a7",
    borderColor: "#2457a7",
  },
  statusText: {
    color: "#333",
  },
  selectedStatusText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#2457a7",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#666",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#666",
    marginVertical: 15,
  },
  loadingIndicator: {
    marginVertical: 18,
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    color: "#2457a7",
    fontWeight: "600",
  },
  errorCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#ffebee",
    gap: 10,
  },
  errorText: {
    color: "#b71c1c",
  },
  retryButton: {
    backgroundColor: "#2457a7",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deliveryCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 5,
  },
  recordTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#2457a7",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#c62828",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
});