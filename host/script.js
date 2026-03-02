// Função principal que recebe os dados da interface gráfica
function espalharComColisaoUI(countStr, marginStr, scaleMinStr, scaleMaxStr, rotateStr, debugStr) {
    var doc;
    try { doc = app.activeDocument; } catch(e) { alert("Abra um documento primeiro."); return; }
    
    var sel = doc.selection;
    if (sel.length === 0) {
        alert("Selecione os ícones matrizes que deseja espalhar!");
        return;
    }

    // Conversão das strings do HTML para os formatos corretos do JavaScript
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

    // Oculta as matrizes originais temporariamente para não atrapalhar o cálculo da caixa (Opcional, mas seguro)
    // Criamos o grupo do espalhamento
    var grupoEspalhamento = doc.groupItems.add();
    grupoEspalhamento.name = "Espalhamento Gerado";
    
    var caixasOcupadas = [];

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
            clone.remove(); // Desiste deste clone se não achou espaço
        }
    }
    
    // No final, deseleciona as matrizes e seleciona o grupo novo para o usuário ver o resultado
    doc.selection = null;
    grupoEspalhamento.selected = true;
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
    // Desenha as caixas visuais dentro do mesmo grupo gerado para não poluir os layers
    var rect = doc.pathItems.rectangle(b[1] + margem, b[0] - margem, (b[2] - b[0]) + (margem*2), (b[1] - b[3]) + (margem*2));
    rect.filled = false;
    var corStroke = new RGBColor(); corStroke.red = 255; corStroke.green = 0; corStroke.blue = 0;
    rect.strokeColor = corStroke;
    rect.strokeWidth = 0.5;
    rect.moveToEnd(grupoPai);
}