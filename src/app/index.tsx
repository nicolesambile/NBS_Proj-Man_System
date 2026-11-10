import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";

import {
  getDeliveries,
  addDelivery,
  updateDelivery,
  deleteDelivery,
} from "../../services/api";

import { Delivery } from "../../types/delivery";

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

  const loadDeliveries = async () => {
    try {
      const data = await getDeliveries();
      setDeliveries(data);
    } catch (error) {
      Alert.alert("Error", "Could not load deliveries.");
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

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
      Alert.alert("Missing Information", "Please complete all fields.");
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
        Alert.alert("Success", "Delivery updated successfully.");
      } else {
        await addDelivery(deliveryData);
        Alert.alert("Success", "Delivery added successfully.");
      }

      clearForm();
      await loadDeliveries();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Something went wrong."
      );
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
    setDeliveryDate(item.delivery_date);
    setStatus(item.status);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Delivery",
      "Are you sure you want to delete this delivery?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDelivery(id);
              Alert.alert("Success", "Delivery deleted successfully.");
              await loadDeliveries();
            } catch (error) {
              Alert.alert("Error", "Could not delete delivery.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Truck Delivery Management</Text>

      <Text style={styles.heading}>
        {editingId !== null ? "Edit Delivery" : "Add New Delivery"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
      />

      <TextInput
        style={styles.input}
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
      />

      <TextInput
        style={styles.input}
        placeholder="Truck Plate Number"
        value={truckPlate}
        onChangeText={setTruckPlate}
      />

      <TextInput
        style={styles.input}
        placeholder="Driver Name"
        value={driverName}
        onChangeText={setDriverName}
      />

      <TextInput
        style={styles.input}
        placeholder="Delivery Date (YYYY-MM-DD)"
        value={deliveryDate}
        onChangeText={setDeliveryDate}
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

      <Text style={styles.heading}>Delivery Records</Text>

      {deliveries.length === 0 ? (
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
              >
                <Text style={styles.buttonText}>Edit</Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
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
    padding: 20,
    backgroundColor: "#f5f5f5",
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