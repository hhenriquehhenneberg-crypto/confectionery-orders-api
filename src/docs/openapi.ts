export const openapi = {
  "openapi": "3.0.3",
  "info": {
    "title": "Confectionery Orders API",
    "version": "2.0.0",
    "description": "API acadêmica para clientes, encomendas e pagamentos. Pagamentos são registros administrativos; a API não processa transações bancárias. Não permite pagar encomenda cancelada, ultrapassar o saldo ou reduzir o preço abaixo do total pago."
  },
  "servers": [
    {
      "url": "/"
    }
  ],
  "tags": [
    {
      "name": "Customer"
    },
    {
      "name": "Order"
    },
    {
      "name": "Payment"
    }
  ],
  "paths": {
    "/customers": {
      "get": {
        "tags": [
          "Customer"
        ],
        "summary": "Listar registros",
        "responses": {
          "200": {
            "description": "Lista",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Customer"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Customer"
        ],
        "summary": "Cadastrar registro",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CustomerCreate"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Criado",
            "headers": {
              "Location": {
                "schema": {
                  "type": "string"
                },
                "description": "URL do registro criado"
              }
            },
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Customer"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/customers/{id}": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          }
        }
      ],
      "get": {
        "tags": [
          "Customer"
        ],
        "summary": "Consultar por UUID",
        "responses": {
          "200": {
            "description": "Registro",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Customer"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Customer"
        ],
        "summary": "Atualizar os campos informados",
        "description": "Campos omitidos preservam o valor atual.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CustomerUpdate"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Atualizado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Customer"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Customer"
        ],
        "summary": "Excluir registro",
        "responses": {
          "204": {
            "description": "Excluído, sem corpo"
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/orders": {
      "get": {
        "tags": [
          "Order"
        ],
        "summary": "Listar registros",
        "responses": {
          "200": {
            "description": "Lista",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Order"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Order"
        ],
        "summary": "Cadastrar registro",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/OrderCreate"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Criado",
            "headers": {
              "Location": {
                "schema": {
                  "type": "string"
                },
                "description": "URL do registro criado"
              }
            },
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/orders/{id}": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          }
        }
      ],
      "get": {
        "tags": [
          "Order"
        ],
        "summary": "Consultar por UUID",
        "responses": {
          "200": {
            "description": "Registro",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Order"
        ],
        "summary": "Atualizar os campos informados",
        "description": "Campos omitidos preservam o valor atual.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/OrderUpdate"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Atualizado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Order"
        ],
        "summary": "Excluir registro",
        "responses": {
          "204": {
            "description": "Excluído, sem corpo"
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/payments": {
      "get": {
        "tags": [
          "Payment"
        ],
        "summary": "Listar registros",
        "responses": {
          "200": {
            "description": "Lista",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Payment"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Payment"
        ],
        "summary": "Cadastrar registro",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentCreate"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Criado",
            "headers": {
              "Location": {
                "schema": {
                  "type": "string"
                },
                "description": "URL do registro criado"
              }
            },
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Payment"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/payments/{id}": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          }
        }
      ],
      "get": {
        "tags": [
          "Payment"
        ],
        "summary": "Consultar por UUID",
        "responses": {
          "200": {
            "description": "Registro",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Payment"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Payment"
        ],
        "summary": "Atualizar os campos informados",
        "description": "O vínculo order_id não pode ser alterado.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentUpdate"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Atualizado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Payment"
                }
              }
            }
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Payment"
        ],
        "summary": "Excluir registro",
        "responses": {
          "204": {
            "description": "Excluído, sem corpo"
          },
          "400": {
            "description": "Dados ou UUID inválidos",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro relacionado ou solicitado não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "409": {
            "description": "Operação impedida por regra de negócio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "413": {
            "description": "Requisição excede 100 KB",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/customers/{id}/orders": {
      "get": {
        "tags": [
          "Customer"
        ],
        "summary": "Listar registros relacionados",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Order"
                  }
                }
              }
            }
          },
          "400": {
            "description": "UUID inválido",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro pai não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/orders/{id}/payments": {
      "get": {
        "tags": [
          "Order"
        ],
        "summary": "Listar registros relacionados",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Payment"
                  }
                }
              }
            }
          },
          "400": {
            "description": "UUID inválido",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Registro pai não encontrado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Erro interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Error": {
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "field": {
                  "type": "string"
                },
                "message": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "CustomerCreate": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "phone": {
            "type": "string",
            "minLength": 1,
            "maxLength": 30
          },
          "email": {
            "type": "string",
            "format": "email",
            "nullable": true,
            "maxLength": 150
          }
        },
        "required": [
          "name",
          "phone"
        ],
        "example": {
          "name": "Mariana Souza",
          "phone": "41999999999",
          "email": "mariana@example.com"
        }
      },
      "CustomerUpdate": {
        "type": "object",
        "additionalProperties": false,
        "minProperties": 1,
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "phone": {
            "type": "string",
            "minLength": 1,
            "maxLength": 30
          },
          "email": {
            "type": "string",
            "format": "email",
            "nullable": true,
            "maxLength": 150
          }
        }
      },
      "Customer": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "phone": {
            "type": "string",
            "minLength": 1,
            "maxLength": 30
          },
          "email": {
            "type": "string",
            "format": "email",
            "nullable": true,
            "maxLength": 150
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "OrderCreate": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "customer_id": {
            "type": "string",
            "format": "uuid"
          },
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 150
          },
          "description": {
            "type": "string",
            "nullable": true,
            "maxLength": 500
          },
          "occasion": {
            "type": "string",
            "nullable": true,
            "enum": [
              "birthday",
              "wedding",
              "party",
              "corporate",
              "other"
            ]
          },
          "delivery_date": {
            "type": "string",
            "format": "date-time"
          },
          "total_price": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01
          },
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "confirmed",
              "in_production",
              "ready",
              "delivered",
              "cancelled"
            ],
            "default": "pending"
          }
        },
        "required": [
          "customer_id",
          "title",
          "delivery_date",
          "total_price"
        ],
        "example": {
          "customer_id": "11111111-1111-4111-8111-111111111111",
          "title": "Bolo de aniversário",
          "delivery_date": "2026-12-10T15:00:00-03:00",
          "total_price": 280
        }
      },
      "OrderUpdate": {
        "type": "object",
        "additionalProperties": false,
        "minProperties": 1,
        "properties": {
          "customer_id": {
            "type": "string",
            "format": "uuid"
          },
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 150
          },
          "description": {
            "type": "string",
            "nullable": true,
            "maxLength": 500
          },
          "occasion": {
            "type": "string",
            "nullable": true,
            "enum": [
              "birthday",
              "wedding",
              "party",
              "corporate",
              "other"
            ]
          },
          "delivery_date": {
            "type": "string",
            "format": "date-time"
          },
          "total_price": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01
          },
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "confirmed",
              "in_production",
              "ready",
              "delivered",
              "cancelled"
            ],
            "default": "pending"
          }
        }
      },
      "Order": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "customer_id": {
            "type": "string",
            "format": "uuid"
          },
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 150
          },
          "description": {
            "type": "string",
            "nullable": true,
            "maxLength": 500
          },
          "occasion": {
            "type": "string",
            "nullable": true,
            "enum": [
              "birthday",
              "wedding",
              "party",
              "corporate",
              "other"
            ]
          },
          "delivery_date": {
            "type": "string",
            "format": "date-time"
          },
          "total_price": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01
          },
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "confirmed",
              "in_production",
              "ready",
              "delivered",
              "cancelled"
            ],
            "default": "pending"
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "PaymentCreate": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "order_id": {
            "type": "string",
            "format": "uuid"
          },
          "amount": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01,
            "exclusiveMinimum": true
          },
          "method": {
            "type": "string",
            "enum": [
              "pix",
              "cash",
              "credit_card",
              "debit_card"
            ]
          }
        },
        "required": [
          "order_id",
          "amount",
          "method"
        ],
        "example": {
          "order_id": "22222222-2222-4222-8222-222222222222",
          "amount": 100,
          "method": "pix"
        }
      },
      "PaymentUpdate": {
        "type": "object",
        "additionalProperties": false,
        "minProperties": 1,
        "properties": {
          "amount": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01,
            "exclusiveMinimum": true
          },
          "method": {
            "type": "string",
            "enum": [
              "pix",
              "cash",
              "credit_card",
              "debit_card"
            ]
          }
        }
      },
      "Payment": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "order_id": {
            "type": "string",
            "format": "uuid"
          },
          "amount": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01,
            "exclusiveMinimum": true
          },
          "method": {
            "type": "string",
            "enum": [
              "pix",
              "cash",
              "credit_card",
              "debit_card"
            ]
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    }
  }
};
