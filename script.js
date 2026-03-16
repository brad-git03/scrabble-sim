const letterValues = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10};

const bonuses = {
    '0,0':'tw', '0,7':'tw', '0,14':'tw', '7,0':'tw', '7,14':'tw', '14,0':'tw', '14,7':'tw', '14,14':'tw',
    '1,1':'dw', '2,2':'dw', '3,3':'dw', '4,4':'dw', '13,13':'dw', '12,12':'dw', '11,11':'dw', '10,10':'dw',
    '1,13':'dw', '2,12':'dw', '3,11':'dw', '4,10':'dw', '13,1':'dw', '12,2':'dw', '11,3':'dw', '10,4':'dw', 
    '1,5':'tl', '1,9':'tl', '5,1':'tl', '5,5':'tl', '5,9':'tl', '5,13':'tl', '9,1':'tl', '9,5':'tl', '9,9':'tl', '9,13':'tl', '13,5':'tl', '13,9':'tl',
    '0,3':'dl', '0,11':'dl', '2,6':'dl', '2,8':'dl', '3,0':'dl', '3,7':'dl', '3,14':'dl', '6,2':'dl', '6,6':'dl', '6,8':'dl', '6,12':'dl',
    '7,3':'dl', '7,11':'dl', '8,2':'dl', '8,6':'dl', '8,8':'dl', '8,12':'dl', '11,0':'dl', '11,7':'dl', '11,14':'dl', '12,6':'dl', '12,8':'dl', '14,3':'dl', '14,11':'dl'
};

let p1Score = 0, p2Score = 0, p3Score = 0; // Added 3rd player score
let currentPlayer = 1;
let currentTurnTiles = []; 
let moveHistory = []; 
let selectedRackTile = null;

function initBoard() {
    const board = document.getElementById('board');
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement('div');
            const bonusClass = bonuses[`${r},${c}`] || '';
            cell.className = `cell ${bonusClass}`;
            cell.id = `c-${r}-${c}`;
            cell.innerText = bonusClass.toUpperCase();
            
            cell.ondragover = e => { e.preventDefault(); cell.classList.add('hover'); };
            cell.ondragleave = () => cell.classList.remove('hover');
            cell.ondrop = e => handleDrop(e, r, c);
            cell.onclick = () => handleCellClick(r, c);
            
            board.appendChild(cell);
        }
    }
}

function generateTiles() {
    const input = document.getElementById('tileInput').value; 
    const rack = document.getElementById('rack');
    rack.innerHTML = '';
    selectedRackTile = null; 

    [...input].forEach((char, index) => {
        const upperChar = char.toUpperCase();
        if (!letterValues[upperChar]) return; 
        
        const isBlank = (char !== upperChar); 

        const tile = document.createElement('div');
        tile.className = isBlank ? 'tile blank-tile' : 'tile';
        tile.draggable = true;
        tile.innerText = upperChar;
        tile.id = `tile-${index}-${Date.now()}`;
        
        if (isBlank) tile.dataset.isBlank = "true";

        tile.ondragstart = e => {
            e.dataTransfer.setData("text/plain", upperChar);
            e.dataTransfer.setData("tileId", tile.id);
            e.dataTransfer.setData("isBlank", isBlank ? "true" : "false"); 
            setTimeout(() => tile.style.opacity = "0.4", 0);
        };
        tile.ondragend = e => e.target.style.opacity = "1";

        tile.onclick = () => {
            if (selectedRackTile) {
                const prevTile = document.getElementById(selectedRackTile.id);
                if (prevTile) prevTile.classList.remove('selected-tile');
            }

            if (selectedRackTile && selectedRackTile.id === tile.id) {
                selectedRackTile = null;
            } else {
                selectedRackTile = { id: tile.id, char: upperChar, isBlank: isBlank };
                tile.classList.add('selected-tile');
            }
        };

        rack.appendChild(tile);
    });
}

function attachDoubleTapToRemove(boardTile, cell, r, c) {
    let lastTap = 0;
    boardTile.onclick = function(e) {
        e.stopPropagation(); 
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) { 
            cell.removeChild(boardTile);
            currentTurnTiles = currentTurnTiles.filter(t => t.r !== r || t.c !== c);
        }
        lastTap = currentTime;
    };
}

function handleCellClick(r, c) {
    if (!selectedRackTile) return; 

    const cell = document.getElementById(`c-${r}-${c}`);
    if (cell.querySelector('.tile')) {
        document.getElementById(selectedRackTile.id)?.classList.remove('selected-tile');
        selectedRackTile = null;
        return; 
    }

    const boardTile = document.createElement('div');
    boardTile.className = selectedRackTile.isBlank ? 'tile blank-tile' : 'tile';
    boardTile.innerText = selectedRackTile.char;
    if (selectedRackTile.isBlank) boardTile.dataset.isBlank = "true";
    
    attachDoubleTapToRemove(boardTile, cell, r, c);

    cell.appendChild(boardTile);
    currentTurnTiles.push({ char: selectedRackTile.char, r, c, isBlank: selectedRackTile.isBlank });

    const rackTile = document.getElementById(selectedRackTile.id);
    if(rackTile) rackTile.remove();
    selectedRackTile = null;
}

function handleDrop(e, r, c) {
    e.preventDefault();
    const char = e.dataTransfer.getData("text/plain");
    const tileId = e.dataTransfer.getData("tileId");
    const isBlank = e.dataTransfer.getData("isBlank") === "true";
    const cell = document.getElementById(`c-${r}-${c}`);
    
    if (cell.querySelector('.tile')) { cell.classList.remove('hover'); return; }
    cell.classList.remove('hover');

    const boardTile = document.createElement('div');
    boardTile.className = isBlank ? 'tile blank-tile' : 'tile';
    boardTile.innerText = char;
    if (isBlank) boardTile.dataset.isBlank = "true";
    
    attachDoubleTapToRemove(boardTile, cell, r, c);

    cell.appendChild(boardTile);
    currentTurnTiles.push({ char, r, c, isBlank });

    const rackTile = document.getElementById(tileId);
    if(rackTile) rackTile.remove();
    
    if (selectedRackTile && selectedRackTile.id === tileId) {
        selectedRackTile = null;
    }
}

function switchPlayer() {
    // Cycles 1 -> 2 -> 3 -> 1
    if (currentPlayer === 1) currentPlayer = 2;
    else if (currentPlayer === 2) currentPlayer = 3;
    else currentPlayer = 1;

    document.getElementById('box-1').classList.toggle('active-p1', currentPlayer === 1);
    document.getElementById('box-2').classList.toggle('active-p2', currentPlayer === 2);
    document.getElementById('box-3').classList.toggle('active-p3', currentPlayer === 3);
}

function getTileAt(r, c) {
    if (r < 0 || r > 14 || c < 0 || c > 14) return null;
    const cell = document.getElementById(`c-${r}-${c}`);
    const tile = cell.querySelector('.tile');
    if (!tile) return null;
    
    const isNew = currentTurnTiles.some(t => t.r === r && t.c === c);
    const isBlank = tile.dataset.isBlank === "true";
    
    return { char: tile.innerText, r, c, isNew, isBlank };
}

function getWord(startR, startC, dR, dC) {
    let tiles = [];
    let r = startR, c = startC;
    while (getTileAt(r - dR, c - dC)) { r -= dR; c -= dC; }
    while (getTileAt(r, c)) {
        tiles.push(getTileAt(r, c));
        r += dR; c += dC;
    }
    return tiles;
}

function scoreWord(wordTiles) {
    if (wordTiles.length < 2) return 0; 
    
    let wordScore = 0;
    let wordMult = 1;

    for (let tile of wordTiles) {
        let val = tile.isBlank ? 0 : (letterValues[tile.char] || 0);
        
        if (tile.isNew) {
            const bonus = bonuses[`${tile.r},${tile.c}`];
            if (bonus === 'dl') val *= 2; 
            else if (bonus === 'tl') val *= 3; 
            else if (bonus === 'dw') wordMult *= 2; 
            else if (bonus === 'tw') wordMult *= 3; 
        }
        wordScore += val;
    }
    return wordScore * wordMult;
}

function calculateTurn() {
    if (currentTurnTiles.length === 0) return;

    let isHoriz = true;
    if (currentTurnTiles.length > 1) {
        if (currentTurnTiles[0].c === currentTurnTiles[1].c) isHoriz = false;
    } else {
        const t = currentTurnTiles[0];
        const hasH = getTileAt(t.r, t.c - 1) || getTileAt(t.r, t.c + 1);
        const hasV = getTileAt(t.r - 1, t.c) || getTileAt(t.r + 1, t.c);
        if (hasV && !hasH) isHoriz = false;
    }

    let turnTotal = 0;
    let wordsFormed = [];

    const formatWordLog = (tilesArray) => {
        return tilesArray.map(t => t.isBlank ? t.char.toLowerCase() : t.char).join('');
    };

    const firstTile = currentTurnTiles[0];
    const primaryWord = getWord(firstTile.r, firstTile.c, isHoriz ? 0 : 1, isHoriz ? 1 : 0);
    
    if (primaryWord.length > 1 || currentTurnTiles.length === 1) {
        let s = scoreWord(primaryWord);
        if (s >= 0) { 
            turnTotal += s;
            wordsFormed.push(formatWordLog(primaryWord));
        }
    }

    for (let tile of currentTurnTiles) {
        const secWord = getWord(tile.r, tile.c, isHoriz ? 1 : 0, isHoriz ? 0 : 1);
        if (secWord.length > 1) {
            let s = scoreWord(secWord);
            if (s >= 0) {
                turnTotal += s;
                wordsFormed.push(formatWordLog(secWord));
            }
        }
    }

    if (currentTurnTiles.length >= 7) {
        turnTotal += 50;
        wordsFormed.push("BINGO (+50)");
    }

    const p1Name = document.getElementById('p1Name').value || "Player 1";
    const p2Name = document.getElementById('p2Name').value || "Player 2";
    const p3Name = document.getElementById('p3Name').value || "Player 3";
    
    let activeName;
    if (currentPlayer === 1) activeName = p1Name;
    else if (currentPlayer === 2) activeName = p2Name;
    else activeName = p3Name;

    moveHistory.push({
        player: currentPlayer,
        score: turnTotal,
        tiles: [...currentTurnTiles] 
    });

    if (currentPlayer === 1) {
        p1Score += turnTotal;
        document.getElementById('s1').innerText = p1Score;
    } else if (currentPlayer === 2) {
        p2Score += turnTotal;
        document.getElementById('s2').innerText = p2Score;
    } else {
        p3Score += turnTotal;
        document.getElementById('s3').innerText = p3Score;
    }

    const logEntry = `<div style="margin-bottom: 5px; border-bottom: 1px dashed #747d8c; padding-bottom: 5px;">
        <b>${activeName}</b>: +${turnTotal} pts <br>
        <span style="color:#ced6e0; font-size: 11px;">Words: ${wordsFormed.join(', ')}</span>
    </div>`;
    document.getElementById('gameLog').innerHTML = logEntry + document.getElementById('gameLog').innerHTML;

    currentTurnTiles.forEach(tile => {
        const lockedTile = document.getElementById(`c-${tile.r}-${tile.c}`).querySelector('.tile');
        if(lockedTile) {
            lockedTile.onclick = null; 
            lockedTile.style.cursor = 'default';
        }
    });

    currentTurnTiles = [];
    document.getElementById('tileInput').value = '';
    document.getElementById('rack').innerHTML = '';
    selectedRackTile = null;
    switchPlayer();
}

function undoLastMove() {
    if (moveHistory.length === 0) {
        alert("No moves to undo!");
        return;
    }

    const lastMove = moveHistory.pop();

    if (lastMove.player === 1) {
        p1Score -= lastMove.score;
        document.getElementById('s1').innerText = p1Score;
    } else if (lastMove.player === 2) {
        p2Score -= lastMove.score;
        document.getElementById('s2').innerText = p2Score;
    } else {
        p3Score -= lastMove.score;
        document.getElementById('s3').innerText = p3Score;
    }

    lastMove.tiles.forEach(t => {
        const cell = document.getElementById(`c-${t.r}-${t.c}`);
        const tileDiv = cell.querySelector('.tile');
        if (tileDiv) {
            cell.removeChild(tileDiv);
        }
    });

    const logDiv = document.getElementById('gameLog');
    if (logDiv.firstElementChild) {
        logDiv.removeChild(logDiv.firstElementChild);
    }

    currentPlayer = lastMove.player;
    document.getElementById('box-1').classList.toggle('active-p1', currentPlayer === 1);
    document.getElementById('box-2').classList.toggle('active-p2', currentPlayer === 2);
    document.getElementById('box-3').classList.toggle('active-p3', currentPlayer === 3);
}

async function checkDictionary() {
    const rawInput = document.getElementById('checkWordInput').value.trim();
    const searchWord = rawInput.toLowerCase();
    const resultDiv = document.getElementById('dictResult');
    
    if (!rawInput) {
        resultDiv.innerHTML = "";
        return;
    }

    let baseScore = 0;
    const upperWord = rawInput.toUpperCase();
    
    for (let char of upperWord) {
        baseScore += letterValues[char] || 0;
    }

    resultDiv.innerHTML = `<span style="color: #f1c40f;">Checking...</span>`;

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`);
        
        if (response.ok) {
            resultDiv.innerHTML = `<span style="color: #2ecc71;">Valid! ✓ (Base Points: ${baseScore})</span>`;
        } else if (response.status === 404) {
            resultDiv.innerHTML = `<span style="color: #ff4757;">Invalid Word ✗</span>`;
        } else {
            resultDiv.innerHTML = `<span style="color: #ffa502;">API Error</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: #ff4757;">Network Error</span>`;
    }
}

initBoard();
