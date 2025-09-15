# Conferidor de Loterias

Este é um projeto de aplicação web para gerenciamento e conferência de jogos das Loterias CAIXA. A ferramenta permite que o usuário salve suas sequências de números (apostas), confira os resultados de concursos passados utilizando a API oficial da Caixa e visualize um histórico detalhado de suas conferências.

## ✨ Funcionalidades

O sistema foi desenvolvido com uma interface de abas para facilitar a navegação e o uso, focando em uma experiência de usuário fluida e sem recarregamentos de página.

* **Conferência de Jogos:**
    * Consulta resultados de concursos diretamente da API da Caixa.
    * Permite selecionar múltiplas sequências salvas para conferir de uma só vez.
    * Apresenta o resultado de forma instantânea (via AJAX), sem recarregar a página, com destaque visual para os acertos.

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

2.  **Inicialize o Banco de Dados (Automático):**
    O banco de dados SQLite (`dados.sqlite`) e suas tabelas serão criados automaticamente na primeira vez que você acessar a aplicação. O sistema verifica a existência do arquivo `db/dados.sqlite`. Se ele não existir, `criar_banco.php` será executado para configurar o ambiente.

3.  **Acesse a Aplicação:**
    Agora, você pode acessar a página principal do projeto:
    ```
    http://localhost/loterias/
    ```

## 📂 Estrutura de Arquivos

Para organizar o projeto, a seguinte estrutura de pastas e arquivos deve ser utilizada:

* **`/loterias`** (raiz do projeto)
    * `criar_banco.php`
    * `index.php`
    * **`assets/`**
        * `style.css`
        * `script.js`
    * **`db/`**
        * `dados.sqlite`
    * **`includes/`**
        * `conferir.php`
        * `db.php`
        * `historico.php`
        * `sequencias.php`
        * `ver_resultado.php`

**Explicação da Estrutura:**

* **`/` (raiz do projeto `loterias`):** Contém os arquivos principais da aplicação.
    * `criar_banco.php`: Script que inicializa o banco de dados SQLite e cria as tabelas se elas não existirem. É executado automaticamente na primeira carga.
    * `index.php`: Página principal da aplicação web, que integra todas as funcionalidades.
* **`assets/`:** Armazena os arquivos estáticos do frontend.
    * `style.css`: Arquivo de folha de estilos CSS para a apresentação.
    * `script.js`: Arquivo com a lógica JavaScript para interatividade (gerenciamento de abas, formulários, ações de sequência, etc.).
* **`db/`:** Contém o arquivo do banco de dados.
    * `dados.sqlite`: O banco de dados SQLite onde as informações da aplicação são armazenadas.
* **`includes/`:** Guarda os arquivos PHP com a lógica de backend e funcionalidades específicas.
    * `conferir.php`: Lógica para processar a conferência de resultados de concursos via API da Caixa.
    * `db.php`: Arquivo essencial para estabelecer a conexão com o banco de dados SQLite.
    * `historico.php`: Contém as funções PHP para manipular e exibir o histórico de conferências, incluindo `pegarUltimoConcursoConferido` e `salvarHistoricoConferencia`.
    * `sequencias.php`: Lógica de backend para o gerenciamento CRUD (Criar, Ler, Atualizar, Desativar/Reativar) das sequências de jogos.
    * `ver_resultado.php`: Script para buscar e formatar os detalhes de um concurso específico a partir do histórico para exibição.
    * `conferir.php`: Lógica para processar a conferência de resultados de concursos via API da Caixa.
    * `db.php`: Arquivo essencial para estabelecer a conexão com o banco de dados SQLite.
    * `historico.php`: Contém as funções PHP para manipular e exibir o histórico de conferências, incluindo `pegarUltimoConcursoConferido` e `salvarHistoricoConferencia`.
    * `sequencias.php`: Lógica de backend para o gerenciamento CRUD (Criar, Ler, Atualizar, Desativar/Reativar) das sequências de jogos.
    * `ver_resultado.php`: Script para buscar e formatar os detalhes de um concurso específico a partir do histórico para exibição.
