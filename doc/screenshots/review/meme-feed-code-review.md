Ex 1 - Review and optimize the meme feed code

Le problème est lié au fait que la requete http permettant de récupérer les memes était appelée dans une boucle for.
C'est une mauvaise pratique d'appeler une requete http dans une boucle for.
La personne a sans doute voulu récupérer tous les memes d'un coup, et ayant accès à un endpoint demandant de préciser la page, il a bouclé tant qu'il y avait une page disponible et a appelé l'endpoint pour chacune des pages.

La solution que je propose est d'ajouter un bouton pour charger la page suivante. Car l'utilisateur ne peut de toute façon pas voir tous les memes d'un coup.
On aurait aussi pu, à la place d'un bouton, décider d'afficher les memes une fois que l'utilisateur a scrollé suffisament.
