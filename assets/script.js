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
            let isValid = true, erros = [];
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
        const inputNome = document.getElementById('salvar-nome'), selectTipoJogo = document.getElementById('salvar-tipo-jogo'), gradeContainer = document.getElementById('grade-numeros-container'), contadorLabel = document.getElementById('contador-selecionados'), hiddenInputNumeros = document.getElementById('salvar-numeros-hidden'), btnSalvar = document.getElementById('btn-salvar-sequencia'), errorMsgSalvar = document.getElementById('salvar-error-msg');
        let numerosSelecionados = [];
        const regrasJogo = { 'lotofacil': { total: 25, min: 15, max: 20 }, 'mega-sena': { total: 60, min: 6, max: 15 } };
        const validarFormSalvar = () => {
            const nomePreenchido = inputNome.value.trim() !== '', tipo = selectTipoJogo.value, config = regrasJogo[tipo], minimoNumerosAtingido = numerosSelecionados.length >= config.min, isValid = nomePreenchido && minimoNumerosAtingido;
            return { isValid, nomePreenchido, minimoNumerosAtingido, config };
        };
        const atualizarEstiloBotaoSalvar = () => {
            const { isValid } = validarFormSalvar();
            btnSalvar.classList.toggle('valid', isValid);
            btnSalvar.classList.toggle('invalid', !isValid);
            errorMsgSalvar.textContent = '';
        };
        const gerarGrade = () => {
            gradeContainer.innerHTML = '';
            const tipo = selectTipoJogo.value, config = regrasJogo[tipo];
            gradeContainer.className = (tipo === 'lotofacil' ? 'grid-lotofacil' : 'grid-megasena');
            for (let i = 1; i <= config.total; i++) {
                const numeroBtn = document.createElement('div');
                numeroBtn.className = 'numero-btn';
                numeroBtn.textContent = i.toString().padStart(2, '0');
                numeroBtn.dataset.numero = i;
                numeroBtn.addEventListener('click', () => toggleSelecaoNumero(numeroBtn, config));
                gradeContainer.appendChild(numeroBtn);
            }
            atualizarEstiloBotaoSalvar();
        };
        const toggleSelecaoNumero = (btn, config) => {
            const numero = parseInt(btn.dataset.numero), jaSelecionado = numerosSelecionados.includes(numero);
            if (jaSelecionado) {
                numerosSelecionados = numerosSelecionados.filter(n => n !== numero);
            } else if (numerosSelecionados.length < config.max) {
                numerosSelecionados.push(numero);
            }
            btn.classList.toggle('selecionado', !jaSelecionado && numerosSelecionados.includes(numero));
            numerosSelecionados.sort((a, b) => a - b);
            hiddenInputNumeros.value = numerosSelecionados.join(',');
            contadorLabel.textContent = `${numerosSelecionados.length} / ${config.max} números selecionados`;
            atualizarEstiloBotaoSalvar();
        };
        formSalvar.addEventListener('submit', (event) => {
            inputNome.classList.remove('input-error');
            gradeContainer.classList.remove('input-error');
            const { isValid, nomePreenchido, minimoNumerosAtingido, config } = validarFormSalvar();
            if (!isValid) {
                event.preventDefault();
                errorMsgSalvar.textContent = 'Verifique os campos destacados.';
                if (!nomePreenchido) inputNome.classList.add('input-error');
                if (!minimoNumerosAtingido) gradeContainer.classList.add('input-error');
            }
        });
        selectTipoJogo.addEventListener('change', () => {
            numerosSelecionados = [];
            hiddenInputNumeros.value = '';
            gerarGrade();
            contadorLabel.textContent = `0 / ${regrasJogo[selectTipoJogo.value].max} números selecionados`;
            atualizarEstiloBotaoSalvar();
        });
        inputNome.addEventListener('input', atualizarEstiloBotaoSalvar);
        gerarGrade();
        contadorLabel.textContent = `0 / ${regrasJogo[selectTipoJogo.value].max} números selecionados`;
        atualizarEstiloBotaoSalvar();
    }
    const allAccordionHeaders = document.querySelectorAll(".accordion-header");
    allAccordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const accordionContent = header.nextElementSibling, icon = header.querySelector('.accordion-icon');
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
        const formSalvar = document.getElementById('form-salvar-sequencia'), inputNome = document.getElementById('salvar-nome'), selectTipoJogo = document.getElementById('salvar-tipo-jogo'), btnSalvar = document.getElementById('btn-salvar-sequencia'), innerTabsNav = document.querySelector(".inner-tabs-nav"), cadastrarTabLink = document.getElementById('cadastrar-tab-link'), btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
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
            cadastrarTabLink.textContent = 'Cadastrar';
            btnCancelarEdicao.classList.add('hidden');
            selectTipoJogo.dispatchEvent(new Event('change'));
        };
        tabGerenciar.addEventListener('click', (event) => {
            const target = event.target, sequenciaId = target.dataset.id, listItem = target.closest('li[data-sequencia-id]');
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
                                const num = parseInt(btn.dataset.numero), deveEstarSelecionado = numerosParaSelecionar.includes(num), estaSelecionado = btn.classList.contains('selecionado');
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
