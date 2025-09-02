<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao'])) {
    header('Content-Type: application/json');
    global $pdo;
    if (!$pdo) {
        echo json_encode(['status' => 'error', 'message' => 'Banco de dados não conectado.']);
        exit;
    }

    $acao = $_POST['acao'];
    try {
        if ($acao === 'salvar') {
            $id = $_POST['id_sequencia'] ?? null;
            $nome = trim($_POST['nome']);
            $tipo_jogo = $_POST['tipo_jogo'];
            $numeros = $_POST['numeros'];

            if (empty($nome) || empty($tipo_jogo) || empty($numeros)) {
                echo json_encode(['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
                exit;
            }

            if (empty($id)) {
                $stmt = $pdo->prepare("INSERT INTO sequencias (nome, tipo_jogo, numeros, status) VALUES (?, ?, ?, 1)");
                $stmt->execute([$nome, $tipo_jogo, $numeros]);
            } else {
                $stmt = $pdo->prepare("UPDATE sequencias SET nome = ?, tipo_jogo = ?, numeros = ? WHERE id = ?");
                $stmt->execute([$nome, $tipo_jogo, $numeros, $id]);
            }
            echo json_encode(['status' => 'success', 'redirect' => 'index.php']);
            exit;
        } elseif ($acao === 'excluir' || $acao === 'reativar') {
            $id = $_POST['id'];
            $status = ($acao === 'excluir') ? 0 : 1;
            $stmt = $pdo->prepare("UPDATE sequencias SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            echo json_encode(['status' => 'success']);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['acao']) && $_GET['acao'] === 'buscar') {
    header('Content-Type: application/json');
    global $pdo;
    if (!$pdo) {
        echo json_encode(null);
        exit;
    }
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("SELECT * FROM sequencias WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

function mostrarSequenciasCheckbox() {
    global $pdo;
    if (!$pdo) {
        return;
    }
    $stmt = $pdo->query("SELECT * FROM sequencias WHERE tipo_jogo = 'lotofacil' AND status = 1 ORDER BY nome ASC");
    while ($seq = $stmt->fetch()) {
        echo "<div><label><input type='checkbox' name='sequencias[]' value='{$seq['id']}'> {$seq['nome']} ({$seq['numeros']})</label></div>";
    }
}

function listarSequenciasComAcoes() {
    global $pdo;
    if (!$pdo) {
        return;
    }
    $stmt = $pdo->query("SELECT id, nome, tipo_jogo, numeros, status FROM sequencias ORDER BY nome ASC");
    echo "<div class='lista-gerenciar-container'>";
    echo "<ul class='lista-gerenciar'>";
    $count = 0;
    while ($row = $stmt->fetch()) {
        $count++;
        $classe_inativa = $row['status'] == 1 ? '' : 'inativa';
        echo "<li data-sequencia-id='{$row['id']}' class='{$classe_inativa}'>";
        echo "<div class='info-sequencia'>";
        echo "<strong>{$row['nome']}</strong>";
        if ($row['status'] == 1) {
            echo "<small class='status-ativo'>Status: Ativo</small>";
        } else {
            echo "<small class='status-inativo'>Status: Inativo</small>";
        }
        echo "<small>({$row['tipo_jogo']}) - {$row['numeros']}</small>";
        echo "</div>";
        echo "<div class='acoes-sequencia'>";
        echo "<button class='acao-btn editar' data-id='{$row['id']}'>Editar</button>";
        if ($row['status'] == 1) {
            echo "<button class='acao-btn excluir' data-id='{$row['id']}'>Excluir</button>";
        } else {
            echo "<button class='acao-btn reativar' data-id='{$row['id']}'>Reativar</button>";
        }
        echo "</div>";
        echo "</li>";
    }
    if ($count === 0) {
        echo "<li>Nenhuma sequência cadastrada.</li>";
    }
    echo "</ul>";
    echo "</div>";
}
