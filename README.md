# AI-Mental-Health-Companion

users:
Patient:
1. jayesh : jayesh@gmail.com, jayesh
2. Jeevesh : jeevesh@gmail.com, jeevesh

Doctor:
1. Kumar : kumar@gmail.com, kumar

# Phase 1:

    php files created: 
    C:\xampp\htdocs\
    └── ai_companion_backend/
        ├── api/
        │   ├── auth.php
        │   ├── goals.php
        │   ├── counselor_dashboard.php
        │   ├── dashboard.php
        │   ├── journal.php
        │   └── mood.php
        └── db_connect.php

# auth.php:
    <?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include '../db_connect.php';

    $data = json_decode(file_get_contents("php://input"));

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($data->action)) {
            $action = $data->action;

            if ($action === 'signup') {
                $username = $conn->real_escape_string($data->username);
                $email = $conn->real_escape_string($data->email);
                $password = $data->password;
                $role = $data->role;

                $password_hash = password_hash($password, PASSWORD_DEFAULT);

                $sql = "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssss", $username, $password_hash, $email, $role);

                if ($stmt->execute()) {
                    echo json_encode(["message" => "User registered successfully."]);
                } else {
                    echo json_encode(["message" => "Error: " . $stmt->error]);
                }
            } elseif ($action === 'login') {
                $username = $conn->real_escape_string($data->username);
                $password = $data->password;

                $sql = "SELECT id, password_hash, role FROM users WHERE username = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $username);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    if (password_verify($password, $user['password_hash'])) {
                        echo json_encode([
                            "message" => "Login successful.",
                            "user_id" => $user['id'],
                            "role" => $user['role']
                        ]);
                    } else {
                        echo json_encode(["message" => "Invalid username or password."]);
                    }
                } else {
                    echo json_encode(["message" => "Invalid username or password."]);
                }
            }
        } else {
            echo json_encode(["message" => "No action specified."]);
        }
    } else {
        echo json_encode(["message" => "Invalid request method."]);
    }

    $conn->close();
    ?>

# goals.php:
    <?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include '../db_connect.php';

    $data = json_decode(file_get_contents("php://input"));

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($data->user_id) && isset($data->description)) {
            $user_id = $conn->real_escape_string($data->user_id);
            $description = $conn->real_escape_string($data->description);
            $start_date = isset($data->start_date) ? $conn->real_escape_string($data->start_date) : date('Y-m-d');
            $end_date = isset($data->end_date) ? $conn->real_escape_string($data->end_date) : null;
            
            // Check if this is an update or a new goal
            if (isset($data->goal_id)) {
                $goal_id = $conn->real_escape_string($data->goal_id);
                $is_completed = $data->is_completed ? 1 : 0;
                
                $sql = "UPDATE goals SET description = ?, is_completed = ?, end_date = ? WHERE id = ? AND user_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sisii", $description, $is_completed, $end_date, $goal_id, $user_id);
            } else {
                $sql = "INSERT INTO goals (user_id, description, start_date, end_date) VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("isss", $user_id, $description, $start_date, $end_date);
            }

            if ($stmt->execute()) {
                echo json_encode(["message" => "Goal saved successfully."]);
            } else {
                echo json_encode(["message" => "Error: " . $stmt->error]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data provided."]);
        }
    } else {
        echo json_encode(["message" => "Invalid request method."]);
    }

    $conn->close();
    ?>

# counselor_dashboard.php:
    <?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include '../db_connect.php';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['counselor_id'])) {
            $counselor_id = $conn->real_escape_string($_GET['counselor_id']);
            $response = [
                'dashboardStats' => [],
                'patients' => [],
                'recentAlerts' => []
            ];

            // Fetch Total Patients
            $sql_total_patients = "SELECT COUNT(patient_id) AS total FROM counselor_patients WHERE counselor_id = ?";
            $stmt = $conn->prepare($sql_total_patients);
            $stmt->bind_param("i", $counselor_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result && $row = $result->fetch_assoc()) {
                $total_patients = $row['total'];
            } else {
                $total_patients = 0;
            }
            $response['dashboardStats']['total_patients'] = $total_patients;

            // Fetch Active Alerts
            $sql_alerts = "
                SELECT COUNT(a.id) AS alert_count
                FROM alerts a
                JOIN counselor_patients cp ON a.patient_id = cp.patient_id
                WHERE cp.counselor_id = ? AND a.severity IN ('moderate', 'high')
            ";
            $stmt = $conn->prepare($sql_alerts);
            $stmt->bind_param("i", $counselor_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result && $row = $result->fetch_assoc()) {
                $active_alerts = $row['alert_count'];
            } else {
                $active_alerts = 0;
            }
            $response['dashboardStats']['active_alerts'] = $active_alerts;

            // Fetch Recent Alerts for display - Corrected to use u.username
            $sql_recent_alerts = "
                SELECT u.username, a.message, a.severity, a.created_at
                FROM alerts a
                JOIN users u ON a.patient_id = u.id
                JOIN counselor_patients cp ON u.id = cp.patient_id
                WHERE cp.counselor_id = ?
                ORDER BY a.created_at DESC
                LIMIT 5
            ";
            $stmt = $conn->prepare($sql_recent_alerts);
            $stmt->bind_param("i", $counselor_id);
            $stmt->execute();
            $recent_alerts_result = $stmt->get_result();
            $response['recentAlerts'] = $recent_alerts_result->fetch_all(MYSQLI_ASSOC);

            // Fetch Patients List - Corrected to use u.username
            $sql_patients = "
                SELECT u.id, u.username
                FROM users u
                JOIN counselor_patients cp ON u.id = cp.patient_id
                WHERE cp.counselor_id = ?
            ";
            $stmt = $conn->prepare($sql_patients);
            $stmt->bind_param("i", $counselor_id);
            $stmt->execute();
            $patients_result = $stmt->get_result();

            $patients_list = [];
            if ($patients_result) {
                while ($patient = $patients_result->fetch_assoc()) {
                    // Simplified logic to get a basic mood count as a 'streak'
                    $sql_mood_count = "SELECT COUNT(id) AS streak FROM mood_entries WHERE user_id = ?";
                    $stmt_mood = $conn->prepare($sql_mood_count);
                    $stmt_mood->bind_param("i", $patient['id']);
                    $stmt_mood->execute();
                    $mood_count_result = $stmt_mood->get_result();
                    if ($mood_count_result && $row_mood_count = $mood_count_result->fetch_assoc()) {
                        $mood_count = $row_mood_count['streak'];
                    } else {
                        $mood_count = 0;
                    }

                    $patients_list[] = [
                        'id' => $patient['id'],
                        'name' => $patient['username'],
                        'streak' => $mood_count,
                        'moodTrend' => 'stable', // Placeholder
                        'riskLevel' => 'low',    // Placeholder
                        'recentAlerts' => 0      // Placeholder
                    ];
                }
            }
            $response['patients'] = $patients_list;
            
            // Add placeholders for other dashboard stats
            $response['dashboardStats']['avg_wellness'] = 7.0;
            $response['dashboardStats']['sessions_today'] = 0;


            echo json_encode($response);

        } else {
            echo json_encode(["message" => "Counselor ID not provided."]);
        }
    } else {
        echo json_encode(["message" => "Invalid request method."]);
    }

    $conn->close();
    ?>

# dashboard.php:
    <?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include '../db_connect.php';

    $data = json_decode(file_get_contents("php://input"));

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($data->action)) {
            $action = $data->action;

            if ($action === 'signup') {
                $username = $conn->real_escape_string($data->username);
                $email = $conn->real_escape_string($data->email);
                $password = $data->password;
                $role = $data->role;

                $password_hash = password_hash($password, PASSWORD_DEFAULT);

                $sql = "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssss", $username, $password_hash, $email, $role);

                if ($stmt->execute()) {
                    echo json_encode(["message" => "User registered successfully."]);
                } else {
                    echo json_encode(["message" => "Error: " . $stmt->error]);
                }
            } elseif ($action === 'login') {
                $username = $conn->real_escape_string($data->username);
                $password = $data->password;

                $sql = "SELECT id, password_hash, role FROM users WHERE username = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $username);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    if (password_verify($password, $user['password_hash'])) {
                        echo json_encode([
                            "message" => "Login successful.",
                            "user_id" => $user['id'],
                            "role" => $user['role']
                        ]);
                    } else {
                        echo json_encode(["message" => "Invalid username or password."]);
                    }
                } else {
                    echo json_encode(["message" => "Invalid username or password."]);
                }
            }
        } else {
            echo json_encode(["message" => "No action specified."]);
        }
    } else {
        echo json_encode(["message" => "Invalid request method."]);
    }

    $conn->close();
    ?>

# journal.php:
    <?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include '../db_connect.php';

    $data = json_decode(file_get_contents("php://input"));

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($data->user_id) && isset($data->content)) {
            $user_id = $conn->real_escape_string($data->user_id);
            $title = isset($data->title) ? $conn->real_escape_string($data->title) : null;
            $content = $conn->real_escape_string($data->content);

            $sql = "INSERT INTO journal_entries (user_id, title, content) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iss", $user_id, $title, $content);

            if ($stmt->execute()) {
                echo json_encode(["message" => "Journal entry saved successfully."]);
            } else {
                echo json_encode(["message" => "Error: " . $stmt->error]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data provided."]);
        }
    } else {
        echo json_encode(["message" => "Invalid request method."]);
    }

    $conn->close();
    ?>

# mood.php:
    <?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include '../db_connect.php';

    $data = json_decode(file_get_contents("php://input"));

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($data->user_id) && isset($data->mood) && isset($data->entry_text)) {
            $user_id = $conn->real_escape_string($data->user_id);
            $mood = $conn->real_escape_string($data->mood);
            $sentiment = $conn->real_escape_string($data->sentiment);
            $entry_text = $conn->real_escape_string($data->entry_text);

            $sql = "INSERT INTO mood_entries (user_id, mood, sentiment, entry_text) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("isss", $user_id, $mood, $sentiment, $entry_text);

            if ($stmt->execute()) {
                echo json_encode(["message" => "Mood entry saved successfully."]);
            } else {
                echo json_encode(["message" => "Error: " . $stmt->error]);
            }
        } else {
            echo json_encode(["message" => "Incomplete data provided."]);
        }
    } else {
        echo json_encode(["message" => "Invalid request method."]);
    }

    $conn->close();
    ?>

    # db_connect.php:
    <?php
    $servername = "localhost";
    $username = "root"; // Default XAMPP username
    $password = "";     // Default XAMPP password
    $dbname = "ai_companion_db"; // The database name you chose earlier

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    ?>


# Phase 2:

the thing that i need to do but cant do now:
Push Notifications & Nudges:
1. Daily Check-in Reminders: A system to send daily notifications to a user to log their mood.

2. Motivational Quotes: Sending gentle nudges or motivational messages. For a web app, these would be browser notifications.

can't do this now coz we need VAPID key which is need to send notification through websites. if you want send notification from browsers then it is needed. so ill do it later .



A councelor is not assigned to every person signed up in our website. it is assigned only when a patient indicates a primary concern of "anxiety" or similar emotions, a counselor is assigned. 
this assigning of counselor is done based on rule based and availability based. it is a blend inorder to ensures that patients get matched with a counselor who can best address their needs while also balancing the workload of hte counselor.


phase 2 is almost completed, small bugs need to be fixed, and rigourous testing need to be done.