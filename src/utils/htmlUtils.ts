export const clearElementChildren = (element: HTMLDivElement): void => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

export const insertHtml = (html: string, el: HTMLElement): void => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  Array.from(doc.body.childNodes).forEach(node => el.appendChild(node));
};

export const getRelativePosition = (
  child: HTMLElement,
  ancestor: HTMLElement
): { top: number; left: number } => {
  let childElement: HTMLElement | null = child;
  let offsetTop = 0;
  let offsetLeft = 0;

  while (childElement && childElement !== ancestor) {
    offsetTop += childElement.offsetTop;
    offsetLeft += childElement.offsetLeft;
    childElement = childElement.offsetParent as HTMLElement; // Traverse up the offsetParent chain
  }

  if (childElement !== ancestor) {
    throw new Error('The specified ancestor is not actually an ancestor of the child element.');
  }

  return { top: offsetTop, left: offsetLeft };
};
