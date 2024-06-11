
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