function fenetre(id, statut, name){
    
   
    var element = document.createElement('div')
    element.setAttribute('class', 'chat')
    element.setAttribute('name', ''+name+'')
    element.innerHTML+=
    
        '<span class="Head">'+
            '<span class="user">'+
                '<a id="name" href="/profil/'+id+'">'+name+'</a>'+
                '<P>X</a>'+
                '<P>-</P>'+
            '</span>'+
            '</span>'+
            
        
        '<div class="area">'+
        '</div>'+
        '<form enctype="multipart/form-data">'+
                '<div id="cont2" style="width:100%;height:70%;">'+
                    '<div id="dash2" style="margin:5px;height:80%;overflow:hidden;background-color: white">'+
                        '<textarea name="message" id="message" placeholder="Votre Post" ></textarea>'+
                        '<p id="text"></p>'+
                        '<input type="file" id="attachement" name="attachement" id="file" style="opacity:0;position:relative;height:100%;z-index:1" />'+
                        '<div id="te"></div>'+
                        '<div id="tt"></div>'+
                    '</div>'+
                '</div>'+
                '<input type="submit" value="envoyer" onclick=\'+message\' >'+
        '</form>'
    
    

  

    
    var currentDiv = document.getElementById('body');
    document.body.insertBefore(element, currentDiv);
    var ami = document.getElementById('name').value
    console.log(ami)
}