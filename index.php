<?php
$db_path = __DIR__ . '/db/dados.sqlite';
$db_exists = file_exists($db_path);

if ($db_exists) {
    require_once 'includes/db.php';
    require_once 'includes/historico.php';
    require_once 'includes/sequencias.php';
    $ultimoConcurso = pegarUltimoConcursoConferido();
} else {
    $ultimoConcurso = '';
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Conferência Loterias</title>
    <link rel="stylesheet" href="assets/style.css">
    <link rel="icon" type="image/png" href="assets/favicon.png">
</head>
<body>
    <header>
        <h1>Conferência de Jogos - Loterias CAIXA</h1>
    </header>

    <?php if (!$db_exists): ?>
        <div class="setup-container">
            <h2>Bem-vindo!</h2>
            <p>Clique no botão abaixo para iniciar a configuração do banco de dados.</p>
            <a href="criar_banco.php" class="btn btn-setup">Criar banco de dados</a>
        </div>
    <?php else: ?>
        <main class="tabs-container">
            <nav class="tabs-nav">
                <button class="tab-link active" data-tab="tab-conferir">Conferir</button>
                <button class="tab-link" data-tab="tab-historico">Histórico</button>
                <button class="tab-link" data-tab="tab-gerenciar">Gerenciar</button>
            </nav>
            <div class="tabs-content">
                <div id="tab-conferir" class="tab-content active">
                    <section class="col form-section">
                        <form id="form-conferir" method="GET" action="includes/conferir.php">
                            <div class="form-group">
                                <label for="tipo">Jogo:</label>
                                <select name="tipo" id="tipo">
                                    <option value="lotofacil">Lotofácil</option>
                                    <option value="megasena">Mega-Sena</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="concurso">Número do concurso:</label>
                                <input type="number" name="concurso" id="concurso" required value="<?= htmlspecialchars($ultimoConcurso) ?>">
                            </div>
                            <div class="accordion">
                                <div class="accordion-header">
                                    <h3>Selecione suas sequências:</h3>
                                    <span class="accordion-icon">+</span>
                                </div>
                                <div class="accordion-content">
                                    <div class="lista-sequencias">
                                        <?php mostrarSequenciasCheckbox(); ?>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" id="btn-conferir" class="btn btn-conferir">Conferir</button>
                            <p id="conferir-error-msg" class="error-message"></p>
                        </form>
                        <div id="conferencia-imediata-resultado" class="resultado-container"></div>
                    </section>
                </div>
                <div id="tab-historico" class="tab-content">
                    <section class="col historico-section">
                        <?php mostrarHistorico(); ?>
                        <div id="detalhes-resultado-historico" class="resultado-container"></div>
                    </section>
                </div>
                <div id="tab-gerenciar" class="tab-content">
                    <nav class="inner-tabs-nav">
                        <button id="cadastrar-tab-link" class="inner-tab-link active" data-tab="inner-tab-cadastrar" data-action="reset">Cadastrar</button>
                        <button class="inner-tab-link" data-tab="inner-tab-listar">Listar</button>
                    </nav>
                    <div class="inner-tabs-content">
                        <div id="inner-tab-cadastrar" class="inner-tab-content active">
                            <section class="col editor-section">
                                <form id="form-salvar-sequencia" method="POST" action="includes/sequencias.php">
                                    <input type="hidden" name="acao" value="salvar">
                                    <div class="form-group">
                                        <label for="salvar-nome">Título da sequência:</label>
                                        <input type="text" id="salvar-nome" name="nome" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="salvar-tipo-jogo">Tipo de jogo:</label>
                                        <select name="tipo_jogo" id="salvar-tipo-jogo">
                                            <option value="lotofacil">Lotofácil</option>
                                            <option value="megasena">Mega-Sena</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Selecione os números:</label>
                                        <div id="grade-numeros-container"></div>
                                        <p id="contador-selecionados" class="contador-info"></p>
                                    </div>
                                    <input type="hidden" name="numeros" id="salvar-numeros-hidden">
                                    <div class="form-actions">
                                        <button type="submit" id="btn-salvar-sequencia" class="btn btn-salvar">Salvar</button>
                                        <button type="button" id="btn-cancelar-edicao" class="btn btn-cancelar-edicao hidden">Cancelar edição</button>
                                    </div>
                                    <p id="salvar-error-msg" class="error-message"></p>
                                </form>
                            </section>
                        </div>
                        <div id="inner-tab-listar" class="inner-tab-content">
                            <section class="col">
                                <?php listarSequenciasComAcoes(); ?>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    <?php endif; ?>
    <script src="assets/script.js"></script>
</body>
</html>
