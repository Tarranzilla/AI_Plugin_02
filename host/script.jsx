// Função que lê a tela em tempo real
function getSystemStatus() {
    try {
        var doc = app.activeDocument;
        var selCount = doc.selection.length;
        var indexAtivo = doc.artboards.getActiveArtboardIndex();
        var nomePrancheta = doc.artboards[indexAtivo].name;
        
        return selCount + "|||" + nomePrancheta;
    } catch(e) {
        return "error";
    }
}

// Motor de espalhamento
function espalharComColisaoUI(countStr, marginStr, scaleMinStr, scaleMaxStr, rotateStr, debugStr) {
    try {
        var doc;
        try { doc = app.activeDocument; } catch(e) { return "Abra um documento primeiro."; }
        
        var sel = doc.selection;
        if (sel.length === 0) {
            return "Selecione os ícones na tela que você quer usar como matriz!";
        }

        var quantidadeTotal = parseInt(countStr);
        var margemSeguranca = parseFloat(marginStr);
        var escalaMinima = parseFloat(scaleMinStr);
        var escalaMaxima = parseFloat(scaleMaxStr);
        var aplicarRotacao = (rotateStr === "true");
        var desenharCaixasDebug = (debugStr === "true");

        var indexAtivo = doc.artboards.getActiveArtboardIndex();
        var limitesPrancheta = doc.artboards[indexAtivo].artboardRect; 
        
        var limiteEsq = limitesPrancheta[0];
        var limiteTopo = limitesPrancheta[1];
        var limiteDir = limitesPrancheta[2];
        var limiteFundo = limitesPrancheta[3];

        var tentativasMaximas = 50; 
        var caixasOcupadas = [];

        var grupoEspalhamento = doc.groupItems.add();
        grupoEspalhamento.name = "Espalhamento Gerado";

        for (var i = 0; i < quantidadeTotal; i++) {
            var indexSorteado = Math.floor(Math.random() * sel.length);
            var iconeOriginal = sel[indexSorteado];
            
            var clone = iconeOriginal.duplicate(grupoEspalhamento, ElementPlacement.PLACEATEND);
            
            if (aplicarRotacao) {
                var rotacao = Math.random() * 360;
                clone.rotate(rotacao);
            }
            
            var escala = escalaMinima + Math.random() * (escalaMaxima - escalaMinima);
            clone.resize(escala, escala);

            var posicionouComSucesso = false;

            for (var tentativa = 0; tentativa < tentativasMaximas; tentativa++) {
                // Cálculo de posição
                var posX = limiteEsq + Math.random() * ((limiteDir - limiteEsq) - clone.width);
                var posY = limiteTopo - Math.random() * ((limiteTopo - limiteFundo) - clone.height);
                
                clone.position = [posX, posY];
                var bounds = clone.geometricBounds; 
                
                if (!temColisao(bounds, caixasOcupadas, margemSeguranca)) {
                    posicionouComSucesso = true;
                    caixasOcupadas.push(bounds); 
                    
                    if (desenharCaixasDebug) { desenharRetangulo(bounds, margemSeguranca, doc, grupoEspalhamento); }
                    break; 
                }
            }

            if (!posicionouComSucesso) {
                clone.remove(); 
            }
        }
        
        doc.selection = null;
        grupoEspalhamento.selected = true;
        
        return "sucesso"; // Devolve o OK para o HTML
        
    } catch(err) {
        // Se algo der pau nas entranhas do Illustrator, ele devolve a mensagem exata de erro
        return "Erro do Illustrator: " + err.message + " na linha " + err.line;
    }
}

function temColisao(novaCaixa, listaCaixas, margem) {
    for (var i = 0; i < listaCaixas.length; i++) {
        var caixaFixa = listaCaixas[i];
        var sobrepoeX = (novaCaixa[0] - margem < caixaFixa[2] + margem) && (novaCaixa[2] + margem > caixaFixa[0] - margem);
        var sobrepoeY = (novaCaixa[1] + margem > caixaFixa[3] - margem) && (novaCaixa[3] - margem < caixaFixa[1] + margem);
        
        if (sobrepoeX && sobrepoeY) { return true; }
    }
    return false;
}

function desenharRetangulo(b, margem, doc, grupoPai) {
    var rect = doc.pathItems.rectangle(b[1] + margem, b[0] - margem, (b[2] - b[0]) + (margem*2), (b[1] - b[3]) + (margem*2));
    rect.filled = false;
    var corStroke = new RGBColor(); corStroke.red = 255; corStroke.green = 0; corStroke.blue = 0;
    rect.strokeColor = corStroke;
    rect.strokeWidth = 0.5;
    rect.moveToEnd(grupoPai);
}