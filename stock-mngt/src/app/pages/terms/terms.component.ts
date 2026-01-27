import { Component, OnInit } from '@angular/core';
import { faFileContract, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  faFileContract = faFileContract;
  faChevronRight = faChevronRight;

  lastUpdated = '7 Janvier 2026';

  sections = [
    {
      id: 'objet',
      title: 'Objet',
      content: `Storiom est une application permettant aux commerçants de gérer leur inventaire 
        (produits, employés, dépenses, fournisseurs, reçus, crédits), de consulter des statistiques, 
        de générer des rapports, et prochainement, de publier leurs produits dans une marketplace 
        visible par des clients externes.`
    },
    {
      id: 'acceptation',
      title: 'Acceptation des conditions',
      content: `En créant un compte et en utilisant Storiom, vous acceptez l'ensemble des présentes 
        Conditions Générales d'Utilisation (CGU). Si vous êtes en désaccord avec une partie de ces 
        conditions, vous ne devez pas utiliser le service.`
    },
    {
      id: 'acces',
      title: 'Accès et sécurité du compte',
      content: `<ul>
        <li>Vous êtes seul responsable de l'accès à votre compte et de la confidentialité de vos identifiants.</li>
        <li>Toute activité effectuée depuis votre compte sera considérée comme la vôtre.</li>
        <li>En cas d'utilisation suspecte de votre compte, vous devez nous en informer immédiatement.</li>
      </ul>`
    },
    {
      id: 'tarification',
      title: 'Accès au service et tarification',
      content: `<ul>
        <li>Le service nécessite un abonnement payant après une période d'essai gratuite d'un mois.</li>
        <li>Les prix des abonnements sont indiqués sur notre plateforme et peuvent être modifiés à l'avenir.</li>
        <li>En cas de modification des tarifs, les utilisateurs seront informés <strong>au moins 30 jours à l'avance</strong> par email ou notification dans l'application.</li>
        <li>Les utilisateurs peuvent résilier leur abonnement avant l'entrée en vigueur des nouveaux tarifs.</li>
        <li>Storiom se réserve le droit de modifier ou suspendre certaines fonctionnalités avec préavis raisonnable.</li>
      </ul>`
    },
    {
      id: 'stockage',
      title: 'Stockage et limites',
      content: `<ul>
        <li>Chaque compte bénéficie d'un espace de stockage de base de <strong>50 Go</strong> pour les images de produits.</li>
        <li>Des extensions de stockage (50 Go, 100 Go, 200 Go) peuvent être achetées pour 1, 3, 6 ou 12 mois.</li>
        <li>En cas de dépassement de la limite de stockage, vous disposez d'un <strong>délai de 30 jours</strong> pour régulariser votre situation.</li>
        <li>Passé ce délai, les <strong>images les plus anciennes</strong> seront automatiquement supprimées.</li>
        <li>Les tarifs du stockage supplémentaire peuvent être modifiés avec un préavis de 30 jours.</li>
      </ul>`
    },
    {
      id: 'donnees',
      title: 'Données personnelles',
      content: `Storiom collecte certaines données personnelles (nom, email, etc.) nécessaires au bon 
        fonctionnement du service. Ces données sont confidentielles et ne seront jamais vendues à des tiers.
        <br><br>
        L'utilisateur peut configurer les données de son magasin (produits, informations) pour qu'elles 
        soient visibles ou non dans la partie publique (marketplace).`
    },
    {
      id: 'contenus',
      title: 'Contenus interdits',
      content: `L'utilisateur s'engage à ne pas publier, dans la marketplace ou ailleurs, de contenus :
      <ul>
        <li>à caractère sexuel, violent, haineux, raciste, discriminatoire ou illégal ;</li>
        <li>comportant des propos injurieux, diffamatoires ou inappropriés ;</li>
        <li>ou enfreignant les lois en vigueur en Tunisie ou à l'international.</li>
      </ul>
      Storiom se réserve le droit de supprimer tout contenu inapproprié et de suspendre le compte de l'utilisateur concerné.`
    },
    {
      id: 'utilisations',
      title: 'Utilisations interdites',
      content: `<ul>
        <li>Utilisation de bots ou systèmes automatisés pour collecter ou interagir avec les données.</li>
        <li>Publication d'informations mensongères ou usurpation d'identité.</li>
        <li>Toute tentative de nuire au fonctionnement de Storiom ou à d'autres utilisateurs.</li>
      </ul>`
    },
    {
      id: 'paiements',
      title: 'Paiements',
      content: `Lors de la mise en place de l'abonnement, les paiements se feront manuellement ou par 
        virement bancaire. Aucun remboursement ne sera effectué après validation, sauf erreur avérée de notre part.`
    },
    {
      id: 'resiliation',
      title: 'Résiliation',
      content: `L'utilisateur peut supprimer son compte à tout moment. De notre côté, nous nous réservons 
        le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU ou en cas 
        d'usage abusif ou frauduleux.`
    },
    {
      id: 'responsabilite',
      title: 'Limitation de responsabilité',
      content: `Storiom est fourni tel quel, sans garantie d'aucune sorte. Nous ne sommes pas responsables 
        des pertes de données, bugs, erreurs techniques ou interruptions temporaires du service. 
        Il est recommandé d'exporter régulièrement vos données.`
    },
    {
      id: 'modifications',
      title: 'Modifications des conditions',
      content: `Ces CGU peuvent être mises à jour à tout moment. En cas de modification importante, 
        une notification sera envoyée dans l'application ou par email.`
    },
    {
      id: 'loi',
      title: 'Loi applicable et juridiction',
      content: `Les présentes CGU sont régies par la loi tunisienne. Tout litige relatif à leur 
        interprétation ou à leur exécution relèvera des tribunaux de Tunis.`
    }
  ];

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
