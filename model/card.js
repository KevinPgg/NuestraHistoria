export class Card {
    static contadorId = 0;

    static resetCounter(start = 0) {
        Card.contadorId = start;
    }

    constructor({ filename, descripcion, fecha }) {
        this.id = Card.contadorId++;
        this.fotoFileName = filename;
        this.descripcion = descripcion;
        this.fecha = fecha ?? null;
    }
}