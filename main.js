var csInterface = new CSInterface();

// Roda assim que o painel abrir
window.onload = function() {
    updateSystemStatus();
};

document.getElementById('btnRefresh').addEventListener('click', updateSystemStatus);

function updateSystemStatus() {
    csInterface.evalScript('getSystemStatus()', function(result) {
        if(result === "error") {
            showError("Abra um documento no Illustrator primeiro.");
            return;
        }
        // O Illustrator devolve algo como "5|||Prancheta 1"
        var parts = result.split('|||');
        document.getElementById('lblSelection').innerHTML = 'Ícones selecionados: <span class="highlight">' + parts[0] + '</span>';
        document.getElementById('lblArtboard').innerHTML = 'Prancheta ativa: <span class="highlight">' + parts[1] + '</span>';
        hideError();
    });
}

document.getElementById('btnScatter').addEventListener('click', function() {
    var count = parseInt(document.getElementById('inpCount').value);
    var margin = parseFloat(document.getElementById('inpMargin').value);
    var scaleMin = parseFloat(document.getElementById('inpScaleMin').value);
    var scaleMax = parseFloat(document.getElementById('inpScaleMax').value);
    var doRotate = document.getElementById('chkRotate').checked;
    var doDebug = document.getElementById('chkDebug').checked;

    if (isNaN(count) || count <= 0) { showError("A quantidade deve ser maior que zero."); return; }
    if (scaleMin > scaleMax) { showError("A escala mínima não pode ser maior que a máxima."); return; }

    hideError(); // Limpa erros antigos antes de rodar
    
    var comando = 'espalharComColisaoUI("' + count + '", "' + margin + '", "' + scaleMin + '", "' + scaleMax + '", "' + doRotate + '", "' + doDebug + '")';
    
    // Agora esperamos uma resposta do script.jsx
    csInterface.evalScript(comando, function(resposta) {
        if(resposta !== "sucesso") {
            showError(resposta); // Mostra o erro exato na tela
        } else {
            updateSystemStatus(); // Atualiza a contagem de itens na tela se deu certo
        }
    });
});

function showError(msg) {
    var errBox = document.getElementById('errorConsole');
    errBox.innerText = "⚠️ " + msg;
    errBox.style.display = "block";
}

function hideError() {
    document.getElementById('errorConsole').style.display = "none";
}