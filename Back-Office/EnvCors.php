<?php

class EnvCors {

    private string $host;
    private int $port;
    private string $user;
    private string $pass;
    private mixed $db_name;

    function __construct() {
        $this->loadEnv();
        $this->loadCors();

        $this->host = $_ENV['DB_HOST'];
        $this->port = $_ENV['DB_PORT'] ?? 3306;
        $this->user = $_ENV['DB_USER'];
        $this->pass = $_ENV['DB_PASS'];
        $this->db_name = $_ENV['DB_NAME'];
    }

    private function loadEnv(): void {
        foreach (file(__DIR__ . '/.env') as $line) {
            $line = trim($line);
            if ($line && !str_starts_with($line, '#')) {
                [$key, $value] = explode('=', $line, 2);
                $_ENV[trim($key)] = trim($value);
            }
        }
    }

    function loadCors(): void {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }


    //TODO GETTERS's
    public function getUser(): string {
        return $this->user;
    }

    public function getHost(): string {
        return $this->host;
    }

    public function getDbName(): mixed {
        return $this->db_name;
    }

    public function getPort(): int {
        return $this->port;
    }

    public function getPass(): string {
        return $this->pass;
    }
}