const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const rooms = new Map();

const server = http.createServer((req,res)=>{
  let file = req.url === "/" ? "/index.html" : req.url;
  const safe = path.normalize(file).replace(/^(\.\.[\/\\])+/, "");
  const full = path.join(__dirname, safe);
  fs.readFile(full,(err,data)=>{
    if(err){res.writeHead(404);return res.end("Not found");}
    const type=full.endsWith(".html")?"text/html; charset=utf-8":"text/plain";
    res.writeHead(200,{"Content-Type":type,"Cache-Control":"no-store"});
    res.end(data);
  });
});

const wss = new WebSocket.Server({server});

function code(){return Math.random().toString(36).slice(2,8).toUpperCase();}
function send(ws,msg){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(msg));}
function broadcast(room,msg,except=null){
  for(const p of room.players.values()) if(p.ws!==except) send(p.ws,msg);
}

wss.on("connection",ws=>{
  ws.on("message",raw=>{
    let m; try{m=JSON.parse(raw)}catch{return}
    if(m.type==="create"){
      let c=code(); while(rooms.has(c))c=code();
      const room={host:m.clientId,players:new Map()};
      room.players.set(m.clientId,{id:m.clientId,name:"Host",score:0,ws});
      rooms.set(c,room); ws.room=c; ws.id=m.clientId;
      send(ws,{type:"roomCreated",room:c});
      sendPlayerList(room);
    }
    else if(m.type==="join"){
      const room=rooms.get(m.room);
      if(!room)return send(ws,{type:"error",message:"Salle introuvable"});
      room.players.set(m.clientId,{id:m.clientId,name:m.name||"Joueur",score:0,ws});
      ws.room=m.room;ws.id=m.clientId;
      send(ws,{type:"roomJoined",room:m.room,host:room.host});
      send(room.players.get(room.host).ws,{type:"peerJoined",id:m.clientId});
      send(ws,{type:"peerList",peers:[room.host]});
      sendPlayerList(room);
    }
    else if(m.type==="signal"){
      const room=rooms.get(ws.room); if(!room)return;
      const target=room.players.get(m.to); if(target)send(target.ws,{type:"signal",from:ws.id,data:m.data});
    }
    else if(m.type==="gameStart"){
      const room=rooms.get(ws.room); if(!room||room.host!==ws.id)return;
      broadcast(room,{type:"gameStart",questions:m.questions,question:m.question});
    }
    else if(m.type==="nextQuestion"){
      const room=rooms.get(ws.room); if(!room||room.host!==ws.id)return;
      broadcast(room,m);
    }
    else if(m.type==="gameEnd"){
      const room=rooms.get(ws.room); if(!room||room.host!==ws.id)return;
      broadcast(room,m);
    }
  });
  ws.on("close",()=>{
    const room=rooms.get(ws.room);if(!room)return;
    room.players.delete(ws.id);
    broadcast(room,{type:"playerLeft",id:ws.id});
    sendPlayerList(room);
    if(ws.id===room.host)rooms.delete(ws.room);
  });
});
function sendPlayerList(room){
  const players={};for(const p of room.players.values())players[p.id]={id:p.id,name:p.name,score:p.score};
  broadcast(room,{type:"playerList",players});
}
server.listen(PORT,()=>console.log(`Biophysique Quiz: http://localhost:${PORT}`));
