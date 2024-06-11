class Story {

    constructor(duration) {
        this.duration = duration;
    }

    onProgress() { }

    onEnd() {

    }

    play() { }

    pause() { }

    stop() { }
}

class ImageStory extends Story {
    constructor({ htmlContainer, url, duration }) {
        super(duration);
        this.htmlContainer = htmlContainer;
        this.url = url;
        this.progressFns = []
        this.endsFns = []
        this.readyFns = []
        this.canPlay = false;
        this.isInit = false;
    }

    init() {
        this.htmlContainer.style.setProperty('background-image', `url(${this.url})`);
        this.animation = this._createAnimator({
            duration: this.duration * 1000,
            timing(timeFraction) {
                return timeFraction;
            },
            draw: (progress) => {
                this.progressFns.forEach(fn => fn(progress));
            },
            onEnd: () => {
                this.endsFns.forEach(fn => fn());
            }
        })

        this.canPlay = true;
        this.isInit = true;
        this.readyFns.forEach(fn => fn());
    }


    play() {
        this.animation.start();
    }

    pause() {
        this.animation.pause();
    }

    stop() {
        this.animation?.reset();
    }

    onProgress(fn) {
        this.progressFns.push(fn);
    }

    onEnd(fn) {
        this.endsFns.push(fn);
    }

    onReady(fn) {
        this.readyFns.push(fn);
    }

    _createAnimator = ({ timing, draw, duration, onEnd }) => {
        let start = null;
        let pausedAt = null;
        let rafId = null;

        const animate = time => {
            if (!start) start = time;
            if (pausedAt) {
                start += (time - pausedAt);
                pausedAt = null;
            }
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            let progress = timing(timeFraction);
            draw(progress);

            if (timeFraction < 1) {
                rafId = requestAnimationFrame(animate);
            } else {
                onEnd()
                start = null;
            }
        };

        return {
            start: () => {
                if (!rafId) {
                    rafId = requestAnimationFrame(animate);
                }
            },
            pause: () => {
                if (rafId) {
                    pausedAt = performance.now();
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            },
            reset: () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                start = null;
                pausedAt = null;
            }
        };
    };
}

class VideoStory extends Story {
    constructor({ htmlContainer, url, duration }) {
        super(duration);
        this.htmlContainer = htmlContainer;
        this.url = url;
        this.progressFns = [];
        this.endsFns = [];
        this.readyFns = [];
        this.canPlay = false;
        this.isInit = false;
    }

    init() {
        const videoEl = document.createElement('video');
        videoEl.setAttribute('muted', 'muted');
        videoEl.setAttribute('playsinline', 'playsinline');
        videoEl.setAttribute('disablepictureinpicture', '');
        videoEl.setAttribute('controlslist', 'nodownload noplaybackrate');
        videoEl.setAttribute('type', 'video/mp4');

        this.htmlContainer.append(videoEl);

        this.player = videojs(videoEl);
        this.player.src({ type: 'video/mp4', src: this.url });
        this.player.ready(() => {
            this.canPlay = true;
            this.readyFns.forEach(fn => fn());
        });

        this.player.on('timeupdate', (e, i) => {
            const duration = this.duration <= this.player.duration()
                ? this.duration
                : this.player.duration();
            const currentTime = this.player.currentTime();
            const progress = currentTime / duration;
            this.progressFns.forEach(fn => fn(Math.min(progress, 1)));

            if (currentTime >= duration) {
                this.player.pause();
                //this.player.currentTime(duration);
                this.endsFns.forEach(fn => fn());
            }
        })

        this.player.on('ended', () => {
            this.endsFns.forEach(fn => fn());
        })

        this.isInit = true;
    }

    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
    }

    stop() {
        this.player.currentTime(0);
        this.player.pause();
    }

    onProgress(fn) {
        this.progressFns.push(fn);
    }

    onEnd(fn) {
        this.endsFns.push(fn);
    }

    onReady(fn) {
        this.readyFns.push(fn);
    }
}

class Stories {
    constructor({
        storiesContainer,
        progressLineContainer,
        btnPlayPause,
        stories
    }) {
        this.storiesContainer = storiesContainer;
        this.progressLineContainer = progressLineContainer;
        this.btnPlayPause = btnPlayPause;
        this.duration = 6;
        this.stories = this._createStories(stories);
        this._isEnd = false;
        this._isStart = true;
        this.readyFns = [];
        this.endFns = [];
        this.changeFns = [];
        this.activeStoryIndex = 0;
        this.prevActiveStoryIndex = 0;
        this.prevItems = [];
        this.progressAnimation = true;
    }

    init() {
        this._createProgressLines();
        this._setEvents();

        const firstStory = this.stories[0];
        firstStory && firstStory.onReady(() => {
            this.readyFns.forEach(fn => fn());
        })

        this._render();

    }

    play() {
        const story = this.stories[this.activeStoryIndex];
        this.prevItems.forEach((st, index) => {
            if (!st) return;

            if (st === story) return;
            st.stop();
        })

        // this._removeProgressAnimation();
        // const linePrev = this.progressLineContainer.children[this.activeStoryIndex - 1];
        // if(linePrev) {
        //     linePrev.classList.add('viewed');
        //     linePrev.classList.remove('active');
        // }
        // //linePrev && this._setProgress(linePrev, 1);

        // const line = this.progressLineContainer.children[this.activeStoryIndex];
        // if(line) {
        //     line.classList.remove('viewed');
        //     line.classList.add('active');
        // }

        // const lineNext = this.progressLineContainer.children[this.activeStoryIndex + 1];
        // if(lineNext) {
        //     lineNext.classList.remove('viewed');
        //     lineNext.classList.remove('active');
        // }
        //lineNext && this._setProgress(lineNext, 0);

        const play = () => {
            if (story.canPlay) {
                story.play();
                this.btnPlayPause && this.btnPlayPause.classList.add('pause');
            } else {
                setTimeout(() => {
                    play();
                }, 200)
            }
        }
        play();
    }

    pause() {
        const story = this.stories[this.activeStoryIndex];
        story.pause();
        this.btnPlayPause && this.btnPlayPause.classList.remove('pause');
    }

    next() {
        if (this.activeStoryIndex === this.stories.length - 1) return;
        this.activeStoryIndex++;
        this._updateProgressLines();
        this._render();
        this.play();
        this.changeFns.forEach(fn => fn());
    }

    prev() {
        if (this.activeStoryIndex === 0) return;
        this.activeStoryIndex--;
        this._updateProgressLines();
        this._render();
        this.play();
        this.changeFns.forEach(fn => fn());
    }

    reset() {
        this._isEnd = false;
        this._isStart = true;
        this.activeStoryIndex = 0;
        this.prevActiveStoryIndex = 0;
        this._updateProgressLines();
        this.stories.forEach(story => story.stop());
        this.pause();
        this._render();
    }

    get isEnd() {
        return this._isEnd;
    }
    get isStart() {
        return this._isStart;
    }

    onReady(fn) {
        this.readyFns.push(fn);
    }

    onEnd(fn) {
        this.endFns.push(fn);
    }

    onStoryChange(fn) {
        this.changeFns.push(fn);
    }

    _createProgressLines() {
        const lines = this.stories.map(story => {
            const line = document.createElement('div');
            line.className = 'progress-line';
            line.style.setProperty('--value', '0%');

            return line;
        })

        this.progressLineContainer.append(...lines);
    }

    _updateProgressLines() {
        Array.from(this.progressLineContainer.children).forEach((line, index) => {
            const activeIndex = this.activeStoryIndex;
            if(index < activeIndex) {
                line.classList.add('viewed');
                line.classList.remove('active');
                this._setProgress(line, 0);
            } else if( index === activeIndex) {
                line.classList.remove('viewed');
                line.classList.add('active');
                this._setProgress(line, 0);
            } else if (index > activeIndex) {
                line.classList.remove('viewed');
                line.classList.remove('active');
                this._setProgress(line, 0);
            }
        })
    }

    _createStories(stories) {
        return stories.map((storyData) => {
            const storyHtmlEl = document.createElement('div');
            storyHtmlEl.className = 'stories-card__stories-item';

            const story = storyData.storyType === 'image'
                ? new ImageStory({
                    htmlContainer: storyHtmlEl,
                    url: storyData.storyUrl,
                    duration: this.duration
                })
                : new VideoStory({
                    htmlContainer: storyHtmlEl,
                    url: storyData.storyUrl,
                    duration: this.duration
                });

            // story.onProgress((progress) => {
            //     this.progressLineContainer.children[index].style.setProperty('--value', 100*progress + '%');
            // })
            return story;
        })
    }

    _render() {
        const i = this.activeStoryIndex;
        const prevIndex = this.prevActiveStoryIndex;
        const stories = this.stories;
        const prevItems = this.prevItems;

        const items = [stories[i - 1], stories[i], stories[i + 1]];

        items.forEach((story, index) => {
            if (!story) return;

            if (index === 1) {
                story.htmlContainer.classList.add('active');
            } else {
                story.htmlContainer.classList.remove('active');
            }

            if (!prevItems.includes(story)) {
                story.isInit || story.init();
                prevIndex < i
                    ? this.storiesContainer.append(story.htmlContainer)
                    : this.storiesContainer.prepend(story.htmlContainer)
            }

        })

        prevItems.forEach(story => {
            if (!story) return;

            if (!items.includes(story)) {
                story.htmlContainer.remove();
            }
        })

        this.prevItems = items;
        this.prevActiveStoryIndex = i;

        this._checkIndexPosition();
    }

    _checkIndexPosition() {
        if (this.activeStoryIndex === this.stories.length - 1) {
            this._isEnd = true
        } else {
            this._isEnd = false
        }

        if (this.activeStoryIndex === 0) {
            this._isStart = true
        } else {
            this._isStart = false
        }
    }

    _setEvents() {
        this.stories.forEach((story, index) => {
            const line = this.progressLineContainer.children[index];
            story.onProgress((progress) => {
                if (this.activeStoryIndex !== index) return;
                this._setProgress(line, progress);
            })

            story.onEnd(() => {
                if (!this.isEnd) {
                    this.next();
                } else {
                    this.endFns.forEach(fn => fn());
                }
            })

            story.onReady(() => {

            })
        })
    }

    _setProgress(line, progress) {
        if (this.progressAnimation) {
            line.style.removeProperty('transition');
        } else {
            line.style.setProperty('transition', 'all 0s linear');
        }
        line.style.setProperty('--value', 100 * progress + '%');
    }

    _removeProgressAnimation() {
        this.progressAnimation = false;

        setTimeout(() => {
            this.progressAnimation = true;;
        }, 300)
    }
}

class StoryCard {
    constructor({
        cardId,
        htmlShimmerElement
    }) {
        this.cardId = cardId;
        this.htmlShimmerElement = htmlShimmerElement;
        this.htmlCardElement = null;
        this.stories = null;
        this.loadFns = [];
        this.canPlayFns = [];
        this.onEndFns = [];
        this.changeFns = [];
        this.onBeforeStartFns = [];
        this.storyCardData = null;
    }

    async init() {
        try {
            const storyData = await StoriesApi.getById({ id: this.cardId });
            this.storyCardData = storyData;
            this.loadFns.forEach(fn => fn(storyData));

            this._crateCard(storyData);

            this._initStories(storyData.stories);

            this._initEvents();
        } catch (error) {
            console.log(error);
        }
    }

    onLoad(fn) {
        this.loadFns.push(fn);
    }

    onCanPlay(fn) {
        this.canPlayFns.push(fn);
    }

    onEnd(fn) {
        this.onEndFns.push(fn);
    }

    onBeforeStart(fn) {
        this.onBeforeStartFns.push(fn);
    }

    onStoryChange(fn) {
        this.changeFns.push(fn);
    }

    play() {
        if (!this.stories) return;
        this.stories.play();
    }
    pause() {
        if (!this.stories) return;
        this.stories.pause();
    }

    next() {
        if (!this.stories) return;
        this.stories.next();
    }

    prev() {
        if (!this.stories) return;
        this.stories.prev();
    }

    hidePreview() {
        if (!this.htmlCardElement) return;
        const previewEl = this.htmlCardElement.querySelector('.stories-card__preview');
        previewEl.style.setProperty('display', 'none');
    }

    showPreview() {
        if (!this.htmlCardElement) return;
        const previewEl = this.htmlCardElement.querySelector('.stories-card__preview');
        previewEl.style.removeProperty('display');
    }

    _crateCard(storyData) {
        this.htmlShimmerElement.insertAdjacentHTML('beforeend', `
            <div class="stories-card__body">
                <div class="stories-card__top">
                    <div class="stories-card__progress-lines"></div>
                    <div class="stories-card__nav">
                        <a href="#" class="stories-card__nav-right">
                            <img  alt="Business logo" src="${storyData.logoUrl}">
                            ${storyData.companyTitle}
                        </a>
                        <div class="stories-card__nav-left">
                            <button type="button" class="stories-card__play-pause-btn" >
                                <img class="play-icon" src="data:image/svg+xml,%3csvg%20width='12px'%20height='20px'%20viewBox='0%200%2018%2018'%20xmlns='http://www.w3.org/2000/svg'%20fill='%23ffffff'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cpath%20d='M4.154%200C2.964%200%202%20.951%202%202.125v13.75c0%20.784.437%201.504%201.138%201.874.7.37%201.55.329%202.211-.106l9.693-6.875A2.117%202.117%200%200016%209c0-.71-.36-1.374-.96-1.768L5.349.357A2.172%202.172%200%20004.154%200z'%20fill='%23ffffff'%20fill-rule='nonzero'%3e%3c/path%3e%3c/g%3e%3c/svg%3e" alt="play">
                                <img class="pause-icon" src="data:image/svg+xml,%3csvg%20width='14px'%20height='20px'%20viewBox='0%200%20512%20512'%20xmlns='http://www.w3.org/2000/svg'%20fill='%23ffffff'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cpath%20fill='%23ffffff'%20d='M120.16%2045A20.162%2020.162%200%200%200%20100%2065.16v381.68A20.162%2020.162%200%200%200%20120.16%20467h65.68A20.162%2020.162%200%200%200%20206%20446.84V65.16A20.162%2020.162%200%200%200%20185.84%2045h-65.68zm206%200A20.162%2020.162%200%200%200%20306%2065.16v381.68A20.162%2020.162%200%200%200%20326.16%20467h65.68A20.162%2020.162%200%200%200%20412%20446.84V65.16A20.162%2020.162%200%200%200%20391.84%2045h-65.68z'%3e%3c/path%3e%3c/g%3e%3c/svg%3e" alt="pause">
                            </button>
                            <div class="stories-card__dropdown drop-down">
                                <div class="drop-down__icon">
                                    <img src="data:image/svg+xml,%3csvg%20width='22'%20height='22'%20viewBox='0%200%2022%2022'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M7.67343%2010.2588C8.26972%2010.2588%208.75311%2010.7422%208.75311%2011.3385C8.75311%2011.9348%208.26972%2012.4181%207.67343%2012.4181C7.07714%2012.4181%206.59375%2011.9348%206.59375%2011.3385C6.59375%2010.7422%207.07714%2010.2588%207.67343%2010.2588ZM11.1284%2010.2588C11.7247%2010.2588%2012.2081%2010.7422%2012.2081%2011.3385C12.2081%2011.9348%2011.7247%2012.4181%2011.1284%2012.4181C10.5321%2012.4181%2010.0487%2011.9348%2010.0487%2011.3385C10.0487%2010.7422%2010.5321%2010.2588%2011.1284%2010.2588ZM14.5834%2010.2588C15.1797%2010.2588%2015.6631%2010.7422%2015.6631%2011.3385C15.6631%2011.9348%2015.1797%2012.4181%2014.5834%2012.4181C13.9871%2012.4181%2013.5037%2011.9348%2013.5037%2011.3385C13.5037%2010.7422%2013.9871%2010.2588%2014.5834%2010.2588Z'%20fill='white'/%3e%3c/svg%3e" alt="ellipsis">
                                </div>
                                <div class="drop-down__content">
                                    <ul>
                                        <li>

                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <button type="button" class="stories-card__close" data-action="close-stories" >
                                <img id="actionImg" class="p-1" src="data:image/svg+xml,%3csvg%20width='24'%20height='25'%20viewBox='0%200%2024%2025'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6%2018.5L18%206.5M6%206.5L18%2018.5'%20stroke='white'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e" alt="x-icon">
                            </button>
                        </div>
                    </div>
                </div>
                <div class="stories-card__stories">
                </div>
                <div class="stories-card__info">
                    <div class="stories-card__info-item">
                        כל הארץ 
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABJCAYAAABxcwvcAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARKSURBVHgB7Zz7VdswFMY/evp/6QRVJ6hHcDfoBk0ngA1IJyidgGxAN3A2ACZImACY4Kt0ZB9kSQ6+cmIrwb9z7olx/JCv70uPAMzMzMzMzJwaZ5gIkoX+MPJNy7kW5Xz9rGWr5VHL/dnZ2RrvAa2Ucy2XWiotT5RTaVloUTg1auVcJSqmi5sxlXUwdzPK0R8XWi5h3SlG41b33v7zWood5xpWWn5rd9zi2NAKKrVs2O02xu2Kntcq+OqmMTZaFjgmaF2ry0VKDMC4mJZVx/WvcAzUiohZjsIe2aGsW1o3z5OIgkygvsQBoc12G+++d1kqKqKgDUfKPrVV+Yq6RU4wjEGjKchpQ0xRf5ADtFlsUgU5bYkp6gemhLZI3HgxSGFCakU9eW2aLj5F3OygQbovxnqycLv6jbncICNoSwEXhbFhmM0UMiLidtcYQFLfzcQivA5trHTf6RcSoa3C3SET05970LLW171HIvq6S/3RVOHmml/19Z4xBrQF3GAros2MFXdTDbi+HxLGi5mev98hAX3eBWUk9cvYfgkVxoJtXxe/HcY7wE+18m/YPSgnVhTt6IF7j8OXA7TDFi69hjuc81Xk4ZexxtcP6CurhIDI/UTnJ0GvBoEQhjGoeOP4wlOU2GU40PINHyDDfShR5qENwKWz6/db2av+/q+zq0ywhq2zrZCAVEnK2X6EDLcfZVJx39rluj6+QeTisOVEg0ICUiV9cbafIKNlhX1rlvq4tbPrG2S49/mEBKRK2hdbyHhxthVkDC4gpUraV8WqIMO1gC1kDE77UiW5b/QzZLhBuqCsZimd7QfIcEPECxKQKmnrbEtjwz9n2yioVzrWyrxA2xrWkOGeu8WhYdhvE5lyYp3Eqesk6Q0HVbCRhzZcRY7rmhpXEBC5X4kx8Bq+hBC2+1MN5poVbd/tlvG+2xJCvHtJS5Z02J4UTOpZ0/bXJCyRANvu/Q9jwXCGpEQCtK5bvaGcauD1XRZI5CPkmFRu6qUmaJeQZxzUK0G+08YZ02Vxs6VJ80MXb114f68xJvrBrp03NO20TQdsT3eNP1ERcbklMoJhqVJiCtiOJ1lZk2dF4w3bRhqSpTUxHB5eYEoi1qQwIQzXA0xnRV6jmEujmOukKduZzjDJmgCGwTqfqXdmsLok4mYb5mJFDQyD+Khux3CBxAI5EnG7UZa8MMxmWa1waVG73Z3X4J84IAzXIm2Y8+pbA+MrzaRTQEPupXAMdLxdhT3C+PrILFba9YbheNHe3IBhNjUscYwwXLG/l0XoDOPeCscMw0G1QYpiWFHnufpfAuMZL+nBGP/VwXErqKEjhvRWVH3+bURBCqcE49no7q0H7bDE01NQQ4eiOh9YevzJsMMyCu+4ggmWdzJ0xBjW+0x9VUW+O/4slgLDDnEXK7xnuHsm9+C/vOzLZP9hooGvC06bEYPmZxPXo/3MYWZmZmZmZmZmJon/actBvNX5awcAAAAASUVORK5CYII=" alt="location">
                    </div>
                    <div class="stories-card__info-item">
                        תחום 
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAA6CAYAAAAA0F95AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKVSURBVHgB7Zv/ddowEMe/7uv/ZYO6EzQjiA3YIDBBRoBOkHQC6ATNBnYnCJ0AdwLoBJdTdArCMf5tvzjS5717lmUhTl8LyT4JIOA3EQaGiGI+KDQni6IoxVTRDWdLqBsHtgWmiDjfFwoD8RkDwA4v+RDLacb2k+2EZii2W0lv2b5hKtBl14/Rkr7qKeMThiGWox7IMrTnT0GdvTKUAJMhCADPuZgFhhhoOtb5xUnHffhXOCZxxXdsR/KHLYmYEZk5ewv/SLk3zLUAT3xyI5k7fHwUzlPqHE63SOABusc7bV6GaRCeEwSA5wQB4DlBAHhOEACeEwSA5wQB4DmuADMaKPb+XiCzwnSXz3Q5uuGij4JuOBWvUy70xQ0V8yTBgxgTRBq9puJY50FCga+FdcT1ga6TiFAKLSETeD3UsC3bDA3Rn5FG31P5wux9WSWWsgjx0RWkjrMicBM2NetcSIMTuu6z9deydOuJ8gJIMmVb4bxCqyr80Su/e5iV4H9yzCRfm17jt8pnJfXETpk520zy7PErTADX5lX584vtUb7fRr5XHA3eFX7KUSnJ5c9E7R2ZsaELClegbnsKtF/6Z/ymV1IuEOpeq7U/gBU7iZKPVhCYO6HYvsPckRuMRwbTS//C3Om9+NiYVhsk5MtSsVdYGC2C7a6xpPXylkKz5W0r+H9JZ9Y6Lre/odcdIuzcviifzKC2Rn1OXNcKIzDIFpkK1izI7ZVrjae/rowlQIpzD1A1y4/CKC9Dst/vR83iTcp2ZrSfAIugH5weUNHN+x7kqhh1DJDZo9V0NRQhHgDPCQLAc4IA8JwgADwnCADPCZulc+f6Of0l3MUvLr/xzp7bO+CG6y7alI8Kb9AscjM1dEjt4r9Hz1mjhUbM6z8yAAAAAElFTkSuQmCC" alt="suitcase">
                    </div>
                    <div class="stories-card__info-item">
                        34 לשעה 
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIXSURBVHgB7dvxUcIwFAbwr57/wwaygY4AG7CBOIFuIG7gBuIE4gTUDdzAMoE4QX1Pq3KQ+pICBZLvd5erBmPha5qm1wAQERERERERHZgMW1SWZU82WrpV+dFZ+d3H3FG3qMrXz1mWvcL/ffVX/5e0n2KXZMddKddSZlLey3bNAt7nyNH+zaftKRqSHQxl84DwnnFUTtCAhDOWzRMiD0cFB1SFc4tEBJ1iei7DDmd5IFUFNqO9tIdj6K06sNUMmFqvg/UZdqBmkD2sQbrqPT3HS3qpHcglc4EIhYxBl466AhGHo7wCKt0TLTWOORzl24MuauqfETnfgM4ddXnsvUf5BuS6xEYfjtokoAIJaHSrkZJNAor+Pkw1vpsPIdOEPtYnmYUM8jkOXCsB4XuSOVqpm0jJceA4BhkYkIEBGRiQgQEZGJCBARkYkIEBGRiQgQEZjiIguamdZOsGaAF7kIEBGRiQIZWAOo66Ah5SCajvqPN6KpNKQK4Hnzk8RB+QsejCFHVA1ZoC13omfWDwAg/RBlSFo8sEe46X7+GpracaLt3qQ6yRo1vUNaprg79VaLqIqy9lWPN3BQIWXewzoCFqPoSEgB0a/3cAVqU2UdRwHkMapBKQznluJJw7BNrnKdaWXMpVyGm1rK2A9AgWWP8Oxy72o0XnOLmUqQQzxwa2+mWWJmRA1sA6aO4jhZVuRERERERERL8+AZ1TT9IC/N6+AAAAAElFTkSuQmCC" alt="dollar">
                    </div>
                </div>
            </div>
            <div class="stories-card__footer">
                <div class="stories-card__description"></div>
                <button type="button" class="stories-card__apply">
                    נראה כמו כיוון
                </button>
            </div>
            <div class="stories-card__preview">
                <div class="stories-card__preview-img" style="background-image: url(${storyData.storyPreview});">
          
                </div>
                <div class="stories-card__preview-logo">
                    <img  alt="Business logo" src="${storyData.logoUrl}">
                    <div class="stories-card__preview-company-title">
                        ${storyData.companyTitle}
                    </div>
                </div>
            </div>    
        `)
        this.htmlShimmerElement.className = 'stories-card';
        this.htmlShimmerElement.setAttribute('data-id', storyData.id);

        this.htmlCardElement = this.htmlShimmerElement;
        this.htmlShimmerElement = null;
    }

    _initStories(storiesData) {
        const stories = new Stories({
            storiesContainer: this.htmlCardElement.querySelector('.stories-card__stories'),
            progressLineContainer: this.htmlCardElement.querySelector('.stories-card__progress-lines'),
            btnPlayPause: this.htmlCardElement.querySelector('.stories-card__play-pause-btn'),
            stories: storiesData
        });

        this.stories = stories;

        stories.onReady(() => {
            this.canPlayFns.forEach(fn => fn());
        })
        stories.onEnd(() => {
            this.onEndFns.forEach(fn => fn());
        })
        stories.onStoryChange(() => {
            this.changeFns.forEach(fn => fn());
        })
        stories.init();


    }

    _initEvents() {
        if (!this.stories) return;
        if (!this.htmlCardElement) return;

        const playPauseBtn = this.htmlCardElement.querySelector('.stories-card__play-pause-btn');
        const storiesContainer = this.htmlCardElement.querySelector('.stories-card__stories');

        playPauseBtn.addEventListener('click', () => {
            if (playPauseBtn.classList.contains('pause')) {
                this.stories.pause();
            } else {
                this.stories.play();
            }
        })

        // let id;
        // let start = null;
        // storiesContainer.addEventListener('pointerdown', () => {
        //     start = performance.now();
        //     id = setTimeout(() => {
        //         this.stories.pause();
        //     }, 100)
        // })
        // storiesContainer.addEventListener('pointerup', (e) => {
        //     const time = performance.now() - start;
        //     if(time < 100) {
        //         clearTimeout(id)

        //         if (isMobile() && document.documentElement.clientWidth < 920) {
        //             const leftSide = storiesContainer.clientWidth * 0.75;

        //             if(e.clientX > leftSide) {
        //                 if(this.stories.isStart) {
        //                     this.onBeforeStartFns.forEach(fn => fn());
        //                     return;
        //                 }
        //                 this.stories.prev();
        //             } else {
        //                 if(this.stories.isEnd) {
        //                     this.onEndFns.forEach(fn => fn());
        //                     return;
        //                 }
        //                 this.stories.next();
        //             }
        //         } else {
        //             if(!playPauseBtn.classList.contains('pause')) {
        //                 this.stories.play();
        //             }
        //         }
        //     } else {
        //         this.stories.play();
        //     }
        // })

        const touchArea = storiesContainer;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let touchStartTime = 0;
        let longPressTimeout;
        const LONG_PRESS_DURATION = 100; 

        touchArea.addEventListener('pointerdown', (e) => {
            touchStartX = e.clientX;
            touchStartY = e.clientY;
            touchStartTime = performance.now();
            longPressTimeout = setTimeout(() => {

                //console.log('long click');
            }, LONG_PRESS_DURATION);

            this.stories.pause();
        });

        touchArea.addEventListener('pointerup', (e) => {
            clearTimeout(longPressTimeout);
            touchEndX = e.clientX;
            touchEndY = e.clientY;
            const timeDiff = performance.now() - touchStartTime;
            this.stories.play();
            if (timeDiff < LONG_PRESS_DURATION) {
                if (Math.abs(touchEndX - touchStartX) < 5 && Math.abs(touchEndY - touchStartY) < 5) {
                    //console.log('fast click');

                    if (isMobile() && document.documentElement.clientWidth < 920) {
                        const leftSide = storiesContainer.clientWidth * 0.75;

                        if (e.clientX > leftSide) {
                            if (this.stories.isStart) {
                                this.onBeforeStartFns.forEach(fn => fn());
                                return;
                            }
                            this.stories.prev();
                        } else {
                            if (this.stories.isEnd) {
                                this.onEndFns.forEach(fn => fn());
                                return;
                            }
                            this.stories.next();
                        }
                    }
                }
            }
        });

        touchArea.addEventListener('pointermove', (e) => {
            if (performance.now() - touchStartTime < LONG_PRESS_DURATION) {
                touchEndX = e.clientX;
                touchEndY = e.clientY;
                if (Math.abs(touchEndX - touchStartX) > 10 || Math.abs(touchEndY - touchStartY) > 10) {
                    clearTimeout(longPressTimeout);
                    //console.log('swipe');
                }
            }
        });


        touchArea.addEventListener('pointercancel', () => {
            clearTimeout(longPressTimeout);
        });

        touchArea.addEventListener('pointerleave', () => {
            clearTimeout(longPressTimeout);
        });
    }
}
