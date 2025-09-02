<?php
require_once 'db.php';
require_once 'historico.php';

if (!$pdo) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Banco de dados não conectado.']);
    exit;
}

$tipo = $_GET['tipo'] ?? null;
$concurso = $_GET['concurso'] ?? null;
$sequencias_ids = $_GET['sequencias'] ?? null;

if (!$tipo || !$concurso || !$sequencias_ids) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Parâmetros inválidos.']);
    exit;
}

$url = "https://servicebus2.caixa.gov.br/portaldeloterias/api/{$tipo}/{$concurso}";
$json = @file_get_contents($url);

if ($json === false) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Não foi possível obter o resultado do concurso. Verifique o número e tente novamente.']);
    exit;
}

$dadosAPI = json_decode($json, true);
$sorteados = array_map('intval', $dadosAPI['listaDezenas'] ?? []);
$dataApuracao = $dadosAPI['dataApuracao'] ?? null;

$resultadosFinais = [];

$dataParaBanco = null;
if ($dataApuracao) {
    $dateObj = DateTime::createFromFormat('d/m/Y', $dataApuracao);
    if ($dateObj) {
        $dataParaBanco = $dateObj->format('Y-m-d');
    }
}

foreach ($sequencias_ids as $id) {
    $stmt = $pdo->prepare("SELECT nome, numeros FROM sequencias WHERE id = ?");
    $stmt->execute([$id]);
    $sequencia = $stmt->fetch();

    if ($sequencia) {
        $jogados = array_map('intval', explode(',', $sequencia['numeros']));
        $acertos = array_intersect($jogados, $sorteados);
        $totalAcertos = count($acertos);
        
        salvarHistoricoConferencia($id, $concurso, $tipo, $sorteados, $jogados, $totalAcertos, $dataParaBanco);
        
        $resultadosFinais[] = [
            'nome' => $sequencia['nome'],
            'concurso' => $concurso,
            'data_sorteio' => $dataApuracao,
            'numeros_sorteados' => $sorteados,
            'seu_jogo' => $jogados,
            'numeros_acertados' => array_values($acertos),
            'acertos_count' => $totalAcertos
        ];
    }
}

header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'resultados' => $resultadosFinais]);
