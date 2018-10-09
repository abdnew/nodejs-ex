var cheer_emotes =[
  {
    img_src:'images/cheer 1.png',
    totla_frame:76
  },{
    img_src:'images/cheer 100.png',
    totla_frame:76
  },{
    img_src:'images/cheer 1000.png',
    totla_frame:76
  },{
    img_src:'images/cheer 5000.png',
    totla_frame:90
  },{
    img_src:'images/cheer 10000.png',
    totla_frame:90
  },{
    img_src:'images/cheer 100000.png',
    totla_frame:90
  }
]
function get_animation(emote_index){
  var data={
          animations: {
              play: [0, cheer_emotes[emote_index].totla_frame]
          },
              images: [cheer_emotes[emote_index].img_src],
              frames: {
              height: 112,
              width: 112,
              regX: 0,
              regY: 0
          },
          framerate : 30
      }

  var spriteSheet = new createjs.SpriteSheet(data);
  var animation = new createjs.Sprite(spriteSheet, "play");
  return animation;
}
