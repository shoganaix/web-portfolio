"use strict";
// Native pixel artwork: fixed pixels, a shared palette, and cached canvases.
// Keep the original factory API so entity logic and authored sprites stay intact.
(() => {
    const cache = new Map();
    const ink = "#272b39", shadow = "#414053", gold = "#e1bc73", light = "#f2dfb0";
    function sprite(key, w, h, paint) {
        if (!cache.has(key)) {
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d");
            paint((x, y, width, height, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, width, height); });
            cache.set(key, canvas);
        }
        return cache.get(key);
    }
    function traveler(kind, coat, trim, skin) {
        return sprite(kind, 24, 34, p => {
            p(5,32,15,2,"#32333b88");
            p(7,27,4,6,ink); p(14,27,4,6,ink); p(6,32,5,1,shadow); p(14,32,6,1,shadow);
            p(7,14,11,15,ink); p(5,17,3,10,ink); p(18,17,3,10,ink);
            p(8,15,9,13,coat); p(6,18,2,7,coat); p(18,18,2,7,coat);
            p(8,24,9,2,trim); p(11,24,3,2,gold); p(8,16,2,7,trim); p(15,16,2,7,trim);
            p(5,25,3,3,skin); p(18,25,3,3,skin);
            p(8,4,9,11,ink); p(9,6,7,7,skin); p(9,6,7,2,"#bc845f");
            p(10,9,1,2,ink); p(14,9,1,2,ink); p(12,12,2,1,"#bc845f");
            if(kind === "sage") {
                p(7,4,12,3,ink); p(8,3,9,3,coat); p(10,1,6,3,coat); p(13,0,2,2,trim);
                p(7,6,12,1,gold); p(10,13,6,3,light); p(11,16,4,2,light);
                p(21,10,2,23,"#866747"); p(20,8,4,4,gold); p(21,7,2,3,"#99e5ce");
            } else if(kind === "prisoner") {
                p(8,3,9,4,shadow); p(7,6,3,5,shadow); p(15,6,3,3,shadow);
                p(8,18,9,2,trim); p(8,22,9,2,trim); p(6,25,2,2,"#a5b7ac");
            } else {
                p(7,3,11,4,"#634b42"); p(6,6,13,2,ink); p(7,5,11,1,gold);
                p(16,1,2,4,"#90b6a0"); p(10,14,5,3,gold); p(13,17,3,6,gold);
                p(17,21,4,7,"#654f40"); p(17,21,4,2,light);
            }
            p(9,18,1,5,"#ffffff25"); p(16,26,1,2,"#ffffff35");
        });
    }
    Placeholders.Guide = () => traveler("guide", "#507e8a", "#35515f", "#ebbc91");
    Placeholders.Sage = () => traveler("sage", "#786080", "#9f8198", "#bd896d");
    Placeholders.Prisoner = () => traveler("prisoner", "#95927c", "#5c655d", "#dbac86");
    Placeholders.Enemy = color => sprite("enemy" + color, 26, 20, p => {
        p(4,18,18,2,"#32333b88"); p(7,3,12,2,ink); p(4,5,18,3,ink);
        p(2,8,22,8,ink); p(4,16,18,3,ink); p(5,7,16,9,color);
        p(8,5,10,3,color); p(3,11,20,4,color); p(6,7,13,2,"#ffffff35");
        p(5,14,16,3,"#272b3944"); p(7,8,4,2,ink); p(15,8,4,2,ink);
        p(8,10,3,3,light); p(15,10,3,3,light); p(10,10,1,2,ink); p(15,10,1,2,ink);
        p(12,14,2,1,ink); p(6,17,4,1,"#a6809d"); p(17,17,3,1,"#a6809d");
        p(3,6,2,4,gold); p(21,5,2,4,gold);
    });
    Placeholders.Gem = color => sprite("gem" + color, 10, 10, p => {
        p(4,0,2,1,ink); p(2,1,6,2,ink); p(1,3,8,4,ink); p(2,7,6,1,ink); p(3,8,4,1,ink); p(4,9,2,1,ink);
        p(3,2,4,2,color); p(2,4,6,2,color); p(3,6,4,1,color); p(4,7,2,1,color);
        p(3,2,2,2,light); p(2,4,2,1,"#ffffff99"); p(6,4,2,2,"#272b3944"); p(5,6,2,1,"#272b3944");
    });
    const bubble = Placeholders.Bubbling.bind(Placeholders);
    let bubbleCanvas;
    Placeholders.Bubbling = () => bubbleCanvas || (bubbleCanvas = bubble());
})();

const WorldArt = {
    create(width, height) {
        // Render once at authored pixel resolution, then scale with nearest-neighbor.
        const c = document.createElement("canvas");
        c.width = width / 3; c.height = height / 3;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#7e8960"; ctx.fillRect(0, 0, c.width, c.height);
        let seed = 1937;
        const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
        for (let i = 0; i < 19000; i++) {
            const x = Math.floor(random()*c.width), y = Math.floor(random()*c.height);
            ctx.fillStyle = ["#758459", "#8d9667", "#9ba16f", "#667a57"][i%4];
            ctx.fillRect(x,y,2+Math.floor(random()*5),1);
            if(i%5===0) ctx.fillRect(x+2,y-2,1,3);
        }
        // Winding ochre footpath links the sanctuary, guide, chest and sage.
        const points = [[185,540],[440,495],[520,462],[565,330],[570,288],[730,270],[990,235],[1040,200]];
        function path(color, lineWidth) {
            ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.lineJoin="round";ctx.lineCap="round";
            ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
        }
        path("#647454",39);path("#b0a078",30);path("#c0ad81",22);
        for(let i=0;i<350;i++) {
            const t=random()*(points.length-1), index=Math.floor(t), f=t-index;
            const a=points[index],b=points[index+1];
            ctx.fillStyle=i%2?"#9b916f":"#cfbc90";
            ctx.fillRect(Math.round(a[0]+(b[0]-a[0])*f+random()*18-9),Math.round(a[1]+(b[1]-a[1])*f+random()*16-8),2,1);
        }
        // Stone sanctuary apron and steps sit below the existing tower.
        for(let row=0;row<5;row++)for(let col=0;col<7;col++){
            const x=153+col*18+(row%2)*3,y=580+row*9;
            ctx.fillStyle="#535f58";ctx.fillRect(x,y,17,8);
            ctx.fillStyle=(row+col)%2?"#a3a58a":"#90977f";ctx.fillRect(x,y,16,6);
            ctx.fillStyle="#c5bc98";ctx.fillRect(x+1,y,14,1);
        }
        for(let i=0;i<650;i++) {
            const x=Math.floor(random()*c.width),y=Math.floor(random()*c.height);
            ctx.fillStyle="#536e50";ctx.fillRect(x,y,1,4);ctx.fillRect(x+2,y+2,1,2);
            if(i%3===0){ctx.fillStyle=i%2?"#e3c17b":"#c6b3a4";ctx.fillRect(x-1,y,3,2);}
        }
        return c;
    }
};
