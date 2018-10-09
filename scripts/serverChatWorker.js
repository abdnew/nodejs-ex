
exports.parseMessage= function (rawMessage) {
    var parsedMessage = {
        message: null,
        tags: null,
        command: null,
        original: rawMessage,
        channel: null,
        username: null
    };

    if(rawMessage[0] === '@'){
        var tagIndex = rawMessage.indexOf(' '),
        userIndex = rawMessage.indexOf(' ', tagIndex + 1),
        commandIndex = rawMessage.indexOf(' ', userIndex + 1),
        channelIndex = rawMessage.indexOf(' ', commandIndex + 1),
        messageIndex = rawMessage.indexOf(':', channelIndex + 1);

        parsedMessage.tags = rawMessage.slice(0, tagIndex);
        parsedMessage.username = rawMessage.slice(tagIndex + 2, rawMessage.indexOf('!'));
        parsedMessage.command = rawMessage.slice(userIndex + 1, commandIndex);
        parsedMessage.channel = rawMessage.slice(commandIndex + 1, channelIndex);
        parsedMessage.message = rawMessage.slice(messageIndex + 1);
        parsedMessage.message=parsedMessage.message.slice(0,parsedMessage.message.length-2)
    } else if(rawMessage.startsWith("PING")) {
        parsedMessage.command = "PING";
        parsedMessage.message = rawMessage.split(":");
    }

    return parsedMessage;
}
exports.getTags =function (tagsx){
  var parsed_tags={
    broadcaster: false,
    display_name: null,
    mod: false,
    subscriper: false,
    bits:0
  };
  var badges= tagsx.slice(0,tagsx.indexOf(';'));
  if (badges.indexOf('broadcaster/1')!== -1){
    parsed_tags.broadcaster=true;
  }
  if (tagsx.indexOf(';bits=')!==-1){
    tagsx=tagsx.slice(tagsx.indexOf(';bits=')+6);
    parsed_tags.bits=parseInt(tagsx.slice(0,tagsx.indexOf(';')));
  }
  var tags = tagsx.slice(tagsx.indexOf('display-name=')+13);
  parsed_tags.display_name=tags.slice(0,tags.indexOf(';'));
  tags=tags.slice(tags.indexOf(';mod=')+5);
  if (tags.startsWith('1')){
    parsed_tags.mod=true;
  }
  tags=tags.slice(tags.indexOf(';subscriber=')+12);
  if (tags.startsWith('1')){
    parsed_tags.subscriper=true;
  }
  return parsed_tags;
}
exports.getSubInfo = function (tagsx){
  var sub_info={
    time:1,
    plan:'1000',
    msg_id: null,
    gifted:null,
    msg:''
  };
  tagsx=tagsx.slice(tagsx.indexOf('msg-id=')+7);
  sub_info.msg_id=tagsx.slice(0,tagsx.indexOf(';'));
  tagsx=tagsx.slice(tagsx.indexOf(';msg-param-months=')+18);
  sub_info.time=parseInt(tagsx.slice(0,tagsx.indexOf(';')));
  if (sub_info.msg_id=='subgift'){
    tagsx=tagsx.slice(tagsx.indexOf(';msg-param-recipient-display-name=')+34);
    sub_info.gifted=tagsx.slice(0,tagsx.indexOf(';'));
  }
  tagsx=tagsx.slice(tagsx.indexOf(';msg-param-sub-plan=')+20);
  sub_info.plan=tagsx.slice(0,tagsx.indexOf(';'));
  if (sub_info.msg_id=='resub'){
    tagsx=tagsx.slice(tagsx.indexOf(' USERNOTICE #')+13);
    if (tagsx.indexOf(':')!==-1){
      sub_info.msg=tagsx.slice(tagsx.indexOf(':')+1);
    }
  }
  return sub_info;
}
