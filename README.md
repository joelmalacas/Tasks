# Task Manager API

REST API desenvolvida em PHP para gestão de tarefas e autenticação de utilizadores.

---

## Estrutura do Projeto

```
├── TasksAPI.php        # Endpoints de tarefas (Tasks)
├── UsersAPI.php        # Endpoints de utilizadores (Auth)
├── DataBase.php     # Classe de ligação e queries à base de dados
└── EnvCors.php      # Configuração de ambiente e CORS
```

---

## Base de Dados

A API utiliza MySQL com duas tabelas principais:

**`users`** — utilizadores registados  
**`tasks`** — tarefas associadas a cada utilizador

---

## Endpoints

### Autenticação (`UsersAPI.php`)

#### `POST /CreateUser`
Cria um novo utilizador.

**Body (JSON):**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Respostas:**
| Código | Descrição |
|--------|-----------|
| `201` | Utilizador criado com sucesso |
| `400` | Formato de e-mail inválido |
| `500` | Erro interno ao inserir na base de dados |

> A password é armazenada como hash SHA-256.

---

#### `POST /LoginUser`
Autentica um utilizador por username ou e-mail.

**Body (JSON):**
```json
{
  "username": "johndoe ou john@example.com",
  "password": "secret123"
}
```

**Resposta de sucesso (`200`):**
```json
{
  "Success": true,
  "Message": "Login efetuado com sucesso.",
  "User": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Respostas de erro:**
| Código | Descrição |
|--------|-----------|
| `401` | Credenciais inválidas ou utilizador não encontrado |

---

### Tarefas (`index.php`)

> Todos os endpoints de tarefas requerem o parâmetro `user_id` via query string, exceto onde indicado.

---

#### `GET /TESTDB`
Verifica a ligação à base de dados.

**Resposta:** `"Test DB Success"` ou `"Test DB Failed"`

---

#### `GET /TASKS?user_id={id}`
Lista todas as tarefas de um utilizador.

**Parâmetros de query:**
| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `user_id` | ✅ | ID do utilizador |

**Resposta de sucesso (`200`):**
```json
[
  {
    "id": 1,
    "nome": "Comprar mantimentos",
    "descricao": "Ir ao supermercado",
    "estado": "pendente",
    "created_at": "2025-01-01 10:00:00",
    "updated_at": "2025-01-01 10:00:00",
    "categoria": "pessoal"
  }
]
```

**Respostas de erro:**
| Código | Descrição |
|--------|-----------|
| `400` | `user_id` não fornecido |
| `500` | Erro ao obter tarefas |

---

#### `POST /CREATETASK?user_id={id}&nome={nome}&descricao={descricao}&categoria={categoria}`
Cria uma nova tarefa para o utilizador.

**Parâmetros de query:**
| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `user_id` | ✅ | ID do utilizador |
| `nome` | ✅ | Nome da tarefa |
| `descricao` | ❌ | Descrição da tarefa |
| `categoria` | ❌ | Categoria da tarefa |

> O estado inicial da tarefa é sempre `"pendente"`.

**Respostas:**
| Código | Descrição |
|--------|-----------|
| `200` | Tarefa criada com sucesso |
| `500` | Erro ao criar tarefa |

---

#### `PUT /UPDATETASK?id={id}&estado={estado}`
Atualiza o estado de uma tarefa existente.

**Parâmetros de query:**
| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `id` | ✅ | ID da tarefa |
| `estado` | ✅ | Novo estado (ex: `"concluída"`, `"pendente"`) |

**Respostas:**
| Código | Descrição |
|--------|-----------|
| `200` | Tarefa atualizada com sucesso |
| `500` | Erro ao atualizar tarefa |

---

#### `DELETE /DELETETASK?id={id}`
Remove uma tarefa.

**Parâmetros de query:**
| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `id` | ✅ | ID da tarefa a eliminar |

**Respostas:**
| Código | Descrição |
|--------|-----------|
| `200` | Tarefa eliminada com sucesso |
| `500` | Erro ao eliminar tarefa |

---

## Configuração

As variáveis de ambiente e configurações de CORS são geridas pela classe `EnvCors`. Certifica-te de que o ficheiro de ambiente está corretamente configurado com:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=
DB_NAME=
```

---

## Notas de Segurança

- As passwords são guardadas com hash **SHA-256** (recomenda-se migrar para `password_hash()` com bcrypt em produção).
- Os parâmetros das tarefas são passados via **query string** — em produção, considera usar o body do request para dados sensíveis.
