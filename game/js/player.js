var player =
{
    imgplayer: new Image,
    X:0,
    i:0,
    speed:0,
    timeanim:0,
    posxanim: 0,
    posyanim: 0,
    horizontalDir: 0,
    verticalDir: 0,
    width : 45,
    height: 64,
    triggers : [],

    //---------------Inicializamos al personaje, su velocidad, su posición
    Start: function(triggers) 
    {
        this.x = 550;
        this.y = 300;
        this.speed = 2;
        this.imgplayer = new Image(this.width, this.height);
        this.imgplayer.src = "img/spritesheet.png";
        this.HasTriggers(triggers);
    },

    Update: function(deltaTime, others)
    {
        this.Action();
        this.AnimationDir(deltaTime);
        this.Collision(others);
    },
    //-----------Gestiona el movimiento por teclas-----------
    Action: function()
    {
        this.posyanim = 0;

        if(Input.IsKeyPressed(KEY_W) || Input.IsKeyPressed(KEY_UP))
        {
            this.posyanim = 2;
            this.verticalDir = -1;
        }
        else if(Input.IsKeyPressed(KEY_S) || Input.IsKeyPressed(KEY_DOWN))
        {
            this.posyanim = 1;
            this.verticalDir = 1;
        }
        else
            this.verticalDir = 0;
        if(Input.IsKeyPressed(KEY_A) || Input.IsKeyPressed(KEY_LEFT))
        {
            this.posyanim = 4;
            this.horizontalDir = -1;
        }
        else if(Input.IsKeyPressed(KEY_D) || Input.IsKeyPressed(KEY_RIGHT))
        {
            this.posyanim = 3;
            this.horizontalDir = 1;
        }
        else
            this.horizontalDir = 0;

        this.x = this.x + this.speed * this.horizontalDir;
        this.y = this.y + this.speed * this.verticalDir;
    },
    //-----------Gestionamos la velocidad y posicion del spritesheet del personaje----------
    AnimationDir: function(deltaTime)
    {
        if(this.timeanim > 0.2)
        {
            this.timeanim = 0;
            this.posxanim += 1;
            if(this.posxanim > 3)
                this.posxanim = 0;
        }
        this.timeanim += deltaTime;
    },

    //-----------Chequea las colisiones de scene y guarda las que sean un trigger------------
    HasTriggers: function(triggers)
    {
        for(i= 0; i < triggers.length; i++)
        {
            if(triggers[i].tag != null)
                this.triggers.push(triggers[i]);
        }
    },
    //-----------Gestiona las colisiones y triggers------------
    Collision: function(others)
    {
        //Collision based on the speed (collider 'speed' times mas delante)
        let directionCol=
        {
            x: this.x + this.speed * this.horizontalDir,
            y: (this.y + this.height / 2) + (this.speed * this.verticalDir),
            height: this.height / 2,
            width: this.width
        }
        //Detecta collision
        for(let i = 0; i < others.length; i++)
        {
            if(IsColliding(directionCol, others[i]))
            {
                while(IsColliding(directionCol, others[i]))
                {
                    directionCol.x -= this.speed * this.horizontalDir;
                    directionCol.y -= this.speed * this.verticalDir;
                }
                this.x = directionCol.x;
                this.y = directionCol.y - this.height / 2;
            }
        }
        //Detecta trigger
        for(let i = 0; i < this.triggers.length; i++)
        {
            //Detecta si esta o no dentro del trigger
            if(IsInTrigger(directionCol, this.triggers[i]))
            {
                //Utilizamos los tags para ver la funcion del elemento y la actuación de PLAYER en consecuencia
                switch(this.triggers[i].tag)
                {
                case 'cofre':
                    this.posyanim = 6;
                    this.horizontalDir = 1;
                    break;
                case 'link':
                    break;
                default:
                    break;
                }
                this.triggers[i].InTrigger();
            }
            //Si no está dentro del trigger...
            else
            {
                //De nuevo, utilizamos los tags para ver la funcion del elemento y la actuación de PLAYER en consecuencia
                switch(this.triggers[i].tag)
                {
                case 'cofre':
                    break;
                case 'link':
                    break;
                default:
                    break;
                }
                this.triggers[i].OutTrigger();
            }
        }
    },

    Draw: function(ctx)
    {
        ctx.drawImage(this.imgplayer, this.posxanim * this.width, this.posyanim * this.height, this.width, this.height, 
            this.x, this.y, this.width, this.height);
    },
}
