class Bullet{
    static speed = 20
    static length = 20
    static width = 3
    constructor(x,y,damage,angle,radius , socketid){
        this.x = x
        this.y = y
        this.damage = damage
        this.angle = angle
        this.radius=radius
        this.centerx = x
        this.centery = y
        this.socketid = socketid
    }
    draw(){
        context.save()
        context.beginPath()
        context.translate(this.x + Math.cos(-this.angle)*Bullet.length / 2 , this.y + Math.sin(-this.angle)*Bullet.length / 2)
        context.rotate(-this.angle)
        context.translate(-(this.x + Math.cos(-this.angle)*Bullet.length / 2) , -( this.y + Math.sin(-this.angle)*Bullet.length / 2))
        context.fillStyle = 'gray'
        context.rect(this.x + Math.cos(-this.angle)*Bullet.length / 2, this.y + Math.sin(-this.angle)*Bullet.length / 2 ,  Bullet.length , Bullet.width)
        context.fill()
        context.closePath()
        context.restore()
    }
    move(){
        this.x += Math.cos(-this.angle) * Bullet.speed
        this.y += Math.sin(-this.angle) * Bullet.speed
        const hypot = Math.hypot(this.x - this.centerx , this.y - this.centery)
        if(hypot >= this.radius - Bullet.length){
            return true
        }
        return false
    }
}