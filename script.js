<script>
        // --- Data ---
        // Includes phonetic overrides (tts) based on standard orthography
        const vocabulary = [
            // Pronouns / People
            { id: 54, klamath: "Ni", english: "I / Me", type: 'pronoun', tts: "Nee" },
            { id: 55, klamath: "S'aam", english: "You", type: 'pronoun', tts: "Sahm" },
            { id: 50, klamath: "Hiswaqs", english: "Man", type: 'noun', tts: "Hiss-wahks" },
            { id: 51, klamath: "Sn'aeweec", english: "Woman", type: 'noun', tts: "Snah-weh-weech" },
            { id: 16, klamath: "W'aa", english: "Coyote", type: 'noun', tts: "Wah-ah" },
            
            // Verbs
            { id: 83, klamath: "Pan", english: "Eat", type: 'verb', tts: "Pahn" },
            { id: 84, klamath: "Bonwa", english: "Drink", type: 'verb', tts: "Bon-wah" },
            { id: 85, klamath: "Sle-a", english: "See", type: 'verb', tts: "Sleh-ah" },
            { id: 86, klamath: "S'abi", english: "Tell", type: 'verb', tts: "Sah-bee" },
            { id: 87, klamath: "S'ode", english: "Make/Work", type: 'verb', tts: "Soh-deh" },
            { id: 88, klamath: "Swina", english: "Sing", type: 'verb', tts: "Swee-nah" },

            // Nouns (Objects/Animals)
            { id: 11, klamath: "C'waam", english: "Sucker Fish", type: 'noun', tts: "Tch-waahm" },
            { id: 12, klamath: "Mako", english: "Cat", type: 'noun', tts: "Mah-koh" },
            { id: 13, klamath: "Wac", english: "Horse", type: 'noun', tts: "Wah-ch" },
            { id: 33, klamath: "Amb", english: "Water", type: 'noun', tts: "Ahmb" },
            { id: 91, klamath: "Pas", english: "Food", type: 'noun', tts: "Pahs" },
            { id: 90, klamath: "Lacas", english: "House", type: 'noun', tts: "Lah-chahs" },

            // Descriptors/Other
            { id: 80, klamath: "Dic", english: "Good", type: 'adj', tts: "Dee-ch" },
            { id: 81, klamath: "Qoy", english: "Bad", type: 'adj', tts: "Koy" },
            { id: 82, klamath: "Dom", english: "Many", type: 'adj', tts: "Dohm" },
            { id: 96, klamath: "Mo", english: "Very", type: 'adj', tts: "Moh" },
            
            // Full List for Vocab View
            { id: 1, klamath: "Naas", english: "One", type: 'number', tts: "Naahs" },
            { id: 2, klamath: "Laap", english: "Two", type: 'number', tts: "Lahp" },
            { id: 3, klamath: "Ndann", english: "Three", type: 'number', tts: "Ndahn" },
            { id: 4, klamath: "Woniib", english: "Four", type: 'number', tts: "Woh-neeb" },
            { id: 5, klamath: "Ton'ip", english: "Five", type: 'number', tts: "Ton-eep" },
            { id: 30, klamath: "S'abas", english: "Sun", type: 'noun', tts: "Sah-bahs" },
            { id: 31, klamath: "Ewks", english: "Moon", type: 'noun', tts: "Oo-ks" },
            { id: 32, klamath: "Geela", english: "Earth", type: 'noun', tts: "Geh-lah" },
            { id: 34, klamath: "Sla", english: "Fire", type: 'noun', tts: "Slah" },
            { id: 39, klamath: "Y'ayn'a", english: "Mountain", type: 'noun', tts: "Yai-nah" },
            { id: 41, klamath: "Koka", english: "River", type: 'noun', tts: "Koh-kah" },
            { id: 60, klamath: "Nep", english: "Hand", type: 'noun', tts: "Nep" },
            { id: 62, klamath: "Nos", english: "Head", type: 'noun', tts: "Noss" },
            { id: 63, klamath: "P'aw", english: "Eye", type: 'noun', tts: "Pow" },
            { id: 70, klamath: "Waytas", english: "Day", type: 'noun', tts: "Way-tahs" },
            { id: 71, klamath: "Psin", english: "Night", type: 'noun', tts: "P-sin" }
        ];

        // --- State ---
        let currentState = {
            view: 'vocabulary', // vocabulary, sentences, culture
            globalShowEnglish: false,
            sentence: [],
            revealedCards: new Set()
        };

        // --- Audio Logic ---
        function playAudio(text, ttsOverride) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                
                const textToSpeak = ttsOverride || text;
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                
                utterance.rate = 0.85;
                utterance.pitch = 1.0;
                
                // Try to find a good English voice
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(voice => voice.name.includes('Google US English')) || voices[0];
                if (preferredVoice) utterance.voice = preferredVoice;

                window.speechSynthesis.speak(utterance);
            } else {
                alert("Text-to-speech not supported in this browser.");
            }
        }

        // --- Core Functions ---

        function switchView(viewName) {
            currentState.view = viewName;
            
            // Update UI
            updateNavStyles();
            toggleControlsVisibility();
            renderApp();
        }

        function toggleGlobalEnglish() {
            currentState.globalShowEnglish = !currentState.globalShowEnglish;
            
            // Reset local reveals if we are hiding
            if (!currentState.globalShowEnglish) {
                currentState.revealedCards.clear();
            }
            
            // Update Toggle Button UI
            const btnDesktop = document.getElementById('btn-toggle-english');
            const btnMobile = document.getElementById('btn-toggle-english-mobile');
            
            const btnContent = currentState.globalShowEnglish 
                ? `<i data-lucide="eye" class="w-4 h-4"></i> <span>Show English</span>`
                : `<i data-lucide="eye-off" class="w-4 h-4"></i> <span>Hide English</span>`;
            
            const btnClasses = currentState.globalShowEnglish
                ? ['bg-yellow-500', 'text-gray-900', 'hover:bg-yellow-400']
                : ['bg-gray-700', 'text-white', 'hover:bg-gray-600'];

            const removeClasses = currentState.globalShowEnglish
                ? ['bg-gray-700', 'text-white', 'hover:bg-gray-600']
                : ['bg-yellow-500', 'text-gray-900', 'hover:bg-yellow-400'];

            // Apply to Desktop
            btnDesktop.innerHTML = btnContent;
            btnDesktop.classList.remove(...removeClasses);
            btnDesktop.classList.add(...btnClasses);

            // Apply to Mobile
            btnMobile.innerText = currentState.globalShowEnglish ? 'English Visible' : 'English Hidden';
            btnMobile.classList.remove(...removeClasses);
            btnMobile.classList.add(...btnClasses);
            
            renderApp();
            lucide.createIcons();
        }

        function toggleControlsVisibility() {
            const deskControls = document.getElementById('desktop-controls');
            const mobileControls = document.getElementById('mobile-controls');
            
            if (currentState.view === 'vocabulary') {
                deskControls.classList.remove('hidden');
                mobileControls.classList.remove('hidden');
            } else {
                deskControls.classList.add('hidden');
                mobileControls.classList.add('hidden');
            }
        }

        function updateNavStyles() {
            const navIds = ['vocabulary', 'sentences', 'culture'];
            navIds.forEach(id => {
                const el = document.getElementById(`nav-${id}`);
                if (id === currentState.view) {
                    el.className = "nav-btn px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 bg-white text-gray-900";
                } else {
                    el.className = "nav-btn px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700";
                }
            });
        }

        // --- Rendering Logic ---

        function renderApp() {
            const container = document.getElementById('app-content');
            container.innerHTML = ''; // Clear content

            if (currentState.view === 'vocabulary') {
                renderVocabulary(container);
            } else if (currentState.view === 'sentences') {
                renderSentenceBuilder(container);
            } else if (currentState.view === 'culture') {
                const tmpl = document.getElementById('tmpl-culture');
                container.appendChild(tmpl.content.cloneNode(true));
            }

            lucide.createIcons();
        }

        function renderVocabulary(container) {
            // Header
            const headerDiv = document.createElement('div');
            headerDiv.className = "text-center mb-12 max-w-2xl mx-auto animate-fade-in";
            headerDiv.innerHTML = `
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Vocabulary Practice</h2>
                <p class="text-gray-600">Tap cards to reveal translations or click the speaker icon to hear the word.</p>
            `;
            container.appendChild(headerDiv);

            // Grid
            const grid = document.createElement('div');
            grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in";
            
            const borderColors = ['border-yellow-400', 'border-red-600', 'border-gray-900', 'border-white'];

            vocabulary.forEach(word => {
                const accentColor = borderColors[word.id % 4];
                const isRevealed = currentState.globalShowEnglish || currentState.revealedCards.has(word.id);
                
                const card = document.createElement('div');
                card.className = `relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 bg-white rounded-xl shadow-xl border-4 ${accentColor} flex flex-col items-center justify-center p-6 text-center h-48 group select-none`;
                
                // Click handler for flip
                card.onclick = () => {
                    if (!currentState.globalShowEnglish) {
                        if (currentState.revealedCards.has(word.id)) {
                            currentState.revealedCards.delete(word.id);
                        } else {
                            currentState.revealedCards.add(word.id);
                        }
                        renderApp(); // Re-render to show state
                    }
                };

                const content = `
                    <div class="absolute top-0 left-0 w-0 h-0 border-t-[30px] border-r-[30px] border-t-red-600 border-r-transparent z-10"></div>
                    <div class="absolute bottom-0 right-0 w-0 h-0 border-b-[30px] border-l-[30px] border-b-yellow-400 border-l-transparent z-10"></div>
                    
                    <button 
                        class="btn-audio absolute top-3 right-3 z-30 bg-gray-100 p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-gray-200 transition-colors shadow-sm"
                        title="Listen"
                    >
                        <i data-lucide="volume-2" class="w-5 h-5"></i>
                    </button>

                    <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-wide serif z-10">${word.klamath}</h2>
                    
                    <div class="h-1 w-16 rounded mb-3 transition-colors duration-300 ${isRevealed ? 'bg-red-600' : 'bg-gray-200'}"></div>
                    
                    <div class="h-8 flex items-center justify-center z-10 w-full">
                        ${isRevealed 
                            ? `<p class="text-xl font-bold text-red-700 animate-fade-in">${word.english}</p>` 
                            : `<span class="text-gray-400 text-sm font-medium uppercase tracking-widest group-hover:text-red-500 transition-colors">Tap to Reveal</span>`
                        }
                    </div>
                `;
                
                card.innerHTML = content;

                // Bind audio button specifically
                const audioBtn = card.querySelector('.btn-audio');
                audioBtn.onclick = (e) => {
                    e.stopPropagation();
                    playAudio(word.klamath, word.tts);
                };

                grid.appendChild(card);
            });

            container.appendChild(grid);
        }

        function renderSentenceBuilder(container) {
            const wrapper = document.createElement('div');
            wrapper.className = "max-w-5xl mx-auto animate-fade-in";

            // Title
            const header = document.createElement('div');
            header.className = "text-center mb-8";
            header.innerHTML = `
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Sentence Builder</h2>
                <p class="text-gray-600">Click words below to arrange them into a sentence.</p>
            `;
            wrapper.appendChild(header);

            // Sentence Strip
            const strip = document.createElement('div');
            strip.className = "bg-white border-4 border-gray-900 rounded-xl p-8 min-h-[160px] shadow-2xl mb-12 relative flex flex-col items-center justify-center";
            
            if (currentState.sentence.length === 0) {
                strip.innerHTML = `<p class="text-gray-400 italic text-lg">Your sentence will appear here...</p>`;
            } else {
                const wordContainer = document.createElement('div');
                wordContainer.className = "flex flex-wrap gap-4 justify-center items-center";
                
                currentState.sentence.forEach(item => {
                    const wordEl = document.createElement('div');
                    wordEl.className = "relative group animate-fade-in cursor-pointer hover:scale-105 transition-transform";
                    wordEl.innerHTML = `
                        <div class="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg shadow-lg border-2 border-black">
                            <span class="text-2xl font-black">${item.klamath}</span>
                            <p class="text-xs uppercase font-bold text-red-800 text-center mt-1">${item.english}</p>
                        </div>
                        <div class="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <i data-lucide="x" class="w-3 h-3"></i>
                        </div>
                    `;
                    wordEl.onclick = () => {
                        removeFromSentence(item.uniqueId);
                    };
                    wordContainer.appendChild(wordEl);
                });
                strip.appendChild(wordContainer);
            }

            // Controls (Play / Clear)
            if (currentState.sentence.length > 0) {
                const controls = document.createElement('div');
                controls.className = "absolute bottom-4 right-4 flex gap-2";
                
                const playBtn = document.createElement('button');
                playBtn.className = "bg-gray-900 text-white px-4 py-2 rounded-lg font-bold uppercase text-sm hover:bg-gray-700 transition-colors flex items-center gap-2";
                playBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> Listen`;
                playBtn.onclick = playSentence;

                const clearBtn = document.createElement('button');
                clearBtn.className = "text-gray-500 hover:text-red-600 flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors px-2 py-2";
                clearBtn.innerHTML = `<i data-lucide="rotate-ccw" class="w-4 h-4"></i> Clear`;
                clearBtn.onclick = clearSentence;

                controls.appendChild(playBtn);
                controls.appendChild(clearBtn);
                strip.appendChild(controls);
            }

            wrapper.appendChild(strip);

            // Word Picker Grid
            const pickerGrid = document.createElement('div');
            pickerGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-8";

            // Helper to create category block
            const createCategory = (title, type, bgColor, borderColor) => {
                const catDiv = document.createElement('div');
                catDiv.className = `${bgColor} p-4 rounded-xl border ${borderColor} mb-6`;
                
                const catTitle = document.createElement('h3');
                catTitle.className = "font-bold text-gray-500 uppercase tracking-widest text-sm mb-3";
                catTitle.innerText = title;
                catDiv.appendChild(catTitle);

                const listDiv = document.createElement('div');
                listDiv.className = "flex flex-wrap gap-2";

                const words = vocabulary.filter(w => w.type === type);
                const borderColors = ['border-yellow-400', 'border-red-600', 'border-gray-900', 'border-white'];

                words.forEach(word => {
                    const accentColor = borderColors[word.id % 4];
                    const btn = document.createElement('button');
                    btn.className = `bg-white border-2 ${accentColor} rounded-lg p-2 shadow-sm hover:shadow-md hover:scale-105 transition-all flex flex-col items-center min-w-[100px] relative group`;
                    
                    btn.innerHTML = `
                        <div class="audio-trigger absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors">
                            <i data-lucide="volume-2" class="w-3 h-3"></i>
                        </div>
                        <span class="font-bold text-gray-900 text-lg mt-2">${word.klamath}</span>
                        <span class="text-xs text-gray-500 uppercase font-medium">${word.english}</span>
                    `;

                    // Add to sentence logic
                    btn.onclick = () => addToSentence(word);

                    // Audio trigger logic
                    const audioTrig = btn.querySelector('.audio-trigger');
                    audioTrig.onclick = (e) => {
                        e.stopPropagation();
                        playAudio(word.klamath, word.tts);
                    }

                    listDiv.appendChild(btn);
                });

                catDiv.appendChild(listDiv);
                return catDiv;
            };

            const col1 = document.createElement('div');
            col1.appendChild(createCategory('People / Pronouns', 'pronoun', 'bg-blue-50', 'border-blue-100'));
            col1.appendChild(createCategory('Verbs (Actions)', 'verb', 'bg-red-50', 'border-red-100'));

            const col2 = document.createElement('div');
            col2.appendChild(createCategory('Nouns (Things)', 'noun', 'bg-green-50', 'border-green-100'));
            col2.appendChild(createCategory('Descriptors', 'adj', 'bg-yellow-50', 'border-yellow-100'));

            pickerGrid.appendChild(col1);
            pickerGrid.appendChild(col2);
            wrapper.appendChild(pickerGrid);

            container.appendChild(wrapper);
        }

        // --- Sentence Logic ---

        function addToSentence(word) {
            currentState.sentence.push({
                ...word,
                uniqueId: Date.now() + Math.random() // Unique ID for duplicate words
            });
            renderApp();
        }

        function removeFromSentence(uniqueId) {
            currentState.sentence = currentState.sentence.filter(item => item.uniqueId !== uniqueId);
            renderApp();
        }

        function clearSentence() {
            currentState.sentence = [];
            renderApp();
        }

        function playSentence() {
            const ttsString = currentState.sentence.map(w => w.tts).join(', ');
            playAudio("Sentence", ttsString);
        }

        // --- Initialization ---
        window.onload = function() {
            renderApp();
            // Pre-load voices if possible
            window.speechSynthesis.getVoices(); 
        };

    </script>
