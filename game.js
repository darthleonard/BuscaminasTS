"use strict";
var GameState;
(function (GameState) {
    GameState[GameState["NotSet"] = 0] = "NotSet";
    GameState[GameState["Win"] = 1] = "Win";
    GameState[GameState["Lose"] = 2] = "Lose";
    GameState[GameState["Play"] = 3] = "Play";
})(GameState || (GameState = {}));
var Drawer = /** @class */ (function () {
    function Drawer(canvas, ctx) {
        this.ctx = null;
        this.gameState = GameState.NotSet;
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = new Map(10, 10, 15);
        this.cellWidth = this.canvas.width / 10;
        this.cellheight = this.canvas.height / 10;
    }
    Drawer.prototype.paint = function () {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = "20px Arial";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        var imgTile = document.getElementById("tile");
        var imgFlag = document.getElementById("flag");
        var imgMine = document.getElementById("mine");
        for (var i = 0; i < this.map.Rows; i++) {
            for (var j = 0; j < this.map.Cols; j++) {
                var cell = this.map.GetCell(j, i);
                this.ctx.fillStyle = "#C2C2C2";
                this.ctx.drawImage(imgTile, j * this.cellWidth, i * this.cellheight, this.cellWidth, this.cellheight);
                if (cell.Marked) {
                    this.ctx.drawImage(imgFlag, j * this.cellWidth, i * this.cellheight, this.cellWidth, this.cellheight);
                }
                if (cell.Opened) {
                    this.ctx.fillRect(j * this.cellWidth + 4, i * this.cellheight + 4, this.cellWidth - 8, this.cellheight - 8);
                    if (cell.HaveMine) {
                        this.ctx.drawImage(imgMine, j * this.cellWidth, i * this.cellheight, this.cellWidth, this.cellheight);
                    }
                }
                var str = (cell.Opened && !cell.HaveMine && cell.Counter > 0) ? cell.Counter : "";
                this.ctx.fillStyle = cell.getColor();
                this.ctx.fillText(str, j * this.cellWidth + this.cellWidth / 4, i * this.cellheight + 30);
            }
        }
    };
    Drawer.prototype.click = function (x, y, actionFlag) {
        var mousex = Math.floor((x - this.canvas.offsetLeft) / this.cellWidth);
        var mousey = Math.floor((y - this.canvas.offsetTop) / this.cellheight);
        if (!this.inRange(mousex, mousey)) {
            return;
        }
        if (actionFlag) {
            this.gameState = this.map.Open(mousex, mousey);
        }
        else {
            this.map.Mark(mousex, mousey);
        }
        switch (this.gameState) {
            case GameState.Win:
                console.log('win');
                break;
            case GameState.Lose:
                console.log('lose');
                break;
            case GameState.Play:
                console.log('play');
                break;
        }
        this.paint();
    };
    Drawer.prototype.inRange = function (mousex, mousey) {
        return mousex >= 0
            && mousex < this.map.Rows
            && mousey >= 0
            && mousey < this.map.Cols;
    };
    return Drawer;
}());
var Cell = /** @class */ (function () {
    function Cell() {
        this.HaveMine = false;
        this.Opened = false;
        this.Marked = false;
        this.Counter = 0;
    }
    Cell.prototype.getColor = function () {
        switch (this.Counter) {
            case 1: return "#0000FF";
            case 2: return "#008000";
            case 3: return "#FF0000";
            case 4: return "#191970";
            case 5: return "#800000";
            case 6: return "#008080";
            case 7: return "#0F0F0F";
            case 8: return "#000000";
        }
        return "";
    };
    return Cell;
}());
var Map = /** @class */ (function () {
    function Map(cols, rows, mines) {
        this.matrix = [];
        this.OpenedCells = 0;
        this.Cols = cols;
        this.Rows = rows;
        this.Mines = mines;
        this.initMap();
    }
    Map.prototype.initMap = function () {
        for (var i = 0; i < this.Rows; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < this.Cols; j++) {
                this.matrix[i][j] = new Cell();
            }
        }
        this.AddMines();
    };
    Map.prototype.AddMines = function () {
        var x, y, cont = 0;
        while (cont < this.Mines) {
            x = Math.floor(Math.random() * this.Cols);
            y = Math.floor(Math.random() * this.Rows);
            if (this.matrix[y][x].HaveMine) {
                continue;
            }
            this.matrix[y][x].HaveMine = true;
            this.matrix[y][x].Counter++;
            this.CountMines(x - 1, y - 1);
            this.CountMines(x, y - 1);
            this.CountMines(x + 1, y - 1);
            this.CountMines(x - 1, y);
            this.CountMines(x + 1, y);
            this.CountMines(x - 1, y + 1);
            this.CountMines(x, y + 1);
            this.CountMines(x + 1, y + 1);
            cont++;
        }
    };
    Map.prototype.CountMines = function (x, y) {
        if (x < 0 || x >= this.Cols || y < 0 || y >= this.Rows) {
            return;
        }
        this.matrix[y][x].Counter++;
    };
    Map.prototype.GetCell = function (x, y) {
        return this.matrix[y][x];
    };
    Map.prototype.Open = function (x, y) {
        if (this.matrix[y][x].HaveMine && !this.matrix[y][x].Marked) {
            this.matrix[y][x].Opened = true;
            this.OpenedCells++;
            return GameState.Lose;
        }
        this.OpenCell(x, y);
        if (this.OpenedCells == this.Cols * this.Rows - this.Mines) {
            return GameState.Win;
        }
        return GameState.Play;
    };
    Map.prototype.Mark = function (x, y) {
        if (this.matrix[y][x].Opened) {
            return;
        }
        this.matrix[y][x].Marked = !this.matrix[y][x].Marked;
    };
    Map.prototype.OpenCell = function (x, y) {
        if (x < 0 || x >= this.Cols || y < 0 || y >= this.Rows || this.matrix[y][x].Opened) {
            return;
        }
        else {
            if (!this.matrix[y][x].HaveMine && !this.matrix[y][x].Marked) {
                this.matrix[y][x].Opened = true;
                this.OpenedCells++;
                if (this.matrix[y][x].Counter == 0) {
                    this.OpenCell(x - 1, y - 1);
                    this.OpenCell(x, y - 1);
                    this.OpenCell(x + 1, y - 1);
                    this.OpenCell(x - 1, y);
                    this.OpenCell(x + 1, y);
                    this.OpenCell(x - 1, y + 1);
                    this.OpenCell(x, y + 1);
                    this.OpenCell(x + 1, y + 1);
                }
            }
        }
    };
    return Map;
}());
function Buscaminas() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var drawer = new Drawer(canvas, ctx);
    canvas.addEventListener('contextmenu', function (evt) { return evt.preventDefault(); }, false);
    document.addEventListener('mousedown', function (evt) {
        evt.preventDefault();
        drawer.click(evt.pageX, evt.pageY, evt.button == 0);
    }, false);
    drawer.paint();
}
window.addEventListener('load', Buscaminas, false);
