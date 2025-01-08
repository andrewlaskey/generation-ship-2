import { describe, beforeEach, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { clearElementChildren, insertHtml } from "./htmlUtils";

/**
 * @vitest-environment jsdom
 */
describe('HTML Utilities', () => {
    let dom: JSDOM;
    let document: Document;

    beforeEach(() => {
        // Create a mock document using JSDOM
        dom = new JSDOM('<!DOCTYPE html><div id="app"></div>');
        document = dom.window.document;

        // Replace document.querySelector with the one from the mock DOM
        global.document = document;
    });

    describe('clearElementChildren', () => {

        it('should remove child elements', () => {
            const parent = document.createElement('div');
            const child1 = document.createElement('p');
            const child2 = document.createElement('div');

            parent.appendChild(child1);
            parent.appendChild(child2);

            expect(parent.children.length).toBe(2);

            clearElementChildren(parent);

            expect(parent.children.length).toBe(0);
        })
    });

    describe('insertHtml', () => {
        it('should parse the html and insert into element', () => {
            const parent = document.createElement('div');
            const html = `
<div class="wrapper">
    <button id="test">Click Me</button>
</div>
<p>Sibling</p>            
            `;

            insertHtml(html, parent);

            expect(parent.childElementCount).toBe(2);

            const button = parent.querySelector<HTMLButtonElement>('#test');

            expect(button).not.toBe(null);
        })
    })
});