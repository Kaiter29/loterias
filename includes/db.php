<?php
$db_file = __DIR__ . '/../db/dados.sqlite';
$pdo = null;

if (file_exists($db_file)) {
    try {
        $pdo = new PDO("sqlite:" . $db_file);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $pdo = null;
    }
}
?>
