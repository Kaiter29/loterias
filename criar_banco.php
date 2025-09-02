<?php
$db_dir = __DIR__ . '/db';
$db_file = $db_dir . '/dados.sqlite';

if (!is_dir($db_dir)) {
    mkdir($db_dir, 0777, true);
}

if (file_exists($db_file)) {
    echo "<h1>Banco de dados já existe!</h1>";
    echo "<p>Redirecionando em 3 segundos...</p>";
    header("Refresh: 3; url=index.php");
    exit;
}

try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sequencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            tipo_jogo TEXT NOT NULL,
            numeros TEXT NOT NULL,
            status INTEGER DEFAULT 1,
            created DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS resultados (
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
        );
    ");

    echo "<h1>Banco de dados e tabelas criados com sucesso!</h1>";
    echo "<p>Você será redirecionado para a página principal em 3 segundos.</p>";
    header("Refresh: 3; url=index.php");
} catch (PDOException $e) {
    die("Erro ao criar o banco de dados: " . $e->getMessage());
}
?>
