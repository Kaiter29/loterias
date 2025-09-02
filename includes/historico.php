<?php
require_once 'db.php';

function pegarUltimoConcursoConferido() {
    global $pdo;
    if (!$pdo) {
        return '';
    }
    try {
        $stmt = $pdo->query("SELECT num_jogo FROM resultados ORDER BY created DESC LIMIT 1");
        $result = $stmt->fetchColumn();
        return $result ?: '';
    } catch (PDOException $e) {
        return '';
    }
}

function mostrarHistorico() {
    global $pdo;
    if (!$pdo) {
        echo '<p>Nenhum histórico disponível.</p>';
        return;
    }
    try {
        $stmt = $pdo->query("SELECT DISTINCT tipo_jogo FROM resultados ORDER BY tipo_jogo ASC");
        $tiposJogos = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($tiposJogos)) {
            echo '<p>Nenhum histórico de conferências registrado ainda.</p>';
            return;
        }

        echo '<div class="history-tabs-container">';
        echo '  <div class="history-tabs-nav">';
        $first = true;
        foreach ($tiposJogos as $tipo) {
            $label = ($tipo === 'lotofacil') ? 'Lotofácil' : (($tipo === 'megasena') ? 'Mega-Sena' : ucfirst($tipo));
            echo '<button class="inner-tab-link ' . ($first ? 'active' : '') . '" data-tab="historico-' . $tipo . '">' . $label . '</button>';
            $first = false;
        }
        echo '  </div>';

        echo '  <div class="history-tabs-content">';
        $first = true;
        foreach ($tiposJogos as $tipo) {
            echo '<div id="historico-' . $tipo . '" class="inner-tab-content ' . ($first ? 'active' : '') . '">';
            $stmtTipo = $pdo->prepare("SELECT DISTINCT num_jogo, dia_jogo FROM resultados WHERE tipo_jogo = ? ORDER BY num_jogo DESC LIMIT 20");
            $stmtTipo->execute([$tipo]);
            $concursosDoTipo = $stmtTipo->fetchAll();
            if(empty($concursosDoTipo)){
                echo '<p>Nenhum concurso conferido para este jogo.</p>';
            } else {
                echo '<ul class="historico-lista">';
                foreach ($concursosDoTipo as $concursoItem) {
                    $data = $concursoItem['dia_jogo'] ? (new DateTime($concursoItem['dia_jogo']))->format('d/m/Y') : 'Data não informada';
                    echo '<li data-tipo="' . htmlspecialchars($tipo) . '" data-concurso="' . htmlspecialchars($concursoItem['num_jogo']) . '">';
                    echo 'Concurso ' . htmlspecialchars($concursoItem['num_jogo']) . ' - ' . $data;
                    echo '</li>';
                }
                echo '</ul>';
            }
            echo '</div>';
            $first = false;
        }
        echo '  </div>';
        echo '</div>';

    } catch (PDOException $e) {
        echo '<p>Ocorreu um erro ao carregar o histórico.</p>';
    }
}

function salvarHistoricoConferencia($id_sequencia, $concurso, $tipo, $sorteados, $jogados, $totalAcertos, $dataParaBanco) {
    global $pdo;
    if (!$pdo) return;

    $stmt = $pdo->prepare("SELECT nome FROM sequencias WHERE id = ?");
    $stmt->execute([$id_sequencia]);
    $sequencia = $stmt->fetch();
    if(!$sequencia) return;
    
    $stmtCheck = $pdo->prepare("SELECT id FROM resultados WHERE sequencia_id = ? AND num_jogo = ?");
    $stmtCheck->execute([$id_sequencia, $concurso]);
    if ($stmtCheck->fetch()) {
        return;
    }

    $stmtInsert = $pdo->prepare(
        "INSERT INTO resultados (sequencia_id, num_jogo, tipo_jogo, numeros, dia_jogo, num_acertos, sequencia_nome, numeros_jogados) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmtInsert->execute([
        $id_sequencia,
        $concurso,
        $tipo,
        implode(',', $sorteados),
        $dataParaBanco,
        $totalAcertos,
        $sequencia['nome'],
        implode(',', $jogados)
    ]);
}
