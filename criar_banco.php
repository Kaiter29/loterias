<?php
$db_dir = __DIR__ . '/db';

if (!is_dir($db_dir)) {
    mkdir($db_dir, 0777, true);
}

$db = new SQLite3($db_dir . '/dados.sqlite');

$db->exec("CREATE TABLE IF NOT EXISTS sequencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo_jogo TEXT NOT NULL,
    numeros TEXT NOT NULL,
    status INTEGER DEFAULT 1,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$db->exec("CREATE TABLE IF NOT EXISTS resultados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sequencia_id INTEGER NOT NULL,
    num_jogo INTEGER NOT NULL,
    tipo_jogo TEXT NOT NULL,
    numeros TEXT NOT NULL,
    dia_jogo DATE,
    num_acertos INTEGER NOT NULL,
    sequencia_nome TEXT NOT NULL,
    numeros_jogados TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
)");

echo "Banco de dados e tabelas criados/atualizados com sucesso!";
