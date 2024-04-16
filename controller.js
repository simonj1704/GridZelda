"use strict";

window.addEventListener("load", start);

function start(){
    console.log("Js is running")
    
    document.addEventListener("keydown", keyPress);
    document.addEventListener("keyup", keyUp);

    createTiles();
    createItems();
    displayTiles();
    requestAnimationFrame(tick);
}


//#region CONTROLLER 

let lastTimestamp = 0;
function tick(timestamp){
  requestAnimationFrame(tick);

  const deltatime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  movePlayer(deltatime);

  checkForItems();

  displayPlayerposition();
  displayPlayerAnimation();  
  showDebugging();
}

function keyPress(event) {
  if(event.key === "ArrowLeft") {
    controls.left = true;
  } else if(event.key === "ArrowRight") {
    controls.right = true;
  } else if(event.key === "ArrowUp") {
    controls.up = true;
  } else if(event.key === "ArrowDown") {
    controls.down = true;
  }
}

function keyUp(event) {
  if(event.key === "ArrowLeft") {
    controls.left = false;
  } else if(event.key === "ArrowRight") {
    controls.right = false;
  } else if(event.key === "ArrowUp") {
    controls.up = false;
  } else if(event.key === "ArrowDown") {
    controls.down = false;
  }
}
//#endregion CONTROLLER

//#region MODEL */

function movePlayer(deltatime){
    player.moving = false;
    const newPos = {
        x: player.x,
        y: player.y
    }

    if(controls.up){
        player.moving = true;
        player.direction = "up";
        player.speed += player.acceleration * deltatime;
    }
    if(controls.down){
        player.moving = true;
        player.direction = "down";
        player.speed += player.acceleration * deltatime;
    }
    if(controls.left){
        player.moving = true;
        player.direction = "left";
        player.speed += player.acceleration * deltatime;
    }
    if(controls.right){
        player.moving = true;
        player.direction = "right";
        player.speed += player.acceleration * deltatime;
    }

    if(player.speed > 0){
      if(controls.up){
        newPos.y -= player.speed * deltatime;
      }
      if(controls.down){
        newPos.y += player.speed * deltatime;
      }
      if(controls.left){
        newPos.x -= player.speed * deltatime;
      }
      if(controls.right){
        newPos.x += player.speed * deltatime;
      }
    }

    player.speed = Math.min(player.speed, player.topspeed);

    if(canMoveToMore(newPos)){
        player.x = newPos.x;
        player.y = newPos.y;
    } else {
        player.moving = false;
        if(newPos.x !== player.x && newPos.y !== player.y){
            const newXpos = {
                x: newPos.x,
                y: player.y
            }
            const newYpos = {
                x: player.x,
                y: newPos.y
            
            }

            if(canMoveToMore(newXpos)){
                player.moving = true;
                player.x = newXpos.x;
            } else if(canMoveToMore(newYpos)){
                player.moving = true;
                if(player.y < newPos.y){
                  player.direction = "down";
                } else {
                  player.direction = "up";
                }
                player.y = newYpos.y;

            }
        }
    }

    if(!player.moving){
      player.speed -= player.acceleration * deltatime + 5;
    }
    player.speed = Math.max(player.speed, 0);
}

function canMoveTo(pos){
  const {row, col} = coordFromPos(pos);

  if(row < 0 || row >= GRID_height||
     col < 0 || col >= GRID_width){
    return false;
  }
  
  const tileType = getTileAtCoord({row, col});
  switch(tileType){
    case 0:
    case 1:
      return true;
    case 2:
    case 3:
    case 4:
    case 5:
      return false;
  }
  return true;
}

function canMoveToMore(pos){
  let canMove = true;

  const positions = getPosForPlayer(pos);

  positions.forEach(position => {
    const {row, col} = coordFromPos(position);

    if(row < 0 || row >= GRID_height||
      col < 0 || col >= GRID_width){
     canMove = false;
   } else {
    const tileType = getTileAtCoord({row, col});
    switch(tileType){
      case 0:
      case 1:
      case 3:
        break;
      case 2:
      case 3:
      case 4:
      case 5:
      case 10:
      case 11:
      case 14:
        canMove = false;
        break;
    }
  }
  });

  return canMove;
}


const player = {
    x: 10,
    y: 550,
    regX: 10,
    regY: 15,
    hitbox: {
      x: 4,
      y: 14,
      w: 16,
      h: 15
    },
    speed: 0,
    topspeed: 120,
    acceleration: 120,
    moving: false,
    direction: undefined
}

const controls = {
    up: false,
    down: false,
    left: false,
    right: false
}

const itemsGrid = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

function checkForItems(){
  const items = getItemsUnderPlayer();

  if(items.length > 0){
    console.log(items)
    console.log(`There are ${items.length} items under the player`)
  }
}

function getItemsUnderPlayer(){
  const coords = getTilesUnderPLayer(player);
  const items = [];

  coords.forEach(coord => {
    const item = itemsGrid[coord.row][coord.col];
    if(item !== 0){
      items.push(item);
    }
  });

  return items;
}

const tiles = [
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [0,0,0,0,7,0,4,4,0,0,0,0,0,0,0,0,5,0,0,0],
  [2,2,2,2,2,0,4,4,0,5,1,1,1,1,1,1,1,1,1,1],
  [2,6,13,6,2,0,4,4,7,0,1,1,1,1,1,1,1,1,1,1],
  [2,13,13,13,2,0,4,4,0,0,1,1,10,10,10,10,10,10,10,10],
  [2,13,13,13,2,0,4,4,0,0,1,1,11,7,2,2,2,2,2,0],
  [2,13,13,13,2,0,4,4,0,0,1,1,11,7,2,13,13,13,2,0],
  [2,13,13,13,2,0,4,4,0,0,1,1,11,7,2,13,6,13,2,7],
  [2,13,13,13,2,0,4,4,0,0,1,1,11,7,2,13,13,13,2,0],
  [2,2,3,2,2,0,4,4,7,0,1,1,11,0,2,13,13,13,2,0],
  [5,7,1,7,5,0,4,4,0,0,1,1,11,5,2,2,3,2,2,5],
  [0,7,1,7,0,0,4,4,0,0,1,1,10,10,10,10,1,10,10,10],
  [0,7,1,7,0,0,4,4,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,11,1,11,0,0,4,4,0,0,1,1,10,10,10,10,10,10,10,10],
  [0,11,1,11,0,0,4,4,0,0,1,1,11,14,14,14,14,14,14,0],
  [0,5,1,5,0,0,4,4,0,0,1,1,11,14,0,0,0,0,14,0],
  [1,1,1,1,1,1,8,8,1,1,1,1,1,8,0,5,6,0,14,5],
  [1,1,1,1,1,1,8,8,1,1,1,1,11,14,0,0,0,0,14,0],
  [0,0,0,0,0,0,4,4,0,0,1,1,11,14,14,14,14,14,14,0],
  [5,7,7,7,7,0,4,4,0,0,1,1,11,0,0,0,0,0,5,0], 
]

const GRID_width = tiles[0].length;
const GRID_height = tiles.length;
const tile_size = 32;

function getTileAtCoord({row, col}){
  /* const row = coord.row;
  const col = coord.col; */

  //const {row, col} = coord; // destructuring
  
  return tiles[row][col];
}

function getTilesUnderPLayer(player){
  const tiles = [];
  const coords = [];

  const topLeft = {x: player.x - player.regX + player.hitbox.x, y: player.y};
  const topRight = {x: player.x - player.regX + player.hitbox.x + player.hitbox.w, y: player.y};
  const bottomLeft = {x: player.x - player.regX + player.hitbox.x, y: player.y + player.hitbox.h};
  const bottomRight = {x: player.x - player.regX + player.hitbox.x + player.hitbox.w, y: player.y + player.hitbox.h};
  
  coords.push(coordFromPos(topLeft));
  coords.push(coordFromPos(topRight));
  coords.push(coordFromPos(bottomLeft));
  coords.push(coordFromPos(bottomRight));
  tiles.push(getTileAtCoord(coordFromPos(topLeft)));
  tiles.push(getTileAtCoord(coordFromPos(topRight)));
  tiles.push(getTileAtCoord(coordFromPos(bottomLeft)));
  tiles.push(getTileAtCoord(coordFromPos(bottomRight)));
  return coords;
}

function getPosForPlayer(pos){
  const positions = [];

  const topLeft = {x: pos.x - player.regX + player.hitbox.x, y: pos.y};
  const topRight = {x: pos.x - player.regX + player.hitbox.x + player.hitbox.w, y: pos.y};
  const bottomLeft = {x: pos.x - player.regX + player.hitbox.x, y: pos.y + player.hitbox.h};
  const bottomRight = {x: pos.x - player.regX + player.hitbox.x + player.hitbox.w, y: pos.y + player.hitbox.h};

  positions.push(topLeft);
  positions.push(topRight);
  positions.push(bottomLeft);
  positions.push(bottomRight);

  return positions;
}


function coordFromPos( {x, y} ){
  const row = Math.floor(y / tile_size);
  const col = Math.floor(x / tile_size);
  return {row, col};
}

function posFromCoord( {row, col} ){
  const x = col * tile_size;
  const y = row * tile_size;
  return {x, y};
}

//#endregion MODEL

//#region VIEW */

function displayPlayerposition(){
    const visualPlayer = document.querySelector("#player");
    visualPlayer.style.translate = `${player.x - player.regX}px ${player.y - player.regY}px`;
}

function displayPlayerAnimation(){
    const visualPlayer = document.querySelector("#player");

    if(player.direction && !visualPlayer.classList.contains(player.direction)){
        visualPlayer.classList.remove("up", "down", "left", "right");
        visualPlayer.classList.add(player.direction);

    }
    
    if (!player.moving){
        visualPlayer.classList.remove("animate");
    } else if (!visualPlayer.classList.contains("animate")){
        visualPlayer.classList.add("animate");
    }

}

function createTiles(){
  const gameField = document.querySelector("#gamefield");

  const background = document.querySelector("#background");

  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
      const tile = document.createElement("div");
      tile.classList.add("tile");
    
      background.append(tile);

      
      }
  }
      background.style.setProperty("--GRID_WIDTH", GRID_width);
      background.style.setProperty("--GRID_HEIGHT", GRID_height);
      background.style.setProperty("--TILE_SIZE", tile_size + "px");

      gameField.style.setProperty("--GRID_WIDTH", GRID_width);
      gameField.style.setProperty("--GRID_HEIGHT", GRID_height);
      gameField.style.setProperty("--TILE_SIZE", tile_size + "px");
    
}

function createItems(){
  const items = document.querySelector("#items");
  

  for(let row = 0; row < itemsGrid.length; row++){
    for(let col = 0; col < itemsGrid[row].length; col++){
      if(itemsGrid[row][col] !== 0){
        const item = document.createElement("div");
      item.classList.add("item");
      item.classList.add("gold");
      item.style.setProperty("--row", row);
      item.style.setProperty("--col", col);
      items.append(item);
      }
      
    }
  }
  
}

function displayTiles(){
  const visualTiles = document.querySelectorAll("#background .tile");

  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
      const tile = getTileAtCoord({row, col});
      const visualTile = visualTiles[row * GRID_width + col];

      visualTile.classList.add(getClassForTileType(tile))
    }
  }
}

function getClassForTileType(tile){
  switch(tile){
    case 0: return "grass";
    case 1: return "path";
    case 2: return "wall";
    case 3: return "door";
    case 4: return "water";
    case 5: return "tree";
    case 6: return "chest";
    case 7: return "flowers";
    case 8: return "bridgeHori";
    case 9: return "bridgeVert";
    case 10: return "fenceHori";
    case 11: return "fenceVert";
    case 12: return "doorOpen";
    case 13: return "floorStone";
    case 14: return "lava";
  }
}

//#endregion VIEW

//#region DEBUGGING

function showDebugging(){
  //showDebugTileUnderPlayer();
  showDebugMoreTiles();
  showPlayerHitbox();
  //showDebugPlayerRegPoint();
  showDebugPlayerHitbox();
}

let lastCoord = {row: 1, col: 1};
function showDebugTileUnderPlayer(){
  const coord = coordFromPos(player);

  if(coord.row !== lastCoord.row || coord.col !== lastCoord.col){
    unhighlightTile(lastCoord);
    highlightTile(coord);
  }

  lastCoord = coord;
}

let lastCoords = [];
function showDebugMoreTiles(){
  const coords = getTilesUnderPLayer(player);

  lastCoords.forEach(coord => {
    unhighlightTile(coord);
  });
  coords.forEach(coord => {
    highlightTile(coord);
    lastCoords.push(coord);
  });
}

function showPlayerHitbox(){
  const player = document.querySelector("#player");
  
  if(!player.classList.contains("show-rect")){
    player.classList.add("show-rect");
  }

}

function showDebugPlayerRegPoint(){
  const visualPlayer = document.querySelector("#player");

  if(!visualPlayer.classList.contains("show-reg-point")){
    visualPlayer.classList.add("show-reg-point");
  }

  visualPlayer.style.setProperty("--regX", player.regX + "px");
  visualPlayer.style.setProperty("--regY", player.regY + "px");
}

function showDebugPlayerHitbox(){
  const visualPlayer = document.querySelector("#player");

  if(!visualPlayer.classList.contains("show-hitbox")){
    visualPlayer.classList.add("show-hitbox");
  }

  visualPlayer.style.setProperty("--hitboxWidth", player.hitbox.w + "px");
  visualPlayer.style.setProperty("--hitboxHeight", player.hitbox.h + "px");
  visualPlayer.style.setProperty("--hitboxX", player.hitbox.x + "px");
  visualPlayer.style.setProperty("--hitboxY", player.hitbox.y + "px");

}

function highlightTile({row, col}){
  const visualTiles = document.querySelectorAll("#background .tile");
  const visualTile = visualTiles[row * GRID_width + col];
  visualTile.classList.add("highlight");
}

function unhighlightTile(coord){
  const visualTiles = document.querySelectorAll("#background .tile");
  const visualTile = visualTiles[coord.row * GRID_width + coord.col];
  visualTile.classList.remove("highlight");
}

//#endregion DEBUGGING