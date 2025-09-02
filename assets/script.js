document.addEventListener("DOMContentLoaded", () => {
    const mainTabsNav = document.querySelector(".tabs-nav");
    if (mainTabsNav) {
        mainTabsNav.addEventListener("click", (event) => {
            if (event.target.classList.contains("tab-link")) {
                const tabId = event.target.dataset.tab;
                mainTabsNav.querySelectorAll(".tab-link").forEach(tab => tab.classList.remove("active"));
                document.querySelectorAll(".tabs-content .tab-content").forEach(content => content.classList.remove("active"));
                event.target.classList.add("active");
                document.getElementById(tabId).classList.add("active");
            }
        });
    }

    const historicoTab = document.getElementById("tab-historico");
    if (historicoTab) {
        const detalhesResultadoHistoricoContainer = document.getElementById("detalhes-resultado-historico");
        historicoTab.addEventListener("click", (event) => {
            const listItem = event.target.closest(".historico-lista li");
            if (listItem) {
                const tipo = listItem.dataset.tipo;
                const concurso = listItem.dataset.concurso;
                fetch(`includes/ver_resultado.php?tipo=${tipo}&concurso=${concurso}`)
                    .then(res => res.text())
                    .then(html => {
                        detalhesResultadoHistoricoContainer.innerHTML = html;
                        detalhesResultadoHistoricoContainer.scrollIntoView({ behavior: "smooth" });
                    });
            }
        });
    }

    const formConferir = document.getElementById('form-conferir');
    if (formConferir) {
        const btnConferir = document.getElementById('btn-conferir');
        const inputConcurso = document.getElementById('concurso');
        const checkboxesContainer = formConferir.querySelector('.lista-sequencias');
        const errorMsgConferir = document.getElementById('conferir-error-msg');
        const conferenciaImediataContainer = document.getElementById('conferencia-imediata-resultado');

        const validarFormConferir = () => {
            const checkboxesSequencias = checkboxesContainer.querySelectorAll('input[type="checkbox"]');
            let isValid = true;
            let erros = [];
            if (inputConcurso.value.trim().length < 4) {
                isValid = false;
                erros.push('concurso');
            }
            if (!Array.from(checkboxesSequencias).some(cb => cb.checked)) {
                isValid = false;
                erros.push('sequencia');
            }
            return { isValid, erros };
        };

        const atualizarEstiloBotaoConferir = () => {
            const { isValid } = validarFormConferir();
            btnConferir.classList.toggle('valid', isValid);
            btnConferir.classList.toggle('invalid', !isValid);
        };

        formConferir.addEventListener('submit', (event) => {
            event.preventDefault();
            errorMsgConferir.textContent = '';
            inputConcurso.classList.remove('input-error');

            const { isValid, erros } = validarFormConferir();
            if (!isValid) {
                errorMsgConferir.textContent = 'Verifique os campos destacados.';
                if (erros.includes('concurso')) inputConcurso.classList.add('input-error');
                return;
            }

            const formData = new FormData(formConferir);
            const params = new URLSearchParams(formData).toString();
            const url = `includes/conferir.php?${params}`;
            btnConferir.textContent = 'Conferindo...';
            btnConferir.disabled = true;

            fetch(url).then(res => res.json()).then(data => {
                conferenciaImediataContainer.innerHTML = '';
                if (data.status === 'success') {
                    data.resultados.forEach(res => {
                        const resultadoDiv = document.createElement('div');
                        resultadoDiv.className = 'resultado-card'; // Reutilizamos o estilo do card
                        let html = `<h4>${res.nome} – Concurso ${res.concurso} (${res.data_sorteio})</h4>`;
                        
                        // Adicionamos a estrutura de bolinhas para os números jogados
                        html += `<div class="numeros-jogados">`;
                        res.seu_jogo.forEach(n => {
                            const classe = res.numeros_acertados.includes(n) ? 'acerto' : 'erro';
                            html += `<span class="${classe}">${String(n).padStart(2, '0')}</span>`;
                        });
                        html += `</div>`;
                        
                        html += `<div class="acertos-box">Acertos: <strong>${res.acertos_count}</strong></div>`;
                        resultadoDiv.innerHTML = html;
                        conferenciaImediataContainer.appendChild(resultadoDiv);
                    });
                } else {
                    conferenciaImediataContainer.innerHTML = `<p class="error-message">${data.message}</p>`;
                }
            }).finally(() => {
                btnConferir.textContent = 'Conferir';
                btnConferir.disabled = false;
                atualizarEstiloBotaoConferir();
            });
        });

        formConferir.addEventListener('input', atualizarEstiloBotaoConferir);
        atualizarEstiloBotaoConferir();
    }

    const allAccordionHeaders = document.querySelectorAll(".accordion-header");
    allAccordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const accordionContent = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;
                if (icon) icon.textContent = '+';
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                if (icon) icon.textContent = '−';
            }
        });
    });

    const tabGerenciar = document.getElementById('tab-gerenciar');
    if (tabGerenciar) {
        const formSalvar = document.getElementById('form-salvar-sequencia');
        const inputNome = document.getElementById('salvar-nome');
        const selectTipoJogo = document.getElementById('salvar-tipo-jogo');
        const gradeContainer = document.getElementById('grade-numeros-container');
        const contadorLabel = document.getElementById('contador-selecionados');
        const hiddenInputNumeros = document.getElementById('salvar-numeros-hidden');
        const btnSalvar = document.getElementById('btn-salvar-sequencia');
        const innerTabsNav = tabGerenciar.querySelector(".inner-tabs-nav");
        const cadastrarTabLink = document.getElementById('cadastrar-tab-link');
        const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
        const listaContainer = tabGerenciar.querySelector('#inner-tab-listar');

        let numerosSelecionados = [];
        const regrasJogo = {
            'lotofacil': { total: 25, min: 15, max: 20 },
            'megasena': { total: 60, min: 6, max: 15 }
        };

        const atualizarUICompleta = () => {
            const config = regrasJogo[selectTipoJogo.value];
            numerosSelecionados.sort((a, b) => a - b);
            hiddenInputNumeros.value = numerosSelecionados.join(',');
            contadorLabel.textContent = `${numerosSelecionados.length} / ${config.max} números selecionados`;
            const nomePreenchido = inputNome.value.trim() !== '';
            const minimoAtingido = numerosSelecionados.length >= config.min;
            const isValid = nomePreenchido && minimoAtingido;
            btnSalvar.classList.toggle('valid', isValid);
            btnSalvar.classList.toggle('invalid', !isValid);
        };

        const toggleSelecaoNumero = (btn, numero) => {
            const config = regrasJogo[selectTipoJogo.value];
            const jaSelecionado = numerosSelecionados.includes(numero);
            if (jaSelecionado) {
                numerosSelecionados = numerosSelecionados.filter(n => n !== numero);
            } else if (numerosSelecionados.length < config.max) {
                numerosSelecionados.push(numero);
            }
            btn.classList.toggle('selecionado', numerosSelecionados.includes(numero));
            atualizarUICompleta();
        };

        const gerarGrade = () => {
            gradeContainer.innerHTML = '';
            const tipo = selectTipoJogo.value;
            const config = regrasJogo[tipo];
            gradeContainer.className = `grid-${tipo}`;
            for (let i = 1; i <= config.total; i++) {
                const numeroBtn = document.createElement('div');
                numeroBtn.className = 'numero-btn';
                numeroBtn.textContent = i.toString().padStart(2, '0');
                if (numerosSelecionados.includes(i)) {
                    numeroBtn.classList.add('selecionado');
                }
                numeroBtn.addEventListener('click', () => toggleSelecaoNumero(numeroBtn, i));
                gradeContainer.appendChild(numeroBtn);
            }
            atualizarUICompleta();
        };

        const modoEdicao = (data) => {
            switchToInnerTab('inner-tab-cadastrar');
            cadastrarTabLink.textContent = 'Editar Sequência';
            btnSalvar.textContent = 'Atualizar Sequência';
            btnCancelarEdicao.classList.remove('hidden');
            let idInput = formSalvar.querySelector('input[name="id_sequencia"]');
            if (!idInput) {
                idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'id_sequencia';
                formSalvar.appendChild(idInput);
            }
            idInput.value = data.id;
            inputNome.value = data.nome;
            selectTipoJogo.value = data.tipo_jogo;
            numerosSelecionados = data.numeros.split(',').map(n => parseInt(n));
            gerarGrade();
            inputNome.focus();
        };

        const modoCadastro = () => {
            formSalvar.reset();
            let idInput = formSalvar.querySelector('input[name="id_sequencia"]');
            if (idInput) idInput.remove();
            cadastrarTabLink.textContent = 'Cadastrar';
            btnSalvar.textContent = 'Salvar';
            btnCancelarEdicao.classList.add('hidden');
            numerosSelecionados = [];
            gerarGrade();
        };

        const switchToInnerTab = (tabId) => {
            innerTabsNav.querySelectorAll(".inner-tab-link").forEach(tab => tab.classList.remove("active"));
            tabGerenciar.querySelectorAll(".inner-tab-content").forEach(content => content.classList.remove("active"));
            innerTabsNav.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
            document.getElementById(tabId).classList.add("active");
        };

        selectTipoJogo.addEventListener('change', () => {
            numerosSelecionados = [];
            gerarGrade();
        });

        inputNome.addEventListener('input', atualizarUICompleta);
        btnCancelarEdicao.addEventListener('click', modoCadastro);

        innerTabsNav.addEventListener("click", (event) => {
            const target = event.target;
            if (target.classList.contains("inner-tab-link")) {
                switchToInnerTab(target.dataset.tab);
                if (target.dataset.action === 'reset') {
                    modoCadastro();
                }
            }
        });

        if (listaContainer) {
            listaContainer.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('editar')) {
                    const sequenciaId = target.dataset.id;
                    fetch(`includes/sequencias.php?acao=buscar&id=${sequenciaId}`)
                    .then(res => res.json()).then(data => {
                        if (data) modoEdicao(data);
                    });
                }
                if (target.classList.contains('excluir') || target.classList.contains('reativar')) {
                    const acao = target.classList.contains('excluir') ? 'excluir' : 'reativar';
                    const confirmMessage = (acao === 'excluir') ? 'Tem certeza que deseja desativar esta sequência?' : 'Tem certeza que deseja reativar esta sequência?';
                    if (confirm(confirmMessage)) {
                        const formData = new FormData();
                        formData.append('acao', acao);
                        formData.append('id', target.dataset.id);
                        fetch('includes/sequencias.php', { method: 'POST', body: formData })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                window.location.reload();
                            } else {
                                alert('Erro: ' + (data.message || 'Não foi possível completar a ação.'));
                            }
                        });
                    }
                }
            });
        }

        formSalvar.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(formSalvar);
            fetch('includes/sequencias.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    window.location.reload();
                } else if (data.status === 'error') {
                    alert('Erro: ' + data.message);
                }
            });
        });

        gerarGrade();
    }
});
