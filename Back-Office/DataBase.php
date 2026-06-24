<?php
class DataBase {

    public String $host;
    public int $port;
    public String $user;
    public String $pass;
    public String $db;
    public ?mysqli $conn = null;

    function __construct($host, $port, $user, $pass, $db) {
        $this->host = $host;
        $this->port = $port;
        $this->user = $user;
        $this->pass = $pass;
        $this->db = $db;
    }

    function connDB() {
        //Ativa excepções no mysqli
        mysqli_report(MYSQLI_REPORT_STRICT);

        try {
            $this->conn = new mysqli($this->host, $this->user, $this->pass, $this->db);
            return true;
        } catch (Exception $e) {
            echo json_encode('Connect DB Failed: ' . $e->getMessage());
            return false;
        }
    }

    function TestDB(): bool {
        $this->connDB();
        return $this->conn !=null && $this->conn->ping();
    }

    function statementDB(String $statement, array $params = []): mixed {
        $this->connDB();
        $this->conn->query("USE {$this->db}");

        $stmt = $this->conn->prepare($statement);

        if ($stmt === false)
            return false;

        if (!empty($params)) {
            $type = str_repeat('s', count($params));
            $stmt->bind_param($type, ...$params);
        }

        $executeSuccess = $stmt->execute();

        if (!$executeSuccess) {
            $stmt->close();
            return false;
        }

        if (str_starts_with(strtoupper($statement), 'SELECT')) {
            $mysqli_result = $stmt->get_result();
            $result = $mysqli_result->fetch_all(MYSQLI_ASSOC);

            $mysqli_result->free();
        } else {
            $result = true;
        }

        $stmt->close();
        return $result;
    }
}