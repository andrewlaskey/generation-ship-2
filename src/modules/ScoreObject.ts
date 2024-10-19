export class ScoreObject {
    name: string;
    value: number;
    history: number[] = [];

    constructor(name: string, startingValue: number) {
        this.name = name;
        this.value = startingValue;
    }

    update(newValue: number) {
        this.history.push(this.value);
        this.value = newValue
    }
}