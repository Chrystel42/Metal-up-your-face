
$("#attachement").on("change", function(e) {

  //création d'un objet FileReader
  var reader = new FileReader();
  
  //déclenchement de l'affichage du fichier dans #tt
  reader.onload = function (event) {
    console.log(event.target.result)
  $("#tt").html("<img src='"+event.target.result+"' style='width:250px;height:150px;margin-left:3px;'/>");
  }
  
  //lecture du fichier FileList envoyé par le formulaire
  reader.readAsDataURL(e.target.files[0]);
})  

$("#attachement2").on("change", function(e) {

  //création d'un objet FileReader
  var reader = new FileReader();
  
  //déclenchement de l'affichage du fichier dans #tt
  reader.onload = function (event) {
    console.log(event.target.result)
  $("#tt2").html("<img id='imagePost' name='image' src='"+event.target.result+"' style='width:250px;height:150px;margin-left:3px;'/>");
  }
  
  //lecture du fichier FileList envoyé par le formulaire
  reader.readAsDataURL(e.target.files[0]);
})  
//commentaire 

$('#post').on('input',function(e){
  var url = $(this).val()

  var matches = url.match(/(https?|ftp|ssh|mailto):\/\/[a-z0-9\/:%_+.,#?!@&=-]+/gi);

  id = matches.toString().substring(0, 32);
  IdVid = url.replace( id, ""); 
  if(IdVid.length > 0)
  {
    address = "//www.youtube.com/embed/"+IdVid
    
      $("#te").html("<input type='hidden' name='link' value='"+address+"'>")
      
    
    $("#tt").html("<iframe type='text/html' id ='video' name='link' style=' width:100%; height:auto;' src='"+ address +"'frameborder='0' allowfullscreen></iframe>")
    //url2 = url.replace(matches, "")
   // console.log(url2)
   // $('#post').reset()
  }
 
  
 
});

$('#post2').on('input',function(e){
  var url = $(this).val()
  console.log(url)

  var matches = url.match(/(https?|ftp|ssh|mailto):\/\/[a-z0-9\/:%_+.,#?!@&=-]+/gi);

  id = matches.toString().substring(0, 32);
  IdVid = url.replace( id, ""); 
  if(IdVid.length > 0)
  {
    address = "//www.youtube.com/embed/"+IdVid
    
      $("#te2").html("<input type='hidden' name='link' value='"+address+"'>")
      
    
    $("#tt2").html("<iframe type='text/html' id ='video' name='link' style=' width:100%; height:auto;' src='"+ address +"'frameborder='0' allowfullscreen></iframe>")
    //url2 = url.replace(matches, "")
   // console.log(url2)
   // $('#post').reset()
  }
 
  
 
});
 //commentaire video



