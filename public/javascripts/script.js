$("#domaines").click(function(){
        
   var domaine = $('#domaines').val();
   if (domaine == "autre")
   {
     $('#domaine').css('display', 'block')
    
   }else{
     $('#domaine').css('display', 'none')
   }

})
$(".hamburger").click(function(){
 $( ".menunav" ).toggle();
 $('.hamburger').css('display', 'none')
})

$(".params").click(function(){
 $( ".search" ).toggle();

})



function veriftitre(champ)
{
   if(champ.value.length == 0)
   {
      surligne(champ, true);
      return false;
   }
   else
   {
      surligne(champ, false);
      return true;
   }
}
function verifDescrip(champ)
{
   if(champ.value.length == 0)
   {
      surligne(champ, true);
      return false;
   }
   else
   {
      surligne(champ, false);
      return true;
   }
}
function verifFIle()
{
   
}
function verifForm(f)
{
   var descriptionOk = verifDescrip(f.description);
   var titreOk = veriftitre(f.titre);
   
   
   if(descriptionOk && titreOk)
      return true;
   else
   {
      alert("Veuillez remplir correctement tous les champs");
      return false;
   }
}
function surligne(champ, erreur)
{
   if(erreur)
      champ.style.backgroundColor = "#fba";
   else
      champ.style.backgroundColor = "";
}

//détection d'un event sur l'input du formulaire
