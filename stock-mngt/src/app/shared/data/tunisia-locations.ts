// Tunisia Governorates and their main cities/delegations
export interface TunisiaLocation {
    governorate: string;
    cities: string[];
}

export const TUNISIA_LOCATIONS: TunisiaLocation[] = [
    {
        governorate: 'Tunis',
        cities: ['Tunis', 'La Marsa', 'Le Bardo', 'Carthage', 'Sidi Bou Said', 'El Menzah', 'El Manar', 'El Omrane', 'Ettahrir', 'Séjoumi']
    },
    {
        governorate: 'Ariana',
        cities: ['Ariana', 'La Soukra', 'Raoued', 'Sidi Thabet', 'Ettadhamen', 'Mnihla', 'Kalâat el-Andalous']
    },
    {
        governorate: 'Ben Arous',
        cities: ['Ben Arous', 'Hammam Lif', 'Hammam Chatt', 'Radès', 'Ezzahra', 'Mégrine', 'Mohamedia', 'Fouchana', 'Mornag', 'Nouvelle Médina']
    },
    {
        governorate: 'Manouba',
        cities: ['Manouba', 'Den Den', 'Douar Hicher', 'Oued Ellil', 'Tebourba', 'El Battan', 'Jedaida', 'Borj El Amri']
    },
    {
        governorate: 'Nabeul',
        cities: ['Nabeul', 'Hammamet', 'Korba', 'Kélibia', 'Menzel Temime', 'Grombalia', 'Soliman', 'Dar Chaâbane', 'Beni Khiar', 'El Haouaria']
    },
    {
        governorate: 'Zaghouan',
        cities: ['Zaghouan', 'Zriba', 'El Fahs', 'Nadhour', 'Bir Mcherga', 'Saouaf']
    },
    {
        governorate: 'Bizerte',
        cities: ['Bizerte', 'Menzel Bourguiba', 'Mateur', 'Ras Jebel', 'Sejnane', 'Tinja', 'Ghezala', 'Menzel Jemil', 'El Alia', 'Joumine']
    },
    {
        governorate: 'Béja',
        cities: ['Béja', 'Medjez el-Bab', 'Nefza', 'Testour', 'Téboursouk', 'Goubellat', 'Thibar', 'Amdoun']
    },
    {
        governorate: 'Jendouba',
        cities: ['Jendouba', 'Tabarka', 'Aïn Draham', 'Bou Salem', 'Ghardimaou', 'Fernana', 'Oued Meliz', 'Balta-Bou Aouane']
    },
    {
        governorate: 'Le Kef',
        cities: ['Le Kef', 'Dahmani', 'Tajerouine', 'Sakiet Sidi Youssef', 'Nebeur', 'El Ksour', 'Jérissa', 'Kalaat Senan']
    },
    {
        governorate: 'Siliana',
        cities: ['Siliana', 'Bou Arada', 'Gaâfour', 'El Krib', 'Makthar', 'Rouhia', 'Kesra', 'Bargou']
    },
    {
        governorate: 'Sousse',
        cities: ['Sousse', 'M\'saken', 'Kalâa Kebira', 'Hammam Sousse', 'Akouda', 'Kalâa Seghira', 'Hergla', 'Enfidha', 'Bouficha', 'Sidi Bou Ali']
    },
    {
        governorate: 'Monastir',
        cities: ['Monastir', 'Moknine', 'Jemmal', 'Ksar Hellal', 'Téboulba', 'Bekalta', 'Sayada-Lamta-Bou Hajar', 'Zeramdine', 'Beni Hassen', 'Ouerdanine']
    },
    {
        governorate: 'Mahdia',
        cities: ['Mahdia', 'Ksour Essef', 'El Jem', 'Chebba', 'Sidi Alouane', 'Bou Merdes', 'Souassi', 'Hebira', 'Essouassi', 'Melloulèche']
    },
    {
        governorate: 'Sfax',
        cities: ['Sfax', 'Sakiet Ezzit', 'Sakiet Eddaïer', 'Chihia', 'Thyna', 'El Aïn', 'Agareb', 'Djebeniana', 'Bir Ali Ben Khalifa', 'Skhira', 'Graïba', 'Mahrès', 'Kerkennah']
    },
    {
        governorate: 'Kairouan',
        cities: ['Kairouan', 'Oueslatia', 'Sbikha', 'Haffouz', 'Bouhajla', 'Nasrallah', 'El Alâa', 'Hajeb El Ayoun', 'Chebika', 'Echrarda']
    },
    {
        governorate: 'Kasserine',
        cities: ['Kasserine', 'Sbeitla', 'Feriana', 'Thala', 'Foussana', 'Haïdra', 'El Ayoun', 'Majel Bel Abbès', 'Jedelienne', 'Hassi El Ferid']
    },
    {
        governorate: 'Sidi Bouzid',
        cities: ['Sidi Bouzid', 'Regueb', 'Jilma', 'Menzel Bouzaiane', 'Meknassy', 'Bir El Hafey', 'Sidi Ali Ben Aoun', 'Mezzouna', 'Cebbala Ouled Asker', 'Ouled Haffouz']
    },
    {
        governorate: 'Gabès',
        cities: ['Gabès', 'El Hamma', 'Mareth', 'Matmata', 'Nouvelle Matmata', 'Métouia', 'Menzel El Habib', 'Ghannouch', 'Ouedhref']
    },
    {
        governorate: 'Médenine',
        cities: ['Médenine', 'Zarzis', 'Ben Guerdane', 'Djerba Houmt Souk', 'Djerba Midoun', 'Djerba Ajim', 'Beni Khedache', 'Sidi Makhlouf']
    },
    {
        governorate: 'Tataouine',
        cities: ['Tataouine', 'Ghomrassen', 'Remada', 'Bir Lahmar', 'Dehiba', 'Smar']
    },
    {
        governorate: 'Gafsa',
        cities: ['Gafsa', 'Metlaoui', 'Redeyef', 'El Guettar', 'Moularès', 'Sened', 'Belkhir', 'Sidi Aïch', 'El Ksar']
    },
    {
        governorate: 'Tozeur',
        cities: ['Tozeur', 'Nefta', 'Degache', 'Tameghza', 'Hazoua']
    },
    {
        governorate: 'Kébili',
        cities: ['Kébili', 'Douz', 'Souk Lahad', 'El Faouar', 'El Golâa']
    }
];

// Helper to get all governorates
export function getAllGovernorates(): string[] {
    return TUNISIA_LOCATIONS.map(loc => loc.governorate);
}

// Helper to get cities for a governorate
export function getCitiesForGovernorate(governorate: string): string[] {
    const location = TUNISIA_LOCATIONS.find(loc => loc.governorate === governorate);
    return location ? location.cities : [];
}

// Helper to get all cities from all governorates
export function getAllCities(): string[] {
    const allCities: string[] = [];
    TUNISIA_LOCATIONS.forEach(loc => {
        allCities.push(...loc.cities);
    });
    return allCities.sort();
}
