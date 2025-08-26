# Conferidor de Loterias

Este é um projeto de aplicação web para gerenciamento e conferência de jogos das Loterias CAIXA. A ferramenta permite que o usuário salve suas sequências de números (apostas), confira os resultados de concursos passados utilizando a API oficial da Caixa e visualize um histórico detalhado de suas conferências.

## ✨ Funcionalidades

O sistema foi desenvolvido com uma interface de abas para facilitar a navegação e o uso, focando em uma experiência de usuário fluida e sem recarregamentos de página.

* **Conferência de Jogos:**
    * Consulta resultados de concursos diretamente da API da Caixa.
    * Permite selecionar múltiplas sequências salvas para conferir de uma só vez.
    * Apresenta o resultado de forma instantânea (via AJAX), sem recarregar a página.

* **Histórico de Conferências:**
    * Mantém um registro imutável de todas as conferências realizadas.
    * Organiza o histórico em abas por tipo de jogo (Lotofácil, Mega-Sena, etc.).
    * Ao clicar em um concurso do histórico, exibe um card detalhado com os números sorteados e o desempenho de cada aposta, destacando os acertos.

* **Gerenciamento de Sequências:**
    * **Cadastro e Edição:** Um formulário interativo para criar ou atualizar sequências de jogos.
    * **Grade de Números:** Em vez de digitar, o usuário seleciona os números em uma grade clicável, que se adapta dinamicamente ao tipo de jogo (25 números para Lotofácil, 60 para Mega-Sena).
    * **Validação em Tempo Real:** O sistema valida a quantidade de números selecionados e só habilita o botão de salvar quando as regras do jogo são atendidas.
    * **Exclusão Suave (Soft Delete):** As sequências não são permanentemente apagadas. Elas são "desativadas" para não aparecerem em novas conferências, mas são mantidas no banco de dados para preservar a integridade do histórico. A interface permite reativar uma sequência a qualquer momento.

* **Interface Moderna:**
    * Layout de abas para uma navegação clara e focada.
    * Design responsivo que se adapta a desktops e dispositivos móveis.
    * Feedback visual interativo nos botões e formulários.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
* **Backend:** PHP
* **Banco de Dados:** SQLite 3

## 🚀 Como Executar o Projeto Localmente

Para testar este projeto em seu ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos

* Um ambiente de servidor local com suporte a PHP e SQLite3. Recomenda-se o uso de **Laragon**, XAMPP ou WAMP.
* Git instalado (opcional, para clonar o repositório).

### Passos para Instalação

1.  **Clone o repositório:**
    Se estiver usando Git, clone o projeto para a pasta do seu servidor web (ex: `C:\laragon\www\`):
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO] loterias
    ```
    Caso contrário, apenas copie a pasta do projeto para o diretório do seu servidor.

2.  **Crie o Banco de Dados:**
    Acesse o projeto pelo seu navegador. A primeira etapa é criar e popular o banco de dados. Para isso, acesse a seguinte URL:
    ```
    http://localhost/loterias/criar_banco.php
    ```
    Você deverá ver a mensagem "Banco de dados e tabelas criados/atualizados com sucesso!". Este passo só precisa ser feito uma vez.

3.  **Acesse a Aplicação:**
    Agora, você pode acessar a página principal do projeto:
    ```
    http://localhost/loterias/
    ```

## 📂 Estrutura de Arquivos

Para organizar o projeto, a seguinte estrutura de pastas e arquivos deve ser utilizada:

<pre>
/loterias
├── assets/
│   ├── style.css
│   └── script.js
├── db/
│   └── dados.sqlite
├── includes/
│   ├── conferir.php
│   ├── db.php
│   ├── historico.php
│   ├── sequencias.php
│   └── ver_resultado.php
├── criar_banco.php
└── index.php
</pre>

**Explicação da Estrutura:**

* **`/` (raiz do projeto `loterias`):** Contém os arquivos principais da aplicação.
    * `criar_banco.php`: Script para inicializar o banco de dados SQLite.
    * `index.php`: Página principal da aplicação web.
* **`assets/`:** Armazena os arquivos estáticos do frontend.
    * `style.css`: Arquivo de folha de estilos CSS para a apresentação.
    * `script.js`: Arquivo com a lógica JavaScript para interatividade.
* **`db/`:** Contém o arquivo do banco de dados.
    * `dados.sqlite`: O banco de dados SQLite onde as informações serão armazenadas.
* **`includes/`:** Guarda os arquivos PHP com a lógica de backend e funcionalidades específicas.
    * `conferir.php`: Lógica para conferir os resultados dos concursos.
    * `db.php`: Arquivo com a função para conectar ao banco de dados.
    * `historico.php`: (Embora não tenhamos criado um arquivo separado para isso, a lógica de histórico está em `index.php` e `ver_resultado.php`).
    * `sequencias.php`: Lógica para gerenciar as sequências de jogos (salvar, editar, listar, excluir/desativar).
    * `ver_resultado.php`: Script para exibir os detalhes de um concurso específico do histórico.
