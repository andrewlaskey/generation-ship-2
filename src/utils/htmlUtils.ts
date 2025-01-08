export const clearElementChildren = (element: HTMLDivElement): void => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

export const insertHtml = (html: string, el: HTMLElement): void => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    Array.from(doc.body.childNodes).forEach(node => el.appendChild(node));
}