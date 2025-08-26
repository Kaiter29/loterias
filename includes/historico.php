<?php
require_once 'db.php';

function pegarUltimoConcursoConferido() {
    $db = conectarBanco();
    $resultado = $db->querySingle("SELECT MAX(num_jogo) FROM resultados");
    return $resultado ?? '';
}

/* ultima alteração realizada */
function mostrarHistorico() {
    $db = conectarBanco();

    $tipos_res = $db->query("SELECT DISTINCT tipo_jogo FROM resultados ORDER BY tipo_jogo ASC");
    
    $tipos_de_jogo = [];
    while ($row = $tipos_res->fetchArray(SQLITE3_ASSOC)) {
        $tipos_de_jogo[] = $row['tipo_jogo'];
    }

    if (empty($tipos_de_jogo)) {
        echo "<p>Nenhum histórico encontrado.</p>";
        return;
    }

    echo '<div class="history-tabs-container">';
    echo '  <div class="history-tabs-nav">';

    foreach ($tipos_de_jogo as $index => $tipo) {
        $active_class = ($index === 0) ? 'active' : '';
        echo "<button class='tab-link {$active_class}' data-tab='tab-{$tipo}'>" . ucfirst($tipo) . "</button>";
    }

    echo '  </div>';
    echo '  <div class="history-tabs-content">';

    foreach ($tipos_de_jogo as $index => $tipo) {
        $active_class = ($index === 0) ? 'active' : '';
        echo "<div id='tab-{$tipo}' class='tab-content {$active_class}'>";

        $stmt = $db->prepare("
            SELECT num_jogo, dia_jogo, COUNT(*) as total
            FROM resultados
            WHERE tipo_jogo = :tipo
            GROUP BY num_jogo, dia_jogo
            ORDER BY num_jogo DESC
            LIMIT 20
        ");
        $stmt->bindValue(':tipo', $tipo, SQLITE3_TEXT);
        $res = $stmt->execute();

        echo "<ul class='historico-lista'>";
        
        $hasResults = false;
        while ($row = $res->fetchArray(SQLITE3_ASSOC)) {

            $hasResults = true;
            $dataStr = 'Data indisponível';
            
            if ($row['dia_jogo']) {
                $dataObj = DateTime::createFromFormat('Y-m-d', $row['dia_jogo']);
                if ($dataObj) $dataStr = $dataObj->format('d/m/Y');
            }
            
            echo "<li data-concurso='{$row['num_jogo']}' data-tipo='{$tipo}'>";
            echo "<strong>Concurso {$row['num_jogo']}</strong> – {$dataStr}<br>";
            echo "<small>{$row['total']} sequência(s) conferida(s)</small>";
            echo "</li>";
        }

        if (!$hasResults) {
            echo "<li>Nenhum resultado para este jogo.</li>";
        }

        echo "</ul>";
        echo "</div>";
    }

    echo '  </div>';
    echo '</div>';
}