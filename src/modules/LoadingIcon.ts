import { insertHtml } from "../utils/htmlUtils";
import { gsap } from "gsap";

export class LoadingIcon {
    private element: HTMLElement | null;
    private tl: gsap.core.Timeline | null;

    constructor(document: Document, selector: string) {
        this.element = document.querySelector(selector);
        this.tl = gsap.timeline({
            repeat: -1
        });

        if (this.element) {
            insertHtml(`
                <div class="loading-icons">
                    <div class="tree">ᚫ</div>
                    <div class="people">ᨊ</div>
                    <div class="farm">፠</div>
                    <div class="power">ᚢ</div>
                </div>
                <p class="loading-text">Loading...</p>
            `, this.element);

            gsap.set('.loading-icons div', {
                yPercent: 100,
                opacity: 0
            })
            
            this.tl.to('.loading-icons div', {
                duration: 0.6,
                yPercent: 0,
                opacity: 1,
                stagger: {
                    each: 0.2,
                    from: "start"
                }
            })
            .to('.loading-icons div', {
                duration: 0.6,
                yPercent: -100,
                opacity: 0,
                stagger: {
                    each: 0.2,
                    from: "start"
                }
            }, "+=0.2");
        }
    }

    public remove(): void {
        if (this.element) {
            this.tl?.clear();

            gsap.to(this.element, {
                duration: 0.5,
                autoAlpha: 0,
                onComplete: () => {
                    gsap.killTweensOf(this.element);

                    if (this.element) {
                        this.element.remove();
                    }
                }
            });
        }
    }
}