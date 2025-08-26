<?php
require_once 'db.php';

function pegarResultadoDaAPI($tipo, $concurso) {
    $url = "https://servicebus2.caixa.gov.br/portaldeloterias/api/$tipo/$concurso";
    $options = ["http" => ["header" => "User-Agent: Mozilla/5.0\r\n"]];
    $context = stream_context_create($options);
    $json = @file_get_contents($url, false, $context);

    if ($json === false) return null;
    $dados = json_decode($json, true);
    if (!isset($dados['listaDezenas'])) return null;

    return [
        'dezenas' => array_map('intval', $dados['listaDezenas']),
        'data' => $dados['dataApuracao']
    ];
}

function gerarCSV($tipo, $nomeSeq, $concurso, $numeros, $sorteados, $data, $acertos) {
    $dir = __DIR__ . '/../export/';
    if (!file_exists($dir)) mkdir($dir, 0777, true);
    $filename = "{$tipo}_{$nomeSeq}_{$concurso}.csv";
    $path = $dir . $filename;
    $fp = fopen($path, 'w');
    fputcsv($fp, ['id', 'num_jogo', 'tipo_jogo', 'numeros', 'sorteio', 'dia_jogo', 'num_acertos']);
    fputcsv($fp, [uniqid(), $concurso, $tipo, implode(',', $numeros), implode(',', $sorteados), $data, $acertos]);
    fclose($fp);
}

$resposta = ['status' => 'error', 'message' => '', 'resultados' => []];
$db = conectarBanco();
$tipo = $_GET['tipo'] ?? 'lotofacil';
$concurso = intval($_GET['concurso'] ?? 0);
$sequencias = $_GET['sequencias'] ?? [];

if (!$concurso || empty($sequencias)) {
    $resposta['message'] = 'Concurso e sequência(s) obrigatórios.';
    header('Content-Type: application/json');
    echo json_encode($resposta);
    exit;
}

$resultadoAPI = pegarResultadoDaAPI($tipo, $concurso);
if (!$resultadoAPI) {
    $resposta['message'] = 'Erro ao buscar dados do concurso na API da Caixa. Verifique o número do concurso.';
    header('Content-Type: application/json');
    echo json_encode($resposta);
    exit;
}

$sorteados = $resultadoAPI['dezenas'];
$data = $resultadoAPI['data'];

foreach ($sequencias as $seq_id) {
    $resultado_individual = [];

    $check = $db->prepare("SELECT COUNT(*) as total FROM resultados WHERE sequencia_id = ? AND num_jogo = ?");
    $check->bindValue(1, $seq_id);
    $check->bindValue(2, $concurso);
    $res = $check->execute()->fetchArray(SQLITE3_ASSOC);

    $q = $db->prepare("SELECT * FROM sequencias WHERE id = ?");
    $q->bindValue(1, $seq_id);
    $seq = $q->execute()->fetchArray(SQLITE3_ASSOC);
    if (!$seq) continue;

    if ($res['total'] > 0) {
        $resultado_individual = [
            'status' => 'already_checked',
            'nome' => $seq['nome'],
            'message' => "Sequência já conferida para o concurso $concurso."
        ];
        $resposta['resultados'][] = $resultado_individual;
        continue;
    }

    $numeros = array_map('intval', explode(',', $seq['numeros']));
    $acertos_array = array_intersect($numeros, $sorteados);
    $acertos_count = count($acertos_array);

    $dateObj = DateTime::createFromFormat('d/m/Y', $data);
    $dataFormatada = ($dateObj !== false) ? $dateObj->format('Y-m-d') : null;

    $stmt = $db->prepare("
        INSERT INTO resultados 
        (sequencia_id, num_jogo, tipo_jogo, numeros, dia_jogo, num_acertos, sequencia_nome, numeros_jogados) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bindValue(1, $seq['id'], SQLITE3_INTEGER);
    $stmt->bindValue(2, $concurso, SQLITE3_INTEGER);
    $stmt->bindValue(3, $tipo, SQLITE3_TEXT);
    $stmt->bindValue(4, implode(',', $sorteados), SQLITE3_TEXT);
    $stmt->bindValue(5, $dataFormatada, is_null($dataFormatada) ? SQLITE3_NULL : SQLITE3_TEXT);
    $stmt->bindValue(6, $acertos_count, SQLITE3_INTEGER);
    $stmt->bindValue(7, $seq['nome'], SQLITE3_TEXT);
    $stmt->bindValue(8, $seq['numeros'], SQLITE3_TEXT);
    $stmt->execute();

    gerarCSV($tipo, $seq['nome'], $concurso, $numeros, $sorteados, $data, $acertos_count);

    $resultado_individual = [
        'status' => 'success',
        'nome' => $seq['nome'],
        'concurso' => $concurso,
        'data_sorteio' => $data,
        'numeros_sorteados' => $sorteados,
        'seu_jogo' => $numeros,
        'acertos_count' => $acertos_count,
        'numeros_acertados' => array_values($acertos_array)
    ];
    $resposta['resultados'][] = $resultado_individual;
}

$resposta['status'] = 'success';
$resposta['message'] = 'Conferência finalizada.';

header('Content-Type: application/json');
echo json_encode($resposta, JSON_PRETTY_PRINT);
