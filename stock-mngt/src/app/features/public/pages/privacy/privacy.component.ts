import { Component, OnInit } from '@angular/core';
import { faShieldAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {

  faShieldAlt = faShieldAlt;
  faChevronRight = faChevronRight;

  lastUpdated = '1 Janvier 2026';

  sections = [
    {
      id: 'collecte',
      title: 'Collecte des Données',
      content: `Nous collectons les informations que vous nous fournissez directement, notamment :
      <ul>
        <li>Informations d'inscription (nom, email, téléphone)</li>
        <li>Informations de profil et préférences</li>
        <li>Historique des commandes et transactions</li>
        <li>Communications avec notre service client</li>
      </ul>`
    },
    {
      id: 'utilisation',
      title: 'Utilisation des Données',
      content: `Vos données sont utilisées pour :
      <ul>
        <li>Traiter vos commandes et livraisons</li>
        <li>Personnaliser votre expérience d'achat</li>
        <li>Vous envoyer des notifications importantes</li>
        <li>Améliorer nos services et produits</li>
        <li>Prévenir les fraudes et sécuriser la plateforme</li>
      </ul>`
    },
    {
      id: 'partage',
      title: 'Partage des Données',
      content: `Nous ne vendons jamais vos données personnelles. Nous les partageons uniquement avec :
      <ul>
        <li>Les vendeurs pour traiter vos commandes</li>
        <li>Les services de livraison partenaires</li>
        <li>Les autorités légales si requis par la loi</li>
      </ul>`
    },
    {
      id: 'securite',
      title: 'Sécurité des Données',
      content: `Nous mettons en œuvre des mesures de sécurité strictes :
      <ul>
        <li>Cryptage SSL de toutes les communications</li>
        <li>Stockage sécurisé des mots de passe (hashage)</li>
        <li>Contrôles d'accès stricts à nos systèmes</li>
      </ul>`
    },
    {
      id: 'droits',
      title: 'Vos Droits',
      content: `Conformément à la réglementation, vous disposez des droits suivants :
      <ul>
        <li>Droit d'accès à vos données personnelles</li>
        <li>Droit de rectification des informations inexactes</li>
        <li>Droit à l'effacement de vos données</li>
        <li>Droit d'opposition au traitement</li>
      </ul>
      Pour exercer ces droits, contactez-nous à privacy@storiom.com`
    },
    {
      id: 'stockage',
      title: 'Stockage Local',
      content: `Nous utilisons le stockage local de votre navigateur pour :
    <ul>
      <li>Maintenir votre session de connexion</li>
      <li>Sauvegarder votre panier d'achat</li>
      <li>Mémoriser vos préférences</li>
    </ul>
    Ces données sont stockées uniquement sur votre appareil et ne sont pas envoyées à nos serveurs.`
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
