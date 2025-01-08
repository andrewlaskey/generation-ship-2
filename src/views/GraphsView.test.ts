import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from 'jsdom';
import { GameResults } from "../modules/AutoPlayer";
import { GameState } from "../modules/GameManager";
import { GraphsView } from "./GraphsView";

describe('GraphsView', () => {
    let dom: JSDOM;
    let document: Document;
    
    beforeEach(() => {
        // Create a mock document using JSDOM
        dom = new JSDOM('<!DOCTYPE html><div id="app"></div>');
        document = dom.window.document;

        // Replace document.querySelector with the one from the mock DOM
        global.document = document;
    });

    describe('appendHistogram', () => {
        it('should append the histogram elements to div', () => {
            const el = document.createElement('div');

            const sampleData: GameResults[] = [
                {
                    score: 10,
                    result: GameState.Complete
                },
                {
                    score: 50,
                    result: GameState.Complete
                },
                {
                    score: 100,
                    result: GameState.Complete
                }
            ];

            const view = new GraphsView(document);

            view.appendHistogram(el, sampleData, 50, 100);

            const graph = el.querySelector('#histogram');

            expect(graph).not.toBeNull();
        })
    })
})