<?php
require_once 'db.php';
?>
<style>
    .resultado-header { padding-bottom: 1em; border-bottom: 2px solid #eee; margin-bottom: 1em; }
    .resultado-header h3 { margin-top: 0; }
    .bolinhas-sorteadas-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .numero-sorteado-bolinha { display: flex; justify-content: center; align-items: center; width: 35px; height: 35px; background-color: #e9ecef; border: 1px solid #ced4da; border-radius: 50%; font-weight: bold; color: #495057; font-size: 0.9em; }
    .resultado-card { border: 1px solid #ddd; background-color: #f9f9f9; padding: 1em; margin-bottom: 1em; border-radius: 5px; }
    .resultado-card h4 { margin: 0 0 10px 0; font-size: 1.1em; }
    .numeros-jogados { display: flex; flex-wrap: wrap; gap: 8px; line-height: 1.6; margin-bottom: 10px; font-weight: bold; }
    .numeros-jogados .acerto, .numeros-jogados .erro { display: flex; justify-content: center; align-items: center; width: 35px; height: 35px; background-color: #e9ecef; border: 1px solid #ced4da; border-radius: 50%; font-size: 0.9em; }
    .numeros-jogados .acerto { color: #28a745; }
    .numeros-jogados .erro { color: #dc3545; }
    .acertos-box { display: inline-block; background-color: #e9ecef; padding: 5px 12px; border-radius: 4px; border: 1px solid #ced4da; font-size: 0.9em; }
    .acertos-box strong { font-size: 1.2em; color: #333; }
    .acertos-box strong.acertos-premio { color: #28a745; font-weight: bold; }
</style>
<?php
$tipo = $_GET['tipo'] ?? '';
$concurso = intval($_GET['concurso'] ?? 0);

if (!$tipo || !$concurso) {
    echo "<p>Parâmetros inválidos.</p>";
    exit;
}

$db = conectarBanco();

$infoSorteioStmt = $db->prepare("SELECT numeros, dia_jogo FROM resultados WHERE num_jogo = ? AND tipo_jogo = ? LIMIT 1");
$infoSorteioStmt->bindValue(1, $concurso);
$infoSorteioStmt->bindValue(2, $tipo);
$infoSorteio = $infoSorteioStmt->execute()->fetchArray(SQLITE3_ASSOC);

if (!$infoSorteio) {
    echo "<div class='resultado-header'><h3>Concurso $concurso – " . ucfirst($tipo) . "</h3></div>";
    echo "<p>Nenhum resultado encontrado para este concurso no banco de dados.</p>";
    exit;
}

$sorteados = array_map('intval', explode(',', $infoSorteio['numeros']));
$dataSorteio = 'Data indisponível';
if ($infoSorteio['dia_jogo']) {
    $dateObj = DateTime::createFromFormat('Y-m-d', $infoSorteio['dia_jogo']);
    if ($dateObj) {
        $dataSorteio = $dateObj->format('d/m/Y');
    }
}

echo "<div class='resultado-header'>";
echo "  <h3>Concurso $concurso – " . ucfirst($tipo) . " ($dataSorteio)</h3>";
echo "  <p><strong>Números Sorteados:</strong></p>";
echo "  <div class='bolinhas-sorteadas-container'>";
foreach ($sorteados as $numero) {
    echo "<span class='numero-sorteado-bolinha'>" . str_pad($numero, 2, '0', STR_PAD_LEFT) . "</span>";
}
echo "  </div>";
echo "</div>";

$stmt = $db->prepare("
    SELECT num_acertos, sequencia_nome, numeros_jogados
    FROM resultados
    WHERE num_jogo = ? AND tipo_jogo = ?
    ORDER BY sequencia_nome ASC
");
$stmt->bindValue(1, $concurso);
$stmt->bindValue(2, $tipo);
$res = $stmt->execute();

$sequenciasEncontradas = 0;
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    $sequenciasEncontradas++;
    $jogados = array_map('intval', explode(',', $row['numeros_jogados']));
    $num_acertos = (int)$row['num_acertos'];

    echo "<div class='resultado-card'>";
    echo "  <h4>{$row['sequencia_nome']}</h4>";
    echo "  <div class='numeros-jogados'>";

    foreach ($jogados as $n) {
        $classe_cor = in_array($n, $sorteados) ? 'acerto' : 'erro';
        echo "<span class='{$classe_cor}'>".str_pad($n, 2, '0', STR_PAD_LEFT)."</span>";
    }
    
    echo "  </div>";
    
    $classe_acertos = $num_acertos >= 11 ? 'acertos-premio' : '';

    echo "  <div class='acertos-box'>";
    echo "      Acertos: <strong class='{$classe_acertos}'>{$num_acertos}</strong>";
    echo "  </div>";

    echo "</div>";
}

if ($sequenciasEncontradas === 0) {
    echo "<p>Nenhuma sequência sua foi conferida para este concurso.</p>";
}