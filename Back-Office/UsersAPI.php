<?php
    include "DataBase.php";
    include "EnvCors.php";

    $EnvCors = new EnvCors();

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
        //ADD PARAM URL
        $username = $_GET['username'];
        $email = $_GET['email'];
        $pass = $_GET['password'];

        //CHECK IF EMAIL
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['Error' => 'Formato de e-mail inválido.']);
            exit;
        }

        $Hashpass = hash('sha256', $pass); //Encode password to sha-256 (64 char)

        $resUserInsert = $db->statementDB("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [$username, $email, $Hashpass]
        );

        if ($resUserInsert) {
            http_response_code(201);
            echo json_encode(['Success' => $resUserInsert]);
        } else {
            http_response_code(500);
            echo json_encode(['Error' => $resUserInsert]);
        }
    }