console.log(localStorage.getItem('session'))

var session = JSON.parse(localStorage.getItem('session'));

if(!session || !session.connected) window.location = './login.html'

var mensajeActual;
var mensajeActualRef;

var notmail = new NotmailWeb(session.url);
notmail.tokenAuthenticate(session.token);
notmail.on('disconnect', function(){    
    disconnect();
})
$('.exittext').click(function(){
    disconnect();
})

$('.notmailtext').first().text(session.notmail)

notmail.getSubscriptions({}, function(err, subs){
    if(err) console.log(err)
    actualizarListaSuscripciones(subs);

    notmail.getMessages({}, function(err, msgs){
        if(err) console.log(err)
        actualizarListaMensajes(msgs);
        nuevoMensajeActual(msgs[0]);
    })
})

/*
    HTML
*/

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
            <li class="pure-menu-item">
                <a href="#" class="pure-menu-link subListName">
                    <img class="subListImage" src="img/common/reid-avatar.png">
                    ${subs[sub].app.title}
                </a>
            </li>
            `
        }
        if(subs[sub].status == 'pending'){
            pending += `
            <li class="pure-menu-item">
                <a href="#" class="pure-menu-link subListName">
                    <img class="subListImage" src="img/common/reid-avatar.png">
                    ${subs[sub].app.title}
                </a>
            </li>
            `
        }
    }
    $('#subListElems').html(subscribed)
    $('#subListElemsPending').html(pending)
}

function actualizarListaMensajes(msgs){
    var data = "";
    for(var mensaje = msgs.length-1; mensaje>=0; mensaje-- ){
        data += `
        <div class="notmail-item pure-g" msgid="${msgs[mensaje].id}"> <!-- CLASES: notmail-item-unread y notmail-item-selected -->
            <div class="pure-u">
                <img width="64" height="64" alt="Reid Burke&#x27;s avatar" class="notmail-avatar" src="img/common/reid-avatar.png">
            </div>

            <div class="pure-u-3-4">
                <h5 class="notmail-name msgSubName">Nombre suscripcion</h5>
                <h4 class="notmail-subject msgTitle">${msgs[mensaje].title}</h4>
                <p class="notmail-desc msgPreview">
                    ${msgs[mensaje].data}
                </p>
            </div>
        </div>
        `
    }
    $('#list').html(data)

    $('.notmail-item').click(function(){
        $(mensajeActualRef).removeClass('notmail-item-selected');
        mensajeActualRef = this;
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
}

/*
    EVENTS
*/

/*
    INICIO
*/
//getMessages()
//getSuscripciones()