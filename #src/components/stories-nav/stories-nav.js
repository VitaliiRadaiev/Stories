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

                if (Math.ceil(totalItems / size) < currentPage) {
                    wrapper.style.setProperty('padding-left', '0px');
                }

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