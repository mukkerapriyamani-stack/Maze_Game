let n=15;
let maze=[];
let player={r:0,c:0};
let goal={r:14,c:14};
let moving=false;
let moves=0;


/* NEW MAZE */

function newMaze(){

  n=Number(document.getElementById("level").value);

  goal={r:n-1,c:n-1};
  player={r:0,c:0};
  moves=0;
  moving=false;

  let chance =
    n==11 ? 0.15 :
    n==15 ? 0.25 : 0.30;

  maze=Array.from({length:n},()=> 
    Array.from({length:n},()=>
      Math.random()<chance?1:0
    )
  );

  maze[0][0]=0;
  maze[n-1][n-1]=0;

  /* GUARANTEE PATH */

  let r=0,c=0;

  while(r<n-1 || c<n-1){

    if(c<n-1 && (r==n-1 || Math.random()<.5))
      c++;
    else
      r++;

    maze[r][c]=0;
  }

  let level=
    n==11?"Easy":
    n==15?"Medium":"Hard";

  document.getElementById("levelName").innerText=level;

  draw();
  update(0,"Player","-");
}


/* DRAW */

function draw(path=[]){

  let box=document.getElementById("maze");

  box.innerHTML="";
  box.style.gridTemplateColumns=
    `repeat(${n},25px)`;

  for(let r=0;r<n;r++){

    for(let c=0;c<n;c++){

      let cell=document.createElement("div");

      cell.className="cell";

      if(maze[r][c])
        cell.classList.add("wall");

      if(path.some(x=>x.r==r&&x.c==c))
        cell.classList.add("path");

      if(r==goal.r&&c==goal.c)
        cell.className="cell goal";

      if(r==player.r&&c==player.c)
        cell.className="cell player";

      box.appendChild(cell);
    }
  }
}


/* VALID */

function valid(r,c){

  return r>=0&&c>=0&&
         r<n&&c<n&&
         maze[r][c]==0;
}


/* NEIGHBOURS */

function neighbors(x){

  return [
    {r:x.r+1,c:x.c},
    {r:x.r-1,c:x.c},
    {r:x.r,c:x.c+1},
    {r:x.r,c:x.c-1}
  ].filter(x=>valid(x.r,x.c));
}


/* KEY */

function key(x){
  return x.r+","+x.c;
}


/* HEURISTIC */

function distance(a,b){

  return Math.abs(a.r-b.r)+
         Math.abs(a.c-b.c);
}


/* PATH SEARCH */

function findPath(){

  let type=document.getElementById("algorithm").value;

  let q=[player];
  let parent={};
  let cost={[key(player)]:0};
  let visited=new Set();

  while(q.length){

    if(type=="A*")
      q.sort((a,b)=>
        cost[key(a)]+distance(a,goal)-
        (cost[key(b)]+distance(b,goal))
      );

    else if(type=="Dijkstra")
      q.sort((a,b)=>
        cost[key(a)]-cost[key(b)]
      );

    let cur=
      type=="DFS"?
      q.pop():
      q.shift();

    if(visited.has(key(cur)))continue;

    visited.add(key(cur));

    if(key(cur)==key(goal))
      return buildPath(parent);

    for(let next of neighbors(cur)){

      let k=key(next);

      if(!visited.has(k)){

        parent[k]=key(cur);

        cost[k]=cost[key(cur)]+1;

        q.push(next);
      }
    }
  }

  return [];
}


/* BUILD PATH */

function buildPath(parent){

  let path=[];
  let k=key(goal);

  while(k){

    let [r,c]=k.split(",").map(Number);

    path.unshift({r,c});

    k=parent[k];
  }

  return path;
}


/* AI MOVEMENT */

async function solveAI(){

  if(moving)return;

  moving=true;

  let path=findPath();

  if(!path.length){

    alert("No path found!");
    moving=false;
    return;
  }

  let algorithm=
    document.getElementById("algorithm").value;

  update(0,algorithm,path.length-1);

  for(let i=1;i<path.length;i++){

    await wait(150);

    player=path[i];
    moves=i;

    draw(path.slice(i));

    update(
      i,
      algorithm,
      path.length-1
    );
  }

  moving=false;

  alert("🎯 AI reached the goal!");
}


/* DELAY */

function wait(ms){

  return new Promise(resolve=>
    setTimeout(resolve,ms)
  );
}


/* KEYBOARD PLAY */

document.addEventListener("keydown",e=>{

  if(moving)return;

  let d={
    ArrowUp:[-1,0],
    ArrowDown:[1,0],
    ArrowLeft:[0,-1],
    ArrowRight:[0,1]
  }[e.key];

  if(!d)return;

  let r=player.r+d[0];
  let c=player.c+d[1];

  if(!valid(r,c))return;

  player={r,c};
  moves++;

  draw();

  update(
    moves,
    "Player",
    moves
  );

  if(player.r==goal.r &&
     player.c==goal.c){

    alert("🎉 You reached the goal!");
  }
});


/* RESET */

function resetPlayer(){

  if(moving)return;

  player={r:0,c:0};
  moves=0;

  draw();

  update(0,"Player","-");
}


/* UPDATE STATS */

function update(m,mode,path){

  document.getElementById("moves").innerText=m;

  document.getElementById("mode").innerText=mode;

  document.getElementById("path").innerText=path;

  document.getElementById("time").innerText=
    (m*0.15).toFixed(1);
}


newMaze();