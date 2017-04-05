var session = JSON.parse(localStorage.getItem('session'));
if(!session || !session.connected) window.location = './login.html'

var mensajeActual;
var mensajeActualRef;
var subActual;
var subsList;
var msgsList;

var subsFilterList = [];

var notmail = new NotmailWeb(session.url);

notmail.session = session;

notmail.on('disconnect', function(){    
    disconnect();
})
$('.exittext').click(function(){
    disconnect();
})
$('.notmailtext').first().text(session.notmail)


notmail.getSubscriptions({}, function(err, subs){
    if(err) console.log(err)
    subsList = subs;
    actualizarListaSuscripciones(subs);

    notmail.getMessages({}, function(err, msgs){
        if(err) console.log(err)
        msgsList = msgs;
        actualizarListaMensajes(msgs);
        nuevoMensajeActual(msgs[0]);
    })
})

/*
    HTML
*/

function filterMessages(){
    let filtered = msgsList.filter(function(msg){
        return subsFilterList.indexOf(msg.getSub().sub) != -1;
    })
    actualizarListaMensajes(filtered);
}

function disconnect(){// faltaría eliminar el token/sesion del servidor
    session.connected = false;
    session.token = '';
    localStorage.removeItem('session');
    window.location = './login.html';
}

function actualizarListaSuscripciones(subs){
    var subscribed = "";
    var pending = ""
    for(sub in subs){
        if(subs[sub].status == 'subscribed'){
            subscribed += `
            <li class="pure-menu-item subListName selectedSub" subid="${subs[sub].sub}">
                <a href="#" class="pure-menu-link">
                    <img class="subListImage" src="${subs[sub].img}">
                    ${subs[sub].app.title}
                </a>
                <span class="subShow settingsSubs glyphicon glyphicon-edit"></span>
            </li>
            `
        }
        if(subs[sub].status == 'pending'){
            pending += `
            <li class="pure-menu-item subListName selectedSub" subid="${subs[sub].sub}">
                <a href="#" class="pure-menu-link">
                    <img class="subListImage" src="${subs[sub].img}">
                    ${subs[sub].app.title}
                </a>
                <span class="subShow settingsSubs glyphicon glyphicon-edit"></span>
            </li>
            `
        }
    }
    $('#subListElems').html(subscribed)
    $('#subListElemsPending').html(pending)
    $('.subListName').click(function(evt){
        evt.preventDefault();
        var subid = $(this).attr('subid');
        var index = subsFilterList.indexOf(subid);
        if(subsFilterList.length==0){
            $(".subListName").addClass('unselectedSub')
        }
        if(index==-1){
            subsFilterList.push(subid);
            $(this).removeClass('unselectedSub');
        }
        else{
            subsFilterList.splice(index, 1);
            $(this).addClass('unselectedSub');
        }
        filterMessages();
    })
    $('.subShow').click(function(){
        subActual =  notmail.subs[$(this).parent().attr('subid')];
        mostrarSuscripcionActual();
    })
}

function mostrarSuscripcionActual(){

    $('#subInfoImg').attr('src', subActual.app.icon);
    $('#subInfoTitle').text(subActual.app.title)
    $('#subInfoTitle2').text(subActual.app.title)
    $('#subInfoDescription').text(subActual.app.description)
    $('#subInfoUrl').text(subActual.app.url)
    $('#subInfoDate').text(subActual.created)
    $('#subInfoUnsecured').text(subActual.app.unsecured_source)
    $('#subInfoStatus').text(subActual.status)
    $('#subInfoValidation').text(subActual.validation)
    $('#subpanel').modal('show');

    if(subActual.status == 'pending')
        $('#subInfoPending').css('display', 'block')
    else
        $('#subInfoPending').css('display', 'none')

}

function actualizarListaMensajes(msgs){
    var data = "";
    for(var mensaje = msgs.length-1; mensaje>=0; mensaje-- ){
        data += `
        <div class="notmail-item pure-g ${(msgs[mensaje].read==true)? 'notmail-item-read' : 'notmail-item-unread'} " msgid="${msgs[mensaje].id}"> <!-- CLASES: notmail-item-unread y notmail-item-selected -->
            <div class="pure-u">
                <img width="64" height="64" alt="Reid Burke&#x27;s avatar" class="notmail-avatar" src="img/common/reid-avatar.png">
            </div>

            <div class="pure-u-3-4">
                <h5 class="notmail-name msgSubName">${msgs[mensaje].getSub().app.title}</h5>
                <h4 class="notmail-subject msgTitle">${msgs[mensaje].title}</h4>
                <p class="notmail-desc msgPreview">
                    ${msgs[mensaje].data}
                </p>
            </div>
        </div>
        `
        console.log(msgs[mensaje].getSub().app.title)
    }
    $('#list').html(data)

    $('.notmail-item').click(function(){
        $(this).removeClass('notmail-item-unread');
        $(this).addClass('notmail-item-read');
        mensajeActualRef = this;
        $(mensajeActualRef).removeClass('notmail-item-selected');
        $(this).addClass('notmail-item-selected')
        var msgid = $(this).attr('msgid')
        nuevoMensajeActual(notmail.messages.filter(function(msg){return msg.id == msgid})[0])
    })

}

function nuevoMensajeActual(mensaje){
    mensajeActual = mensaje;

    $('#msgTitle').text(mensaje.title);
    $('#subName').text(mensaje.getSub().app.title);
    $('#msgArrival').text(new Date(mensaje.arrival_time)); 
    $('#msgData').text(mensaje.data );

    if(!mensaje.read) mensaje.setRead(true, function(){});
}

/*
    EVENTS
*/
$("#mostrarNinguna").click(function(){
    subsFilterList = [];
    filterMessages();
    $(".subListName").addClass('unselectedSub')
})

$("#mostrarTodas").click(function(){
    subsFilterList = [];
    for(sub in subsList){
        subsFilterList.push(sub);
    }
    $(".subListName").removeClass('unselectedSub')
    console.log(subsFilterList)
    filterMessages();
})

$("#msgMarkAsNotRead").click(function(){
    mensajeActual.setRead(false, function(){})
    $(mensajeActualRef).addClass('notmail-item-unread')
    $(mensajeActualRef).removeClass('notmail-item-read')
})
$("#msgDelete").click(function(){
    mensajeActual.delete(function(){})
    $(mensajeActualRef).remove();
})



/*
    INICIO
*/
//getMessages()
//getSuscripciones()