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
    const detalhesResultadoHistoricoContainer = document.getElementById("detalhes-resultado-historico");
    if (historicoTab && detalhesResultadoHistoricoContainer) {
        historicoTab.addEventListener("click", (event) => {
            const listItem = event.target.closest(".historico-lista li");
            if (listItem) {
                listItem.style.cursor = "pointer";
                const tipo = listItem.dataset.tipo;
                const concurso = listItem.dataset.concurso;
                fetch(`includes/ver_resultado.php?tipo=${tipo}&concurso=${concurso}`)
                    .then(res => res.text())
                    .then(html => {
                        detalhesResultadoHistoricoContainer.innerHTML = html;
                        detalhesResultadoHistoricoContainer.scrollIntoView({ behavior: "smooth" });
                    })
                    .catch(() => alert("Erro ao buscar detalhes."));
            }
        });
    }

    const formConferir = document.getElementById('form-conferir');
    if (formConferir) {
        const btnConferir = document.getElementById('btn-conferir');
        const inputConcurso = document.getElementById('concurso');
        const tipoJogoSelectConferir = document.getElementById('tipo');
        const checkboxesContainer = formConferir.querySelector('.lista-sequencias');
        const checkboxesSequencias = checkboxesContainer.querySelectorAll('input[type="checkbox"]');
        const errorMsgConferir = document.getElementById('conferir-error-msg');
        const conferenciaImediataContainer = document.getElementById('conferencia-imediata-resultado');
        const validarFormConferir = () => {
            let isValid = true;
            let erros = [];
            const tipoJogo = tipoJogoSelectConferir.value;
            if (tipoJogo === 'lotofacil' && inputConcurso.value.trim().length < 4) {
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
            checkboxesContainer.classList.remove('input-error');
            const { isValid, erros } = validarFormConferir();
            if (!isValid) {
                errorMsgConferir.textContent = 'Verifique os campos destacados.';
                if (erros.includes('concurso')) inputConcurso.classList.add('input-error');
                if (erros.includes('sequencia')) checkboxesContainer.classList.add('input-error');
                return;
            }
            const formData = new FormData(formConferir);
            const params = new URLSearchParams(formData).toString();
            const url = `includes/conferir.php?${params}`;
            btnConferir.textContent = 'Conferindo...';
            btnConferir.disabled = true;
            fetch(url).then(response => response.json()).then(data => {
                conferenciaImediataContainer.innerHTML = '';
                if (data.status === 'error') {
                    conferenciaImediataContainer.innerHTML = `<p style="color:red; font-weight:bold;">${data.message}</p>`;
                } else {
                    conferenciaImediataContainer.innerHTML = `<p style="color:green; font-weight:bold;">Conferência realizada com sucesso!</p>`;
                    data.resultados.forEach(res => {
                        const resultadoDiv = document.createElement('div');
                        resultadoDiv.style.border = '1px solid #ddd';
                        resultadoDiv.style.borderRadius = '5px';
                        resultadoDiv.style.padding = '1em';
                        resultadoDiv.style.margin = '1em 0';
                        resultadoDiv.style.backgroundColor = '#f9f9f9';
                        let html = `<h3>${res.nome} – Concurso ${res.concurso} (${res.data_sorteio})</h3>`;
                        if (res.status === 'already_checked') {
                            html += `<p>🔁 ${res.message}</p>`;
                        } else {
                            html += `<p><strong>Sorteados:</strong> ${res.numeros_sorteados.join(', ')}</p><p><strong>Seu jogo:</strong> `;
                            res.seu_jogo.forEach(n => {
                                const cor = res.numeros_acertados.includes(n) ? 'green' : '#555';
                                const fontWeight = res.numeros_acertados.includes(n) ? 'bold' : 'normal';
                                html += `<span style="color:${cor};font-weight:${fontWeight};">${n}</span> `;
                            });
                            html += `</p><p style="font-size:1.1em;"><strong>✅ Acertos: ${res.acertos_count}</strong></p>`;
                        }
                        resultadoDiv.innerHTML = html;
                        conferenciaImediataContainer.appendChild(resultadoDiv);
                    });
                }
                conferenciaImediataContainer.scrollIntoView({ behavior: 'smooth' });
            }).catch(error => {
                conferenciaImediataContainer.innerHTML = `<p style="color:red;">Ocorreu um erro de comunicação. Tente novamente.</p>`;
                console.error('Erro no fetch:', error);
            }).finally(() => {
                btnConferir.textContent = 'Conferir';
                btnConferir.disabled = false;
                atualizarEstiloBotaoConferir();
            });
        });
        formConferir.addEventListener('input', atualizarEstiloBotaoConferir);
        atualizarEstiloBotaoConferir();
    }

    const formSalvar = document.getElementById('form-salvar-sequencia');
    if (formSalvar) {
        const inputNome = document.getElementById('salvar-nome');
        const selectTipoJogo = document.getElementById('salvar-tipo-jogo');
        const gradeContainer = document.getElementById('grade-numeros-container');
        const contadorLabel = document.getElementById('contador-selecionados');
        const hiddenInputNumeros = document.getElementById('salvar-numeros-hidden');
        const btnSalvar = document.getElementById('btn-salvar-sequencia');
        const errorMsgSalvar = document.getElementById('salvar-error-msg');

        let numerosSelecionados = [];
        const regrasJogo = {
            'lotofacil': { total: 25, min: 15, max: 20 },
            'megasena': { total: 60, min: 6, max: 15 }
        };

        const atualizarUICompleta = () => {
            const tipo = selectTipoJogo.value;
            const config = regrasJogo[tipo];

            // Atualiza input
            numerosSelecionados.sort((a, b) => a - b);
            hiddenInputNumeros.value = numerosSelecionados.join(',');

            // Atualiza contador
            contadorLabel.textContent = `${numerosSelecionados.length} / ${config.max} números selecionados`;

            // Valida formulário; atualiza botão
            const nomePreenchido = inputNome.value.trim() !== '';
            const minimoNumerosAtingido = numerosSelecionados.length >= config.min;
            const isValid = nomePreenchido && minimoNumerosAtingido;
            btnSalvar.classList.toggle('valid', isValid);
            btnSalvar.classList.toggle('invalid', !isValid);
            errorMsgSalvar.textContent = '';
        };

        const toggleSelecaoNumero = (btn, numero, config) => {
            const jaSelecionado = numerosSelecionados.includes(numero);

            if (jaSelecionado) {
                numerosSelecionados = numerosSelecionados.filter(n => n !== numero);
                btn.classList.remove('selecionado');
            } else {
                if (numerosSelecionados.length < config.max) {
                    numerosSelecionados.push(numero);
                    btn.classList.add('selecionado');
                } else {
                    alert(`Você pode selecionar no máximo ${config.max} números.`);
                }
            }
            atualizarUICompleta();
        };

        const gerarGrade = () => {
            gradeContainer.innerHTML = '';
            const tipo = selectTipoJogo.value;
            const config = regrasJogo[tipo];

            gradeContainer.className = (tipo === 'lotofacil' ? 'grid-lotofacil' : 'grid-megasena');

            for (let i = 1; i <= config.total; i++) {
                const numeroBtn = document.createElement('div');
                numeroBtn.className = 'numero-btn';
                numeroBtn.textContent = i.toString().padStart(2, '0');

                if (numerosSelecionados.includes(i)) {
                    numeroBtn.classList.add('selecionado');
                }

                numeroBtn.addEventListener('click', () => toggleSelecaoNumero(numeroBtn, i, config));
                gradeContainer.appendChild(numeroBtn);
            }
            atualizarUICompleta();
        };

        const carregarDadosParaEdicao = (dados) => {
            inputNome.value = dados.nome;
            selectTipoJogo.value = dados.tipo_jogo;
            numerosSelecionados = dados.numeros.split(',').map(n => parseInt(n));
            gerarGrade();
        };

        selectTipoJogo.addEventListener('change', () => {
            numerosSelecionados = [];
            gerarGrade();
        });

        inputNome.addEventListener('input', atualizarUICompleta);

        formSalvar.addEventListener('submit', (event) => {
            inputNome.classList.remove('input-error');
            gradeContainer.classList.remove('input-error');
            const { isValid, nomePreenchido, minimoNumerosAtingido } = validarFormSalvar();
            if (!isValid) {
                event.preventDefault();
                errorMsgSalvar.textContent = 'Verifique os campos destacados.';
                if (!nomePreenchido) inputNome.classList.add('input-error');
                if (!minimoNumerosAtingido) gradeContainer.classList.add('input-error');
            }
        });

        gerarGrade();
    }

    const allAccordionHeaders = document.querySelectorAll(".accordion-header");
    allAccordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const accordionContent = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            header.parentElement.classList.toggle("active");
            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;
                if (icon) icon.textContent = '+';
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                if (icon) icon.textContent = '−';
            }
        });
    });

    const historyTabsContainer = document.querySelector(".history-tabs-nav");
    if (historyTabsContainer) {
        historyTabsContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("tab-link")) {
                const tabId = event.target.dataset.tab;
                historyTabsContainer.querySelectorAll(".tab-link").forEach(tab => tab.classList.remove("active"));
                document.querySelectorAll(".history-tabs-content .tab-content").forEach(content => content.classList.remove("active"));
                event.target.classList.add("active");
                document.getElementById(tabId).classList.add("active");
            }
        });
    }

    const tabGerenciar = document.getElementById('tab-gerenciar');
    if (tabGerenciar) {
        const formSalvar = document.getElementById('form-salvar-sequencia');
        const inputNome = document.getElementById('salvar-nome');
        const selectTipoJogo = document.getElementById('salvar-tipo-jogo');
        const btnSalvar = document.getElementById('btn-salvar-sequencia');
        const innerTabsNav = document.querySelector(".inner-tabs-nav");
        const cadastrarTabLink = document.getElementById('cadastrar-tab-link');
        const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
        const switchToInnerTab = (tabId) => {
            innerTabsNav.querySelectorAll(".inner-tab-link").forEach(tab => tab.classList.remove("active"));
            document.querySelectorAll(".inner-tabs-content .inner-tab-content").forEach(content => content.classList.remove("active"));
            innerTabsNav.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
            document.getElementById(tabId).classList.add("active");
        };
        const resetarFormularioParaCadastro = () => {
            formSalvar.reset();
            let idInput = formSalvar.querySelector('input[name="id_sequencia"]');
            if (idInput) idInput.remove();
            btnSalvar.textContent = 'Salvar';
            cadastrarTabLink.textContent = 'Cadastrar Nova';
            btnCancelarEdicao.classList.add('hidden');
            selectTipoJogo.dispatchEvent(new Event('change'));
        };
        tabGerenciar.addEventListener('click', (event) => {
            const target = event.target;
            const sequenciaId = target.dataset.id;
            const listItem = target.closest('li[data-sequencia-id]');
            if (target.classList.contains('excluir')) {
                if (confirm('Tem certeza que deseja desativar esta sequência? Ela ficará salva no histórico.')) {
                    const formData = new FormData();
                    formData.append('acao', 'excluir');
                    formData.append('id', sequenciaId);
                    fetch('includes/sequencias.php', { method: 'POST', body: formData }).then(response => response.json()).then(data => {
                        if (data.status === 'success') {
                            listItem.classList.add('inativa');
                            listItem.querySelector('.status-ativo').textContent = 'Status: Inativo';
                            listItem.querySelector('.status-ativo').className = 'status-inativo';
                            target.textContent = 'Reativar';
                            target.className = 'acao-btn reativar';
                            const checkbox = document.querySelector(`#form-conferir input[value='${sequenciaId}']`);
                            if (checkbox) checkbox.parentElement.parentElement.remove();
                        } else { alert('Erro ao desativar sequência.'); }
                    });
                }
            }
            if (target.classList.contains('reativar')) {
                const formData = new FormData();
                formData.append('acao', 'reativar');
                formData.append('id', sequenciaId);
                fetch('includes/sequencias.php', { method: 'POST', body: formData }).then(response => response.json()).then(data => {
                    if (data.status === 'success') {
                        window.location.reload();
                    } else { alert('Erro ao reativar sequência.'); }
                });
            }
            if (target.classList.contains('editar')) {
                fetch(`includes/sequencias.php?acao=buscar&id=${sequenciaId}`).then(response => response.json()).then(data => {
                    if (data) {
                        switchToInnerTab('inner-tab-cadastrar');
                        inputNome.value = data.nome;
                        selectTipoJogo.value = data.tipo_jogo;
                        let idInput = formSalvar.querySelector('input[name="id_sequencia"]');
                        if (!idInput) {
                            idInput = document.createElement('input');
                            idInput.type = 'hidden';
                            idInput.name = 'id_sequencia';
                            formSalvar.appendChild(idInput);
                        }
                        idInput.value = data.id;
                        btnSalvar.textContent = 'Atualizar Sequência';
                        cadastrarTabLink.textContent = 'Editar Sequência';
                        btnCancelarEdicao.classList.remove('hidden');
                        selectTipoJogo.dispatchEvent(new Event('change'));
                        setTimeout(() => {
                            const numerosParaSelecionar = data.numeros.split(',').map(n => parseInt(n));
                            tabGerenciar.querySelectorAll('#grade-numeros-container .numero-btn').forEach(btn => {
                                const num = parseInt(btn.dataset.numero);
                                const deveEstarSelecionado = numerosParaSelecionar.includes(num);
                                const estaSelecionado = btn.classList.contains('selecionado');
                                if (deveEstarSelecionado !== estaSelecionado) btn.click();
                            });
                        }, 50);
                        inputNome.focus();
                    }
                });
            }
        });
        btnCancelarEdicao.addEventListener('click', () => {
            resetarFormularioParaCadastro();
        });
        innerTabsNav.addEventListener("click", (event) => {
            if (event.target.classList.contains("inner-tab-link")) {
                const tabId = event.target.dataset.tab;
                switchToInnerTab(tabId);
                if (tabId === 'inner-tab-cadastrar') {
                    resetarFormularioParaCadastro();
                }
            }
        });
    }
});
