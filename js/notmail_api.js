(function () {

    // Global Variables

    var endpoints = {
        auth: '/notmail_api/user/auth/',
        sub: '/notmail_api/user/sub/',
        msg: '/notmail_api/user/msg/'
    }


    /*
        Notmail Class
    */

    // Notmail_constructor

    NotmailWeb = function (url) {
        this.url = url;
        this.session = {
            connected: false,
            token: ''
        }
        this.messages = [];
        this.subs = {};
        //this.subsDict = {};
    };

    // Notmail_private_methods

    var getUrl = function(endpoint, query){
        if (!query) query = {};
        query.token = this.session.token;
        return this.url + endpoint + '?' + jQuery.param(query);
    }

    // Notmail_shared_methods

    NotmailWeb.prototype.tokenAuthenticate = function(token){
        this.session.token = token;
    }

    NotmailWeb.prototype.passwordAuthenticate = function(notmail, password, callback){
        var that = this;
        var url = getUrl.call(this, endpoints.auth, {notmail: notmail, pwd: password})        
        
        $.ajax(url, {method: 'GET'})
        .done(function(data){
            if(data.session){
                that.session.token = data.session.token;
                that.session.expiration = data.session.expiration;
                that.session.subs = data.session.subs;
                that.session.permissions = data.session.permissions
                callback(false, data.session)
            }
        })
        .fail(function(err){
            callback(err.responseJSON.error);
        })
    }

    NotmailWeb.prototype.on = function(event, callback){
        if(event == 'disconnect')
            this.eventDisconnect = callback;
    }

    NotmailWeb.prototype.getMessages = function (query, callback) {
        var that = this;
        var url = getUrl.call(this, endpoints.msg, query)
        $.ajax(
            url, 
            {
                method: 'GET',
                //contentType: 'application/json',
                dataType: 'json',
            }
        )
        .done(function(data){
            that.messages = data.msgs.map(function(msg){
                var msg = new Message(msg); 
                Object.defineProperty(msg, "notmail", {
                    enumerable: false,
                    writable: true
                });
                msg.notmail = that;
                return msg
            });
            callback(false, that.messages);
        })
        .fail(function(err){
            if(err.status == 401) this.eventDisconnect();
            callback(err.responseJSON.error);
        })
    };

    NotmailWeb.prototype.getSubscriptions = function (query, callback) {
        var that = this;
        var url = getUrl.call(this, endpoints.sub, query)
        $.ajax(
            url, 
            {
                method: 'GET',
                //contentType: 'application/json',
                dataType: 'json',
            }
        )
        .done(function(data){
            data.subs.forEach(function(sub){
                that.subs[sub.sub]=new Subscription(sub);
                Object.defineProperty(that.subs[sub.sub], "notmail", {
                    enumerable: false,
                    writable: true
                });
                that.subs[sub.sub].notmail = that;
            });
            callback(false, that.subs);
        })
        .fail(function(err){
            if(err.status == 401) this.eventDisconnect();
            callback(err.responseJSON.error);
        })
    };

    /* 
        Subscriptions Class
    */
    
    // Subscriptions_constructor

    Subscription = function(sub){
        this.sub = sub.sub;
        this.app = sub.app;
        this.status = sub.status;
        this.validation = sub.validation;
    }

    // Subscriptions_shared_methods
    Subscription.prototype.show = function(){
        console.log(this.name+': '+this.status)
    }
    

    /* 
        Messages Class
    */

    // Messages_constructor

    Message = function(msg){
        this.title = msg.title;
        this.arrival_time = msg.arrival_time;
        this.data = msg.data;
        this.id = msg.id;
        this.sub = msg.sub;
    }

    // Messages_shared_methods
    Message.prototype.show = function(){
        console.log(this.title+': '+this.data+' by: '+this.getSub().app.title+' at: '+this.arrival_time)
    }

    Message.prototype.getSub = function(){
        return this.notmail.subs[this.sub];
    }


}());