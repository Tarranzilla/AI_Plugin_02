var csInterface = new CSInterface();

document.getElementById('btnScatter').addEventListener('click', function() {
    // Coleta os valores da interface
    var count = parseInt(document.getElementById('inpCount').value);
    var margin = parseFloat(document.getElementById('inpMargin').value);
    var scaleMin = parseFloat(document.getElementById('inpScaleMin').value);
    var scaleMax = parseFloat(document.getElementById('inpScaleMax').value);
    var doRotate = document.getElementById('chkRotate').checked;
    var doDebug = document.getElementById('chkDebug').checked;

    // Validação básica de segurança
    if (isNaN(count) || count <= 0) { alert("A quantidade deve ser maior que zero."); return; }
    if (scaleMin > scaleMax) {
        alert("A escala mínima não pode ser maior que a escala máxima!");
        return;
    }

    // Converte tudo para string para enviar pelo evalScript sem erros de sintaxe
    var comando = 'espalharComColisaoUI("' + count + '", "' + margin + '", "' + scaleMin + '", "' + scaleMax + '", "' + doRotate + '", "' + doDebug + '")';
    
    // Dispara a função no Illustrator
    csInterface.evalScript(comando);
});