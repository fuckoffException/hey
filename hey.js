var canvas, context, itemsArr, MAX_X, MIN_X, MAX_Y, MIN_Y, item, lastPos, interval, backgroundColor, score, IN, OUT, SIZE, pause, beforeChanged;

// 物体
class Item {
    constructor(size) {
        this.shape = 2;
        this.size = size;
        this.arrPosition = [
            {
                x: 10,
                y: -2,
            },
            {
                x: 10,
                y: -1,
            },
            {
                x: 10,
                y: 0,
            },
            {
                x: 11,
                y: 0,
            }
        ];
        this.moveX = function (offset) {
            for (let i = 0; i < this.arrPosition.length; i++) {
                this.arrPosition[i].x += offset;
            }
        }
        this.moveY = function (offset) {
            for (let i = 0; i < this.arrPosition.length; i++) {
                this.arrPosition[i].y += offset;
            }
        }
        this.initArrPosition = function () {
            this.shape = parseInt(Math.random() * 10 % 7);
            let startX = 11;
            let startY = -2;
            this.arrPosition = [];
            this.arrPosition.push({ x: startX, y: startY });
            this.arrPosition.push({ x: startX, y: startY + 1 });
            //console.log("this.shape: " + this.shape);
            if (0 == this.shape) {
                this.arrPosition.push({ x: startX, y: startY + 2 });
                this.arrPosition.push({ x: startX, y: startY + 3 });
            } else if (1 == this.shape) {
                this.arrPosition.push({ x: startX + 1, y: startY });
                this.arrPosition.push({ x: startX + 1, y: startY + 1 });
            } else if (2 == this.shape) {
                this.arrPosition.push({ x: startX, y: startY + 2 });
                this.arrPosition.push({ x: startX + 1, y: startY + 2 });
            } else if (3 == this.shape) {
                this.arrPosition.push({ x: startX, y: startY + 2 });
                this.arrPosition.push({ x: startX - 1, y: startY + 2 });
            } else if (4 == this.shape) {
                this.arrPosition.push({ x: startX - 1, y: startY + 1 });
                this.arrPosition.push({ x: startX + 1, y: startY + 1 });
            } else if (5 == this.shape) {
                this.arrPosition.push({ x: startX + 1, y: startY + 1 });
                this.arrPosition.push({ x: startX + 1, y: startY + 2 });
            } else if (6 == this.shape) {
                this.arrPosition.push({ x: startX - 1, y: startY + 1 });
                this.arrPosition.push({ x: startX - 1, y: startY + 2 });
            } else {
                console.log("初始化类型时出错!");
            }
        }
    }
}

// 初始化
function init() {

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.fillStyle = "darkcyan";
    context.strokeStyle = "white";
    //context.lineWidth = 1;
    context.lineCap = 'square';//"butt|round|square"

    backgroundColor = canvas.style.backgroundColor;

    // 二维数组作为记录位置，提供碰撞检测
    itemsArr = new Array(25);
    for (let i = 0; i < itemsArr.length; i++) {
        itemsArr[i] = new Array(30);
        for (let j = 0; j < itemsArr[i].length; j++) {
            itemsArr[i][j] = 0;
        }
    }

    MAX_X = 500;
    MIN_X = 0;
    MAX_Y = 600;
    MIN_Y = 0;
    IN = 1;
    OUT = 0;

    SIZE = 20;

    lastPos = [];
    score = 0;
    beforeChanged = [];
    pause = false;

    console.log("当前分数：" + score);    
}

// 下落
function drop() {
    clearLastPos(true);
    drawItem();
    if (!reachBottom()) {
        addToLastPos();
        item.moveY(1);
    } else {
        addToItemsArr();
        gameOver();
        item.initArrPosition();
    }
}

function gameOver(){
    for (let i=0; i<item.arrPosition.length; i++){
        if (item.arrPosition[i].y<=0){
            window.clearInterval(interval);
            console.log("--GAME OVER--");
            return;
        }
    }
}

// 画
function drawItem() {
    let pos = item.arrPosition;
    draw(pos);
}

// 实际的画
function draw(arrPos) {
    let realPos = indexsToPositions(arrPos);
    context.beginPath();
    for (let i = 0; i < realPos.length; i++) {
        context.rect(realPos[i].x, realPos[i].y, SIZE, SIZE);
    }
    context.closePath();
    context.fill();
    context.beginPath();
    for (let i = 0; i < realPos.length; i++) {
        context.rect(realPos[i].x + 1, realPos[i].y + 1, SIZE - 2, SIZE - 2);
    }
    context.closePath();
    context.stroke();
}

function drawSinglePoint(x, y) {
    let realX = indexToPosition(x);
    let realY = indexToPosition(y);

    context.beginPath();
    context.rect(realX, realY, SIZE, SIZE);
    context.closePath();
    context.fill();
    context.beginPath();
    context.rect(realX + 1, realY + 1, SIZE - 2, SIZE - 2);
    context.closePath();
    context.stroke();
}

// 加入轨迹
function addToLastPos() {
    let pos = item.arrPosition;
    lastPos.push([{ x: pos[0].x, y: pos[0].y }, { x: pos[1].x, y: pos[1].y }, { x: pos[2].x, y: pos[2].y }, { x: pos[3].x, y: pos[3].y }]);
}

// 清除轨迹
function clearLastPos(clear) {

    if (lastPos.length <= 0) {
        return;
    }

    if (clear) {
        let realLastPos = [];
        for (let i = 0; i < lastPos.length; i++) {
            realLastPos.push(indexsToPositions(lastPos[i]));
        }
        for (let i = 0; i < realLastPos.length; i++) {
            for (let j = 0; j < realLastPos[i].length; j++) {
                context.clearRect(realLastPos[i][j].x, realLastPos[i][j].y, SIZE, SIZE);
            }
        }
    }

    lastPos = [];
}

// 清除画好的得分行
function clearScoreDraw(y) {
    let realY = indexToPosition(y);
    context.clearRect(0, realY, MAX_X, SIZE);
}

// 清除单个点
function clearSinglePoint(x, y) {
    let realX = indexToPosition(x);
    let realY = indexToPosition(y);
    context.clearRect(realX, realY, SIZE, SIZE);
}
// 画一些点
function drawPoints(points) {
    let realPoints = [];
    // 一画填充色
    context.beginPath();
    for (let i = 0; i < points.length; i++) {
        let realX = indexToPosition(points[i].x);
        let realY = indexToPosition(points[i].y);
        // 这里只是顺便放进去
        realPoints.push({ x: realX, y: realY });
        context.rect(realX, realY, SIZE, SIZE);
    }
    context.closePath();
    context.fill();

    // 二画边框
    context.beginPath();
    for (let i = 0; i < realPoints.length; i++) {
        context.rect(realPoints[i].x + 1, realPoints[i].y + 1, SIZE - 2, SIZE - 2);
    }
    context.closePath();
    context.stroke();
}

// 根据当前索引值检测是否触发得分
function scoresDetect(y) {
    if (y<0){
        return;
    }
    let i = 0;
    for (; i < itemsArr.length; i++) {
        if (itemsArr[i][y] == 0) {
            break;
        }
    }
    // 整行都满了yes得分
    if (i == itemsArr.length) {
        score += 10;
        console.log("当前分数：" + score);

        // 一清数组行
        for (let j = 0; j < itemsArr.length; j++) {
            itemsArr[j][y] = 0;
        }
        // 二消图像行
        clearScoreDraw(y);

        // 三移其他行
        y--;
        let otherPoints = [];
        while (y >= 0) {
            for (let k = 0; k < itemsArr.length; k++) {
                if (itemsArr[k][y] == 1) {
                    itemsArr[k][y] = 0;
                    clearSinglePoint(k, y);
                    let nextY = y + 1;
                    itemsArr[k][nextY] = 1;

                    //drawSinglePoint(k, y+1);// 一个一个画图形很奇葩，所以一次性画所有
                    otherPoints.push({ x: k, y: nextY });
                }
            }
            y--;
        };
        if (otherPoints.length > 0) {
            drawPoints(otherPoints);
        }

    }
}


// 更新数组位置值， value: 0或1
function updateItemsArr(value) {

    let pos = item.arrPosition;
    for (let i = 0; i < pos.length; i++) {
        let x = pos[i].x;
        let y = pos[i].y;
        itemsArr[x][y] = value;
    }
    for (let i = 0; i < pos.length; i++) {
        let y = pos[i].y;
        // 根据当前行检测是否得分
        scoresDetect(y);
    }

}

// 加入设置当前数组位置
function addToItemsArr() {
    updateItemsArr(1);
}

// 移除当前数组位置
function clearFromItemsArr() {
    updateItemsArr(0);
}

// 图像坐标 -> 数组下标
function posToIndex(p) {
    return xIndex = p / SIZE;
}

// 单个数组下标 -> 图像坐标
function indexToPosition(index) {
    return index * SIZE;
}

// 数组下标 -> 图像坐标
function indexsToPositions(position) {
    let realPos = [];
    for (let i = 0; i < position.length; i++) {
        let x = position[i].x * SIZE;
        let y = position[i].y * SIZE;
        realPos.push(
            {
                x: x,
                y: y
            }
        );
    }
    return realPos;
}

// 变
function change() {
    let pos = item.arrPosition;
    let size = SIZE;
    for (let i=0; i<pos.length; i++){
        beforeChanged.push({x: pos[i].x, y: pos[i].y});
    }
    switch (item.shape) {
        // 长条状
        case 0:
            if (pos[0].x == pos[1].x) {
                // 当前为竖条
                pos[0].x -= 1;
                pos[0].y += 1;
                pos[1].x = pos[1].x;
                pos[1].y = pos[1].y;
                pos[2].x += 1;
                pos[2].y -= 1;
                pos[3].x += (2 * 1);
                pos[3].y -= (2 * 1);
            } else {
                // 当前为横条
                pos[0].x += 1;
                pos[0].y -= 1;
                pos[1].x = pos[1].x;
                pos[1].y = pos[1].y;
                pos[2].x -= 1;
                pos[2].y += 1;
                pos[3].x -= (2 * 1);
                pos[3].y += (2 * 1);
            }
            break;
        // 田字形
        case 1:
            break;
        // 正L型
        case 2:
            let pivoit = {};
            let offset = 0;
            if (pos[1].x == pos[0].x && pos[1].y > pos[0].y) {
                // pivoit on right
                pivoit = { x: pos[1].x + 1, y: pos[1].y };
                pos[0].y += 2;
                pos[1].x += 1;
                pos[1].y += 1;
                pos[2].x += 2;
                pos[3].x += 1;
                pos[3].y -= 1;
            } else if (pos[1].x > pos[0].x && pos[1].y == pos[0].y) {
                // pivoit on top
                pivoit = { x: pos[1].x, y: pos[1].y - 1 };
                pos[0].x += 2;
                pos[1].x += 1;
                pos[1].y -= 1;
                pos[2].y -= 2;
                pos[3].x -= 1;
                pos[3].y -= 1;
            } else if (pos[1].x == pos[0].x && pos[1].y < pos[0].y) {
                // pivoit on left
                pivoit = { x: pos[1].x - 1, y: pos[1].y };
                pos[0].y -= 2;
                pos[1].x -= 1;
                pos[1].y -= 1;
                pos[2].x -= 2;
                pos[3].x -= 1;
                pos[3].y += 1;
            } else if (pos[1].x < pos[0].x && pos[1].y == pos[0].y) {
                // pivoit on bottom
                pivoit = { x: pos[1].x, y: pos[1] + 1 };
                pos[0].x -= 2;
                pos[1].x -= 1;
                pos[1].y += 1;
                pos[2].y += 2;
                pos[3].x += 1;
                pos[3].y += 1;
            }
            break;
        // 反L型
        case 3:
            if (pos[1].x == pos[0].x && pos[1].y > pos[0].y) {
                pos[0].x -= 2;
                pos[1].x -= 1;
                pos[1].y -= 1;
                pos[2].y -= 2;
                pos[3].x += 1;
                pos[3].y -= 1;
            } else if (pos[1].x > pos[0].x && pos[1].y == pos[0].y) {
                pos[0].y += 2;
                pos[1].y += 1;
                pos[1].x -= 1;
                pos[2].x -= 2;
                pos[3].y -= 1;
                pos[3].x -= 1;
            } else if (pos[1].x == pos[0].x && pos[1].y < pos[0].y) {
                pos[0].x += 2;
                pos[1].y += 1;
                pos[1].x += 1;
                pos[2].y += 2;
                pos[3].x -= 1;
                pos[3].y += 1;
            } else if (pos[1].x < pos[0].x && pos[1].y == pos[0].y) {
                pos[0].y -= 2;
                pos[1].x += 1;
                pos[1].y -= 1;
                pos[2].x += 2;
                pos[3].x += 1;
                pos[3].y += 1;
            }
            break;
        // 凸字型
        case 4:
            if (pos[0].x == pos[1].x && pos[0].y < pos[1].y) {
                pos[0].x -= 1;
                pos[0].y += 1;
                pos[2].x += 1;
                pos[2].y += 1;
                pos[3].x -= 1;
                pos[3].y -= 1;
            } else if (pos[0].x < pos[1].x && pos[0].y == pos[1].y) {
                pos[0].x += 1;
                pos[0].y += 1;
                pos[2].x += 1;
                pos[2].y -= 1;
                pos[3].x -= 1;
                pos[3].y += 1;
            } else if (pos[0].x == pos[1].x && pos[0].y > pos[1].y) {
                pos[0].x += 1;
                pos[0].y -= 1;
                pos[2].x -= 1;
                pos[2].y -= 1;
                pos[3].x += 1;
                pos[3].y += 1;
            } else if (pos[0].x > pos[1].x && pos[0].y == pos[1].y) {
                pos[0].x -= 1;
                pos[0].y -= 1;
                pos[2].x -= 1;
                pos[2].y += 1;
                pos[3].x += 1;
                pos[3].y -= 1;
            }
            break;
        // 正闪电型
        case 5:
            if (pos[0].x == pos[1].x && pos[0].y < pos[1].y) {
                pos[0].x -= 1;
                pos[0].y += 1;
                pos[2].x -= 1;
                pos[2].y -= 1;
                pos[3].y -= 2;
            } else if (pos[0].x < pos[1].x && pos[0].y == pos[1].y) {
                pos[0].x += 1;
                pos[0].y -= 1;
                pos[2].x += 1;
                pos[2].y += 1;
                pos[3].y += 2;
            }
            break;
        // 反闪电型
        case 6:
            if (pos[0].x == pos[1].x && pos[0].y < pos[1].y) {
                pos[0].x -= 2;
                pos[1].x -= 1;
                pos[1].y -= 1;
                pos[3].x += 1;
                pos[3].y -= 1;
            } else if (pos[0].x < pos[1].x && pos[0].y == pos[1].y) {
                pos[0].x += 2;
                pos[1].x += 1;
                pos[1].y += 1;
                pos[3].x -= 1;
                pos[3].y += 1;
            }
            break;
        default:
            break;
    }

    detectOutOrCrack();

    clearLastPos(true);
    drawItem();
    addToLastPos();

    beforeChanged = [];
}
// 出界或覆盖物体就还原形状
function detectOutOrCrack(){
    if (beforeChanged.length==0){
        return;
    }
    let pos = item.arrPosition;
    for (let i=0; i<pos.length; i++){
        let x = pos[i].x;
        let y = pos[i].y;
        if (x<0 || x>24 || itemsArr[x][y]==1){
            item.arrPosition = [];
            for (let j=0; j<beforeChanged.length; j++){
                item.arrPosition.push({x: beforeChanged[j].x, y: beforeChanged[j].y});
            }
            return;
        }
    }
    
}

// 底部碰撞检测
function reachBottom() {
    let pos = item.arrPosition;
    let posX = 0, posY = 0;
    // 存放可能碰撞的点
    let crackPos = [];
    for (let i = 0; i < pos.length; i++) {
        posX = pos[i].x;
        posY = pos[i].y;
        // 检测是否到底部
        if (posY >= 29) {
            return true;
        }
        if (itemsArr[posX][posY + 1] == 1) {
            crackPos.push({ x: posX, y: posY + 1 });
        }
    }
    // 扫描底部可能的物体碰撞
    for (let j = 0; j < crackPos.length; j++) {
        for (let k = 0; k < pos.length; k++) {
            if (pos[k].x == crackPos[j].x && pos[k].y == crackPos[j].y) {
                continue;
            }
        }
        return true;
    }
    return false;
}
// 左边碰撞检测
function reachLeft() {
    let pos = item.arrPosition;
    let posX = 0, posY = 0;

    // 存放可能碰撞的点
    let crackPos = [];
    for (let i = 0; i < pos.length; i++) {
        posX = pos[i].x;
        posY = pos[i].y;
        if (pos[i].x <= 0) {
            return true;
        }
        if (itemsArr[posX - 1][posY] == 1) {
            crackPos.push({ x: posX - 1, y: posY });
        }
    }
    // 扫描左边可能的物体碰撞
    for (let j = 0; j < crackPos.length; j++) {
        for (let k = 0; k < pos.length; k++) {
            if (pos[k].x <= 0){
                return true;
            }
            if (pos[k].x == crackPos[j].x && pos[k].y == crackPos[j].y) {
                continue;
            }
        }
        return true;
    }
    return false;
}

// 右边碰撞检测
function reachRight() {
    let pos = item.arrPosition;
    let posX = 0, posY = 0;
    // 存放可能碰撞的点
    let crackPos = [];
    for (let i = 0; i < pos.length; i++) {
        posX = pos[i].x;
        posY = pos[i].y;
        if (pos[i].x >= 24) {
            return true;
        }
        if (itemsArr[posX + 1][posY] == 1) {
            crackPos.push({ x: posX + 1, y: posY });
        }
    }
    // 扫描右边可能的物体碰撞
    for (let j = 0; j < crackPos.length; j++) {
        for (let k = 0; k < pos.length; k++) {
            if(pos[k].x >= 29){
                return true;
            }
            if (pos[k].x == crackPos[j].x && pos[k].y == crackPos[j].y) {
                continue;
            }
        }
        return true;
    }
    return false;
}

// 按键监听
window.onkeydown = function (event) {
    keyCode = event.keyCode;
    if ("32" == keyCode) {
        
    }
    if (reachBottom()){
        return;
    }
    if ("39" == keyCode) {
        if (!reachRight()) {
            clearLastPos(true);
            item.moveX(1);
            drawItem(item);
            addToLastPos();
        }
    }
    if ("37" == keyCode) {
        if (!reachLeft()) {
            clearLastPos(true);
            item.moveX(-1);
            drawItem(item);
            addToLastPos();
        }
    }
    if ("38" == keyCode) {
        try{
            change();
        }catch(e){
            console.log(e);
        }
    }
    if ("40" == keyCode) {
        if (!reachBottom()) {
            clearLastPos(true);
            item.moveY(1);
            drawItem(item);
            addToLastPos();
        }
    }
}

function start() {
    interval = window.setInterval(() => {
        window.requestAnimationFrame(drop);
        //drop();
    }, 400);
}

// ok, baby, let's go!
window.onload = () => {
    init();
    item = new Item(SIZE);
    //drawItem(item);
    start();
}


