class StoriesApi {
    static delay = 400;

    static async fetch(url) {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        if(res.ok) {
            const result = await res.json();
            return await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(result)
                }, this.delay);
            });
        } else {
            throw new Error('StoriesApi fetching error');
        }
    }

    static async get({ page, size }) {
        const { companies } = await this.fetch('./public/data.json');
        return companies.slice(size * (page - 1), (size * (page - 1)) + size);
    }
    static async getById({ id }) {
        const { companies } = await this.fetch('./public/data.json');
        return companies.find(c => c.id === id);
    }
}




function isSafari() {
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return isSafari;
}
function Android() {
    return navigator.userAgent.match(/Android/i);
}
function BlackBerry() {
    return navigator.userAgent.match(/BlackBerry/i);
}
function iOS() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
}
function Opera() {
    return navigator.userAgent.match(/Opera Mini/i);
}
function Windows() {
    return navigator.userAgent.match(/IEMobile/i);
}

function isMobile() {
    return (Android() || BlackBerry() || iOS() || Opera() || Windows());
}

function slideUp(target, duration = 500) {
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.height = target.offsetHeight + 'px';
    target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
        target.style.display = 'none';
        target.style.removeProperty('height');
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
        target?.classList.remove('_slide');
    }, duration);
}
function slideDown(target, duration = 500) {
    target.style.removeProperty('display');
    let display = window.getComputedStyle(target).display;
    if (display === 'none')
        display = 'block';

    target.style.display = display;
    let height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    window.setTimeout(() => {
        target.style.removeProperty('height');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
        target?.classList.remove('_slide');
    }, duration);
}
function slideToggle(target, duration = 500) {
    if (!target?.classList.contains('_slide')) {
        target?.classList.add('_slide');
        if (window.getComputedStyle(target).display === 'none') {
            return this.slideDown(target, duration);
        } else {
            return this.slideUp(target, duration);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (isMobile()) {
        document.body.classList.add('mobile-device');
    }

    document.addEventListener('contextmenu', function (event) {
        if (event.target.tagName === 'IMG') {
            event.preventDefault();
        }
        if (event.target.tagName === 'VIDEO') {
            event.preventDefault();
        }
    })

    const clientScreenWidth = document.documentElement.clientWidth;

    window.addEventListener('resize', () => {
        if (
            document.documentElement.clientWidth >= 920
            && clientScreenWidth < 920
        ) {
            window.location.reload();
        }

        if (
            document.documentElement.clientWidth < 920
            && clientScreenWidth >= 920
        ) {
            window.location.reload();
        }
    })

    {
    const storiesNavigation = document.querySelector('[data-slider="stories-nav"]');
    if (storiesNavigation) {
        if (isMobile() && document.documentElement.clientWidth < 920) {
            initMobileSlider();
        } else {
            initDesktopSlider();
        }

        function createSlides(stories) {
            const slides = stories.map(story => {

                const slide = document.createElement('div');
                slide.className = 'swiper-slide';

                slide.insertAdjacentHTML('beforeend', `
                <button data-action="open-stories" data-id="${story.id}" class="stories-nav-item">
                    <img src="${story.logoUrl}" alt="">
                </button>    
            `)
                return slide;
            })
            return slides;
        }

        function initMobileSlider() {
            let currentPage = 1;
            let isLoading = false;
            const size = 12;
            const swiper = storiesNavigation.querySelector('.swiper');
            const wrapper = storiesNavigation.querySelector('.swiper-wrapper');
            const totalItems = 18;

            loadFirstNavItems(wrapper);

            swiper.addEventListener('scrollend', async (e) => {
                if (e.target.scrollLeft < 0) {
                    const loadedChunk = Math.ceil((wrapper.children.length / size));

                    if ((loadedChunk + 1) !== currentPage) return;

                    await loadNextNavItems(wrapper);

                    if (Math.ceil(totalItems / size) < currentPage) {
                        wrapper.style.setProperty('padding-left', '0px');
                    }
                }
            })


            async function loadFirstNavItems(wrapper) {
                isLoading = true;

                const stories = await StoriesApi.get({ page: currentPage++, size });
                const slides = createSlides(stories);
                Array.from(wrapper.children).forEach(child => child.remove());
                wrapper.append(...slides);

                isLoading = false;

            }

            async function loadNextNavItems(wrapper) {
                isLoading = true;

                const stories = await StoriesApi.get({ page: currentPage++, size });
                const slides = createSlides(stories);

                wrapper.append(...slides);

                isLoading = false;
            }

        }

        function initDesktopSlider() {
            let currentPage = 1;
            let isLoading = false;
            const size = 15;
            const wrapper = storiesNavigation.querySelector('.swiper-wrapper');
            const totalItems = 18;

            const swiper = new Swiper(storiesNavigation.querySelector('.swiper'), {
                speed: 500,
                watchSlidesProgress: true,
                watchSlidesVisibility: true,
                slidesPerView: 10,
                spaceBetween: 20,
                slidesPerGroup: 5,
                touchRatio: 0,
                navigation: {
                    nextEl: storiesNavigation.querySelector('.btn-left'),
                    prevEl: storiesNavigation.querySelector('.btn-right'),
                }
            });

            loadFirstNavItems(wrapper);

            swiper.on('slideChange', (swiper) => {
                if (swiper.isEnd) {
                    const currentChunk = Math.ceil((swiper.visibleSlidesIndexes.at(-1) + 1) / size);

                    if ((currentChunk + 1) !== currentPage) return;

                    if (isLoading) return;

                    loadNextNavItems(wrapper);
                }
            })

            async function loadFirstNavItems(wrapper) {
                isLoading = true;

                const stories = await StoriesApi.get({ page: currentPage++, size });
                const slides = createSlides(stories);
                swiper.removeAllSlides();
                swiper.appendSlide(slides);

                isLoading = false;

            }


            async function loadNextNavItems(wrapper) {
                isLoading = true;

                const stories = await StoriesApi.get({ page: currentPage++, size });
                const slides = createSlides(stories);

                swiper.appendSlide(slides);

                isLoading = false;
            }
        }
    }

}
    
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
        // const img = document.createElement('img');
        // img.src = this.url;

        // this.htmlContainer.append(img);
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
        this.duration = 3;
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
                <div class="stories-card__preview-img">
                    <img src="${storyData.storyPreview}" alt="">
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

    
{
    const storiesCarousel = document.querySelector('[data-slider="stories-carousel"]');
    if (storiesCarousel) {
        const wrapper = storiesCarousel.querySelector('.swiper-wrapper');
        const btnLeft = storiesCarousel.querySelector('.btn-left');
        const btnRight = storiesCarousel.querySelector('.btn-right');
        const popup = document.querySelector('[data-stories-popup]');


        storiesCarousel.addEventListener('touchmove', function (event) {
            const touches = event.touches;
            if (touches && (touches[0].clientY < 50 || touches[0].clientY > window.innerHeight - 50)) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, { passive: false });

        if (document.documentElement.clientWidth < 920) {
            initMob();
        } else {
            initDesk();
        }


        function initMob() {
            initCarousel({ initSwiper: initMobSwiper });
        }
        function initDesk() {
            initCarousel({ initSwiper: initDeskSwiper, initEvents });
        }

        function initMobSwiper({ updateActiveSlide, loadMoreStoriesCards }) {
            return new Swiper(storiesCarousel.querySelector('.swiper'), {
                effect: "cube",
                grabCursor: true,
                speed: 400,
                threshold: 10,
                cubeEffect: {
                    shadow: true,
                    slideShadows: true,
                    shadowOffset: 20,
                    shadowScale: 0.94,
                },
                on: {
                    slideChangeTransitionStart: async (swiper) => {
                        await updateActiveSlide(swiper);

                        setTimeout(() => {
                            loadMoreStoriesCards(swiper);
                        }, 400);
                    }
                }
            })
        }

        function initDeskSwiper({ checkButtonsVisibility, updateActiveSlide, loadMoreStoriesCards }) {
            return new Swiper(storiesCarousel.querySelector('.swiper'), {
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 1,
                touchRatio: 0,
                grabCursor: false,
                speed: 400,
                on: {
                    init: (swiper) => {
                        checkButtonsVisibility(swiper);
                    },
                    slideChangeTransitionStart: async (swiper) => {
                        await updateActiveSlide(swiper);

                        setTimeout(() => {
                            loadMoreStoriesCards(swiper);
                        }, 400);

                        checkButtonsVisibility(swiper);
                    }
                }
            })
        }

        function initEvents({ slideTo, nextSlide, prevSlide, swiper }) {


            storiesCarousel.addEventListener('click', (e) => {
                if (e.target.closest('.stories-card')) {
                    const slide = e.target.closest('.swiper-slide');

                    if (!slide.classList.contains('swiper-slide-active')) {
                        const index = Array.from(wrapper.children).indexOf(slide);
                        slideTo(index);
                    }
                }
            })

            btnLeft.addEventListener('click', () => {
                const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                if (!storyCard) return;
                if (!storyCard.stories) return;

                if (storyCard.stories.isEnd) {
                    nextSlide();
                } else {
                    storyCard.stories.next();
                }
            })
            btnRight.addEventListener('click', () => {
                const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                if (!storyCard) return;
                if (!storyCard.stories) return;

                if (storyCard.stories.isStart) {
                    prevSlide();
                } else {
                    storyCard.stories.prev();
                }
            })
        }

        function initCarousel({ initSwiper, initEvents }) {

            let prevStoryCard = null;

            const swiper = initSwiper({ checkButtonsVisibility, updateActiveSlide, loadMoreStoriesCards });

            if (initEvents) {
                initEvents({ slideTo, nextSlide, prevSlide, swiper })
            }

            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="open-stories"]')) {
                    e.preventDefault();
                    const btn = e.target.closest('[data-action="open-stories"]');
                    const id = btn.getAttribute('data-id');
                    if (!id) return;
                    const isSingleStory = btn.hasAttribute('data-single');

                    openPopup();

                    storiesController({
                        id,
                        isSingleStory
                    })
                }

                if (e.target.closest('[data-action="close-stories"]')) {
                    e.preventDefault();
                    closePopup();
                    const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                    if (!storyCard) return;
                    storyCard.pause();
                    storyCard.stories.reset();
                }
            })

            function checkButtonsVisibility(swiper) {
                swiper.isBeginning ? btnRight.classList.add('hidden') : btnRight.classList.remove('hidden');
                swiper.isEnd ? btnLeft.classList.add('hidden') : btnLeft.classList.remove('hidden');

                const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                if (!storyCard) return;
                if (!storyCard.stories) return;
                storyCard.stories.isStart ? btnRight.classList.add('stories-start') : btnRight.classList.remove('stories-start');
                storyCard.stories.isEnd ? btnLeft.classList.add('stories-end') : btnLeft.classList.remove('stories-end');
            }

            function checkIsCardExist(companyId) {
                return Array.from(wrapper.children).some(slide => {
                    const card = slide.firstElementChild;
                    if (!card) return false;
                    return card.getAttribute('data-id') == companyId;
                });

            }

            function createShimmerAndSlide() {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                const shimmer = document.createElement('div');
                shimmer.className = 'stories-card-shimmer';
                slide.append(shimmer);

                return {
                    slide,
                    shimmer
                };
            }

            async function updateActiveSlide(swiper) {
                const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                if (!storyCard) return;
                if (!storyCard.storyCardData) {
                    await new Promise(res => {
                        storyCard.onCanPlay(() => {
                            res();
                        })
                    })
                }
                if (!storyCard.stories) return;
                storyCard.hidePreview();
                storyCard.play();

                prevStoryCard?.showPreview();
                prevStoryCard?.stories?.reset();

                prevStoryCard = storyCard;
            }

            async function slideTo(index) {
                swiper.slideTo(index);

                //console.log('index', index);
                // await updateActiveSlide();

                // setTimeout(() => {
                //     loadMoreStoriesCards();
                // }, 400);
            }

            async function nextSlide() {
                swiper.slideNext();

                // await updateActiveSlide();

                // setTimeout(() => {
                //     loadMoreStoriesCards();
                // }, 400);

                // checkButtonsVisibility(swiper);
            }

            async function prevSlide() {
                swiper.slidePrev();

                // await updateActiveSlide();

                // setTimeout(() => {
                //     loadMoreStoriesCards();
                // }, 400);
            }

            function loadSideCards(data) {
                if (data.hasNext) {
                    const isSlideExist = swiper.slides.some(slide => slide.storyCard.cardId == data.hasNext);
                    if (isSlideExist) return;

                    const { slide, shimmer } = createShimmerAndSlide();
                    swiper.appendSlide(slide);

                    slide.storyCard = new StoryCard({
                        cardId: data.hasNext,
                        htmlShimmerElement: shimmer
                    });

                    slide.storyCard.onLoad((data) => {
                        if (data.hasNext) {
                            const { slide, shimmer } = createShimmerAndSlide();
                            swiper.appendSlide(slide);

                            slide.storyCard = new StoryCard({
                                cardId: data.hasNext,
                                htmlShimmerElement: shimmer
                            });

                            slide.storyCard.onEnd(() => {
                                nextSlide();
                            })

                            slide.storyCard.onBeforeStart(() => {
                                prevSlide();
                            })

                            slide.storyCard.onStoryChange(() => {
                                checkButtonsVisibility(swiper);
                            })

                            slide.storyCard.init();
                        }
                    })

                    slide.storyCard.onEnd(() => {
                        nextSlide();
                    })

                    slide.storyCard.onBeforeStart(() => {
                        prevSlide();
                    })

                    slide.storyCard.onStoryChange(() => {
                        checkButtonsVisibility(swiper);
                    })

                    slide.storyCard.init();
                }

                if (data.hasPrevious) {
                    const isSlideExist = swiper.slides.some(slide => slide.storyCard.cardId == data.hasPrevious);
                    if (isSlideExist) return;

                    const { slide, shimmer } = createShimmerAndSlide();
                    swiper.prependSlide(slide);

                    slide.storyCard = new StoryCard({
                        cardId: data.hasPrevious,
                        htmlShimmerElement: shimmer
                    });

                    slide.storyCard.onLoad((data) => {
                        if (data.hasPrevious) {
                            const { slide, shimmer } = createShimmerAndSlide();
                            swiper.prependSlide(slide);

                            slide.storyCard = new StoryCard({
                                cardId: data.hasPrevious,
                                htmlShimmerElement: shimmer
                            });

                            slide.storyCard.onEnd(() => {
                                nextSlide();
                            })

                            slide.storyCard.onBeforeStart(() => {
                                prevSlide();
                            })

                            slide.storyCard.onStoryChange(() => {
                                checkButtonsVisibility(swiper);
                            })

                            slide.storyCard.init();
                        }
                    })

                    slide.storyCard.onStoryChange(() => {
                        checkButtonsVisibility(swiper);
                    })

                    slide.storyCard.onEnd(() => {
                        nextSlide();
                    })

                    slide.storyCard.onBeforeStart(() => {
                        prevSlide();
                    })

                    slide.storyCard.init();
                }
            }

            function storiesController({
                id: companyId,
                isSingleStory = false
            }) {
                const isCardExist = checkIsCardExist(companyId);

                if (isCardExist) {
                    const index = (Array.from(wrapper.children).findIndex(slide => {
                        if(slide.classList.contains('swiper-cube-shadow')) return;
                        const card = slide.firstElementChild;
                        return card.getAttribute('data-id') == companyId;
                    })) -1 ;

                    if(swiper.activeIndex === index) {
                        const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                        if (!storyCard) return;
                        storyCard.play();
                    } else {
                        swiper.slideTo(index, 0);
                    }
                } else {
                    swiper.removeAllSlides();
                    const { slide, shimmer } = createShimmerAndSlide();
                    swiper.appendSlide(slide);

                    slide.storyCard = new StoryCard({
                        cardId: companyId,
                        htmlShimmerElement: shimmer
                    });

                    slide.storyCard.onLoad((data) => {
                        if (isSingleStory) return;
                        loadSideCards(data);
                    })

                    slide.storyCard.onCanPlay(() => {
                        checkButtonsVisibility(swiper);
                        slide.storyCard.hidePreview();
                        slide.storyCard.play();
                    })

                    slide.storyCard.onEnd(() => {
                        nextSlide();
                    })
                    slide.storyCard.onBeforeStart(() => {
                        prevSlide();
                    })

                    slide.storyCard.onStoryChange(() => {
                        checkButtonsVisibility(swiper);
                    })

                    slide.storyCard.init();

                    prevStoryCard = slide.storyCard;
                }
            }

            function checkActiveCardPosition(swiper) {
                const index = swiper.realIndex;
                const length = swiper.slides.length;

                if (length - index === 2) {
                    return 'last2'
                }
                if (length - index === 1) {
                    return 'last1'
                }
                if (length - index === length) {
                    return 'first1'
                }
                if (length - index === (length - 1)) {
                    return 'first2'
                }

                return false;
            }

            function createStoryCard({ data, twice = false, isAppend = true }) {
                const { slide, shimmer } = createShimmerAndSlide();

                isAppend ? swiper.appendSlide(slide) : swiper.prependSlide(slide);

                removeStoriesCards(isAppend);

                const next = isAppend ? data.hasNext : data.hasPrevious;

                slide.storyCard = new StoryCard({
                    cardId: next,
                    htmlShimmerElement: shimmer
                });

                if (twice) {
                    slide.storyCard.onLoad((data) => {
                        const next = isAppend ? data.hasNext : data.hasPrevious;
                        if (next) {
                            const { slide, shimmer } = createShimmerAndSlide();
                            isAppend ? swiper.appendSlide(slide) : swiper.prependSlide(slide);

                            removeStoriesCards(isAppend);

                            slide.storyCard = new StoryCard({
                                cardId: next,
                                htmlShimmerElement: shimmer
                            });

                            slide.storyCard.onEnd(() => {
                                nextSlide();
                            })

                            slide.storyCard.onBeforeStart(() => {
                                prevSlide();
                            })

                            slide.storyCard.onStoryChange(() => {
                                checkButtonsVisibility(swiper);
                            })

                            slide.storyCard.init();
                        }
                    })
                }

                slide.storyCard.onEnd(() => {
                    nextSlide();
                })

                slide.storyCard.onBeforeStart(() => {
                    prevSlide();
                })

                slide.storyCard.onStoryChange(() => {
                    checkButtonsVisibility(swiper);
                })

                slide.storyCard.init();
            }

            async function loadMoreStoriesCards(swiper) {
                const position = checkActiveCardPosition(swiper);
                if (!position) return;

                if (position === 'last2') {
                    const storyCard = swiper.slides[swiper.realIndex + 1]?.storyCard;
                    if (!storyCard) return;
                    if (!storyCard.storyCardData) {
                        await new Promise(res => {
                            storyCard.onLoad(() => {
                                res()
                            })
                        })
                    }
                    const data = storyCard.storyCardData;

                    if (data.hasNext) {
                        const isSlideExist = swiper.slides.some(slide => slide.storyCard.cardId == data.hasNext);
                        if (isSlideExist) return;
                        createStoryCard({
                            data,
                            twice: false,
                            isAppend: true
                        });

                    }

                    {
                        const storyCard = swiper.slides[swiper.realIndex - 1]?.storyCard;
                        if (!storyCard) return;
                        if (!storyCard.storyCardData) {
                            await new Promise(res => {
                                storyCard.onLoad(() => {
                                    res()
                                })
                            })
                        }
                        const data = storyCard.storyCardData;

                        if (data.hasPrevious) {
                            const isSlideExist = swiper.slides.some(slide => slide.storyCard.cardId == data.hasPrevious);
                            if (isSlideExist) return;

                            createStoryCard({
                                data,
                                twice: false,
                                isAppend: false
                            });
                        }
                    }
                }
                if (position === 'last1') {
                    const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                    if (!storyCard) return;
                    if (!storyCard.storyCardData) {
                        await new Promise(res => {
                            storyCard.onLoad(() => {
                                res()
                            })
                        })
                    }
                    const data = storyCard.storyCardData;

                    if (data.hasNext) {
                        const isSlideExist = swiper.slides.some(slide => slide.storyCard.cardId == data.hasNext);
                        if (isSlideExist) return;
                        createStoryCard({
                            data,
                            twice: true,
                            isAppend: true
                        });
                    }
                }
                if (position === 'first2') {
                    const storyCard = swiper.slides[swiper.realIndex - 1]?.storyCard;
                    if (!storyCard) return;
                    if (!storyCard.storyCardData) {
                        await new Promise(res => {
                            storyCard.onLoad(() => {
                                res()
                            })
                        })
                    }
                    const data = storyCard.storyCardData;

                    if (data.hasPrevious) {
                        const isSlideExist = swiper.slides.some(slide => slide.storyCard.cardId == data.hasPrevious);
                        if (isSlideExist) return;

                        createStoryCard({
                            data,
                            twice: false,
                            isAppend: false
                        });
                    }
                }
                if (position === 'first1') {
                    const storyCard = swiper.slides[swiper.realIndex]?.storyCard;
                    if (!storyCard) return;
                    if (!storyCard.storyCardData) {
                        await new Promise(res => {
                            storyCard.onLoad(() => {
                                res()
                            })
                        })
                    }
                    const data = storyCard.storyCardData;

                    if (data.hasPrevious) {
                        const isSlideExist = swiper.slides.some(slide => slide.storyCard.cardId == data.hasPrevious);
                        if (isSlideExist) return;

                        createStoryCard({
                            data,
                            twice: true,
                            isAppend: false
                        });
                    }
                }
            }

            function removeStoriesCards(fromStart = true) {
                const length = swiper.slides.length;
                if (length <= 5) return;

                const count = length - 5;
                let removeSlides = null;

                if (fromStart) {
                    removeSlides = swiper.slides.slice(0, count);
                } else {
                    removeSlides = swiper.slides.slice(count * -1);
                }

                const indexes = removeSlides.map(slide => swiper.slides.indexOf(slide));

                swiper.removeSlide(indexes);
            }
        }

        function openPopup() {
            toggleDisablePageScroll(true);
            compensateWidthOfScrollbar(true);
            popup.classList.add('stories-popup--open');
        }
        function closePopup() {
            toggleDisablePageScroll(false);
            compensateWidthOfScrollbar(false);
            popup.classList.remove('stories-popup--open');
        }
    }
}

function toggleDisablePageScroll(state) {
    if (state) {
        const offsetValue = getScrollbarWidth();
        document.documentElement?.classList.add('overflow-hidden');
        document.body?.classList.add('overflow-hidden');
        document.documentElement.style.paddingRight = offsetValue + 'px';
    } else {
        document.documentElement?.classList.remove('overflow-hidden');
        document.body?.classList.remove('overflow-hidden');
        document.documentElement.style.removeProperty('padding-right');
    }
}


function getScrollbarWidth() {
    const lockPaddingValue = window.innerWidth - document.querySelector('body').offsetWidth;

    return lockPaddingValue;
}

function compensateWidthOfScrollbar(isAddPadding) {

    if (isAddPadding) {
        const scrollbarWidth = getScrollbarWidth();
        document.documentElement.style.paddingRight = scrollbarWidth + 'px';
    } else {
        document.documentElement.style.paddingRight = '0px';
    }
}
});	