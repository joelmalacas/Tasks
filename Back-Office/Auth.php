<?php

class Auth {

   function __Construct() {}

    public function token($db, $user_id) : string {
        try{
            $token = bin2hex(random_bytes(32)); //64 char hex

            $db->statementDB("UPDATE users SET token = ? WHERE id = ?", [$token, $user_id]);

            return $token;
        } catch (Exception $ex) {
            http_response_code(500);
            echo json_encode(['Error' => $ex->getMessage()]);
            exit;
        }
    }

    public function validateToken($db) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? '';

        if (!str_starts_with($auth, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(['Error' => 'Token não fornecido']);
            exit;
        }

        $token = substr($auth, 7);

        $res = $db->statementDB("SELECT id FROM users WHERE token = ?", [$token]);

        if (empty($res)) {
            http_response_code(401);
            echo json_encode(['Error' => 'Token inválido ou expirado']);
            exit;
        }

        return $res[0]['id'];
    }

}