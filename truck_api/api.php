
<?php

header("Content-Type: application/json");

$host = "localhost";
$dbname = "truck_delivery_db";
$username = "root";
$password = "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $method = $_SERVER["REQUEST_METHOD"];

    // READ - GET
    if ($method === "GET") {

        $stmt = $pdo->query(
            "SELECT * FROM deliveries ORDER BY id DESC"
        );

        $deliveries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $deliveries
        ]);

    }

    // CREATE - POST
    elseif ($method === "POST") {

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare(
            "INSERT INTO deliveries
            (customer_name, destination, truck_plate,
            driver_name, delivery_date, status)
            VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $data["customer_name"],
            $data["destination"],
            $data["truck_plate"],
            $data["driver_name"],
            $data["delivery_date"],
            $data["status"]
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Delivery added successfully."
        ]);

    }

    // UPDATE - PUT
    elseif ($method === "PUT") {

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare(
            "UPDATE deliveries SET
            customer_name = ?,
            destination = ?,
            truck_plate = ?,
            driver_name = ?,
            delivery_date = ?,
            status = ?
            WHERE id = ?"
        );

        $stmt->execute([
            $data["customer_name"],
            $data["destination"],
            $data["truck_plate"],
            $data["driver_name"],
            $data["delivery_date"],
            $data["status"],
            $data["id"]
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Delivery updated successfully."
        ]);

    }

    // DELETE - DELETE
    elseif ($method === "DELETE") {

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare(
            "DELETE FROM deliveries WHERE id = ?"
        );

        $stmt->execute([$data["id"]]);

        echo json_encode([
            "success" => true,
            "message" => "Delivery deleted successfully."
        ]);

    }

    else {

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method not allowed."
        ]);

    }

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error."
    ]);

}

?>
