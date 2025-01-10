import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from 'jsdom';
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

            const sampleData: number[] = [10, 50, 100];
            const view = new GraphsView(document);

            view.appendHistogram(el, sampleData, 50);

            const graph = el.querySelector('#histogram');

            expect(graph).not.toBeNull();
        });

        it.skip('should not throw an error', () => {
            const el = document.createElement('div');

            const sampleData: number[] = [1800, 800, 1800];
            const view = new GraphsView(document);

            expect(() => {
                view.appendHistogram(el, sampleData, 600);
            }).not.toThrow();
        })
    })
})