import { Component, OnInit } from '@angular/core';
import {
    faQuestionCircle, faChevronDown, faSearch,
    faShoppingCart, faTruck, faUndo, faCreditCard, faUser, faStore
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

    // Icons
    faQuestionCircle = faQuestionCircle;
    faChevronDown = faChevronDown;
    faSearch = faSearch;

    searchQuery = '';
    activeCategory = 'all';
    openQuestions: Set<number> = new Set();

    categories = [
        { id: 'all', name: 'Toutes', icon: faQuestionCircle },
        { id: 'orders', name: 'Commandes', icon: faShoppingCart },
        { id: 'shipping', name: 'Livraison', icon: faTruck },
        { id: 'returns', name: 'Retours', icon: faUndo },
        { id: 'payment', name: 'Paiement', icon: faCreditCard },
        { id: 'account', name: 'Compte', icon: faUser },
        { id: 'sellers', name: 'Vendeurs', icon: faStore }
    ];

    faqs = [
        {
            id: 1,
            category: 'orders',
            question: 'Comment passer une commande ?',
            answer: 'Pour passer une commande, ajoutez les produits souhaités à votre panier, puis cliquez sur "Commander". Suivez les étapes pour entrer vos informations de livraison et de paiement. Vous recevrez une confirmation par email une fois la commande validée.'
        },
        {
            id: 2,
            category: 'orders',
            question: 'Comment suivre ma commande ?',
            answer: 'Connectez-vous à votre compte et accédez à la section "Mes Commandes". Vous y trouverez le statut de toutes vos commandes ainsi que les informations de suivi lorsque votre colis est expédié.'
        },
        /*{
            id: 3,
            category: 'orders',
            question: 'Puis-je annuler ma commande ?',
            answer: 'Vous pouvez annuler votre commande tant qu\'elle n\'a pas été expédiée. Rendez-vous dans "Mes Commandes" et cliquez sur "Annuler". Une fois le colis expédié, vous devrez procéder à un retour après réception.'
        },*/
        {
            id: 4,
            category: 'shipping',
            question: 'Comment fonctionne la livraison ?',
            answer: 'La livraison est entièrement gérée par chaque boutique. Storiom ne propose pas de service de livraison propre. Chaque vendeur définit ses propres options de livraison, délais et tarifs. Consultez la page de la boutique pour connaître les modalités de livraison disponibles.'
        },
        {
            id: 5,
            category: 'shipping',
            question: 'Quels sont les frais de livraison ?',
            answer: 'Les frais de livraison varient selon la boutique et sont fixés par chaque vendeur. Certaines boutiques proposent la livraison gratuite, d\'autres facturent selon la distance ou le poids. Les frais sont affichés lors de la commande.'
        },
        {
            id: 6,
            category: 'shipping',
            question: 'Puis-je récupérer ma commande en magasin ?',
            answer: 'Cela dépend de la boutique. Si le vendeur propose le retrait en magasin, vous pourrez sélectionner cette option lors de la commande. Le retrait en magasin est généralement gratuit.'
        },
        {
            id: 7,
            category: 'returns',
            question: 'Comment retourner un article ?',
            answer: 'Les retours sont entièrement gérés par chaque boutique. Storiom ne gère pas les retours. Contactez directement le vendeur via la page de la boutique pour connaître sa politique de retour et organiser un éventuel retour.'
        },
        {
            id: 8,
            category: 'returns',
            question: 'Quelle est la politique de retour ?',
            answer: 'Chaque boutique définit sa propre politique de retour (délais, conditions, remboursement). Consultez les informations de la boutique ou contactez le vendeur avant d\'effectuer un achat si les retours sont importants pour vous.'
        },
        {
            id: 9,
            category: 'payment',
            question: 'Quels moyens de paiement sont acceptés ?',
            answer: 'Les moyens de paiement dépendent de chaque boutique. La plupart proposent le paiement à la livraison (cash). Certaines boutiques peuvent également accepter d\'autres modes de paiement. Consultez la page de la boutique pour plus de détails.'
        },
        {
            id: 10,
            category: 'payment',
            question: 'Le paiement est-il sécurisé ?',
            answer: 'Storiom utilise le cryptage SSL pour protéger vos données. Pour le paiement à la livraison, vous payez uniquement à la réception de votre commande, ce qui offre une sécurité supplémentaire.'
        },
        {
            id: 11,
            category: 'account',
            question: 'Comment créer un compte ?',
            answer: 'Cliquez sur "S\'inscrire" en haut de la page. Remplissez le formulaire avec vos informations et validez votre email. Vous pourrez ensuite profiter de tous les avantages membres.'
        },
        {
            id: 12,
            category: 'account',
            question: 'J\'ai oublié mon mot de passe, que faire ?',
            answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.'
        },
        {
            id: 13,
            category: 'sellers',
            question: 'Comment devenir vendeur sur Storiom ?',
            answer: 'C\'est simple et rapide ! Cliquez sur "Devenir vendeur", créez votre compte et configurez votre boutique. Vous pouvez commencer à ajouter vos produits immédiatement, sans validation préalable.'
        },
        {
            id: 14,
            category: 'sellers',
            question: 'Quels sont les frais pour les vendeurs ?',
            answer: 'Storiom fonctionne avec un système d\'abonnement mensuel. Vous bénéficiez d\'un mois d\'essai gratuit pour découvrir toutes les fonctionnalités. Aucune commission n\'est prélevée sur vos ventes.'
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

    toggleQuestion(id: number) {
        if (this.openQuestions.has(id)) {
            this.openQuestions.delete(id);
        } else {
            this.openQuestions.add(id);
        }
    }

    isOpen(id: number): boolean {
        return this.openQuestions.has(id);
    }

    get filteredFaqs() {
        return this.faqs.filter(faq => {
            const matchesCategory = this.activeCategory === 'all' || faq.category === this.activeCategory;
            const matchesSearch = !this.searchQuery ||
                faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }
}
