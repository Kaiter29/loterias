<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = $_POST['acao'] ?? '';
    if ($acao === 'salvar') {
        salvarSequencia();
    } elseif ($acao === 'excluir') {
        desativarSequencia();
    } elseif ($acao === 'reativar') {
        reativarSequencia();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $acao = $_GET['acao'] ?? '';
    if ($acao === 'buscar') {
        buscarSequenciaPorId();
    }
}

function salvarSequencia() {
    $db = conectarBanco();
    $id = $_POST['id_sequencia'] ?? null;
    $nome = $_POST['nome'];
    $numeros = $_POST['numeros'];
    $tipo = $_POST['tipo_jogo'];
    
    if (empty($id)) {
        $stmt = $db->prepare("INSERT INTO sequencias (nome, tipo_jogo, numeros) VALUES (?, ?, ?)");
    } else {
        $stmt = $db->prepare("UPDATE sequencias SET nome = ?, tipo_jogo = ?, numeros = ? WHERE id = ?");
        $stmt->bindValue(4, $id);
    }
    
    $stmt->bindValue(1, $nome);
    $stmt->bindValue(2, $tipo);
    $stmt->bindValue(3, $numeros);
    $stmt->execute();

    header("Location: ../index.php");
    exit;
}

function desativarSequencia() {
    $db = conectarBanco();
    $id = $_POST['id'] ?? 0;

    $stmt = $db->prepare("UPDATE sequencias SET status = 0 WHERE id = ?");
    $stmt->bindValue(1, $id);
    $stmt->execute();
    
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Sequência desativada.']);
    exit;
}

function reativarSequencia() {
    $db = conectarBanco();
    $id = $_POST['id'] ?? 0;

    $stmt = $db->prepare("UPDATE sequencias SET status = 1 WHERE id = ?");
    $stmt->bindValue(1, $id);
    $stmt->execute();
    
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Sequência reativada.']);
    exit;
}

function buscarSequenciaPorId() {
    $db = conectarBanco();
    $id = $_GET['id'] ?? 0;

    $stmt = $db->prepare("SELECT * FROM sequencias WHERE id = ?");
    $stmt->bindValue(1, $id);
    $resultado = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
    
    header('Content-Type: application/json');
    echo json_encode($resultado);
    exit;
}

function mostrarSequenciasCheckbox() {
    $db = conectarBanco();
    $res = $db->query("SELECT * FROM sequencias WHERE tipo_jogo = 'lotofacil' AND status = 1 ORDER BY nome ASC");
    while ($seq = $res->fetchArray(SQLITE3_ASSOC)) {
        echo "<div><label><input type='checkbox' name='sequencias[]' value='{$seq['id']}'> {$seq['nome']} ({$seq['numeros']})</label></div>";
    }
}

function listarSequenciasComAcoes() {
    $db = conectarBanco();
    $res = $db->query("SELECT id, nome, tipo_jogo, numeros, status FROM sequencias ORDER BY nome ASC");

    echo "<div class='lista-gerenciar-container'>";
    echo "<ul class='lista-gerenciar'>";
    $sequenciasEncontradas = 0;
    while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
        $sequenciasEncontradas++;
        $classe_inativa = $row['status'] == 1 ? '' : 'inativa';
        
        echo "<li data-sequencia-id='{$row['id']}' class='{$classe_inativa}'>";
        echo "  <div class='info-sequencia'>";
        echo "      <strong>{$row['nome']}</strong>";
        
        if ($row['status'] == 1) {
            echo "      <small class='status-ativo'>Status: Ativo</small>";
        } else {
            echo "      <small class='status-inativo'>Status: Inativo</small>";
        }

        echo "      <small>({$row['tipo_jogo']}) - {$row['numeros']}</small>";
        echo "  </div>";
        echo "  <div class='acoes-sequencia'>";
        echo "      <button class='acao-btn editar' data-id='{$row['id']}'>Editar</button>";

        if ($row['status'] == 1) {
            echo "      <button class='acao-btn excluir' data-id='{$row['id']}'>Excluir</button>";
        } else {
            echo "      <button class='acao-btn reativar' data-id='{$row['id']}'>Reativar</button>";
        }

        echo "  </div>";
        echo "</li>";
    }

    if ($sequenciasEncontradas === 0) {
        echo "<li>Nenhuma sequência cadastrada.</li>";
    }
    echo "</ul>";
    echo "</div>";
}