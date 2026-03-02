function espalharComColisao() {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (sel.length === 0) {
        alert("Selecione os ícones matrizes primeiro!");
        return;
    }

    var indexAtivo = doc.artboards.getActiveArtboardIndex();
    var limitesPrancheta = doc.artboards[indexAtivo].artboardRect; 
    
    var limiteEsq = limitesPrancheta[0];
    var limiteTopo = limitesPrancheta[1];
    var limiteDir = limitesPrancheta[2];
    var limiteFundo = limitesPrancheta[3];

    // --- NOVOS PARÂMETROS ANTI-COLISÃO ---
    var quantidadeTotal = 80;    
    var escalaMinima = 50;       
    var escalaMaxima = 120;      
    var margemSeguranca = 5;      // Espaço extra (em pts/mm) ao redor da caixa para os ícones "respirarem"
    var tentativasMaximas = 50;   // Quantas vezes tentar achar um buraco antes de desistir
    var desenharCaixasDebug = true; // MUDE PARA FALSE QUANDO FOR USAR DE VERDADE

    var grupoEspalhamento = doc.groupItems.add();
    grupoEspalhamento.name = "Espalhamento Anti-Colisão";
    
    // Lista onde guardaremos as coordenadas das caixas de quem já foi posicionado
    var caixasOcupadas = [];

    for (var i = 0; i < quantidadeTotal; i++) {
        var indexSorteado = Math.floor(Math.random() * sel.length);
        var iconeOriginal = sel[indexSorteado];
        
        var clone = iconeOriginal.duplicate(grupoEspalhamento, ElementPlacement.PLACEATEND);
        
        var rotacao = Math.random() * 360;
        clone.rotate(rotacao);
        
        var escala = escalaMinima + Math.random() * (escalaMaxima - escalaMinima);
        clone.resize(escala, escala);

        var posicionouComSucesso = false;

        // TENTA ACHAR UM LUGAR VAZIO
        for (var tentativa = 0; tentativa < tentativasMaximas; tentativa++) {
            var posX = limiteEsq + Math.random() * ((limiteDir - limiteEsq) - clone.width);
            var posY = limiteTopo - Math.random() * ((limiteTopo - limiteFundo) - clone.height);
            
            clone.position = [posX, posY];
            
            // Pega as extremidades invisíveis do ícone neste novo lugar
            var bounds = clone.geometricBounds; // [Esquerda, Topo, Direita, Fundo]
            
            // Checa se essa nova caixa bate em alguma das antigas
            if (!temColisao(bounds, caixasOcupadas, margemSeguranca)) {
                posicionouComSucesso = true;
                caixasOcupadas.push(bounds); // Salva o lugar como ocupado
                
                // Desenha a caixa vermelha para você entender como o script "enxerga" os limites
                if (desenharCaixasDebug) { desenharRetangulo(bounds, margemSeguranca, doc); }
                
                break; // Sai do loop de tentativas, pois achou um lugar!
            }
        }

        // Se tentou 50 vezes e não achou buraco, deleta esse clone e segue a vida
        if (!posicionouComSucesso) {
            clone.remove();
        }
    }
}

// Lógica Matemática de Interseção de Retângulos (AABB)
function temColisao(novaCaixa, listaCaixas, margem) {
    for (var i = 0; i < listaCaixas.length; i++) {
        var caixaFixa = listaCaixas[i];
        
        // Verifica se as caixas se cruzam
        // No Illustrator, o eixo Y (Topo/Fundo) funciona um pouco diferente do X
        var sobrepoeX = (novaCaixa[0] - margem < caixaFixa[2] + margem) && (novaCaixa[2] + margem > caixaFixa[0] - margem);
        var sobrepoeY = (novaCaixa[1] + margem > caixaFixa[3] - margem) && (novaCaixa[3] - margem < caixaFixa[1] + margem);
        
        if (sobrepoeX && sobrepoeY) {
            return true; // Bateu!
        }
    }
    return false; // Caminho livre!
}

// Função visual extra apenas para debug (cria os quadrados em volta)
function desenharRetangulo(b, margem, doc) {
    var rect = doc.pathItems.rectangle(b[1] + margem, b[0] - margem, (b[2] - b[0]) + (margem*2), (b[1] - b[3]) + (margem*2));
    rect.filled = false;
    var corStroke = new RGBColor(); corStroke.red = 255; corStroke.green = 0; corStroke.blue = 0;
    rect.strokeColor = corStroke;
    rect.strokeWidth = 0.5;
}

espalharComColisao();