// Grid Style

var w = 240;
var h = 400;
let scl = 20;
var step = 20;
var canvasElementId = "grid";
const canvas = document.getElementById(canvasElementId);
canvas.width = w;
canvas.height = h;
var ctx = canvas.getContext('2d');

function drawGrid(ctx, w, h, step) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (var x = 0; x <= w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.beginPath();
    for (var y = 0; y <= h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    drawMatrix(arena, { x: 0, y: 0 }, ctx);
    drawMatrix(player.matrix, player.pos, ctx);
};



// Hold Style

var element_scl = 0.6
var element_size = h * element_scl
var holdElementID = "hold";
const hold = document.getElementById(holdElementID);
hold.width = element_size;
hold.height = element_size;
const element_pos = {x: 1.5, y: 0.5};
var hold_ctx = hold.getContext('2d');

function drawHold(hold_ctx) {
    hold_ctx.fillStyle = '#000';
    hold_ctx.fillRect(0, 0, element_size, element_size);
    if (player.held_matrix != null) {
        drawMatrix(scaleMatrix(player.held_matrix, 3), element_pos, hold_ctx)
    };
};



// Next Style
var nextElementID = "next";
const next = document.getElementById(nextElementID);
next.width = element_size;
next.height = element_size;
var next_ctx = next.getContext('2d');

function drawNext(next_ctx) {
    next_ctx.fillStyle = '#000';
    next_ctx.fillRect(0, 0, element_size, element_size);
    drawMatrix(scaleMatrix(player.next_matrix, 3), element_pos, next_ctx)
}



// Arena

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

const scaleMatrix = (arr, scale) => {
    let newArr = [];
    arr.forEach((el) => {
        let newArrRow = [];
        el.forEach((el) => {
            for (let j = 0; j < scale; j++) {
                newArrRow.push(el);
            }
        });
        for(let i = 0; i < scale ; i++) {
            newArr.push(newArrRow);
        }
    });
    return newArr;
};



// Pieces

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x * scl + offset.x * scl,
                    y * scl + offset.y * scl,
                    scl, scl);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        has_just_held = false;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    if (player.next_matrix == null) {
        player.next_matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    }
    last_piece = player.matrix
    if (has_just_held == true) {
        if (first_held == true) {
            player.matrix = player.next_matrix
            first_held = false
        } else {
            player.matrix = player.held_matrix
        }
        player.held_matrix = last_piece
    } else {
        player.matrix = player.next_matrix
    }
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
    player.next_matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    drawHold(hold_ctx)
    drawNext(next_ctx)
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1; 
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function hold_piece() {
    if (has_just_held == false) {
        has_just_held = true;
        playerReset()
    } else {
        return;
    }
}



// Game

let first_held = true
let has_just_held = false
let dropCounter = 0;
let dropInterval = 1000;
let difficulty = 49;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    if (player.score > difficulty) {
        dropInterval = dropInterval / 1.25;
        dropInterval = Math.round(dropInterval);
        difficulty = difficulty + 50;
    }

    lastTime = time;

    drawGrid(ctx, w, h, step);
    requestAnimationFrame(update);
} 

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 65) {
        playerMove(-1);
    }
    if (event.keyCode === 68) {
        playerMove(1);
    }
    if (event.keyCode === 83) {
        playerDrop();
    }
    if (event.keyCode === 81) {
        playerRotate(-1);
    }
    if (event.keyCode === 69) {
        playerRotate(1);
    }
    if (event.keyCode === 87) {
        hold_piece();
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    held_matrix: null,
    next_matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();