export class Store {
    id?: number
    name: string;
    description: string;
    logo: File;
    images: string[];
    constructor( name: string, description: string, logo: File, images: string[],id?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.logo = logo;
        this.images = images;
    }

}
