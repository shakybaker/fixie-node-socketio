    function displayMessage (msg) {
        var li = '<li>' + msg + '</li>'
        $('#messages').append(li);
    }

var socket = io.connect();

socket.on('connect', function(){
  console.log('Connected');
});

socket.on('error', function (e) {
  console.log('System', e ? e : 'A unknown error occurred');
});

socket.on('message', function(msg){
  console.log("Received Msg : "+msg);
});

socket.on("movingCardBroadcast", function(data){
  var card = $('#' + data.cardId);
//  card.animate({borderColor: '#FF6A00', backgroundColor: '#FFC09E'})
  card.animate({borderColor: '#ff0000'})
});

socket.on("messageBroadcast", function(msg){
  displayMessage(msg);
});

socket.on("movedCardBroadcast", function(data){
  var len = $('#' + data.laneId).children('li.card').length;
  var card = $('#' + data.cardId);
  card.animate({borderColor: '#c2e0e3'}, 1000)
  card.appendTo('#' + data.laneId);
  if (len>1) {
    for (var i=len;i>data.position;i--) {
      card.prev().before(card);
    }
  }
  fixie.countCards();
});

socket.on("broadcast", function(msg){
  console.log("Broadcast Msg : "+msg);
});

socket.emit("setId","ABC");

socket.on('disconnect', function(){
  console.log('Disconnected');
});

var fixie = {
    
    jQuery : $,
    
    settings : {
        lanes : '.lane-cards',
        cardSelector: '.card',
        handleSelector: '.card-head',
        contentSelector: '.card-content',
        cardDefault : {
            movable: true,
            removable: false,
            collapsible: false,
            editable: false,
            colorClasses : ['color-yellow', 'color-red', 'color-blue', 'color-white', 'color-orange', 'color-green']
        },
        cardIndividual : {
            intro : {
                movable: false,
                removable: false,
                collapsible: false,
                editable: false
            }
        }
    },

    init : function () {
        this.attachStylesheet('fixie.js.css');
        this.addcardControls();
        this.makeSortable();
        this.countCards();
    },
    
    countCards : function () {
        $('.lane-cards').each(function () {
            var cnt = $(this).find('li.card').length;
            var counter = $(this).find('li.card-counter span.count');
            counter.removeClass('warn');
            counter.removeClass('none');
            if (cnt > 3) {
                counter.addClass('warn');
            }
            if (cnt < 1) {
                counter.addClass('none');
            }
            counter.html(cnt + ' CARDS');
        });
    },

    getcardSettings : function (id) {
        var $ = this.jQuery,
            settings = this.settings;
        return (id&&settings.cardIndividual[id]) ? $.extend({},settings.cardDefault,settings.cardIndividual[id]) : settings.cardDefault;
    },
    
    addcardControls : function () {
        var fixie = this,
            $ = this.jQuery,
            settings = this.settings;
            
        $(settings.cardSelector, $(settings.lanes)).each(function () {
            var thiscardSettings = fixie.getcardSettings(this.id);
            if (thiscardSettings.removable) {
                $('<a href="#" class="remove">CLOSE</a>').mousedown(function (e) {
                    e.stopPropagation();    
                }).click(function () {
                    if(confirm('This card will be removed, ok?')) {
                        $(this).parents(settings.cardSelector).animate({
                            opacity: 0    
                        },function () {
                            $(this).wrap('<div/>').parent().slideUp(function () {
                                $(this).remove();
                                fixie.countCards();
                            });
                        });
                    }
                    return false;
                }).appendTo($(settings.handleSelector, this));
            }
            
            if (thiscardSettings.editable) {
                $('<a href="#" class="edit">EDIT</a>').mousedown(function (e) {
                    e.stopPropagation();    
                }).toggle(function () {
                    $(this).css({backgroundPosition: '-66px 0', width: '55px'})
                        .parents(settings.cardSelector)
                            .find('.edit-box').show().find('input').focus();
                    return false;
                },function () {
                    $(this).css({backgroundPosition: '', width: ''})
                        .parents(settings.cardSelector)
                            .find('.edit-box').hide();
                    return false;
                }).appendTo($(settings.handleSelector,this));
                $('<div class="edit-box" style="display:none;"/>')
                    .append('<ul><li class="item"><label>Change the title?</label><input value="' + $('h3',this).text() + '"/></li>')
                    .append((function(){
                        var colorList = '<li class="item"><label>Available colors:</label><ul class="colors">';
                        $(thiscardSettings.colorClasses).each(function () {
                            colorList += '<li class="' + this + '"/>';
                        });
                        return colorList + '</ul>';
                    })())
                    .append('</ul>')
                    .insertAfter($(settings.handleSelector,this));
            }
            
            if (thiscardSettings.collapsible) {
                $('<a href="#" class="collapse">COLLAPSE</a>').mousedown(function (e) {
                    e.stopPropagation();    
                }).toggle(function () {
                    $(this).css({backgroundPosition: '-38px 0'})
                        .parents(settings.cardSelector)
                            .find(settings.contentSelector).hide();
                    return false;
                },function () {
                    $(this).css({backgroundPosition: ''})
                        .parents(settings.cardSelector)
                            .find(settings.contentSelector).show();
                    return false;
                }).prependTo($(settings.handleSelector,this));
            }
        });
        
        $('.edit-box').each(function () {
            $('input',this).keyup(function () {
                $(this).parents(settings.cardSelector).find('h3').text( $(this).val().length>20 ? $(this).val().substr(0,20)+'...' : $(this).val() );
            });
            $('ul.colors li',this).click(function () {
                
                var colorStylePattern = /\bcolor-[\w]{1,}\b/,
                    thiscardColorClass = $(this).parents(settings.cardSelector).attr('class').match(colorStylePattern)
                if (thiscardColorClass) {
                    $(this).parents(settings.cardSelector)
                        .removeClass(thiscardColorClass[0])
                        .addClass($(this).attr('class').match(colorStylePattern)[0]);
                }
                return false;
                
            });
        });
        
    },
    
    attachStylesheet : function (href) {
        var $ = this.jQuery;
        return $('<link href="/public/stylesheets/' + href + '" rel="stylesheet" type="text/css" />').appendTo('head');
    },
    
    makeSortable : function () {
        var fixie = this,
            $ = this.jQuery,
            settings = this.settings,
            $sortableItems = (function () {
                var notSortable = '';
                $(settings.cardSelector,$(settings.lanes)).each(function (i) {
                    if (!fixie.getcardSettings(this.id).movable) {
                        if(!this.id) {
                            this.id = 'card-no-id-' + i;
                        }
                        notSortable += '#' + this.id + ',';
                    }
                });
                return $('> li:not(' + notSortable + ')', settings.lanes);
            })();
        
        $sortableItems.find(settings.handleSelector).css({
            cursor: 'move'
        }).mousedown(function (e) {
            $sortableItems.css({width:''});
            $(this).parent().css({
                width: $(this).parent().width() + 'px'
            });
        }).mouseup(function () {
            if(!$(this).parent().hasClass('dragging')) {
                $(this).parent().css({width:''});
            } else {
                $(settings.lanes).sortable('disable');
            }
        });

        $(settings.lanes).sortable({
            items: $sortableItems,
            connectWith: $(settings.lanes),
            handle: settings.handleSelector,
            placeholder: 'card-placeholder',
            forcePlaceholderSize: true,
            revert: 300,
            delay: 100,
            opacity: 0.8,
            containment: 'document',
            start: function (e,ui) {
                $(ui.helper).addClass('dragging');
                var card = $(ui.item).attr('id');
	        socket.emit('movingCard',{ cardId: card });
            },
            stop: function (e,ui) {
                $(ui.item).css({width:''}).removeClass('dragging');
                $(settings.lanes).sortable('enable');
                fixie.countCards();
                var card = $(ui.item).attr('id');
                var cardNum = $(ui.item).find('span.card-id').html();
                var lane = $(ui.item).parent().attr('id');
                var laneName = $(ui.item).parent().find('li.lane-title h2').html();
                var index = $(ui.item).parent().children('li.card').index(ui.item);
                var msg = ' moved card ' + cardNum + ' to <strong>' + laneName + '</strong>'			;
	        socket.emit('movedCard',{ cardId: card, laneId: lane, position: index });
                socket.send('<strong>' + $('span.user-id').html() + '</strong>' + msg);
                displayMessage('<strong>You</strong>'+ msg);
            }
        });
    }
  
};

fixie.init();
