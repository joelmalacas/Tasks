<?php
    include "DataBase.php";
    include "EnvCors.php";
    include "Auth.php";

    $EnvCors = new EnvCors();
    $Auth = new Auth();

    $host    = $EnvCors->getHost();
    $port    = $EnvCors->getPort();
    $user    = $EnvCors->getUser();
    $pass    = $EnvCors->getPass();
    $db_name = $EnvCors->getDBName();

    $db = new DataBase($host, $port, $user, $pass, $db_name);

    //ROUTE
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    //TODO ENDPOINT PARA CRIAR USER
    if (str_ends_with($uri, '/CreateUser') && ($_SERVER['REQUEST_METHOD'] === 'POST')) {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? null;
        $email = $input['email'] ?? null;
        $pass = $input['password'] ?? null;

        //CHECK IF EMAIL
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['Error' => 'Formato de e-mail inválido.']);
            exit;
        }

        $Hashpass = hash('sha256', $pass); //Encode password to sha-256 (64 char)

        $resUserInsert = $db->statementDB("INSERT INTO users (username, email, password, estado) VALUES (?, ?, ?, ?)",
            [$username, $email, $Hashpass, 'Offline']
        );

        if ($resUserInsert) {
            http_response_code(201);
            echo json_encode(['Success' => $resUserInsert]);
        } else {
            http_response_code(500);
            echo json_encode(['Error' => $resUserInsert]);
        }
        exit;
    }

    //TODO ENDPOINT LOGIN
    if (str_ends_with($uri, '/LoginUser') && ($_SERVER['REQUEST_METHOD'] === 'POST')) {
        $input = json_decode(file_get_contents('php://input'), true);
        $emailOrUsername = $input['username'] ?? null;
        $pass = $input['password'] ?? null;

        $resLog = $db->statementDB(
            "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?",
            [$emailOrUsername, $emailOrUsername]
        );

        if (!empty($resLog) && count($resLog) > 0) {
            $user = $resLog[0];

            if (hash('sha256', $pass) === $user['password']) {
                $loginOk = true;
            } else {
                $loginOk = false;
            }

            if ($loginOk) {
                //Create Barrer Token
                $token = $Auth->token($db, $user['id']);

                http_response_code(200);
                echo json_encode([
                    'Success' => true,
                    'Message' => 'Login efetuado com sucesso.',
                    'Token'   => $token,
                    'User'    => [
                        'id'       => $user['id'],
                        'username' => $user['username'],
                        'email'    => $user['email']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['Error' => 'Crendenciais inválidas']);

            }
        } else {
            http_response_code(401);
            echo json_encode(['Error' => 'Utilizador não encontrado']);
        }
        exit;
    }