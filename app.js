/* State global, inisialisasi, navigasi tab, profil siswa */
// Global Application State
        const state = {
            student: { name: 'Siswa', class: '-', school: '-' },
            p1: { running: false, t: 0, A: 10, v: 2.0, V: 0, data: [], timerId: null },
            p2: { A1: 20, v1: 2.0, A2: 10, data: [] },
            p3: { mode: 'A', P1: 150, v1: 2.0, h1: 0, A2_ratio: 2.0, h2: 0, data: [] }
        };

        // Charts Object Holders
        let chartP1Vt, chartP1QA, chartP2Av, chartP2Q1Q2, chartP3Pv, chartP3Ph;

        window.onload = function() {
            loadLocalStorageData();
            setActiveNav('beranda');
            updateSoundIcon();
            initP1Canvas();
            initP2Canvas();
            initP3Canvas();
            initCharts();
            updateP1Charts();
            updateP2Charts();
            updateP3Charts();
            renderQuizQuestions();
            restoreSavedInputs();
            updateP1Sim();
            updateP2Sim();
            updateP3Sim();
            renderP1Table();
            renderP2Table();
            renderP3Table();
            updateReportView();
            // Start Canvas Render Loops
            requestAnimationFrame(p1RenderLoop);
            requestAnimationFrame(p2RenderLoop);
            requestAnimationFrame(p3RenderLoop);
        };

        function setActiveNav(tabId) {
            document.querySelectorAll('.nav-btn').forEach(btn => {
                // Simpan class asli sekali, lalu pulihkan untuk tombol yang tidak aktif
                if (!btn.dataset.base) btn.dataset.base = btn.className;
                const isActive = btn.id === 'nav-' + tabId;
                if (isActive) {
                    const noColor = btn.dataset.base
                        .replace(/(^|\s)text-(sky|slate|amber|emerald|purple)-\d+/g, ' ')
                        .replace(/(^|\s)bg-slate-800\/80/g, ' ');
                    btn.className = noColor + ' bg-slate-800 text-sky-400';
                } else {
                    btn.className = btn.dataset.base;
                }
            });
        }

        function switchMainTab(tabId) {
            audio.playClick();
            document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
            document.getElementById('tab-' + tabId).classList.remove('hidden');

            setActiveNav(tabId);
            window.scrollTo({ top: 0, behavior: 'auto' });

            if (tabId === 'laporan') updateReportView();
            // Chart.js tidak bisa mengukur ukuran saat tab tersembunyi -> ukur ulang setelah tampil
            requestAnimationFrame(() => {
                [chartP1Vt, chartP1QA, chartP2Av, chartP2Q1Q2, chartP3Pv, chartP3Ph].forEach(c => { if (c) c.resize(); });
            });

            // Canvas must be sized AFTER its tab becomes visible.
            if (['p1', 'p2', 'p3'].includes(tabId)) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (tabId === 'p1') {
                            resizeCanvas(p1Canvas);
                        } else if (tabId === 'p2') {
                            resizeCanvas(p2Canvas);
                            p2Particles = [];
                            const count = 70;
                            for (let i = 0; i < count; i++) {
                                p2Particles.push({
                                    x: Math.random() * p2Canvas.width,
                                    y: Math.random(),
                                    speedMultiplier: 1.0
                                });
                            }
                        } else if (tabId === 'p3') {
                            resizeCanvas(p3Canvas);
                        }

                        if (window.MathJax && MathJax.typesetPromise) {
                            MathJax.typesetPromise([document.getElementById('tab-' + tabId)]);
                        }
                    });
                });
            }
        }


        window.addEventListener('resize', () => {
            requestAnimationFrame(() => {
                resizeCanvas(p1Canvas);
                resizeCanvas(p2Canvas);
                resizeCanvas(p3Canvas);
            });
        });

        function toggleMobileMenu() {
            document.getElementById('mobileMenu').classList.toggle('hidden');
        }

        function scrollToStep(stepId) {
            document.getElementById(stepId)?.scrollIntoView({ behavior: 'smooth' });
        }

        function openProfileModal() {
            document.getElementById('inStudentName').value = state.student.name;
            document.getElementById('inStudentClass').value = state.student.class;
            document.getElementById('inStudentSchool').value = state.student.school;
            document.getElementById('profileModal').classList.remove('hidden');
        }

        function closeProfileModal() {
            document.getElementById('profileModal').classList.add('hidden');
        }

        function saveProfile() {
            state.student.name = document.getElementById('inStudentName').value.trim() || 'Siswa';
            state.student.class = document.getElementById('inStudentClass').value.trim() || '-';
            state.student.school = document.getElementById('inStudentSchool').value.trim() || '-';
            safeLS.set('vlab_student_info', JSON.stringify(state.student));
            document.getElementById('headerStudentName').innerText = state.student.name;
            closeProfileModal();
            updateReportView();
            audio.playSuccess();
        }

        function loadLocalStorageData() {
            const info = parseSaved('vlab_student_info', null);
            if (info && typeof info === 'object') {
                state.student = {
                    name: String(info.name || 'Siswa'),
                    class: String(info.class || '-'),
                    school: String(info.school || '-')
                };
            }
            document.getElementById('headerStudentName').innerText = state.student.name;

            state.p1.data = parseSaved('vlab_p1_data', []);
            state.p2.data = parseSaved('vlab_p2_data', []);
            state.p3.data = parseSaved('vlab_p3_data', []);
        }
