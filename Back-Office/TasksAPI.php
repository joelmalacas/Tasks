<?php
    include "DataBase.php";
    include "EnvCors.php";

    $EnvCors = new EnvCors();

    $EnvCors->loadCors();

    $host    = $EnvCors->getHost();
    $port    = $EnvCors->getPort();
    $user    = $EnvCors->getUser();
    $pass    = $EnvCors->getPass();
    $db_name = $EnvCors->getDBName();

    $db = new DataBase($host, $port, $user, $pass, $db_name);

    //ROUTE
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    //ENDPOINT PARA VERIFICAR LIGAÇÃO BD
    if (str_ends_with($uri, '/TESTDB')) {
        if ($db->TestDB())
            echo json_encode('Test DB Success');
        else
            echo json_encode('Test DB Failed');
    }

    //TODO ENDPOINT PARA LISTAR TAREFA
    if (str_ends_with($uri, '/TASKS')) {
        $res = $db->statementDB("SELECT id,nome,descricao,estado,created_at, updated_at, categoria FROM tasks");

        if ($res instanceof mysqli_result) {
            $tasks = $res->fetch_all(MYSQLI_ASSOC);
            echo json_encode($tasks);
        } else {
            http_response_code(500);
            echo json_encode('Erro ao tentar obter as tarefas');
        }
    }

    //TODO ENDPOINT PARA CRIAR TAREFA
    if (str_ends_with($uri, '/CREATETASK') && ($_SERVER['REQUEST_METHOD'] === 'POST')) {
        //Add param URL
        $user_id = $_GET['user_id'];
        $nome = $_GET['nome'] ?? null;
        $descricao = $_GET['descricao'] ?? null;
        $categoria = $_GET['categoria'] ?? null;

        $resInsert = $db->statementDB(
            "INSERT INTO tasks (user_id, nome, descricao, estado ,categoria) VALUES (?, ?, ?, ?, ?)",
            [$user_id ,$nome, $descricao, 'pendente' ,$categoria]
        );

        if ($resInsert) {
            http_response_code(200);
            echo json_encode(['success INSERT' => $resInsert]);
        } else {
            http_response_code(500);
            echo json_encode('Erro ao tentar criar tarefa');
        }
    }

    //TODO ENDPOINT PARA EDITAR STATUS TAREFA
    if (str_ends_with($uri, '/UPDATETASK') && ($_SERVER['REQUEST_METHOD'] === 'PUT')) {
        $id = $_GET['id'];
        $estado = $_GET['estado'];

        $resUpdate = $db->statementDB(
            "UPDATE tasks SET estado = ?,  updated_at = ? WHERE id = ?",
            [$estado, date('Y-m-d H:i:s') , $id]
        );

        if ($resUpdate) {
            http_response_code(200);
            echo json_encode(['success UPDATE' => $resUpdate]);
        } else {
            http_response_code(500);
            echo json_encode('Erro ao tentar atualizar tarefa');
        }
    }

    //TODO ENDPOINT PARA REMOVER TAREFA
    if (str_ends_with($uri, '/DELETETASK') && ($_SERVER['REQUEST_METHOD'] === 'DELETE')) {
        //Add param URL
        $id = $_GET['id'];

        $resDel = $db->statementDB("DELETE FROM tasks WHERE id = ?", [$id]);

        if ($resDel) {
            http_response_code(200);
            echo json_encode(['success DELETE' => $resDel]);
        } else {
            http_response_code(500);
            echo json_encode('Erro ao tentar eliminar tarefa');
        }
    }